# 知识库后台管理系统设计文档

## 1. 项目概述

### 1.1 项目背景
为个人知识库系统开发一个现代化的后台管理系统，支持知识条目管理、API Key管理、系统监控、管理员用户管理等核心功能。

### 1.2 目标用户
混合团队（技术+业务人员），需要平衡易用性和功能性。

### 1.3 核心需求
- UI设计美观、UX体验优秀
- 使用现代化框架，易于维护
- 性能良好，长列表使用分页处理
- 支持中英双语
- 支持多套主题方案（浅色/深色/护眼）

### 1.4 API版本说明

基于 OpenAPI v1.0.0，主要特性：

1. **管理员用户管理**：新增模块，支持 super_admin 创建、编辑、删除管理员用户，重置密码
2. **知识条目所有者校验**：业务 API 更新/删除/版本操作需验证 `created_by` 与当前 API Key 一致
3. **软删除**：知识条目删除为软删除，数据可恢复
4. **分页限制调整**：列表查询 limit 最大值从 100 提升至 200
5. **审计日志流式导出**：导出格式改为 NDJSON，流式输出，无条目上限
6. **健康检查分离**：`/health` 为存活探针（无认证），`/admin/system/health` 为深度健康检查（需认证）

## 2. 技术架构

### 2.1 技术栈选型

| 层次 | 技术选型 | 说明 |
|------|---------|------|
| 构建工具 | Vite | 构建快速，开发体验好，适合SPA |
| 前端框架 | React 18 + TypeScript | 生态成熟，类型安全 |
| UI组件库 | Shadcn/ui + Tailwind CSS | 现代化设计，高度可定制，体积小 |
| 服务端状态 | TanStack Query v5 | 自动缓存、重试、刷新，性能优秀 |
| 客户端状态 | Zustand | 轻量级，API简洁，TypeScript友好 |
| 路由 | React Router v6 | 声明式路由，支持懒加载 |
| 表单处理 | React Hook Form | 高性能，减少重渲染 |
| 表单验证 | Zod | 类型推导，与TypeScript完美配合 |
| HTTP客户端 | Axios | 拦截器支持，请求取消 |
| 日期处理 | Day.js | 轻量级，API兼容Moment.js |
| 图标 | Lucide React | Shadcn/ui默认图标库 |
| Toast通知 | Sonner | 轻量级，样式美观 |

### 2.2 架构设计

```
┌─────────────────────────────────────────────────────┐
│                   表现层 (Presentation)               │
│        React Components | Shadcn/ui | Tailwind       │
├─────────────────────────────────────────────────────┤
│                    状态层 (State)                     │
│     TanStack Query (服务端) | Zustand (客户端)        │
├─────────────────────────────────────────────────────┤
│                   服务层 (Service)                    │
│    API Client | Auth Service | Theme | i18n          │
├─────────────────────────────────────────────────────┤
│                     后端 API                         │
│          http://limousea.asia:3000/api/v1            │
└─────────────────────────────────────────────────────┘
```

## 3. 页面结构与路由

### 3.1 路由规划

| 路径 | 页面 | 权限 | 说明 |
|------|------|------|------|
| `/login` | 登录页 | 公开 | 用户名密码登录，支持MFA |
| `/` | 仪表盘 | 需登录 | 系统统计概览 |
| `/knowledge` | 知识条目列表 | 需登录 | 分页列表，筛选搜索 |
| `/knowledge/:id` | 知识条目详情 | 需登录 | 查看、编辑、版本历史 |
| `/api-keys` | API Key管理 | 需登录 | 创建、查看、管理Key |
| `/users` | 管理员用户管理 | super_admin | 用户列表、创建、编辑 |
| `/users/:id` | 用户详情 | super_admin | 查看用户详情 |
| `/audit-logs` | 审计日志 | 需登录 | 操作日志查询、导出 |
| `/monitor` | 系统监控 | 需登录 | 统计数据、健康检查 |
| `/settings` | 个人设置 | 需登录 | 修改密码、MFA设置 |

### 3.2 布局结构

```
┌────────────────────────────────────────────────┐
│                    Header                       │
│  Logo | 面包屑 | 主题切换 | 语言切换 | 用户菜单   │
├───────┬────────────────────────────────────────┤
│       │                                        │
│  S    │                                        │
│  i    │           Content Area                 │
│  d    │                                        │
│  e    │                                        │
│  b    │                                        │
│  a    │                                        │
│  r    │                                        │
│       │                                        │
└───────┴────────────────────────────────────────┘
```

