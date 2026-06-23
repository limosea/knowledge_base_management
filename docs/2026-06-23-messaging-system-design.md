# 站内信系统设计文档

## 1. 概述

### 1.1 背景

知识库系统需要一个站内信系统，用于站内用户间的通信，包括：
- 系统公告（管理员向所有用户发布通知）
- 审批通知（用户申请权限时通知审批人）
- 系统通知（自动触发的通知，如安全提醒）

### 1.2 目标

- 提供可靠的站内消息传递机制
- 支持多种消息类型和接收者筛选方式
- 实时推送新消息通知
- 与现有权限系统和审计系统集成

### 1.3 设计原则

- **可靠性优先**：数据库持久化保证消息不丢失
- **存储高效**：全体公告只存储一次
- **权限细粒度**：与现有权限模型集成
- **审计完整**：关键操作记录审计日志

---

## 2. 数据模型

### 2.1 消息模板表（message_templates）

存储消息内容和元数据。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| title | VARCHAR(200) | 消息标题 |
| content | TEXT | 消息内容 |
| type | VARCHAR(20) | 消息类型：announcement / approval / system |
| sender_id | UUID | 发送者ID（可为空表示系统消息） |
| sender_type | VARCHAR(20) | 发送者类型：admin / system |
| target_type | VARCHAR(20) | 目标类型：all / users / role / permission |
| target_value | TEXT | 目标值（JSON数组，存储用户ID列表/角色名/权限名） |
| metadata | JSONB | 关联的业务对象信息 |
| created_at | TIMESTAMPTZ | 创建时间 |
| expires_at | TIMESTAMPTZ | 过期时间（可选） |

### 2.2 用户收件箱表（user_inboxes）

存储用户与消息的关系及状态。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| user_id | UUID | 接收者ID（外键关联 admin_users） |
| message_template_id | UUID | 消息模板ID（外键关联 message_templates） |
| is_read | BOOLEAN | 是否已读（默认 false） |
| is_deleted | BOOLEAN | 是否删除（默认 false，软删除） |
| is_starred | BOOLEAN | 是否收藏（默认 false） |
| read_at | TIMESTAMPTZ | 阅读时间 |
| created_at | TIMESTAMPTZ | 创建时间 |

**唯一约束**：(user_id, message_template_id)

### 2.3 索引设计

```sql
-- 用户消息列表查询
CREATE INDEX idx_user_inboxes_user_deleted ON user_inboxes(user_id, is_deleted);

-- 未读消息查询
CREATE INDEX idx_user_inboxes_user_read_deleted ON user_inboxes(user_id, is_read, is_deleted);

-- 按类型和时间查询消息模板
CREATE INDEX idx_message_templates_type_created ON message_templates(type, created_at);

-- 发送者查询
CREATE INDEX idx_message_templates_sender ON message_templates(sender_id);
```

---

## 3. 消息类型

### 3.1 系统公告（announcement）

管理员发布的公告类消息，如系统维护通知、功能更新等。

**特点：**
- 通常发送给全体用户或特定角色
- 由管理员手动发送
- 需要审计记录

### 3.2 审批通知（approval）

审批流程相关的通知消息。

**特点：**
- 关联业务对象（通过 metadata）
- 通常发送给有特定权限的用户
- 由系统自动发送或用户触发

**metadata 示例：**
```json
{
  "requestId": "uuid",
  "type": "permission_approval",
  "applicantId": "uuid",
  "applicantName": "张三",
  "requestedPermission": "users:manage"
}
```

### 3.3 系统通知（system）

系统自动触发的通知，如安全提醒、账户状态变更等。

**特点：**
- 由系统自动发送（sender_id 为空）
- 通常发送给单个用户
- 可能有过期时间

---

## 4. 接收者筛选

### 4.1 全体用户（all）

发送给系统中所有活跃用户。

**权限要求：** 仅 super_admin 可发送

**解析逻辑：**
```sql
SELECT id FROM admin_users WHERE is_active = true
```

### 4.2 指定用户列表（users）

发送给指定的用户ID列表。

**权限要求：** 需要 `messages:send` 权限

**target_value 示例：**
```json
["user-id-1", "user-id-2", "user-id-3"]
```

### 4.3 按角色筛选（role）

发送给拥有指定角色的用户。

**权限要求：** 需要 `messages:send` 权限

**target_value 示例：**
```json
["admin", "moderator"]
```

**解析逻辑：**
```sql
SELECT id FROM admin_users 
WHERE role IN ('admin', 'moderator') AND is_active = true
```

### 4.4 按权限筛选（permission）

发送给拥有指定权限的用户。

**权限要求：** 需要 `messages:send` 权限

**target_value 示例：**
```json
["users:manage", "content:shield"]
```

