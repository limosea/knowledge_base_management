# 权限控制架构重构实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 重构前端权限控制架构，实现普通用户自助服务、调整管理端知识条目权限、放宽审计日志和系统监控访问权限。

**Architecture:** 增量修改现有代码，新增自助服务 API 客户端和页面，调整路由和导航权限配置，移除管理端知识条目编辑功能。

**Tech Stack:** React 19, TypeScript, Vite 6, react-router-dom 7, Tailwind CSS 3, shadcn/ui (Radix UI)

## Global Constraints

- TypeScript strict mode
- ESLint + Prettier for code formatting
- i18n support (en/zh)
- Follow existing code patterns and conventions

---

## Task 1: 新增类型定义

**Files:**
- Modify: `src/types/index.ts:468-468`

**Interfaces:**
- Produces: `MyApiKey`, `MyApiKeyListResponse`, `MyStats`

- [ ] **Step 1: 添加自助服务类型定义**

在 `src/types/index.ts` 文件末尾添加：

```typescript
// ==================== Self-Service API Types ====================

export interface MyApiKey {
  id: string
  key?: string
  keyPrefix: string
  name: string
  permissions: Permission[]
  rateLimit: number
  lastUsedAt?: string
  expiresAt?: string
  createdAt: string
}

export type MyApiKeyListResponse = PaginatedResponse<MyApiKey>

export interface MyStats {
  apiKeys: {
    total: number
    active: number
  }
  requests: {
    today: number
    thisWeek: number
  }
}
```

- [ ] **Step 2: 验证类型定义**

运行 TypeScript 类型检查：
```bash
npx tsc --noEmit
```
Expected: 无类型错误

- [ ] **Step 3: 提交更改**

```bash
git add src/types/index.ts
git commit -m "feat(types): add self-service API types"
```

---

## Task 2: 新增 API 客户端

**Files:**
- Create: `src/api/me.ts`
- Modify: `src/api/index.ts:1-9`

**Interfaces:**
- Consumes: `MyApiKey`, `MyApiKeyListResponse`, `MyStats`, `CreateApiKeyRequest`, `UpdateApiKeyRequest` (from Task 1)
- Produces: `meApi` object with methods: `listKeys`, `getKey`, `createKey`, `updateKey`, `deleteKey`, `regenerateKey`, `getStats`

- [ ] **Step 1: 创建自助服务 API 客户端**

创建 `src/api/me.ts`：

```typescript
import { apiClient } from './client'
import type {
  MyApiKey,
  MyApiKeyListResponse,
  MyStats,
  CreateApiKeyRequest,
  UpdateApiKeyRequest,
} from '@/types'

export const meApi = {
  listKeys: (params?: {
    page?: number
    limit?: number
  }): Promise<MyApiKeyListResponse> => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', String(params.page))
    if (params?.limit) searchParams.set('limit', String(params.limit))
    const query = searchParams.toString()
    return apiClient.get<MyApiKeyListResponse>(`/admin/me/api-keys${query ? `?${query}` : ''}`)
  },

  getKey: (id: string): Promise<MyApiKey> => {
    return apiClient.get<MyApiKey>(`/admin/me/api-keys/${id}`)
  },

  createKey: (data: CreateApiKeyRequest): Promise<MyApiKey> => {
    return apiClient.post<MyApiKey>('/admin/me/api-keys', data)
  },

  updateKey: (id: string, data: UpdateApiKeyRequest): Promise<MyApiKey> => {
    return apiClient.put<MyApiKey>(`/admin/me/api-keys/${id}`, data)
  },

  deleteKey: (id: string): Promise<{ message: string }> => {
    return apiClient.delete(`/admin/me/api-keys/${id}`)
  },

  regenerateKey: (id: string): Promise<MyApiKey> => {
    return apiClient.post<MyApiKey>(`/admin/me/api-keys/${id}/regenerate`)
  },

  getStats: (): Promise<MyStats> => {
    return apiClient.get<MyStats>('/admin/me/stats')
  },
}
```

- [ ] **Step 2: 导出 API 客户端**

修改 `src/api/index.ts`，在末尾添加：

```typescript
export { meApi } from './me'
```

- [ ] **Step 3: 验证 API 客户端**

运行 TypeScript 类型检查：
```bash
npx tsc --noEmit
```
Expected: 无类型错误

- [ ] **Step 4: 提交更改**

