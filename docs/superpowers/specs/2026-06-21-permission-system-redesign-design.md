# 权限系统重构设计文档

## 概述

本文档描述了知识库管理系统前端权限系统的重构设计。后端进行了大幅度重构，特别是用户管理和权限管理部分，引入了基于角色的访问控制（RBAC）模型和细粒度权限系统。前端需要相应地调整架构以支持这些变化。

## 设计目标

1. **完全重构**用户/权限模块
2. **支持细粒度权限控制**（如`users:read`、`users:write`等）
3. **动态路由和菜单**根据用户权限生成
4. **角色管理功能**支持CRUD操作
5. **渐进式重构**，分阶段交付

## 架构设计

### 整体架构

```
┌─────────────────────────────────────────────────────┐
│                    应用层                            │
├─────────────────────────────────────────────────────┤
│  PermissionContext (权限状态管理)                    │
│  ├── 用户信息 (id, username, role, isSuperAdmin)    │
│  ├── 权限列表 (permissions: string[])               │
│  └── 权限检查方法 (hasPermission, hasRole)          │
├─────────────────────────────────────────────────────┤
│  路由守卫 (Route Guards)                            │
│  ├── AuthenticatedRoute (已认证)                    │
│  ├── PermissionRoute (权限路由)                     │
│  └── RoleRoute (角色路由)                           │
├─────────────────────────────────────────────────────┤
│  动态菜单 (Dynamic Menu)                            │
│  ├── 根据权限过滤菜单项                             │
│  └── 支持细粒度权限控制                             │
├─────────────────────────────────────────────────────┤
│  API层                                             │
│  ├── adminRolesApi (角色管理API)                    │
│  └── 扩展现有API支持新权限模型                      │
└─────────────────────────────────────────────────────┘
```

### 核心设计原则

1. **权限集中管理**：通过`PermissionContext`统一管理用户权限状态
2. **声明式权限控制**：使用`<PermissionRoute>`组件声明权限要求
3. **细粒度权限**：支持`users:read`、`users:write`等细粒度权限
4. **动态路由**：根据用户权限动态生成可访问的路由

### 技术选型

- **状态管理**：React Context + useReducer（保持轻量）
- **路由**：react-router-dom（保持现有）
- **UI组件**：shadcn/ui（保持现有）
- **类型安全**：TypeScript（保持现有）

## 组件设计

### 1. 权限上下文组件

```typescript
// src/contexts/PermissionContext.tsx
interface PermissionState {
  user: {
    id: string
    username: string
    role: 'user' | 'admin' | 'super_admin'
    isSuperAdmin: boolean
    email: string
  } | null
  permissions: string[]
  loading: boolean
}

interface PermissionContextType extends PermissionState {
  hasPermission: (permission: string) => boolean
  hasAnyPermission: (permissions: string[]) => boolean
  hasAllPermissions: (permissions: string[]) => boolean
  hasRole: (role: 'user' | 'admin' | 'super_admin') => boolean
  hasMinRole: (minRole: 'user' | 'admin' | 'super_admin') => boolean
  refreshPermissions: () => Promise<void>
}
```

### 2. 路由守卫组件

```typescript
// src/components/auth/PermissionRoute.tsx
interface PermissionRouteProps {
  children: React.ReactNode
  permissions?: string[]  // 需要的权限
  requireAll?: boolean    // 是否需要所有权限（默认false，只需任一权限）
  fallback?: React.ReactNode
  redirectTo?: string
}

// 使用示例
<PermissionRoute permissions={['users:read', 'users:write']}>
  <UsersPage />
</PermissionRoute>

<PermissionRoute permissions={['roles:manage']} redirectTo="/dashboard">
  <RolesPage />
</PermissionRoute>
```

### 3. 权限指令组件

