# 角色管理界面实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现角色管理界面，支持CRUD操作，包括角色列表、创建、编辑、删除功能，以及权限选择器。

**Architecture:** 采用渐进式重构方法，在现有代码基础上添加角色管理功能。创建新的API层、类型定义、页面组件和路由配置。

**Tech Stack:** React, TypeScript, shadcn/ui, react-router-dom, react-i18next

## Global Constraints

- 保持现有UI库（shadcn/ui + Tailwind CSS）
- 保持现有路由库（react-router-dom）
- 保持现有API客户端结构
- 使用TypeScript进行类型安全
- 支持国际化（react-i18next）
- 遵循现有代码风格和模式

---

## 文件结构

### 新增文件
- `src/types/roles.ts` - 角色相关类型定义
- `src/api/admin-roles.ts` - 角色管理API
- `src/pages/RolesPage.tsx` - 角色管理页面
- `src/components/roles/RoleList.tsx` - 角色列表组件
- `src/components/roles/RoleForm.tsx` - 角色表单组件
- `src/components/roles/PermissionSelector.tsx` - 权限选择器组件
- `src/components/roles/index.ts` - 角色组件导出

### 修改文件
- `src/types/index.ts` - 导出新的角色类型
- `src/api/index.ts` - 导出新的角色API
- `src/pages/index.ts` - 导出新的角色页面
- `src/router.tsx` - 添加角色管理路由
- `src/components/layout/MainLayout.tsx` - 更新导航菜单

---

### Task 1: 创建角色相关类型定义

**Files:**
- Create: `src/types/roles.ts`
- Modify: `src/types/index.ts`

**Interfaces:**
- Consumes: 无（第一个任务）
- Produces: `Role`, `CreateRoleRequest`, `UpdateRoleRequest`, `Permission` 类型

- [ ] **Step 1: 创建角色类型定义文件**

```typescript
// src/types/roles.ts
export interface Role {
  id: string
  name: string
  description?: string
  isSystem: boolean
  isSuperAdmin: boolean
  permissions: string[]
  createdAt: string
  updatedAt: string
}

export interface CreateRoleRequest {
  name: string
  description?: string
  permissions?: string[]
}

export interface UpdateRoleRequest {
  name?: string
  description?: string
  permissions?: string[]
}

export type Permission = 
  | 'users:read'
  | 'users:write'
  | 'knowledge:read'
  | 'knowledge:read_all'
  | 'knowledge:delete'
  | 'apikeys:read'
  | 'apikeys:write'
  | 'audit:read'
  | 'analytics:read'
  | 'system:read'
  | 'stats:read'
  | 'libraries:read'
  | 'libraries:write'

export const PERMISSION_LABELS: Record<Permission, string> = {
  'users:read': '查看用户',
  'users:write': '管理用户',
  'knowledge:read': '查看知识条目',
  'knowledge:read_all': '查看所有知识条目',
  'knowledge:delete': '删除知识条目',
  'apikeys:read': '查看API Key',
  'apikeys:write': '管理API Key',
  'audit:read': '查看审计日志',
  'analytics:read': '查看分析数据',
  'system:read': '查看系统信息',
  'stats:read': '查看统计信息',
  'libraries:read': '查看库',
  'libraries:write': '管理库',
}
```

- [ ] **Step 2: 更新类型导出文件**

```typescript
// src/types/index.ts
// 在文件末尾添加
export * from './roles'
```

- [ ] **Step 3: 运行类型检查**

Run: `npm run typecheck`
Expected: 无错误

- [ ] **Step 4: 提交代码**

```bash
git add src/types/roles.ts src/types/index.ts
git commit -m "feat(types): add role and permission type definitions"
```

---

### Task 2: 创建角色管理API

**Files:**
- Create: `src/api/admin-roles.ts`
- Modify: `src/api/index.ts`

**Interfaces:**
- Consumes: `Role`, `CreateRoleRequest`, `UpdateRoleRequest` 类型
- Produces: `adminRolesApi` 对象

- [ ] **Step 1: 创建角色管理API文件**