```bash
git add src/api/me.ts src/api/index.ts
git commit -m "feat(api): add self-service API client"
```

---

## Task 3: 新增自助服务页面

**Files:**
- Create: `src/pages/MyApiKeysPage.tsx`
- Modify: `src/pages/index.ts:1-15`

**Interfaces:**
- Consumes: `meApi` (from Task 2), `MyApiKey`, `CreateApiKeyRequest`, `UpdateApiKeyRequest` (from Task 1)
- Produces: `MyApiKeysPage` component

- [ ] **Step 1: 创建自助服务页面**

创建 `src/pages/MyApiKeysPage.tsx`：

```tsx
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { meApi } from '@/api'
import type { MyApiKey, CreateApiKeyRequest, UpdateApiKeyRequest, Permission } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { Plus, Trash2, RefreshCw, Copy, Check } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export function MyApiKeysPage() {
  const { t } = useTranslation()
  const { toast } = useToast()
  const [keys, setKeys] = useState<MyApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [regenerateDialogOpen, setRegenerateDialogOpen] = useState(false)
  const [newKeyDialogOpen, setNewKeyDialogOpen] = useState(false)
  
  const [currentKey, setCurrentKey] = useState<MyApiKey | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [regenerateId, setRegenerateId] = useState<string | null>(null)
  const [newKeyValue, setNewKeyValue] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    permissions: ['read'] as Permission[],
    rateLimit: 100,
  })

  const limit = 20

  useEffect(() => {
    fetchKeys()
  }, [page])

  const fetchKeys = async () => {
    setLoading(true)
    try {
      const response = await meApi.listKeys({ page, limit })
      setKeys(response.data)
      setTotal(response.total)
    } catch (error) {
      toast({
        title: t('common.error'),
        description: 'Failed to fetch API keys',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    try {
      const data: CreateApiKeyRequest = {
        name: formData.name,
        permissions: formData.permissions,
        rateLimit: formData.rateLimit,
      }
      const result = await meApi.createKey(data)
      setNewKeyValue(result.key || null)
      setCreateDialogOpen(false)
      setNewKeyDialogOpen(true)
      setFormData({ name: '', permissions: ['read'], rateLimit: 100 })
      fetchKeys()
    } catch (error) {
      toast({
        title: t('common.error'),
        description: 'Failed to create API key',
        variant: 'destructive',
      })
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await meApi.deleteKey(deleteId)
      toast({
        title: t('common.success'),
        description: 'API key deleted successfully',
      })
      setDeleteDialogOpen(false)
      setDeleteId(null)
      fetchKeys()
    } catch (error) {
      toast({
        title: t('common.error'),
        description: 'Failed to delete API key',
        variant: 'destructive',
      })
    }
  }

  const handleRegenerate = async () => {
    if (!regenerateId) return
    try {
      const result = await meApi.regenerateKey(regenerateId)
      setNewKeyValue(result.key || null)
      setRegenerateDialogOpen(false)
      setRegenerateId(null)
      setNewKeyDialogOpen(true)
      fetchKeys()
    } catch (error) {
      toast({
        title: t('common.error'),
        description: 'Failed to regenerate API key',
        variant: 'destructive',
      })
    }
  }

  const copyToClipboard = () => {
    if (newKeyValue) {
      navigator.clipboard.writeText(newKeyValue)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('myApiKeys.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('myApiKeys.description')}</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {t('myApiKeys.createKey')}
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : keys.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t('common.noData')}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('apiKeys.name')}</TableHead>
                  <TableHead>{t('apiKeys.keyPrefix')}</TableHead>
                  <TableHead>{t('apiKeys.permissions')}</TableHead>
                  <TableHead>{t('apiKeys.rateLimit')}</TableHead>
                  <TableHead>{t('apiKeys.lastUsed')}</TableHead>
                  <TableHead>{t('common.createdAt')}</TableHead>
                  <TableHead className="w-24">{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {keys.map((key) => (
                  <TableRow key={key.id}>
                    <TableCell className="font-medium">{key.name}</TableCell>
                    <TableCell>
                      <code className="bg-muted px-2 py-1 rounded text-sm">
                        {key.keyPrefix}...
                      </code>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {key.permissions.map((perm) => (
                          <Badge key={perm} variant="secondary" className="text-xs">
                            {perm}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{key.rateLimit}/min</TableCell>
                    <TableCell>
                      {key.lastUsedAt ? formatDate(key.lastUsedAt) : '-'}
                    </TableCell>
                    <TableCell>{formatDate(key.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setRegenerateId(key.id)
                            setRegenerateDialogOpen(true)
                          }}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setDeleteId(key.id)
                            setDeleteDialogOpen(true)
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                {t('pagination.showing', {
                  from: (page - 1) * limit + 1,
                  to: Math.min(page * limit, total),
                  total,
                })}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  {t('common.back')}
                </Button>
                <span className="text-sm">
                  {page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  {t('pagination.page')}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('myApiKeys.createKey')}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t('apiKeys.name')}</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('apiKeys.permissions')}</Label>
              <div className="flex flex-wrap gap-4">
                {(['read', 'write', 'admin'] as Permission[]).map((perm) => (
                  <label key={perm} className="flex items-center gap-2">
                    <Checkbox
                      checked={formData.permissions.includes(perm)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFormData({
                            ...formData,
                            permissions: [...formData.permissions, perm],
                          })
                        } else {
                          setFormData({
                            ...formData,
                            permissions: formData.permissions.filter((p) => p !== perm),
                          })
                        }
                      }}
                    />
                    {perm}
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="rateLimit">{t('apiKeys.rateLimit')}</Label>
              <Input
                id="rateLimit"
                type="number"
                value={formData.rateLimit}
                onChange={(e) =>
                  setFormData({ ...formData, rateLimit: parseInt(e.target.value) || 100 })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleCreate}>{t('common.create')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Key Dialog */}
      <Dialog open={newKeyDialogOpen} onOpenChange={setNewKeyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('myApiKeys.keyCreated')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{t('myApiKeys.keyCreatedWarning')}</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-muted p-3 rounded text-sm break-all">
                {newKeyValue}
              </code>
              <Button variant="outline" size="icon" onClick={copyToClipboard}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setNewKeyDialogOpen(false)}>{t('common.close')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('apiKeys.confirmDelete')}</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Regenerate Dialog */}
      <AlertDialog open={regenerateDialogOpen} onOpenChange={setRegenerateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('apiKeys.confirmRegenerate')}</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleRegenerate}>
              {t('common.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
```