```typescript
// src/components/auth/PermissionGuard.tsx
interface PermissionGuardProps {
  children: React.ReactNode
  permissions: string[]
  requireAll?: boolean
  fallback?: React.ReactNode
}

// 使用示例
<PermissionGuard permissions={['users:write']}>
  <Button>创建用户</Button>
</PermissionGuard>

<PermissionGuard permissions={['roles:manage']} fallback={<Button disabled>无权限</Button>}>
  <Button>管理角色</Button>
</PermissionGuard>
```

### 4. 角色管理页面组件

```typescript
// src/pages/RolesPage.tsx
// 主要功能：
// 1. 角色列表（显示系统角色和自定义角色）
// 2. 创建自定义角色
// 3. 编辑角色（名称、描述、权限）
// 4. 删除自定义角色（系统角色不可删除）
// 5. 为用户分配角色

// 组件结构：
// - RoleList（角色列表）
// - RoleForm（角色表单）
// - PermissionSelector（权限选择器）
// - UserRoleAssignment（用户角色分配）
```

### 5. 组件文件结构

```
src/
├── contexts/
│   └── PermissionContext.tsx      # 权限上下文
├── components/
│   └── auth/
│       ├── PermissionRoute.tsx    # 权限路由守卫
│       ├── PermissionGuard.tsx    # 权限指令组件
│       └── RoleBadge.tsx          # 角色徽章组件
├── pages/
│   └── RolesPage.tsx              # 角色管理页面
├── api/
│   └── admin-roles.ts             # 角色管理API
└── types/
    └── roles.ts                   # 角色相关类型
```

## 数据流设计

### 1. 认证和权限数据流

```
┌─────────────────────────────────────────────────────────────┐
│  登录流程                                                   │
│  1. 用户登录 → POST /admin/auth/login                       │
│  2. 返回 accessToken + user (id, username, role, isSuperAdmin) │
│  3. 存储到 localStorage                                      │
│  4. PermissionContext 初始化用户信息                         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  权限获取流程                                                │
│  1. 用户登录成功后 → GET /admin/auth/profile                 │
│  2. 返回 permissions: string[]                               │
│  3. PermissionContext 存储权限列表                           │
│  4. super_admin 返回空数组，隐式拥有所有权限                 │
└─────────────────────────────────────────────────────────────┘
```

### 2. 权限检查数据流

```
┌─────────────────────────────────────────────────────────────┐
│  路由守卫检查                                                │
│  1. 用户访问受保护路由                                       │
│  2. PermissionRoute 检查 permissions                         │
│  3. 调用 hasPermission() 或 hasAnyPermission()              │
│  4. 通过 → 渲染子组件                                       │
│  5. 失败 → 重定向到 fallback 或 /dashboard                  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  UI元素权限检查                                              │
│  1. 组件渲染时检查权限                                       │
│  2. PermissionGuard 检查 permissions                         │
│  3. 通过 → 渲染 children                                    │
│  4. 失败 → 渲染 fallback 或隐藏元素                         │
└─────────────────────────────────────────────────────────────┘
```

### 3. 角色管理数据流

```
┌─────────────────────────────────────────────────────────────┐
│  角色列表                                                    │
│  1. 用户访问 /roles                                         │
│  2. RolesPage 调用 GET /admin/roles                         │
│  3. 返回角色列表（系统角色 + 自定义角色）                    │
│  4. 显示角色列表，系统角色标记为不可删除                     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  创建/编辑角色                                               │
│  1. 用户点击"创建角色"或"编辑角色"                          │
│  2. 打开 RoleForm 表单                                      │
│  3. 填写名称、描述、选择权限                                │
│  4. 提交 → POST /admin/roles 或 PUT /admin/roles/{id}       │
│  5. 成功 → 刷新角色列表                                    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  分配用户角色                                                │
│  1. 用户管理页面显示用户角色                                 │
│  2. 点击"编辑角色" → 打开角色选择器                         │
│  3. 选择角色 → PUT /admin/users/{id}                        │
│  4. 成功 → 刷新用户列表                                    │
└─────────────────────────────────────────────────────────────┘
```

### 4. 状态管理

