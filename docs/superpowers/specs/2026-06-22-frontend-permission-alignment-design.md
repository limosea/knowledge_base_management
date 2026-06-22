# 前端权限系统对齐设计文档

## 概述

本文档描述前端权限系统与后端重构后的 API 对齐方案。后端引入了：
1. **细粒度权限系统**：11 种可配置权限
2. **三角色模型**：`super_admin`、`admin`、`user`
3. **Step-up Elevation**：个人控制台与高级控制台分离
4. **内容屏蔽功能**：`shielded`/`unshielded`

## 设计目标

1. 类型定义与 API 完全对齐
2. 支持细粒度权限检查
3. 实现个人控制台与高级控制台分离
4. 支持内容屏蔽功能
5. 渐进式重构，分阶段交付

---

## 第一部分：类型系统更新

### 1.1 权限类型定义

```typescript
// src/types/roles.ts

export type Permission =
  | 'users:list'
  | 'users:manage'
  | 'content:view_shielded'
  | 'content:shield'
  | 'content:unshield'
  | 'apikeys:list'
  | 'apikeys:manage'
  | 'audit:read'
  | 'analytics:read'
  | 'system:read'
  | 'stats:read'

export const PERMISSION_LABELS: Record<Permission, string> = {
  'users:list': '列出用户',
  'users:manage': '管理用户（创建/编辑/停用/重置密码）',
  'content:view_shielded': '查看已屏蔽内容',
  'content:shield': '屏蔽内容',
  'content:unshield': '解除屏蔽',
  'apikeys:list': '列出 API Key',
  'apikeys:manage': '管理 API Key',
  'audit:read': '查看审计日志',
  'analytics:read': '查看分析数据',
  'system:read': '查看系统信息',
  'stats:read': '查看统计信息',
}

export const PERMISSION_DESCRIPTIONS: Record<Permission, string> = {
  'users:list': '列出全站管理员用户',
  'users:manage': '创建/编辑/停用/重置密码管理员用户（仅 super_admin）',
  'content:view_shielded': '在列表/详情中可见已被屏蔽的库或条目',
  'content:shield': '将他人已公开的库/条目标记为屏蔽',
  'content:unshield': '解除屏蔽，恢复公开',
  'apikeys:list': '列出全站 API Key',
  'apikeys:manage': '管理全站任意 API Key（仅 super_admin）',
  'audit:read': '查看审计日志',
  'analytics:read': '查看分析数据',
  'system:read': '查看系统信息',
  'stats:read': '查看统计信息',
}
```

### 1.2 角色类型更新

```typescript
// src/types/index.ts

export type AdminRole = 'user' | 'admin' | 'super_admin'
```

### 1.3 登录响应类型

```typescript
export interface LoginResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
  requirePasswordChange?: boolean
  user: {
    id: string
    username: string
    role: AdminRole
    email: string
    isSuperAdmin: boolean
    permissions: Permission[]
  }
}
```

### 1.4 用户资料类型

```typescript
export interface AdminProfile {
  id: string
  username: string
  email: string
  role: AdminRole
  isSuperAdmin: boolean
  permissions: Permission[]
  mfaEnabled: boolean
  createdAt: string
}
```

### 1.5 管理员用户摘要

```typescript
export interface AdminUserSummary {
  id: string
  username: string
  email: string
  role: AdminRole
  isActive: boolean
  mfaEnabled: boolean
  lastLoginAt?: string
  createdBy?: string
  createdAt: string
}
```

### 1.6 知识条目类型更新

```typescript
export interface AdminKnowledgeListItem {
  id: string
  title: string
  category?: string
  tags: string[]
  qualityScore?: number
  visibility: 'private' | 'public'
  shielded: boolean
  shieldedAt?: string
  createdAt: string
  createdBy: string
}
```

### 1.7 Elevation 状态类型

