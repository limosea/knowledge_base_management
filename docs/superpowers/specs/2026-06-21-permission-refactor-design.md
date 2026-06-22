# 权限控制架构重构设计文档

## 概述

根据新版 OpenAPI 文档（`docs/openapi.yaml`），重构前端权限控制架构，实现以下目标：

1. 新增普通用户自助服务功能（管理自己的 API Key）
2. 调整管理端知识条目权限（移除编辑功能）
3. 放宽审计日志和系统监控的访问权限（admin 可访问）

## 变更对比

### 1. 权限模型变化

| 角色 | 旧版权限 | 新版权限 |
|------|----------|----------|
| `super_admin` | 完整管理权限 | 完整管理权限（不变） |
| `admin` | 不可管理其他用户 | 可管理 user-role 账户（创建/更新/删除/重置密码） |
| `user` | 仅可管理自己 API Key（`/admin/api-keys`） | 仅可通过 `/admin/me/*` 自助服务 |

### 2. 新增端点

| 端点 | 方法 | 说明 |
|------|------|------|
| `/admin/me/api-keys` | GET | 获取自己的 API Key 列表 |
| `/admin/me/api-keys` | POST | 创建自己的 API Key |
| `/admin/me/api-keys/{id}` | GET | 获取自己的 API Key 详情 |
| `/admin/me/api-keys/{id}` | PUT | 更新自己的 API Key |
| `/admin/me/api-keys/{id}` | DELETE | 删除自己的 API Key |
| `/admin/me/api-keys/{id}/regenerate` | POST | 重新生成自己的 API Key |
| `/admin/me/stats` | GET | 获取自己的统计数据 |

### 3. 权限变化

| 端点 | 旧版权限 | 新版权限 |
|------|----------|----------|
| `/admin/api-keys` | user 及以上 | admin 或 super_admin |
| `/admin/knowledge/{id}` PUT | super_admin | **已移除** |
| `/admin/audit-logs` | super_admin | admin 或 super_admin |
| `/admin/system/stats` | super_admin | admin 或 super_admin |
| `/admin/system/health` | super_admin | admin 或 super_admin |

## 实现方案

### 1. 新增 API 客户端 (`src/api/me.ts`)

创建新的 API 模块，封装 `/admin/me/*` 端点调用。

### 2. 新增自助服务页面 (`src/pages/MyApiKeysPage.tsx`)

为普通用户提供 API Key 管理界面，功能与 `ApiKeysPage` 类似但：
- 调用 `/admin/me/api-keys` 端点
- 不显示 `isActive` 字段（用户无法禁用自己的 Key）
- 不显示 `ownerId` 字段

### 3. 修改路由配置 (`src/router.tsx`)

- 新增 `/me/api-keys` 路由（所有认证用户可访问）
- 将 `/audit-logs` 和 `/system` 从 `SuperAdminRoute` 改为 `AdminRoute`
- 新增 `AdminRoute` 组件（admin 及以上可访问）

### 4. 修改导航配置 (`src/components/layout/MainLayout.tsx`)

- 新增"我的 API Keys"导航项（所有用户可见）
- 将"审计日志"和"系统监控"的 `minRole` 从 `super_admin` 改为 `admin`

### 5. 修改知识条目管理 (`src/pages/KnowledgePage.tsx`)

- 移除编辑按钮（`Pencil` 图标）
- 移除编辑弹窗（`Dialog`）
- 移除 `handleEdit` 和 `handleSave` 函数
- 移除 `formData` 状态和相关表单

### 6. 更新类型定义 (`src/types/index.ts`)

新增自助服务相关类型：
- `MyApiKey`
- `MyApiKeyListResponse`
- `MyStats`

### 7. 更新国际化 (`src/i18n/index.ts`)

新增翻译键：
- `nav.myApiKeys`: "我的 API Keys" / "My API Keys"
- `myApiKeys.title`: "我的 API Keys" / "My API Keys"
- `myApiKeys.description`: "管理你自己创建的 API Key" / "Manage your own API Keys"

## 文件变更列表

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/api/me.ts` | 新增 | 自助服务 API 客户端 |
| `src/api/index.ts` | 修改 | 导出 `meApi` |
| `src/types/index.ts` | 修改 | 新增类型定义 |
| `src/pages/MyApiKeysPage.tsx` | 新增 | 自助服务页面 |
| `src/pages/index.ts` | 修改 | 导出 `MyApiKeysPage` |
| `src/router.tsx` | 修改 | 新增路由，调整权限守卫 |
| `src/components/layout/MainLayout.tsx` | 修改 | 调整导航项权限 |
| `src/pages/KnowledgePage.tsx` | 修改 | 移除编辑功能 |
| `src/i18n/index.ts` | 修改 | 新增翻译 |

## 验证要点

1. **普通用户 (user 角色)**：
   - ✅ 可访问"我的 API Keys"页面
   - ✅ 可访问 Dashboard、Knowledge、Categories、Settings
   - ❌ 不可访问 Users、Audit Logs、System
   - ❌ 不可访问管理员 API Keys 页面

2. **管理员 (admin 角色)**：
   - ✅ 可访问所有分析页面
   - ✅ 可访问 Audit Logs、System Monitor
   - ✅ 可管理知识条目（仅查看和删除）
   - ✅ 可管理所有 API Key
   - ✅ 可管理 user-role 账户

3. **超级管理员 (super_admin 角色)**：
   - ✅ 可访问所有功能
   - ✅ 可管理所有用户（包括 admin）