```typescript
// localStorage 存储结构
{
  "accessToken": "jwt_token",
  "refreshToken": "refresh_token",
  "user": {
    "id": "user_id",
    "username": "admin",
    "role": "super_admin",
    "isSuperAdmin": true,
    "email": "admin@example.com"
  }
}

// PermissionContext 状态
{
  user: { ... },           // 从 localStorage 初始化
  permissions: [...],      // 从 API 获取
  loading: false           // 加载状态
}
```

### 5. API调用流程

```typescript
// 登录流程
const login = async (username: string, password: string) => {
  const response = await authApi.login({ username, password })
  localStorage.setItem('accessToken', response.accessToken)
  localStorage.setItem('user', JSON.stringify(response.user))
  await refreshPermissions()
}

// 获取权限
const refreshPermissions = async () => {
  const profile = await authApi.getProfile()
  setPermissions(profile.permissions)
}

// 检查权限
const hasPermission = (permission: string) => {
  if (user?.isSuperAdmin) return true  // super_admin 隐式拥有所有权限
  return permissions.includes(permission)
}
```

## 错误处理策略

### 1. 权限不足错误

```typescript
// PermissionRoute 错误处理
const PermissionRoute = ({ children, permissions, fallback, redirectTo }) => {
  const { hasAnyPermission } = usePermission()
  
  if (!hasAnyPermission(permissions)) {
    // 方案1：重定向到指定页面
    if (redirectTo) {
      return <Navigate to={redirectTo} replace />
    }
    
    // 方案2：渲染备用UI
    if (fallback) {
      return <>{fallback}</>
    }
    
    // 方案3：显示权限不足提示
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <h2 className="text-2xl font-bold mb-4">权限不足</h2>
        <p className="text-muted-foreground">您没有访问此页面的权限</p>
        <Button onClick={() => navigate('/dashboard')} className="mt-4">
          返回首页
        </Button>
      </div>
    )
  }
  
  return <>{children}</>
}
```

### 2. API错误处理

```typescript
// 角色管理API错误处理
const rolesApi = {
  async getRoles(): Promise<Role[]> {
    try {
      return await apiClient.get('/admin/roles')
    } catch (error) {
      if (error.response?.status === 403) {
        throw new Error('您没有权限管理角色')
      }
      throw error
    }
  },
  
  async createRole(data: CreateRoleRequest): Promise<Role> {
    try {
      return await apiClient.post('/admin/roles', data)
    } catch (error) {
      if (error.response?.status === 409) {
        throw new Error('角色名称已存在')
      }
      if (error.response?.status === 403) {
        throw new Error('您没有权限创建角色')
      }
      throw error
    }
  }
}
```

### 3. Toast通知错误

```typescript
// 在组件中使用toast通知错误
const handleCreateRole = async (data: CreateRoleRequest) => {
  try {
    await rolesApi.createRole(data)
    toast({
      title: '成功',
      description: '角色创建成功',
    })
    refreshRoles()
  } catch (error) {
    toast({
      title: '错误',
      description: error.message,
      variant: 'destructive',
    })
  }
}
```

## 测试策略

### 1. 单元测试

```typescript
// src/contexts/__tests__/PermissionContext.test.tsx
describe('PermissionContext', () => {
  it('should check permission correctly for super_admin', () => {
    const { result } = renderHook(() => usePermission(), { wrapper })
    
    act(() => {
      result.current.setUser({
        id: '1',
        username: 'admin',
        role: 'super_admin',
        isSuperAdmin: true,
        email: 'admin@example.com'
      })
    })
    
    // super_admin 隐式拥有所有权限
    expect(result.current.hasPermission('users:read')).toBe(true)
    expect(result.current.hasPermission('roles:manage')).toBe(true)
  })
  
  it('should check permission correctly for regular user', () => {
    const { result } = renderHook(() => usePermission(), { wrapper })
    
    act(() => {
      result.current.setUser({
        id: '2',
        username: 'user',
        role: 'user',
        isSuperAdmin: false,
        email: 'user@example.com'
      })
      result.current.setPermissions(['users:read'])
    })
    
    expect(result.current.hasPermission('users:read')).toBe(true)
    expect(result.current.hasPermission('users:write')).toBe(false)
  })
})
```