## 4. 核心功能模块

### 4.1 知识条目管理

#### 4.1.1 列表页功能
- 分页展示（支持20/50/100/200条每页）
- 多条件筛选：标题/内容搜索、分类、标签、语言
- 表格排序：按质量分、创建时间、更新时间
- 批量操作：多选后批量删除
- 状态展示：质量评分、创建时间、创建者
- 所有者校验：业务API更新/删除需验证created_by与当前API Key一致

#### 4.1.2 详情页功能
- 基本信息展示：标题、内容、摘要、分类、标签
- 元信息面板：ID、语言、框架、难度等级、质量评分、版本号、创建者
- 版本历史：查看历史版本，恢复到指定版本
- 操作按钮：编辑、删除
- 删除操作：执行软删除

### 4.2 API Key管理

#### 4.2.1 列表展示
- 卡片式展示，支持网格布局
- 分页展示（支持20/50/100/200条每页）
- 显示信息：名称、Key前缀、权限、状态、最后使用时间、速率限制
- 状态标签：活跃、已过期、已禁用

#### 4.2.2 创建/编辑表单
- 名称（必填）
- 权限选择：read、write、admin（多选）
- 速率限制：1-1000请求/分钟
- 过期时间：可选，ISO 8601格式

#### 4.2.3 其他操作
- 重新生成Key：废弃旧Key，生成新Key
- 禁用/启用：切换Key状态
- 删除：删除Key记录

### 4.3 系统监控

#### 4.3.1 仪表盘
- 统计卡片：知识条目总数、活跃API Key、今日请求、平均质量分
- 分类分布：可视化图表展示各分类条目数量
- 健康状态：数据库、API服务状态，响应延迟

#### 4.3.2 请求统计
- 时间维度：今日、本周、本月
- 趋势图表：折线图或柱状图

#### 4.3.3 健康检查
- 存活探针：`/health` 端点，无需认证，返回 `{status: "ok"}`
- 深度健康检查：`/admin/system/health` 端点，需认证，检查数据库连通性

### 4.4 管理员用户管理（super_admin专属）

#### 4.4.1 列表页功能
- 分页展示（支持20/50/100/200条每页）
- 显示信息：用户名、邮箱、角色、状态、MFA状态、最后登录时间、创建时间
- 角色标签：admin、super_admin
- 状态标签：活跃、已停用
- 权限控制：仅super_admin可访问

#### 4.4.2 创建用户
- 用户名（必填）
- 密码（必填，至少8位，包含大小写字母、数字、特殊字符）
- 邮箱（可选）
- 角色选择：admin、super_admin（默认admin）
- 新用户首次登录需修改密码

#### 4.4.3 编辑用户
- 修改邮箱
- 修改角色（保护最后一个活跃的super_admin）
- 启用/停用用户（保护最后一个活跃的super_admin）

#### 4.4.4 其他操作
- 删除用户：不允许删除自己，不允许删除最后一个super_admin
- 重置密码：生成一次性临时密码，强制下次登录修改

### 4.5 审计日志

#### 4.5.1 列表页功能
- 分页展示（支持20/50/100/200条每页）
- 多条件筛选：操作类型、资源类型、时间范围
- 显示信息：操作类型、资源类型、资源ID、IP地址、User Agent、时间

#### 4.5.2 导出功能
- 格式：NDJSON流式下载（每行一个JSON对象）
- 筛选条件：时间范围、操作类型、资源类型
- 文件名：`audit-logs.ndjson`
- 内存友好：流式输出，无条目上限

### 4.6 认证与安全

#### 4.6.1 登录流程
1. 输入用户名密码
2. 后端验证
3a. 未启用MFA → 返回JWT Token
3b. 启用MFA → 返回tempToken，显示MFA验证页
4. MFA验证 → 返回JWT Token
5. 首次登录 → 强制修改密码（requirePasswordChange: true）

#### 4.6.2 Token管理
- accessToken：存于内存/Zustand，短期有效（如15分钟）
- refreshToken：存于localStorage，长期有效（如7天）
- 自动刷新：拦截401响应，使用refreshToken刷新accessToken

#### 4.6.3 MFA功能
- 设置MFA：生成密钥和二维码URL
- 启用/禁用MFA：验证6位数字验证码

## 5. 主题系统