**解析逻辑：**
```sql
SELECT DISTINCT u.id
FROM admin_users u
JOIN roles r ON u.role = r.name
JOIN role_permissions rp ON rp.role_id = r.id
WHERE rp.permission IN ('users:manage', 'content:shield')
  AND u.is_active = true
```

---

## 5. API 设计

### 5.1 用户端 API

#### 获取消息列表

```
GET /admin/messages
```

**Query 参数：**
- `page`: 页码（默认 1）
- `limit`: 每页数量（默认 20，最大 100）
- `type`: 消息类型筛选（可选）
- `unreadOnly`: 仅未读消息（默认 false）
- `starredOnly`: 仅收藏消息（默认 false）

**响应：**
```json
{
  "items": [
    {
      "id": "uuid",
      "title": "系统维护通知",
      "content": "...",
      "type": "announcement",
      "isRead": false,
      "isStarred": false,
      "createdAt": "2026-06-23T10:00:00Z",
      "readAt": null
    }
  ],
  "total": 50,
  "unreadCount": 12
}
```

#### 获取消息详情

```
GET /admin/messages/:id
```

**响应：**
```json
{
  "id": "uuid",
  "title": "系统维护通知",
  "content": "...",
  "type": "announcement",
  "sender": {
    "id": "uuid",
    "name": "管理员"
  },
  "isRead": true,
  "isStarred": false,
  "metadata": {},
  "createdAt": "2026-06-23T10:00:00Z",
  "readAt": "2026-06-23T11:00:00Z"
}
```

#### 标记消息已读

```
PATCH /admin/messages/:id/read
```

**响应：**
```json
{
  "success": true
}
```

#### 批量标记已读

```
PATCH /admin/messages/batch-read
```

**请求体：**
```json
{
  "messageIds": ["uuid1", "uuid2", "uuid3"]
}
```

**响应：**
```json
{
  "success": true,
  "count": 3
}
```

#### 标记全部已读

```
PATCH /admin/messages/read-all
```

**响应：**
```json
{
  "success": true,
  "count": 12
}
```

#### 收藏/取消收藏消息

```
PATCH /admin/messages/:id/star
```

**请求体：**
```json
{
  "starred": true
}
```

**响应：**
```json
{
  "success": true
}
```

#### 删除消息

```
DELETE /admin/messages/:id
```

**响应：**
```json
{
  "success": true
}
```

#### 批量删除消息

```
DELETE /admin/messages/batch
```

**请求体：**
```json
{
  "messageIds": ["uuid1", "uuid2", "uuid3"]
}
```

**响应：**
```json
{
  "success": true,
  "count": 3
}
```

#### 获取未读数量

```
GET /admin/messages/unread-count
```

**响应：**
```json
{
  "count": 12
}
```

### 5.2 发送消息 API

#### 发送消息

```
POST /admin/messages/send
```

**权限要求：**
- `targetType: all` - 仅 super_admin
- `targetType: users/role/permission` - 需要 `messages:send` 权限

**请求体：**
```json
{
  "title": "审批请求通知",
  "content": "用户张三申请权限...",
  "type": "approval",
  "targetType": "permission",
  "targetValue": ["users:manage"],
  "metadata": {
    "requestId": "uuid",
    "type": "permission_approval"
  }
}
```

**响应：**
```json
{
  "success": true,
  "messageId": "uuid",
  "recipientCount": 5
}
```

### 5.3 WebSocket API

#### 连接端点

```
WS /admin/messages/ws
```

**认证：**
- 连接时传递 JWT token（query 参数或握手数据）

**事件：**

**新消息通知：**
```json
{
  "event": "new_message",
  "data": {
    "id": "uuid",
    "title": "系统维护通知",
    "type": "announcement",
    "createdAt": "2026-06-23T10:00:00Z"
  }
}
```

**未读数更新：**
```json
{
  "event": "unread_count_update",
  "data": {
    "count": 13
  }
}
```

**未读消息摘要（上线时推送）：**
```json
{
  "event": "unread_messages",
  "data": {
    "items": [
      {
        "id": "uuid",
        "title": "系统维护通知",
        "type": "announcement"
      }
    ]
  }
}
```

---

## 6. 服务层架构

### 6.1 模块结构

```
src/messages/
├── messages.module.ts
├── messages.controller.ts          # 用户端 API
├── messages-send.controller.ts     # 发送消息 API
├── messages.service.ts             # 核心业务逻辑
├── messages-delivery.service.ts    # 消息投递逻辑
├── messages.gateway.ts             # WebSocket Gateway
├── entities/
│   ├── message-template.entity.ts
│   └── user-inbox.entity.ts
├── dto/
│   ├── send-message.dto.ts
│   ├── message-list-query.dto.ts
│   └── message-response.dto.ts
└── constants/
    └── message-types.ts
```