### 2. 集成测试

```typescript
// src/components/auth/__tests__/PermissionRoute.test.tsx
describe('PermissionRoute', () => {
  it('should render children when user has required permission', () => {
    render(
      <PermissionRoute permissions={['users:read']}>
        <div>Protected Content</div>
      </PermissionRoute>
    )
    
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })
  
  it('should redirect when user lacks required permission', () => {
    render(
      <MemoryRouter>
        <PermissionRoute permissions={['users:read']} redirectTo="/dashboard">
          <div>Protected Content</div>
        </PermissionRoute>
      </MemoryRouter>
    )
    
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
    expect(screen.getByText('Redirecting to /dashboard')).toBeInTheDocument()
  })
})
```

### 3. E2E测试

```typescript
// cypress/e2e/roles.cy.ts
describe('Role Management', () => {
  it('should create a new role', () => {
    cy.login('super_admin')
    cy.visit('/roles')
    
    // 点击创建角色按钮
    cy.get('button').contains('创建角色').click()
    
    // 填写表单
    cy.get('input[name="name"]').type('Test Role')
    cy.get('textarea[name="description"]').type('Test Description')
    
    // 选择权限
    cy.get('button').contains('users:read').click()
    cy.get('button').contains('users:write').click()
    
    // 提交表单
    cy.get('button').contains('保存').click()
    
    // 验证角色创建成功
    cy.contains('Test Role').should('exist')
  })
  
  it('should prevent non-super_admin from accessing roles page', () => {
    cy.login('admin')
    cy.visit('/roles')
    
    // 应该被重定向到dashboard
    cy.url().should('include', '/dashboard')
  })
})
```

## 性能优化

### 1. 权限缓存

```typescript
// 使用useMemo缓存权限检查结果
const hasPermission = useMemo(() => {
  return (permission: string) => {
    if (user?.isSuperAdmin) return true
    return permissions.includes(permission)
  }
}, [user, permissions])
```

### 2. 路由懒加载

```typescript
// 使用React.lazy懒加载角色管理页面
const RolesPage = React.lazy(() => import('@/pages/RolesPage'))

// 在路由配置中使用
{
  path: '/roles',
  element: (
    <PermissionRoute permissions={['roles:manage']}>
      <Suspense fallback={<div>Loading...</div>}>
        <RolesPage />
      </Suspense>
    </PermissionRoute>
  )
}
```

## 国际化支持

```typescript
// 使用react-i18next支持多语言
const { t } = useTranslation()

// 权限错误消息
t('errors.permissionDenied')  // '权限不足'
t('errors.roleAlreadyExists') // '角色名称已成功'

// 角色管理页面
t('roles.title')      // '角色管理'
t('roles.create')     // '创建角色'
t('roles.edit')       // '编辑角色'
t('roles.delete')     // '删除角色'
t('roles.systemRole') // '系统角色'
```

## 实施计划

### 分阶段交付计划

根据需求，采用**渐进式重构**方法，分三个阶段交付：

#### 阶段一：角色管理界面（第一阶段）
**目标**：添加角色管理功能，支持CRUD操作

**任务清单**：
1. 创建角色管理API（`src/api/admin-roles.ts`）
2. 创建角色相关类型定义（`src/types/roles.ts`）
3. 创建角色管理页面（`src/pages/RolesPage.tsx`）
4. 添加角色管理路由（`/roles`）
5. 更新导航菜单，添加角色管理入口
6. 编写单元测试和集成测试

**交付物**：
- 角色列表页面
- 创建/编辑角色表单
- 权限选择器组件
- 角色删除功能（仅自定义角色）
- 系统角色保护（不可删除）

#### 阶段二：动态路由和权限控制
**目标**：重构权限系统，支持细粒度权限控制