### 5.1 三套主题方案

#### 5.1.1 浅色模式（Light）
```
Primary: #3b82f6 (蓝色)
Background: #ffffff
Surface: #f3f4f6
Text: #1f2937
Border: #e5e7eb
```

#### 5.1.2 深色模式（Dark）
```
Primary: #3b82f6 (蓝色)
Background: #0f172a
Surface: #1e293b
Text: #e2e8f0
Border: #334155
```

#### 5.1.3 护眼模式（Eye Comfort）
温暖的棕色/茶色系：
```
Primary: #8B6F47 (棕色主色)
Secondary: #A0785A (卡其/橄榄棕)
Tertiary: #6D5D4B (深咖啡)
Background: #F5EFE6 (奶油色)
Surface: #FAF6F0 (温暖Surface)
SurfaceVariant: #EDE8DE (茶色变体)
Outline: #D7C4A7 (浅棕色边框)
Error: #B85450 (护眼红)
Text: #3E2723 (棕色文字)

// 深色护眼变体
DarkBackground: #231C14 (深木棕)
DarkPrimary: #D4A843 (暖金色)
```

### 5.2 实现方案
- 使用CSS变量定义主题色，Tailwind自动读取
- localStorage持久化用户偏好
- Zustand管理主题状态
- 系统级媒体查询支持（prefers-color-scheme）

## 6. 国际化

### 6.1 支持语言
- 简体中文（zh-CN）- 默认
- 英语（en-US）

### 6.2 实现方案
- 使用i18next或自定义轻量级i18n方案
- 语言文件存放于 `public/locales/` 目录
- 支持运行时切换，无需刷新页面
- localStorage持久化用户语言偏好

## 7. 表单验证规则

### 7.1 知识条目表单

| 字段 | 必填 | 验证规则 | 错误提示 |
|------|------|----------|----------|
| 标题 | 是 | 1-500字符，去除首尾空格 | 标题不能为空，最多500字符 |
| 内容 | 是 | 1-50000字符 | 内容不能为空，最多50000字符 |
| 摘要 | 否 | 最多1000字符 | 摘要最多1000字符 |
| 分类 | 否 | 最多100字符 | 分类名最多100字符 |
| 标签 | 否 | 数组，每项最多50字符，最多10项 | 每个标签最多50字符，最多10个 |
| 难度等级 | 否 | 整数 1-5 | 难度等级必须为1-5 |

### 7.2 API Key表单

| 字段 | 必填 | 验证规则 | 错误提示 |
|------|------|----------|----------|
| 名称 | 是 | 至少1字符，去除首尾空格 | 名称不能为空 |
| 权限 | 否 | 至少选择一项 | 至少选择一项权限 |
| 速率限制 | 否 | 整数 1-1000，默认100 | 速率限制必须在1-1000之间 |
| 过期时间 | 否 | ISO 8601日期，必须晚于当前时间 | 过期时间必须晚于当前时间 |

### 7.3 登录表单

| 字段 | 验证规则 | 错误提示 |
|------|----------|----------|
| 用户名 | 至少1字符 | 请输入用户名 |
| 密码 | 至少1字符 | 请输入密码 |

### 7.4 修改密码表单

| 字段 | 验证规则 | 错误提示 |
|------|----------|----------|
| 当前密码 | 至少1字符 | 请输入当前密码 |
| 新密码 | 至少8字符，包含大小写字母、数字、特殊字符 | 密码至少8位，需包含大小写字母、数字和特殊字符 |
| 确认密码 | 与新密码一致 | 两次密码输入不一致 |

### 7.5 MFA验证

| 字段 | 验证规则 | 错误提示 |
|------|----------|----------|
| 验证码 | 6-8位数字 | 请输入6-8位验证码 |

### 7.6 创建管理员用户表单

| 字段 | 必填 | 验证规则 | 错误提示 |
|------|------|----------|----------|
| 用户名 | 是 | 至少1字符，去除首尾空格 | 用户名不能为空 |
| 密码 | 是 | 至少8字符，包含大小写字母、数字、特殊字符 | 密码至少8位，需包含大小写字母、数字和特殊字符 |
| 邮箱 | 否 | 邮箱格式 | 请输入有效的邮箱地址 |
| 角色 | 否 | admin 或 super_admin，默认admin | 请选择有效的角色 |

### 7.7 编辑管理员用户表单