### 6.2 核心服务职责

**MessagesService**
- 查询用户消息列表（分页、筛选）
- 标记已读/删除/收藏
- 获取未读数量
- 消息详情查询

**MessagesDeliveryService**
- 解析接收者列表（根据 targetType）
- 创建 MessageTemplate 记录
- 批量创建 UserInbox 记录
- 触发 WebSocket 推送通知
- 记录审计日志

**MessagesGateway**
- 用户连接时记录 userId ↔ socketId 映射
- 接收新消息时向在线用户推送通知
- 用户断开连接时清理映射
- 推送未读数量更新

### 6.3 消息投递流程

```
发送请求
  ↓
权限检查
  ↓
MessagesDeliveryService.sendMessage()
  ↓
解析接收者列表（根据 targetType）
  ↓
创建 MessageTemplate（事务开始）
  ↓
批量创建 UserInbox 记录（分批处理，每批 500 条）
  ↓
事务提交
  ↓
遍历接收者，检查是否在线
  ├─ 在线 → WebSocket 推送通知
  └─ 离线 → 跳过
  ↓
记录审计日志
  ↓
返回发送结果
```

### 6.4 用户上线流程

```
WebSocket 连接建立
  ↓
JWT 认证获取 userId
  ↓
记录连接映射（支持多设备）
  ↓
查询数据库中的未读消息
  ↓
推送未读数量
  ↓
推送最近的未读消息摘要（最近 5 条）
```

---

## 7. 权限控制

### 7.1 新增权限

在 `AdminPermission` 类型中添加：

```typescript
| 'messages:send'    // 发送消息
| 'messages:manage'  // 管理消息（撤回等，预留）
```

更新 `ALL_ADMIN_PERMISSIONS` 数组：

```typescript
export const ALL_ADMIN_PERMISSIONS: readonly AdminPermission[] = [
  'users:list',
  'users:manage',
  'content:view_shielded',
  'content:shield',
  'content:unshield',
  'apikeys:list',
  'apikeys:manage',
  'audit:read',
  'analytics:read',
  'stats:read',
  'system:read',
  'messages:send',    // 新增
  'messages:manage',  // 新增
];
```

### 7.2 权限规则

| 操作 | 权限要求 |
|------|---------|
| 查看自己收件箱 | 无需权限（所有登录用户） |
| 发送给全体用户 | super_admin |
| 发送给指定用户/角色/权限 | `messages:send` |
| 撤回消息（预留） | `messages:manage` |

---

## 8. 审计日志

### 8.1 审计事件

| 事件 | action | resourceType |
|------|--------|--------------|
| 发送消息 | `message:send` | `message_template` |
| 标记已读 | `message:read` | `user_inbox` |
| 批量已读 | `message:batch_read` | `user_inbox` |
| 全部已读 | `message:read_all` | `user_inbox` |
| 收藏消息 | `message:star` | `user_inbox` |
| 删除消息 | `message:delete` | `user_inbox` |
| 批量删除 | `message:batch_delete` | `user_inbox` |

### 8.2 审计日志示例

**发送消息：**
```json
{
  "action": "message:send",
  "resourceType": "message_template",
  "resourceId": "uuid",
  "details": {
    "title": "系统维护通知",
    "type": "announcement",
    "targetType": "all",
    "targetValue": null,
    "recipientCount": 150,
    "onlineRecipientCount": 42,
    "pushedCount": 42,
    "hasMetadata": false
  }
}
```

**标记已读：**
```json
{
  "action": "message:read",
  "resourceType": "user_inbox",
  "resourceId": "uuid",
  "details": {
    "messageTemplateId": "uuid",
    "messageTitle": "系统维护通知",
    "messageType": "announcement"
  }
}
```

---

## 9. 消息可靠性保证

### 9.1 核心原则

**数据库是消息的唯一真实来源，WebSocket 只是实时通知通道。**

- 所有消息都持久化到数据库（message_templates + user_inboxes）
- WebSocket 推送只是加速通知，不是唯一传递方式
- 用户上线后主动同步未读消息

### 9.2 消息不丢失保证

| 场景 | 处理方式 | 保证 |
|------|---------|------|
| 用户在线 | 数据库存储 + WebSocket 推送 | 实时收到通知 |
| 用户离线 | 数据库存储 | 上线后可查询到消息 |
| 用户上线 | 主动推送未读数量和摘要 | 立即感知新消息 |
| 推送失败 | 数据库已有记录 | 不丢失 |
| 服务器重启 | 数据库持久化 | 消息持久保存 |

### 9.3 上线同步机制