- [ ] **Step 2: 导出页面组件**

修改 `src/pages/index.ts`，在末尾添加：

```typescript
export { MyApiKeysPage } from './MyApiKeysPage'
```

- [ ] **Step 3: 验证页面组件**

运行 TypeScript 类型检查：
```bash
npx tsc --noEmit
```
Expected: 无类型错误

- [ ] **Step 4: 提交更改**

```bash
git add src/pages/MyApiKeysPage.tsx src/pages/index.ts
git commit -m "feat(pages): add self-service API keys page"
```

---

## Task 4: 更新路由配置

**Files:**
- Modify: `src/router.tsx:1-143`

**Interfaces:**
- Consumes: `MyApiKeysPage` (from Task 3)
- Produces: Updated router with new routes and AdminRoute

- [ ] **Step 1: 添加 AdminRoute 组件**

修改 `src/router.tsx`，在 `SuperAdminRoute` 组件后添加：

```typescript
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }
  if (!hasRole('admin')) {
    return <Navigate to="/dashboard" replace />
  }
  return <>{children}</>
}
```

- [ ] **Step 2: 导入 MyApiKeysPage**

修改 `src/router.tsx` 的导入语句，添加 `MyApiKeysPage`：

```typescript
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
} from '@/pages'
```

- [ ] **Step 3: 添加自助服务路由**

在路由配置的 `children` 数组中，在 `/api-keys` 路由后添加：

```typescript
{
  path: '/me/api-keys',
  element: <MyApiKeysPage />,
},
```

- [ ] **Step 4: 调整审计日志路由权限**

修改 `/audit-logs` 路由，将 `SuperAdminRoute` 改为 `AdminRoute`：

```typescript
{
  path: '/audit-logs',
  element: <AdminRoute><AuditLogsPage /></AdminRoute>,
},
```

- [ ] **Step 5: 调整系统监控路由权限**

修改 `/system` 路由，将 `SuperAdminRoute` 改为 `AdminRoute`：

```typescript
{
  path: '/system',
  element: <AdminRoute><SystemPage /></AdminRoute>,
},
```

- [ ] **Step 6: 验证路由配置**