```typescript
export interface ElevationStatus {
  elevated: boolean
  elevatedUntil?: string
  remainingSeconds?: number
  mfaEnabled: boolean
  isSuperAdmin: boolean
  permissions: {
    held: Permission[]
    baseline: Permission[]
    elevated_only: Permission[]
  }
}

export interface ElevationStepUpResponse {
  elevated: boolean
  elevatedUntil: string
  expiresIn: number
}
```

---

## 第二部分：权限上下文设计

### 2.1 PermissionContext

```typescript
// src/contexts/PermissionContext.tsx

interface PermissionState {
  user: {
    id: string
    username: string
    role: AdminRole
    isSuperAdmin: boolean
    email: string
  } | null
  permissions: Permission[]
  elevation: {
    elevated: boolean
    elevatedUntil?: string
    remainingSeconds?: number
    mfaEnabled: boolean
    baseline: Permission[]
    elevatedOnly: Permission[]
  }
  loading: boolean
}

interface PermissionContextType extends PermissionState {
  hasPermission: (permission: Permission) => boolean
  hasAnyPermission: (permissions: Permission[]) => boolean
  hasAllPermissions: (permissions: Permission[]) => boolean
  hasMinRole: (minRole: AdminRole) => boolean
  isElevated: () => boolean
  canAccessElevated: () => boolean
  stepUp: (code: string) => Promise<ElevationStepUpResponse>
  revokeElevation: () => Promise<void>
  refreshElevationStatus: () => Promise<void>
  refreshPermissions: () => Promise<void>
}
```

### 2.2 权限检查逻辑

```typescript
const hasPermission = (permission: Permission) => {
  if (user?.isSuperAdmin) return true
  return permissions.includes(permission)
}

const isElevated = () => {
  if (user?.isSuperAdmin) return true
  return elevation.elevated && elevation.remainingSeconds > 0
}

const canAccessElevated = () => {
  return elevation.mfaEnabled && elevation.elevatedOnly.length > 0
}

const hasElevatedPermission = (permission: Permission) => {
  if (!isElevated()) return false
  return hasPermission(permission)
}
```

---

## 第三部分：路由守卫设计

### 3.1 PermissionRoute

```typescript
// src/components/auth/PermissionRoute.tsx

interface PermissionRouteProps {
  children: React.ReactNode
  permissions?: Permission[]
  requireAll?: boolean
  requireElevation?: boolean
  fallback?: React.ReactNode
  redirectTo?: string
}

// 使用示例
<PermissionRoute permissions={['users:list']}>
  <UsersPage />
</PermissionRoute>

<PermissionRoute requireElevation>
  <RolesPage />
</PermissionRoute>
```

### 3.2 PermissionGuard

```typescript
// src/components/auth/PermissionGuard.tsx

interface PermissionGuardProps {
  children: React.ReactNode
  permissions?: Permission[]
  requireAll?: boolean
  requireElevation?: boolean
  fallback?: React.ReactNode
}

// 使用示例
<PermissionGuard permissions={['content:shield']} requireElevation>
  <Button onClick={handleShield}>屏蔽</Button>
</PermissionGuard>
```

### 3.3 ElevationRoute

```typescript
// src/components/auth/ElevationRoute.tsx

interface ElevationRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

// 检查是否已提权，未提权则显示提权对话框
```

### 3.4 路由权限映射

| 路由 | 权限要求 | 提权要求 | 说明 |
|------|---------|---------|------|
| `/dashboard` | 无 | 否 | 个人控制台 |
| `/me/api-keys` | 无 | 否 | 个人控制台 |
| `/knowledge` | 无 | 否 | 个人控制台（自己的条目） |
| `/users` | `users:list` | 是（写操作） | 高级控制台 |
| `/roles` | 无（super_admin only） | 是 | 高级控制台 |
| `/api-keys` | `apikeys:list` | 是（写操作） | 高级控制台 |
| `/audit-logs` | `audit:read` | 否 | 高级控制台 |
| `/system` | `system:read` | 否 | 高级控制台 |
| `/analytics/*` | `analytics:read` 或 `stats:read` | 否 | 高级控制台 |