用户建立 WebSocket 连接时：
1. JWT 认证获取 userId
2. 记录连接映射（支持多设备）
3. 查询未读消息数量
4. 推送未读数量
5. 推送最近的未读消息摘要（最近 5 条）

---

## 10. 测试策略

### 10.1 单元测试

**MessagesService 测试：**
- 查询消息列表（分页、筛选）
- 标记已读/未读
- 收藏/取消收藏
- 删除消息
- 未读数量统计

**MessagesDeliveryService 测试：**
- 解析全体用户接收者
- 解析指定用户列表接收者
- 解析按角色筛选接收者
- 解析按权限筛选接收者
- 消息投递事务回滚场景

**MessagesGateway 测试：**
- WebSocket 连接认证
- 用户上线/下线处理
- 消息推送逻辑

### 10.2 集成测试

- 发送消息给全体用户
- 发送消息给指定用户
- 发送消息给按权限筛选的用户
- 用户消息列表查询和分页
- 标记消息已读
- 收藏消息
- 删除消息
- 获取未读数量
- WebSocket 连接和实时推送
- 用户上线后同步未读消息

### 10.3 性能测试

- 全体公告场景（1000+ 用户）
- 批量操作性能
- WebSocket 连接数压力测试

---

## 11. 实现计划

### 11.1 步骤分解

**步骤 1：基础设施（1-2天）**
- 创建实体（message-template.entity.ts, user-inbox.entity.ts）
- 创建数据库迁移文件
- 创建 DTO 和常量定义
- 创建 messages.module.ts

**步骤 2：核心服务（2-3天）**
- 实现 MessagesService（查询、标记、删除）
- 实现 MessagesDeliveryService（投递逻辑）
- 创建 MessagesController（用户端 API）
- 创建 MessagesSendController（发送消息 API）

**步骤 3：WebSocket 实时推送（1-2天）**
- 安装 WebSocket 依赖（@nestjs/websockets, @nestjs/platform-socket.io, socket.io）
- 实现 MessagesGateway
- 集成认证和推送逻辑
- 测试实时推送

**步骤 4：权限集成（1天）**
- 更新权限常量
- 添加权限装饰器和守卫
- 添加审计日志记录
- 测试权限控制

**步骤 5：测试（2天）**
- 编写单元测试
- 编写集成测试
- 编写 WebSocket 测试
- 性能测试和优化

**总计：约 7-9 天**

### 11.2 依赖项

需要安装的 npm 包：
- `@nestjs/websockets`
- `@nestjs/platform-socket.io`
- `socket.io`

---

## 12. 扩展性考虑

### 12.1 预留功能

以下功能在设计中已预留，可在后续迭代中实现：

**消息撤回：**
- 管理员可撤回已发送的全体公告
- 需要删除相关的 user_inboxes 记录
- 需要 `messages:manage` 权限

**消息回复：**
- 支持用户对消息进行回复
- 需要添加 replies 表

**消息模板：**
- 预定义常用的消息模板
- 方便快速发送标准化消息

**消息分类标签：**
- 除了类型外，支持自定义标签分类
- 需要添加 tags 字段

### 12.2 未来优化

**消息缓存：**
- 使用 Redis 缓存未读数量
- 减少数据库查询压力

**消息推送增强：**
- 支持邮件推送
- 支持短信推送
- 支持浏览器推送通知

**消息搜索：**
- 全文搜索消息内容
- 使用 PostgreSQL 全文搜索或 Elasticsearch

---

## 13. 风险与缓解

### 13.1 性能风险

**风险：** 全体公告场景下，大量用户同时上线可能导致数据库压力。

**缓解：**
- 分批处理用户收件箱记录创建
- 添加适当的数据库索引
- 考虑使用 Redis 缓存未读数量

### 13.2 WebSocket 连接管理

**风险：** 大量僵尸连接占用资源。

**缓解：**
- 实现心跳检测机制
- 限制单个用户最大连接数
- 定期清理无效连接

### 13.3 消息存储增长

**风险：** 长期运行后消息数据量持续增长。

**缓解：**
- 设置消息过期时间（expires_at）
- 定时任务清理过期消息
- 归档历史消息到冷存储

---

## 14. 总结

本设计采用消息模板 + 收件箱模型，实现了高效、可靠的站内信系统：

- **存储高效**：全体公告只存储一次
- **功能完整**：支持已读/未读、收藏、删除、关联业务对象
- **实时推送**：WebSocket 实现新消息即时通知
- **可靠保证**：数据库持久化 + 上线同步确保消息不丢失
- **灵活投递**：支持全体、指定用户、按角色、按权限筛选
- **权限控制**：细粒度权限，与现有权限系统集成
- **审计完整**：关键操作记录审计日志
- **易于扩展**：预留消息撤回、回复等功能接口