| 字段 | 必填 | 验证规则 | 错误提示 |
|------|------|----------|----------|
| 邮箱 | 否 | 邮箱格式 | 请输入有效的邮箱地址 |
| 角色 | 否 | admin 或 super_admin | 请选择有效的角色 |
| 状态 | 否 | 布尔值 | - |

### 7.8 Zod Schema示例

```typescript
// 知识条目表单验证
const knowledgeSchema = z.object({
  title: z.string()
    .min(1, "标题不能为空")
    .max(500, "标题最多500字符")
    .transform(val => val.trim()),
  content: z.string()
    .min(1, "内容不能为空")
    .max(50000, "内容最多50000字符"),
  summary: z.string().max(1000, "摘要最多1000字符").optional(),
  category: z.string().max(100, "分类最多100字符").optional(),
  tags: z.array(z.string().max(50)).max(10, "最多10个标签").optional(),
  difficulty_level: z.number().int().min(1).max(5).optional(),
});

// API Key 表单验证
const apiKeySchema = z.object({
  name: z.string().min(1, "名称不能为空").transform(val => val.trim()),
  permissions: z.array(z.enum(['read', 'write', 'admin']))
    .min(1, "至少选择一项权限")
    .default(['read']),
  rateLimit: z.number().int().min(1).max(1000).default(100),
  expiresAt: z.string().datetime().refine(
    (val) => new Date(val) > new Date(),
    "过期时间必须晚于当前时间"
  ).optional(),
});

// 修改密码验证
const passwordSchema = z.object({
  currentPassword: z.string().min(1, "请输入当前密码"),
  newPassword: z.string()
    .min(8, "密码至少8位")
    .regex(/[a-z]/, "需包含小写字母")
    .regex(/[A-Z]/, "需包含大写字母")
    .regex(/[0-9]/, "需包含数字")
    .regex(/[!@#$%^&*]/, "需包含特殊字符"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "两次密码输入不一致",
  path: ["confirmPassword"],
});

// 创建管理员用户验证
const createAdminUserSchema = z.object({
  username: z.string().min(1, "用户名不能为空").transform(val => val.trim()),
  password: z.string()
    .min(8, "密码至少8位")
    .regex(/[a-z]/, "需包含小写字母")
    .regex(/[A-Z]/, "需包含大写字母")
    .regex(/[0-9]/, "需包含数字")
    .regex(/[!@#$%^&*]/, "需包含特殊字符"),
  email: z.string().email("请输入有效的邮箱地址").optional().or(z.literal('')),
  role: z.enum(['admin', 'super_admin']).default('admin'),
});

// 更新管理员用户验证
const updateAdminUserSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址").optional().or(z.literal('')),
  role: z.enum(['admin', 'super_admin']).optional(),
  isActive: z.boolean().optional(),
});
```

## 8. 错误处理策略

### 8.1 错误处理架构

```
┌────────────────────────────────────────┐
│         全局错误边界 (ErrorBoundary)      │
│     捕获React组件渲染错误                │
├────────────────────────────────────────┤
│         API错误拦截器 (Axios)            │
│     统一处理HTTP错误，自动刷新Token       │
├────────────────────────────────────────┤
│      查询错误处理 (TanStack Query)       │
│     自动重试，显示Toast提示              │
├────────────────────────────────────────┤
│        表单验证错误 (Zod)                │
│     实时验证，字段下方显示错误            │
└────────────────────────────────────────┘
```

### 8.2 HTTP错误码处理

| 状态码 | 含义 | 处理策略 |
|--------|------|----------|
| 400 | 请求参数错误 | 显示后端返回的具体错误信息，高亮表单错误字段 |
| 401 | 未授权/Token过期 | 尝试刷新Token，失败则跳转登录页 |
| 403 | 权限不足 | 显示"无权限访问"提示，提供返回首页按钮 |
| 404 | 资源不存在 | 显示"资源不存在"提示，提供返回列表按钮 |
| 409 | 资源冲突 | 显示具体冲突信息（如用户名已存在） |
| 500 | 服务器内部错误 | 显示"服务器繁忙，请稍后重试"，记录错误日志 |
| 网络错误 | 无网络/超时 | 显示"网络连接失败"，提供重试按钮，自动重试3次 |

### 8.3 用户反馈方式