---

## 第四部分：Step-up Elevation 设计

### 4.1 API 封装

```typescript
// src/api/elevation.ts

export const elevationApi = {
  stepUp: (code: string): Promise<ElevationStepUpResponse> => {
    return apiClient.post('/admin/elevation/step-up', { code })
  },

  getStatus: (): Promise<ElevationStatus> => {
    return apiClient.get('/admin/elevation/status')
  },

  revoke: (): Promise<{ elevated: boolean }> => {
    return apiClient.post('/admin/elevation/revoke')
  },
}
```

### 4.2 提权对话框组件

```typescript
// src/components/auth/ElevationDialog.tsx

interface ElevationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

// 流程：
// 1. 检查 mfaEnabled，未启用则引导设置
// 2. 显示 TOTP 输入框
// 3. 调用 stepUp API
// 4. 成功后调用 onSuccess
```

### 4.3 高级控制台入口

```typescript
// src/components/layout/ElevationToggle.tsx

// 在导航栏显示：
// - 未提权时：显示"进入高级控制台"按钮
// - 已提权时：显示剩余时间 + "退出高级控制台"按钮
// - 无高级权限时：不显示
```

### 4.4 提权状态指示器

```typescript
// src/components/layout/ElevationIndicator.tsx

// 在页面顶部显示：
// - 已提权时：显示警告条"高级模式 · 剩余 XX 分钟"
// - 点击可退出
```

---

## 第五部分：导航菜单设计

### 5.1 个人控制台菜单

```typescript
const personalNavItems: NavItem[] = [
  { path: '/dashboard', icon: LayoutDashboard, labelKey: 'nav.overview' },
  { path: '/me/api-keys', icon: Key, labelKey: 'nav.myApiKeys' },
  { path: '/knowledge', icon: BookOpen, labelKey: 'nav.knowledge' },
  { path: '/categories', icon: Tag, labelKey: 'nav.categories' },
]
```

### 5.2 高级控制台菜单

```typescript
const elevatedNavItems: NavItem[] = [
  { 
    path: '/users', 
    icon: Users, 
    labelKey: 'nav.userManagement',
    permissions: ['users:list'],
    requireElevation: true,
  },
  { 
    path: '/roles', 
    icon: Shield, 
    labelKey: 'nav.roleManagement',
    requireElevation: true,
    superAdminOnly: true,
  },
  { 
    path: '/api-keys', 
    icon: Key, 
    labelKey: 'nav.apiKeys',
    permissions: ['apikeys:list'],
  },
  { 
    path: '/audit-logs', 
    icon: FileText, 
    labelKey: 'nav.auditLogs',
    permissions: ['audit:read'],
  },
  { 
    path: '/system', 
    icon: Activity, 
    labelKey: 'nav.systemMonitor',
    permissions: ['system:read'],
  },
  {
    icon: BarChart3,
    labelKey: 'nav.analytics',
    collapsible: true,
    children: [
      { path: '/analytics/knowledge', icon: BookOpen, labelKey: 'analytics.knowledgeAnalysis', permissions: ['analytics:read'] },
      { path: '/analytics/search', icon: Search, labelKey: 'analytics.searchAnalysis', permissions: ['stats:read'] },
      { path: '/analytics/api', icon: KeyRound, labelKey: 'analytics.apiAnalysis', permissions: ['stats:read'] },
      { path: '/analytics/performance', icon: Gauge, labelKey: 'analytics.performanceAndAudit', permissions: ['audit:read'] },
    ],
  },
]
```

### 5.3 菜单过滤逻辑

```typescript
const filterNavItems = (items: NavItem[], context: PermissionContextType) => {
  return items.filter(item => {
    if (item.superAdminOnly && !context.user?.isSuperAdmin) return false
    if (item.permissions && !context.hasAnyPermission(item.permissions)) return false
    if (item.requireElevation && !context.canAccessElevated()) return false
    return true
  })
}
```

---