运行 TypeScript 类型检查：
```bash
npx tsc --noEmit
```
Expected: 无类型错误

- [ ] **Step 7: 提交更改**

```bash
git add src/router.tsx
git commit -m "feat(router): add self-service route and adjust admin permissions"
```

---

## Task 5: 更新导航配置

**Files:**
- Modify: `src/components/layout/MainLayout.tsx:56-100`

**Interfaces:**
- Consumes: None (uses existing role hierarchy)
- Produces: Updated navigation with new items and adjusted permissions

- [ ] **Step 1: 导入新图标**

修改 `src/components/layout/MainLayout.tsx` 的导入语句，添加 `KeyRound` 图标（如果尚未导入）：

```typescript
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
} from 'lucide-react'
```

- [ ] **Step 2: 添加自助服务导航项**

修改 `navSections` 数组，在"用户"部分添加新的导航项：

```typescript
{
  titleKey: 'nav.users',
  items: [
    { path: '/users', icon: Users, labelKey: 'nav.userManagement', minRole: 'super_admin' },
    { path: '/api-keys', icon: Key, labelKey: 'nav.apiKeys', minRole: 'admin' },
    { path: '/me/api-keys', icon: User, labelKey: 'nav.myApiKeys' },
  ],
},
```

- [ ] **Step 3: 调整审计日志导航权限**

修改"系统"部分的导航项，将审计日志的 `minRole` 从 `super_admin` 改为 `admin`：

```typescript
{
  titleKey: 'nav.system',
  items: [
    { path: '/audit-logs', icon: FileText, labelKey: 'nav.auditLogs', minRole: 'admin' },
    { path: '/system', icon: Activity, labelKey: 'nav.systemMonitor', minRole: 'admin' },
    { path: '/settings', icon: Settings, labelKey: 'nav.settings' },
  ],
},
```

- [ ] **Step 4: 验证导航配置**

运行 TypeScript 类型检查：
```bash
npx tsc --noEmit
```
Expected: 无类型错误

- [ ] **Step 5: 提交更改**

```bash
git add src/components/layout/MainLayout.tsx
git commit -m "feat(layout): update navigation with self-service and adjusted permissions"
```

---

## Task 6: 修改知识条目管理页面

**Files:**
- Modify: `src/pages/KnowledgePage.tsx:1-497`

**Interfaces:**
- Consumes: None (removes existing functionality)
- Produces: Updated KnowledgePage without edit functionality

- [ ] **Step 1: 移除编辑相关导入**

修改 `src/pages/KnowledgePage.tsx` 的导入语句，移除 `Pencil` 图标：

```typescript
import { Trash2, Search } from 'lucide-react'
```

- [ ] **Step 2: 移除编辑相关状态**

移除以下状态声明（约第 54-69 行）：

```typescript
const [editDialogOpen, setEditDialogOpen] = useState(false)
const [currentEntry, setCurrentEntry] = useState<KnowledgeEntry | null>(null)
const [formData, setFormData] = useState({
  title: '',
  content: '',
  summary: '',
  category: '',
  tags: '',
  language: '',
  framework: '',
  difficulty_level: 1,
  visibility: 'private' as Visibility,
})
```

- [ ] **Step 3: 移除编辑相关函数**

移除以下函数（约第 113-168 行）：

```typescript
const handleEdit = async (id: string) => {
  try {
    const entry = await knowledgeApi.get(id)
    setCurrentEntry(entry)
    setFormData({
      title: entry.title,
      content: entry.content,
      summary: entry.summary || '',
      category: entry.category || '',
      tags: entry.tags?.join(', ') || '',
      language: entry.language || '',
      framework: entry.framework || '',
      difficulty_level: entry.difficultyLevel || 1,
      visibility: entry.visibility || 'private',
    })
    setEditDialogOpen(true)
  } catch (error) {
    toast({
      title: t('common.error'),
      description: 'Failed to fetch entry details',
      variant: 'destructive',
    })
  }
}

const handleSave = async () => {
  if (!currentEntry) return
  
  try {
    const data: UpdateEntryRequest = {
      title: formData.title,
      content: formData.content,
      summary: formData.summary || undefined,
      category: formData.category || undefined,
      tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : undefined,
      language: formData.language || undefined,
      framework: formData.framework || undefined,
      difficulty_level: formData.difficulty_level || undefined,
      visibility: formData.visibility,
    }
    
    await knowledgeApi.update(currentEntry.id, data)
    toast({
      title: t('common.success'),
      description: 'Entry updated successfully',
    })
    setEditDialogOpen(false)
    fetchEntries()
  } catch (error) {
    toast({
      title: t('common.error'),
      description: 'Failed to update entry',
      variant: 'destructive',
    })
  }
}
```