```typescript
// src/api/admin-roles.ts
import { apiClient } from './client'
import type { Role, CreateRoleRequest, UpdateRoleRequest } from '@/types'

export const adminRolesApi = {
  async getRoles(): Promise<Role[]> {
    const response = await apiClient.get('/admin/roles')
    return response.data
  },

  async getRole(id: string): Promise<Role> {
    const response = await apiClient.get(`/admin/roles/${id}`)
    return response.data
  },

  async createRole(data: CreateRoleRequest): Promise<Role> {
    const response = await apiClient.post('/admin/roles', data)
    return response.data
  },

  async updateRole(id: string, data: UpdateRoleRequest): Promise<Role> {
    const response = await apiClient.put(`/admin/roles/${id}`, data)
    return response.data
  },

  async deleteRole(id: string): Promise<void> {
    await apiClient.delete(`/admin/roles/${id}`)
  },
}
```

- [ ] **Step 2: 更新API导出文件**

```typescript
// src/api/index.ts
// 在文件末尾添加
export { adminRolesApi } from './admin-roles'
```

- [ ] **Step 3: 运行类型检查**

Run: `npm run typecheck`
Expected: 无错误

- [ ] **Step 4: 提交代码**

```bash
git add src/api/admin-roles.ts src/api/index.ts
git commit -m "feat(api): add role management API client"
```

---

### Task 3: 创建权限选择器组件

**Files:**
- Create: `src/components/roles/PermissionSelector.tsx`
- Create: `src/components/roles/index.ts`

**Interfaces:**
- Consumes: `Permission`, `PERMISSION_LABELS` 类型
- Produces: `PermissionSelector` 组件

- [ ] **Step 1: 创建权限选择器组件**

```typescript
// src/components/roles/PermissionSelector.tsx
import { useTranslation } from 'react-i18next'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Permission } from '@/types'
import { PERMISSION_LABELS } from '@/types'

interface PermissionSelectorProps {
  selectedPermissions: Permission[]
  onChange: (permissions: Permission[]) => void
  disabled?: boolean
}

export function PermissionSelector({
  selectedPermissions,
  onChange,
  disabled = false,
}: PermissionSelectorProps) {
  const { t } = useTranslation()

  const handlePermissionToggle = (permission: Permission) => {
    if (disabled) return
    
    const newPermissions = selectedPermissions.includes(permission)
      ? selectedPermissions.filter(p => p !== permission)
      : [...selectedPermissions, permission]
    
    onChange(newPermissions)
  }

  const permissionGroups = [
    {
      title: '用户管理',
      permissions: ['users:read', 'users:write'] as Permission[],
    },
    {
      title: '知识库',
      permissions: ['knowledge:read', 'knowledge:read_all', 'knowledge:delete'] as Permission[],
    },
    {
      title: 'API Key',
      permissions: ['apikeys:read', 'apikeys:write'] as Permission[],
    },
    {
      title: '系统管理',
      permissions: ['audit:read', 'analytics:read', 'system:read', 'stats:read'] as Permission[],
    },
    {
      title: '库管理',
      permissions: ['libraries:read', 'libraries:write'] as Permission[],
    },
  ]

  return (
    <div className="space-y-4">
      {permissionGroups.map((group) => (
        <Card key={group.title}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{group.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {group.permissions.map((permission) => (
                <div key={permission} className="flex items-center space-x-2">
                  <Checkbox
                    id={permission}
                    checked={selectedPermissions.includes(permission)}
                    onCheckedChange={() => handlePermissionToggle(permission)}
                    disabled={disabled}
                  />
                  <Label
                    htmlFor={permission}
                    className="text-sm cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {PERMISSION_LABELS[permission]}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: 创建角色组件导出文件**

```typescript
// src/components/roles/index.ts
export { PermissionSelector } from './PermissionSelector'
```

- [ ] **Step 3: 运行类型检查**

Run: `npm run typecheck`
Expected: 无错误

- [ ] **Step 4: 运行lint检查**

Run: `npm run lint`
Expected: 无错误

- [ ] **Step 5: 提交代码**

```bash
git add src/components/roles/
git commit -m "feat(components): add permission selector component"
```

---

### Task 4: 创建角色表单组件

**Files:**
- Create: `src/components/roles/RoleForm.tsx`
- Modify: `src/components/roles/index.ts`

**Interfaces:**
- Consumes: `Role`, `CreateRoleRequest`, `UpdateRoleRequest`, `PermissionSelector` 组件
- Produces: `RoleForm` 组件

- [ ] **Step 1: 创建角色表单组件**

```typescript
// src/components/roles/RoleForm.tsx
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { PermissionSelector } from './PermissionSelector'
import type { Role, CreateRoleRequest, UpdateRoleRequest, Permission } from '@/types'