## 第六部分：内容屏蔽功能设计

### 6.1 API 封装

```typescript
// src/api/knowledge.ts（新增）

export const knowledgeApi = {
  // ... 现有方法
  
  shield: (id: string): Promise<KnowledgeEntry> => {
    return apiClient.post(`/admin/knowledge/${id}/shield`)
  },
  
  unshield: (id: string): Promise<KnowledgeEntry> => {
    return apiClient.post(`/admin/knowledge/${id}/unshield`)
  },
  
  batchShield: (ids: string[]): Promise<{ shielded: number; skipped: number }> => {
    return apiClient.post('/admin/knowledge/batch-shield', { ids })
  },
  
  batchUnshield: (ids: string[]): Promise<{ unshielded: number; skipped: number }> => {
    return apiClient.post('/admin/knowledge/batch-unshield', { ids })
  },
}
```

### 6.2 知识条目列表增强

```typescript
// 新增列
<TableHead>可见性</TableHead>
<TableHead>屏蔽状态</TableHead>

// 条目操作
<PermissionGuard permissions={['content:shield']} requireElevation>
  {entry.shielded ? (
    <Button size="sm" variant="outline" onClick={() => handleUnshield(entry.id)}>
      解除屏蔽
    </Button>
  ) : (
    <Button size="sm" variant="destructive" onClick={() => handleShield(entry.id)}>
      屏蔽
    </Button>
  )}
</PermissionGuard>
```

### 6.3 批量操作工具栏

```typescript
// 仅在选中条目且已提权时显示
{selectedIds.length > 0 && isElevated() && hasPermission('content:shield') && (
  <div className="bulk-actions">
    <Button onClick={handleBatchShield}>批量屏蔽 ({selectedIds.length})</Button>
    <Button onClick={handleBatchUnshield}>批量解除 ({selectedIds.length})</Button>
  </div>
)}
```

---

## 第七部分：用户管理页面更新

### 7.1 创建用户表单

```typescript
// 角色选项
<select name="role">
  <option value="user">普通用户</option>
  <option value="admin">管理员</option>
  {/* super_admin 只能通过数据库初始化 */}
</select>
```

### 7.2 权限控制

```typescript
// 创建按钮
<PermissionGuard permissions={['users:manage']} requireElevation>
  <Button onClick={handleCreate}>创建用户</Button>
</PermissionGuard>

// 编辑/删除按钮
<PermissionGuard permissions={['users:manage']} requireElevation>
  <Button onClick={handleEdit}>编辑</Button>
  <Button onClick={handleDelete}>删除</Button>
</PermissionGuard>
```

---

## 第八部分：实施计划

### 阶段一：类型系统和 API 对齐（1-2 天）

**任务清单**：
1. 更新 `src/types/roles.ts` 权限类型定义
2. 更新 `src/types/index.ts` 用户相关类型
3. 新增 `src/types/elevation.ts` 提权类型
4. 更新 `src/api/auth.ts` 登录响应处理
5. 新增 `src/api/elevation.ts` 提权 API
6. 更新 `src/api/admin-users.ts` 支持新字段
7. 更新 `src/api/knowledge.ts` 新增屏蔽 API
8. 更新 `src/components/roles/PermissionSelector.tsx` 权限选项

**交付物**：
- 类型定义与 API 完全一致
- 编译通过，无类型错误

### 阶段二：权限上下文和路由守卫（3-4 天）

**任务清单**：
1. 创建 `src/contexts/PermissionContext.tsx`
2. 创建 `src/components/auth/PermissionRoute.tsx`
3. 创建 `src/components/auth/PermissionGuard.tsx`
4. 创建 `src/components/auth/ElevationRoute.tsx`
5. 更新 `src/router.tsx` 使用权限路由
6. 更新 `src/components/layout/MainLayout.tsx` 导航权限过滤
7. 更新登录流程，获取并存储权限信息

**交付物**：
- 权限上下文正常工作
- 路由和菜单根据权限动态显示
- super_admin 隐式拥有所有权限