**任务清单**：
1. 创建权限上下文（`src/contexts/PermissionContext.tsx`）
2. 创建权限路由守卫（`src/components/auth/PermissionRoute.tsx`）
3. 创建权限指令组件（`src/components/auth/PermissionGuard.tsx`）
4. 重构现有路由守卫，使用新的权限系统
5. 重构导航菜单，支持动态权限过滤
6. 更新登录流程，获取用户权限
7. 编写单元测试和集成测试

**交付物**：
- 权限上下文和钩子
- 权限路由守卫组件
- 权限指令组件
- 动态导航菜单
- 细粒度权限控制

#### 阶段三：权限指令系统和优化
**目标**：完善权限指令系统，优化性能和用户体验

**任务清单**：
1. 创建角色徽章组件（`src/components/auth/RoleBadge.tsx`）
2. 优化权限检查性能（useMemo缓存）
3. 添加路由懒加载
4. 完善错误处理和Toast通知
5. 添加国际化支持
6. 编写E2E测试
7. 性能优化和代码清理

**交付物**：
- 角色徽章组件
- 性能优化
- 国际化支持
- E2E测试
- 完整文档

### 依赖关系

```
阶段一 → 阶段二 → 阶段三
   ↓        ↓        ↓
角色管理   权限系统   优化完善
```

**阶段一依赖**：
- 无外部依赖，可以独立开发

**阶段二依赖**：
- 依赖阶段一完成（角色管理API和类型）
- 需要后端支持权限API

**阶段三依赖**：
- 依赖阶段二完成（权限系统）
- 需要完整的测试环境

### 验收标准

#### 阶段一验收标准
- [ ] 角色列表页面显示所有角色
- [ ] 系统角色标记为不可删除
- [ ] 可以创建自定义角色
- [ ] 可以编辑角色名称、描述、权限
- [ ] 可以删除自定义角色
- [ ] 权限选择器显示所有可用权限
- [ ] 表单验证和错误处理正常
- [ ] 单元测试覆盖率达到80%

#### 阶段二验收标准
- [ ] 权限上下文正常工作
- [ ] 路由守卫正确检查权限
- [ ] 导航菜单根据权限动态显示
- [ ] 登录后正确获取用户权限
- [ ] super_admin隐式拥有所有权限
- [ ] 权限不足时显示友好提示
- [ ] 集成测试覆盖核心流程

#### 阶段三验收标准
- [ ] 角色徽章正确显示用户角色
- [ ] 权限检查性能优化（无重复计算）
- [ ] 路由懒加载正常工作
- [ ] 国际化支持完整
- [ ] E2E测试通过
- [ ] 代码清理，无冗余代码

### 风险评估

#### 阶段一风险
- **低风险**：主要是新增功能，不影响现有代码
- **缓解措施**：充分测试，确保现有功能不受影响

#### 阶段二风险
- **中风险**：重构权限系统，可能影响现有路由守卫
- **缓解措施**：渐进式重构，保持向后兼容

#### 阶段三风险
- **低风险**：主要是优化和完善
- **缓解措施**：充分测试，确保性能优化不引入新问题

### 时间估算

#### 阶段一：角色管理界面
- **预计时间**：3-5天
- **主要工作**：API开发、页面开发、测试

#### 阶段二：动态路由和权限控制
- **预计时间**：5-7天
- **主要工作**：权限系统重构、路由守卫、测试

#### 阶段三：权限指令系统和优化
- **预计时间**：2-3天
- **主要工作**：优化、国际化、测试

**总计**：10-15天

## 总结

本设计文档详细描述了权限系统重构的整体架构、组件设计、数据流、错误处理、测试策略和实施计划。采用渐进式重构方法，分三个阶段交付，确保风险可控、代码质量高、用户体验好。

通过这次重构，系统将支持细粒度权限控制、动态路由和菜单、角色管理等功能，满足后端重构带来的新需求，同时保持现有功能的稳定性。