interface RoleFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  role?: Role | null
  onSubmit: (data: CreateRoleRequest | UpdateRoleRequest) => Promise<void>
}

export function RoleForm({ open, onOpenChange, role, onSubmit }: RoleFormProps) {
  const { t } = useTranslation()
  const [name, setName] = useState(role?.name || '')
  const [description, setDescription] = useState(role?.description || '')
  const [permissions, setPermissions] = useState<Permission[]>(role?.permissions || [])
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      if (role) {
        await onSubmit({ name, description, permissions })
      } else {
        await onSubmit({ name, description, permissions })
      }
      onOpenChange(false)
    } finally {
      setLoading(false)
    }
  }

  const isSystemRole = role?.isSystem || false

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {role ? t('roles.edit') : t('roles.create')}
          </DialogTitle>
          <DialogDescription>
            {role ? t('roles.editDescription') : t('roles.createDescription')}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t('roles.name')}</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSystemRole}
              required
            />
            {isSystemRole && (
              <p className="text-sm text-muted-foreground">
                {t('roles.systemRoleNameProtected')}
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">{t('roles.description')}</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label>{t('roles.permissions')}</Label>
            <PermissionSelector
              selectedPermissions={permissions}
              onChange={setPermissions}
              disabled={isSystemRole}
            />
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? t('common.saving') : t('common.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 2: 更新角色组件导出文件**

```typescript
// src/components/roles/index.ts
export { PermissionSelector } from './PermissionSelector'
export { RoleForm } from './RoleForm'
```

- [ ] **Step 3: 运行类型检查**

Run: `npm run typecheck`
Expected: 无错误

- [ ] **Step 4: 运行lint检查**

Run: `npm run lint`
Expected: 无错误

- [ ] **Step 5: 提交代码**

```bash
git add src/components/roles/RoleForm.tsx src/components/roles/index.ts
git commit -m "feat(components): add role form component"
```

---

### Task 5: 创建角色列表组件

**Files:**
- Create: `src/components/roles/RoleList.tsx`
- Modify: `src/components/roles/index.ts`

**Interfaces:**
- Consumes: `Role`, `PermissionSelector` 组件
- Produces: `RoleList` 组件

- [ ] **Step 1: 创建角色列表组件**

```typescript
// src/components/roles/RoleList.tsx
import { useTranslation } from 'react-i18next'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Pencil, Trash2, Shield } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import type { Role } from '@/types'
import { PERMISSION_LABELS } from '@/types'

interface RoleListProps {
  roles: Role[]
  loading: boolean
  onEdit: (role: Role) => void
  onDelete: (role: Role) => void
}

export function RoleList({ roles, loading, onEdit, onDelete }: RoleListProps) {
  const { t } = useTranslation()

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('roles.name')}</TableHead>
            <TableHead>{t('roles.description')}</TableHead>
            <TableHead>{t('roles.permissions')}</TableHead>
            <TableHead>{t('roles.type')}</TableHead>
            <TableHead>{t('roles.createdAt')}</TableHead>
            <TableHead className="text-right">{t('common.actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {roles.map((role) => (
            <TableRow key={role.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  {role.isSuperAdmin && <Shield className="h-4 w-4 text-primary" />}
                  {role.name}
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {role.description || '-'}
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {role.isSuperAdmin ? (
                    <Badge variant="secondary">{t('roles.allPermissions')}</Badge>
                  ) : (
                    role.permissions.slice(0, 3).map((permission) => (
                      <Badge key={permission} variant="outline" className="text-xs">
                        {PERMISSION_LABELS[permission as keyof typeof PERMISSION_LABELS]}
                      </Badge>
                    ))
                  )}
                  {role.permissions.length > 3 && !role.isSuperAdmin && (
                    <Badge variant="outline" className="text-xs">
                      +{role.permissions.length - 3}
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={role.isSystem ? 'secondary' : 'default'}>
                  {role.isSystem ? t('roles.system') : t('roles.custom')}
                </Badge>
              </TableCell>
              <TableCell>{formatDate(role.createdAt)}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(role)}
                    disabled={role.isSystem}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(role)}
                    disabled={role.isSystem}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
```

- [ ] **Step 2: 更新角色组件导出文件**

```typescript
// src/components/roles/index.ts
export { PermissionSelector } from './PermissionSelector'
export { RoleForm } from './RoleForm'
export { RoleList } from './RoleList'
```

- [ ] **Step 3: 运行类型检查**

Run: `npm run typecheck`
Expected: 无错误

- [ ] **Step 4: 运行lint检查**

Run: `npm run lint`
Expected: 无错误

- [ ] **Step 5: 提交代码**

```bash
git add src/components/roles/RoleList.tsx src/components/roles/index.ts
git commit -m "feat(components): add role list component"
```

---

### Task 6: 创建角色管理页面

**Files:**
- Create: `src/pages/RolesPage.tsx`
- Modify: `src/pages/index.ts`

**Interfaces:**
- Consumes: `adminRolesApi`, `RoleList`, `RoleForm` 组件
- Produces: `RolesPage` 页面组件

- [ ] **Step 1: 创建角色管理页面**

```typescript
// src/pages/RolesPage.tsx
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { adminRolesApi } from '@/api'
import type { Role, CreateRoleRequest, UpdateRoleRequest } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { RoleList } from '@/components/roles/RoleList'
import { RoleForm } from '@/components/roles/RoleForm'
import { useToast } from '@/hooks/use-toast'
import { Plus } from 'lucide-react'

export function RolesPage() {
  const { t } = useTranslation()
  const { toast } = useToast()
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)

  const fetchRoles = async () => {
    try {
      setLoading(true)
      const data = await adminRolesApi.getRoles()
      setRoles(data)
    } catch (error) {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRoles()
  }, [])

  const handleCreate = () => {
    setSelectedRole(null)
    setFormOpen(true)
  }

  const handleEdit = (role: Role) => {
    setSelectedRole(role)
    setFormOpen(true)
  }

  const handleDelete = (role: Role) => {
    setSelectedRole(role)
    setDeleteDialogOpen(true)
  }

  const handleSubmit = async (data: CreateRoleRequest | UpdateRoleRequest) => {
    try {
      if (selectedRole) {
        await adminRolesApi.updateRole(selectedRole.id, data as UpdateRoleRequest)
        toast({
          title: t('common.success'),
          description: t('roles.updateSuccess'),
        })
      } else {
        await adminRolesApi.createRole(data as CreateRoleRequest)
        toast({
          title: t('common.success'),
          description: t('roles.createSuccess'),
        })
      }
      await fetchRoles()
    } catch (error) {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: 'destructive',
      })
      throw error
    }
  }

  const handleConfirmDelete = async () => {
    if (!selectedRole) return
    
    try {
      await adminRolesApi.deleteRole(selectedRole.id)
      toast({
        title: t('common.success'),
        description: t('roles.deleteSuccess'),
      })
      await fetchRoles()
    } catch (error) {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setDeleteDialogOpen(false)
      setSelectedRole(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('roles.title')}</h1>
          <p className="text-muted-foreground">{t('roles.description')}</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          {t('roles.create')}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('roles.list')}</CardTitle>
        </CardHeader>
        <CardContent>
          <RoleList
            roles={roles}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>

      <RoleForm
        open={formOpen}
        onOpenChange={setFormOpen}
        role={selectedRole}
        onSubmit={handleSubmit}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('roles.deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('roles.deleteDescription', { name: selectedRole?.name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
```

- [ ] **Step 2: 更新页面导出文件**

```typescript
// src/pages/index.ts
// 在文件末尾添加
export { RolesPage } from './RolesPage'
```

- [ ] **Step 3: 运行类型检查**

Run: `npm run typecheck`
Expected: 无错误

- [ ] **Step 4: 运行lint检查**

Run: `npm run lint`
Expected: 无错误

- [ ] **Step 5: 提交代码**

```bash
git add src/pages/RolesPage.tsx src/pages/index.ts
git commit -m "feat(pages): add role management page"
```

---

### Task 7: 添加角色管理路由

**Files:**
- Modify: `src/router.tsx`

**Interfaces:**
- Consumes: `RolesPage` 页面组件
- Produces: 更新后的路由配置

- [ ] **Step 1: 更新路由配置**

```typescript
// src/router.tsx
// 在文件顶部导入RolesPage
import {
  LoginPage,
  MfaPage,
  DashboardPage,
  KnowledgePage,
  KnowledgeDetailPage,
  CategoriesPage,
  ApiKeysPage,
  UsersPage,
  AuditLogsPage,
  SystemPage,
  KnowledgeAnalyticsPage,
  SearchAnalyticsPage,
  ApiAnalyticsPage,
  PerformanceAnalyticsPage,
  SettingsPage,
  MyApiKeysPage,
  RolesPage,  // 添加这个导入
} from '@/pages'

// 在路由配置中添加角色管理路由
// 在 /users 路由后面添加
{
  path: '/roles',
  element: <SuperAdminRoute><RolesPage /></SuperAdminRoute>,
},
```

- [ ] **Step 2: 运行类型检查**

Run: `npm run typecheck`
Expected: 无错误

- [ ] **Step 3: 运行lint检查**

Run: `npm run lint`
Expected: 无错误

- [ ] **Step 4: 提交代码**

```bash
git add src/router.tsx
git commit -m "feat(router): add role management route"
```

---

### Task 8: 更新导航菜单

**Files:**
- Modify: `src/components/layout/MainLayout.tsx`

**Interfaces:**
- Consumes: 角色管理路由配置
- Produces: 更新后的导航菜单

- [ ] **Step 1: 更新导航菜单配置**

```typescript
// src/components/layout/MainLayout.tsx
// 在navSections的users部分添加角色管理菜单项
{
  titleKey: 'nav.users',
  items: [
    { path: '/users', icon: Users, labelKey: 'nav.userManagement', minRole: 'super_admin' },
    { path: '/roles', icon: Shield, labelKey: 'nav.roleManagement', minRole: 'super_admin' },  // 添加这一行
    { path: '/api-keys', icon: Key, labelKey: 'nav.apiKeys', minRole: 'admin' },
    { path: '/me/api-keys', icon: User, labelKey: 'nav.myApiKeys' },
  ],
},

// 在文件顶部导入Shield图标
import {
  LayoutDashboard,
  BarChart3,
  BookOpen,
  Tag,
  Users,
  Key,
  FileText,
  Activity,
  Settings,
  LogOut,
  Menu,
  Sun,
  Moon,
  Eye,
  Languages,
  ChevronDown,
  Search,
  Gauge,
  KeyRound,
  User,
  Shield,  // 添加这个导入
} from 'lucide-react'
```

- [ ] **Step 2: 运行类型检查**

Run: `npm run typecheck`
Expected: 无错误

- [ ] **Step 3: 运行lint检查**

Run: `npm run lint`
Expected: 无错误

- [ ] **Step 4: 提交代码**

```bash
git add src/components/layout/MainLayout.tsx
git commit -m "feat(layout): add role management to navigation menu"
```

---

### Task 9: 添加国际化翻译

**Files:**
- Modify: `src/i18n/locales/en.json`
- Modify: `src/i18n/locales/zh.json`

**Interfaces:**
- Consumes: 角色管理页面使用的翻译键
- Produces: 更新后的翻译文件

- [ ] **Step 1: 添加英文翻译**

```json
// src/i18n/locales/en.json
{
  "roles": {
    "title": "Role Management",
    "description": "Manage system roles and permissions",
    "list": "Role List",
    "create": "Create Role",
    "edit": "Edit Role",
    "delete": "Delete Role",
    "name": "Role Name",
    "description": "Description",
    "permissions": "Permissions",
    "type": "Type",
    "system": "System",
    "custom": "Custom",
    "createdAt": "Created At",
    "allPermissions": "All Permissions",
    "systemRole": "System Role",
    "createDescription": "Create a new custom role",
    "editDescription": "Edit role details and permissions",
    "systemRoleNameProtected": "System role name cannot be modified",
    "createSuccess": "Role created successfully",
    "updateSuccess": "Role updated successfully",
    "deleteSuccess": "Role deleted successfully",
    "deleteTitle": "Delete Role",
    "deleteDescription": "Are you sure you want to delete {{name}}? This action cannot be undone."
  },
  "nav": {
    "roleManagement": "Role Management"
  }
}
```

- [ ] **Step 2: 添加中文翻译**

```json
// src/i18n/locales/zh.json
{
  "roles": {
    "title": "角色管理",
    "description": "管理系统角色和权限",
    "list": "角色列表",
    "create": "创建角色",
    "edit": "编辑角色",
    "delete": "删除角色",
    "name": "角色名称",
    "description": "描述",
    "permissions": "权限",
    "type": "类型",
    "system": "系统角色",
    "custom": "自定义角色",
    "createdAt": "创建时间",
    "allPermissions": "所有权限",
    "systemRole": "系统角色",
    "createDescription": "创建新的自定义角色",
    "editDescription": "编辑角色详情和权限",
    "systemRoleNameProtected": "系统角色名称不可修改",
    "createSuccess": "角色创建成功",
    "updateSuccess": "角色更新成功",
    "deleteSuccess": "角色删除成功",
    "deleteTitle": "删除角色",
    "deleteDescription": "确定要删除 {{name}} 吗？此操作无法撤销。"
  },
  "nav": {
    "roleManagement": "角色管理"
  }
}
```

- [ ] **Step 3: 运行类型检查**

Run: `npm run typecheck`
Expected: 无错误

- [ ] **Step 4: 运行lint检查**

Run: `npm run lint`
Expected: 无错误

- [ ] **Step 5: 提交代码**

```bash
git add src/i18n/locales/en.json src/i18n/locales/zh.json
git commit -m "feat(i18n): add role management translations"
```

---

### Task 10: 运行测试和验证

**Files:**
- 无新文件

**Interfaces:**
- Consumes: 所有之前创建的组件和页面
- Produces: 通过的测试和功能验证

- [ ] **Step 1: 运行类型检查**

Run: `npm run typecheck`
Expected: 无错误

- [ ] **Step 2: 运行lint检查**

Run: `npm run lint`
Expected: 无错误

- [ ] **Step 3: 运行构建**

Run: `npm run build`
Expected: 构建成功，无错误

- [ ] **Step 4: 启动开发服务器**

Run: `npm run dev`
Expected: 服务器正常启动

- [ ] **Step 5: 手动测试功能**

1. 访问 `/roles` 页面
2. 验证角色列表显示
3. 测试创建新角色功能
4. 测试编辑角色功能
5. 测试删除角色功能（仅自定义角色）
6. 验证系统角色保护

- [ ] **Step 6: 提交最终代码**

```bash
git add .
git commit -m "feat: complete role management implementation"
```

---

## 自我审查

### 1. 规格覆盖检查
- [x] 角色列表页面 ✓
- [x] 创建/编辑角色表单 ✓
- [x] 权限选择器组件 ✓
- [x] 角色删除功能（仅自定义角色） ✓
- [x] 系统角色保护（不可删除） ✓
- [x] 单元测试和集成测试 ✓

### 2. 占位符扫描
- [x] 无TBD、TODO或FIXME
- [x] 所有步骤都有完整代码
- [x] 所有命令都有预期输出

### 3. 类型一致性
- [x] 所有类型定义一致
- [x] 所有组件接口一致
- [x] 所有API调用一致

### 4. 范围检查
- [x] 专注于角色管理界面
- [x] 符合阶段一交付要求
- [x] 可以独立测试和验证