### 阶段三：Step-up Elevation 功能（2-3 天）

**任务清单**：
1. 创建 `src/components/auth/ElevationDialog.tsx`
2. 创建 `src/components/layout/ElevationToggle.tsx`
3. 创建 `src/components/layout/ElevationIndicator.tsx`
4. 更新 `MainLayout` 集成提权组件
5. 处理 `403 ELEVATION_REQUIRED` 错误响应

**交付物**：
- 用户可通过 TOTP 进入高级控制台
- 高级模式有剩余时间指示
- 可随时退出高级模式

### 阶段四：功能组件更新（2-3 天）

**任务清单**：
1. 更新 `src/pages/KnowledgePage.tsx` 支持屏蔽功能
2. 更新 `src/pages/UsersPage.tsx` 支持新角色和权限
3. 更新 `src/pages/RolesPage.tsx` 使用新权限列表
4. 更新 `src/pages/ApiKeysPage.tsx` 权限检查
5. 更新分析页面权限检查

**交付物**：
- 所有页面正确使用权限检查
- 屏蔽功能可用
- 高级控制台功能正常

---

## 第九部分：文件变更清单

```
src/
├── types/
│   ├── index.ts                    # 更新：用户类型、权限类型
│   ├── roles.ts                    # 更新：权限定义
│   └── elevation.ts                # 新增：提权类型
├── contexts/
│   └── PermissionContext.tsx       # 新增
├── components/
│   └── auth/
│       ├── PermissionRoute.tsx     # 新增
│       ├── PermissionGuard.tsx     # 新增
│       ├── ElevationRoute.tsx      # 新增
│       └── ElevationDialog.tsx     # 新增
│   └── layout/
│       ├── MainLayout.tsx          # 更新：导航权限过滤
│       ├── ElevationToggle.tsx     # 新增
│       └── ElevationIndicator.tsx  # 新增
│   └── roles/
│       └── PermissionSelector.tsx  # 更新：权限选项
├── pages/
│   ├── KnowledgePage.tsx           # 更新：屏蔽功能
│   ├── UsersPage.tsx               # 更新：角色和权限
│   ├── RolesPage.tsx               # 更新：权限列表
│   └── ...
├── api/
│   ├── auth.ts                     # 更新：登录响应处理
│   ├── elevation.ts                # 新增
│   ├── admin-users.ts              # 更新：新字段
│   ├── knowledge.ts                # 更新：屏蔽 API
│   └── ...
└── router.tsx                      # 更新：权限路由
```

**总计**：约 8-12 天

---

## 第十部分：错误处理

### 10.1 ELEVATION_REQUIRED 错误

```typescript
// 当后端返回 403 ELEVATION_REQUIRED 时
if (error.code === 'ELEVATION_REQUIRED') {
  // 显示提权对话框
  showElevationDialog()
}
```

### 10.2 MFA_NOT_ENABLED 错误

```typescript
// 当后端返回 409 MFA_NOT_ENABLED 时
if (error.code === 'MFA_NOT_ENABLED') {
  // 引导用户设置 MFA
  navigate('/settings/mfa')
}
```

---

## 第十一部分：验收标准

### 阶段一验收
- [ ] 类型定义与 API 文档一致
- [ ] 编译通过，无类型错误
- [ ] 现有功能不受影响

### 阶段二验收
- [ ] 权限上下文正常工作
- [ ] 路由守卫正确检查权限
- [ ] 导航菜单根据权限动态显示
- [ ] super_admin 隐式拥有所有权限

### 阶段三验收
- [ ] 用户可通过 TOTP 进入高级控制台
- [ ] 高级模式有剩余时间指示
- [ ] 可随时退出高级模式
- [ ] 未启用 MFA 时引导设置

### 阶段四验收
- [ ] 所有页面正确使用权限检查
- [ ] 屏蔽功能可用
- [ ] 用户管理支持新角色
- [ ] 高级控制台功能正常