| 方式 | 适用场景 | 实现 |
|------|----------|------|
| Toast通知 | 操作成功、普通错误 | sonner库，绿色/红色/黄色区分 |
| 表单内联错误 | 表单验证失败 | 字段下方红色文字，实时验证 |
| 全屏错误页面 | 404、500等严重错误 | 友好错误页面，包含操作按钮 |
| 确认对话框 | 删除等危险操作 | AlertDialog，说明操作后果 |

### 8.4 Axios拦截器实现

```typescript
// api/client.ts
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 30000,
});

// 请求拦截器：自动添加Token
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器：统一错误处理
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // 401: Token过期，尝试刷新
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const { accessToken } = await refreshTokens();
        useAuthStore.getState().setAccessToken(accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch {
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }
    
    // 其他错误，显示Toast
    const message = error.response?.data?.error?.message 
      || getHttpErrorMessage(error.response?.status)
      || '网络连接失败，请稍后重试';
    toast.error(message);
    
    return Promise.reject(error);
  }
);
```

### 8.5 TanStack Query配置

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
      onError: (error) => {
        console.error('Mutation error:', error);
      },
    },
  },
});
```

### 8.6 全局错误边界

```typescript
// components/ErrorBoundary.tsx
class ErrorBoundary extends Component<Props, State> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">出错了</h1>
            <p className="text-muted-foreground mb-6">页面遇到问题，请刷新重试</p>
            <Button onClick={() => window.location.reload()}>刷新页面</Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
```

## 9. 项目目录结构

```
knowledge-base-admin/
├── public/
│   └── locales/
│       ├── zh-CN.json
│       └── en-US.json
├── src/
│   ├── api/
│   │   ├── client.ts
│   │   ├── auth.ts
│   │   ├── knowledge.ts
│   │   ├── api-keys.ts
│   │   ├── users.ts
│   │   ├── audit-logs.ts
│   │   └── system.ts
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   └── MainLayout.tsx
│   │   └── common/
│   │       ├── DataTable.tsx
│   │       ├── Pagination.tsx
│   │       └── SearchBar.tsx
│   ├── features/
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── MfaPage.tsx
│   │   │   └── hooks/
│   │   ├── knowledge/
│   │   │   ├── KnowledgeListPage.tsx
│   │   │   ├── KnowledgeDetailPage.tsx
│   │   │   ├── components/
│   │   │   │   ├── KnowledgeForm.tsx
│   │   │   │   └── VersionHistory.tsx
│   │   │   └── hooks/
│   │   ├── api-keys/
│   │   │   ├── ApiKeysPage.tsx
│   │   │   └── components/
│   │   ├── users/
│   │   │   ├── UsersListPage.tsx
│   │   │   ├── UserDetailPage.tsx
│   │   │   ├── components/
│   │   │   │   ├── UserForm.tsx
│   │   │   │   └── ResetPasswordDialog.tsx
│   │   │   └── hooks/
│   │   ├── audit-logs/
│   │   │   ├── AuditLogsPage.tsx
│   │   │   └── components/
│   │   └── monitor/
│   │       └── DashboardPage.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   └── useTheme.ts
│   ├── stores/
│   │   ├── authStore.ts
│   │   └── themeStore.ts
│   ├── lib/
│   │   ├── utils.ts
│   │   └── constants.ts
│   ├── types/
│   │   ├── api.ts
│   │   └── models.ts
│   ├── themes/
│   │   ├── light.ts
│   │   ├── dark.ts
│   │   ├── eye-comfort.ts
│   │   └── index.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── router.tsx
├── tailwind.config.js
├── components.json
└── package.json
```

## 10. 性能优化

### 10.1 数据加载
- 分页加载：后端分页，前端缓存
- TanStack Query缓存：5分钟staleTime，减少重复请求
- 预加载：详情页预加载相邻数据

### 10.2 构建优化
- 路由懒加载：React.lazy + Suspense
- 代码分割：Vite自动分割
- Tree Shaking：移除未使用代码
- 压缩：生产环境压缩代码

### 10.3 渲染优化
- React.memo：避免不必要的重渲染
- useMemo/useCallback：缓存计算结果和回调
- 虚拟列表：如果未来需要长列表，使用@tanstack/react-virtual

## 11. 后续规划

### 11.1 第二阶段功能
- 高级搜索（多条件组合）
- 批量编辑功能
- 数据可视化增强（图表库集成）

### 11.2 优化方向
- PWA支持：离线可用
- 键盘快捷键
- 导出功能增强（CSV、Excel格式）