- [ ] **Step 4: 移除编辑按钮**

在表格操作列中，移除编辑按钮（约第 342-348 行）：

```typescript
<Button
  variant="ghost"
  size="icon"
  onClick={() => handleEdit(entry.id)}
>
  <Pencil className="h-4 w-4" />
</Button>
```

- [ ] **Step 5: 移除编辑弹窗**

移除整个编辑弹窗（约第 402-479 行）：

```typescript
{/* Edit Dialog */}
<Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>{t('knowledge.edit')}</DialogTitle>
    </DialogHeader>
    <div className="grid gap-4 py-4">
      {/* ... form fields ... */}
    </div>
    <DialogFooter>
      <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
        {t('common.cancel')}
      </Button>
      <Button onClick={handleSave}>{t('common.save')}</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

- [ ] **Step 6: 移除未使用的导入**

移除以下未使用的导入：

```typescript
import type { AdminKnowledgeListItem, KnowledgeEntry, UpdateEntryRequest, AdminCategoryListItem, Visibility } from '@/types'
```

改为：

```typescript
import type { AdminKnowledgeListItem, AdminCategoryListItem } from '@/types'
```

同时移除 `Dialog` 相关导入（如果不再使用）：

```typescript
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
```

- [ ] **Step 7: 验证页面组件**

运行 TypeScript 类型检查：
```bash
npx tsc --noEmit
```
Expected: 无类型错误

- [ ] **Step 8: 提交更改**

```bash
git add src/pages/KnowledgePage.tsx
git commit -m "feat(knowledge): remove edit functionality from admin page"
```

---

## Task 7: 更新国际化翻译

**Files:**
- Modify: `src/i18n/index.ts`

**Interfaces:**
- Consumes: None
- Produces: Updated translations with new keys

- [ ] **Step 1: 添加自助服务翻译**

在英文翻译对象中添加：

```typescript
nav: {
  // ... existing translations
  myApiKeys: 'My API Keys',
},
myApiKeys: {
  title: 'My API Keys',
  description: 'Manage your own API keys',
  createKey: 'Create API Key',
  keyCreated: 'API Key Created',
  keyCreatedWarning: 'Please save this key securely. It will not be shown again.',
},
```

在中文翻译对象中添加：

```typescript
nav: {
  // ... existing translations
  myApiKeys: '我的 API Keys',
},
myApiKeys: {
  title: '我的 API Keys',
  description: '管理你自己创建的 API Key',
  createKey: '创建 API Key',
  keyCreated: 'API Key 已创建',
  keyCreatedWarning: '请安全保存此密钥，它将不会再显示。',
},
```

- [ ] **Step 2: 验证翻译**

运行 TypeScript 类型检查：
```bash
npx tsc --noEmit
```
Expected: 无类型错误

- [ ] **Step 3: 提交更改**

```bash
git add src/i18n/index.ts
git commit -m "feat(i18n): add translations for self-service page"
```

---

## Task 8: 最终验证

**Files:**
- None (verification only)

**Interfaces:**
- Consumes: All previous tasks
- Produces: Verified working application

- [ ] **Step 1: 运行完整类型检查**

```bash
npx tsc --noEmit
```
Expected: 无类型错误

- [ ] **Step 2: 运行 ESLint 检查**

```bash
npm run lint
```
Expected: 无 ESLint 错误

- [ ] **Step 3: 构建项目**

```bash
npm run build
```
Expected: 构建成功

- [ ] **Step 4: 提交最终更改**

```bash
git add -A
git commit -m "feat: complete permission refactor implementation"
```

---

## 执行选项

**计划已保存到 `docs/superpowers/plans/2026-06-21-permission-refactor.md`。两种执行方式：**

**1. Subagent-Driven（推荐）** - 每个任务分派一个新的子代理，任务之间进行审查，快速迭代

**2. Inline Execution** - 在当前会话中使用 executing-plans 执行任务，批量执行并设置检查点

**选择哪种方式？**
