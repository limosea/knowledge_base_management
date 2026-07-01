import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { adminUsersApi, adminRolesApi } from '@/api'
import type { AdminUserSummary, UpdateAdminUserRequest, ResetPasswordResponse, AdminRole, CreateAdminUserResponse } from '@/types'
import type { Role } from '@/types/roles'
import { PermissionGuard } from '@/components/auth/PermissionGuard'
import { usePermission } from '@/contexts/PermissionContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
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
  DialogDescription,
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
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { RegistrationInvitationsPage } from './RegistrationInvitationsPage'
import { useToast } from '@/hooks/use-toast'
import { Plus, Pencil, KeyRound, Ban, CheckCircle, UserX, Search, BarChart3, PowerOff, ShieldCheck, Copy, Check, AlertTriangle } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export function UsersPage() {
  const { t } = useTranslation()
  const { toast } = useToast()
  const [users, setUsers] = useState<AdminUserSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)

  // Filters
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [mfaFilter, setMfaFilter] = useState<string>('all')
  const [createdAfter, setCreatedAfter] = useState('')
  const [createdBefore, setCreatedBefore] = useState('')
  const [lastLoginAfter, setLastLoginAfter] = useState('')
  const [lastLoginBefore, setLastLoginBefore] = useState('')

  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [disableDialogOpen, setDisableDialogOpen] = useState(false)
  const [enableDialogOpen, setEnableDialogOpen] = useState(false)
  const [banDialogOpen, setBanDialogOpen] = useState(false)
  const [toggleUserId, setToggleUserId] = useState<string | null>(null)
  const [resetDialogOpen, setResetDialogOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<AdminUserSummary | null>(null)
  const [resetResult, setResetResult] = useState<ResetPasswordResponse | null>(null)
  const [roles, setRoles] = useState<Role[]>([])

  // One-time credentials returned by the create endpoint. When non-null,
  // the create dialog switches from the input form to a "save these now"
  // reveal view. Cleared when the dialog closes.
  const [createResult, setCreateResult] = useState<CreateAdminUserResponse | null>(null)
  const [creating, setCreating] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  // Audit state
  const [auditDialogOpen, setAuditDialogOpen] = useState(false)
  const [auditData, setAuditData] = useState<any>(null)
  const [auditLoading, setAuditLoading] = useState(false)

  const [formData, setFormData] = useState({
    email: '',
    role: 'user' as AdminRole,
    rateLimit: 1000,
  })
  const [activeTab, setActiveTab] = useState('users')

  const limit = 20
  const { user: permUser } = usePermission()

  useEffect(() => {
    fetchUsers()
  }, [page, roleFilter, statusFilter, mfaFilter, createdAfter, createdBefore, lastLoginAfter, lastLoginBefore])

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1)
      fetchUsers()
    }, 300)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  useEffect(() => {
    fetchRoles()
  }, [])

  const fetchRoles = async () => {
    try {
      const data = await adminRolesApi.getRoles()
      setRoles(data)
    } catch {
      // fallback: leave empty, form will still work with current role
    }
  }

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await adminUsersApi.list({
        page,
        limit,
        search: search || undefined,
        role: roleFilter !== 'all' ? roleFilter : undefined,
        isActive: statusFilter === 'all' ? undefined : statusFilter === 'active',
        mfaEnabled: mfaFilter === 'all' ? undefined : mfaFilter === 'enabled',
        createdAfter: createdAfter || undefined,
        createdBefore: createdBefore || undefined,
        lastLoginAfter: lastLoginAfter || undefined,
        lastLoginBefore: lastLoginBefore || undefined,
      })
      setUsers(response.data)
      setTotal(response.total)
    } catch (error) {
      toast({
        title: t('common.error'),
        description: 'Failed to fetch users',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    setCreating(true)
    try {
      const result = await adminUsersApi.create({
        email: formData.email || undefined,
        role: formData.role,
      })
      // One-time credentials — surface them in the dialog's "reveal"
      // step. The admin must save / copy them now; they are not
      // retrievable afterwards.
      setCreateResult(result)
      fetchUsers()
    } catch (error) {
      toast({
        title: t('common.error'),
        description: 'Failed to create user',
        variant: 'destructive',
      })
    } finally {
      setCreating(false)
    }
  }

  const copyToClipboard = async (field: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopiedField(field)
      toast({ title: t('common.success'), description: t('users.copied', '已复制') })
      setTimeout(() => setCopiedField(null), 1500)
    } catch {
      toast({ title: t('common.error'), description: t('users.copyFailed', '复制失败'), variant: 'destructive' })
    }
  }

  const closeCreateDialog = () => {
    setCreateDialogOpen(false)
    setCreateResult(null)
    setFormData({ email: '', role: 'user', rateLimit: 1000 })
  }

  const handleEdit = (user: AdminUserSummary) => {
    setCurrentUser(user)
    setFormData({
      email: user.email || '',
      role: user.role,
      rateLimit: user.rateLimit ?? 1000,
    })
    setEditDialogOpen(true)
  }

  const handleSave = async () => {
    if (!currentUser) return
    
    try {
      const data: UpdateAdminUserRequest = {
        role: formData.role,
        rateLimit: formData.rateLimit,
      }
      
      await adminUsersApi.update(currentUser.id, data)
      toast({
        title: t('common.success'),
        description: 'User updated successfully',
      })
      setEditDialogOpen(false)
      fetchUsers()
    } catch (error) {
      toast({
        title: t('common.error'),
        description: 'Failed to update user',
        variant: 'destructive',
      })
    }
  }

  const handleToggleActive = async (userId: string, isActive: boolean) => {
    try {
      await adminUsersApi.update(userId, { isActive })
      toast({
        title: t('common.success'),
        description: isActive ? 'User enabled successfully' : 'User disabled successfully',
      })
      setDisableDialogOpen(false)
      setEnableDialogOpen(false)
      setToggleUserId(null)
      fetchUsers()
    } catch (error) {
      toast({
        title: t('common.error'),
        description: isActive ? 'Failed to enable user' : 'Failed to disable user',
        variant: 'destructive',
      })
    }
  }

  const handleApproveDeletion = async (userId: string) => {
    try {
      await adminUsersApi.approveDeletion(userId)
      toast({ title: t('common.success'), description: '销户申请已批准，用户已被禁用' })
      fetchUsers()
    } catch (error) {
      toast({ title: t('common.error'), description: '批准销户失败', variant: 'destructive' })
    }
  }

  const handleRejectDeletion = async (userId: string) => {
    try {
      await adminUsersApi.rejectDeletion(userId)
      toast({ title: t('common.success'), description: '销户申请已拒绝' })
      fetchUsers()
    } catch (error) {
      toast({ title: t('common.error'), description: '拒绝销户失败', variant: 'destructive' })
    }
  }

  const handleBan = async (userId: string) => {
    try {
      await adminUsersApi.ban(userId)
      toast({ title: t('common.success'), description: t('users.banSuccess', '用户已被封号，所有访问已撤销') })
      setBanDialogOpen(false)
      setToggleUserId(null)
      fetchUsers()
    } catch (error) {
      toast({ title: t('common.error'), description: t('users.banError', '封号失败'), variant: 'destructive' })
    }
  }

  const handleUnban = async (userId: string) => {
    try {
      await adminUsersApi.unban(userId)
      toast({ title: t('common.success'), description: t('users.unbanSuccess', '用户已解封') })
      fetchUsers()
    } catch (error) {
      toast({ title: t('common.error'), description: t('users.unbanError', '解封失败'), variant: 'destructive' })
    }
  }

  const handleAudit = async (user: AdminUserSummary) => {
    setCurrentUser(user)
    setAuditDialogOpen(true)
    setAuditLoading(true)
    setAuditData(null)
    try {
      const data = await adminUsersApi.getAudit(user.id)
      setAuditData(data)
    } catch (error) {
      toast({ title: t('common.error'), description: t('users.auditError', '加载审计数据失败'), variant: 'destructive' })
    } finally {
      setAuditLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (!currentUser) return
    
    try {
      const result = await adminUsersApi.resetPassword(currentUser.id)
      setResetResult(result)
    } catch (error) {
      toast({
        title: t('common.error'),
        description: 'Failed to reset password',
        variant: 'destructive',
      })
    }
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t('users.title')}</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="users">{t('users.title')}</TabsTrigger>
          <TabsTrigger value="invitations">{t('invitations.title', 'Registration Invitations')}</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">{t('users.title')}</h2>
            <PermissionGuard permissions={['users:manage']}>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                {t('users.create')}
              </Button>
            </PermissionGuard>
          </div>

          <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Row 1: Search box + dropdown filters */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('users.searchPlaceholder')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder={t('users.role')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('users.allRoles')}</SelectItem>
                  <SelectItem value="super_admin">{t('users.superAdmin')}</SelectItem>
                  <SelectItem value="admin">{t('users.admin')}</SelectItem>
                  <SelectItem value="user">{t('users.user')}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder={t('common.status')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('users.allStatus')}</SelectItem>
                  <SelectItem value="active">{t('users.active')}</SelectItem>
                  <SelectItem value="inactive">{t('users.inactive')}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={mfaFilter} onValueChange={setMfaFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="MFA" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('users.allMfa')}</SelectItem>
                  <SelectItem value="enabled">MFA</SelectItem>
                  <SelectItem value="disabled">{t('users.noMfa')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Row 2: Time selectors */}
            <div className="flex flex-wrap items-center gap-2">
              <Input
                type="date"
                value={createdAfter}
                onChange={(e) => setCreatedAfter(e.target.value)}
                className="w-44"
                title={t('users.createdAfter')}
              />
              <Input
                type="date"
                value={createdBefore}
                onChange={(e) => setCreatedBefore(e.target.value)}
                className="w-44"
                title={t('users.createdBefore')}
              />
              <Input
                type="date"
                value={lastLoginAfter}
                onChange={(e) => setLastLoginAfter(e.target.value)}
                className="w-44"
                title={t('users.lastLoginAfter')}
              />
              <Input
                type="date"
                value={lastLoginBefore}
                onChange={(e) => setLastLoginBefore(e.target.value)}
                className="w-44"
                title={t('users.lastLoginBefore')}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader />
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t('common.noData')}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('users.nickname', '昵称')}</TableHead>
                  <TableHead>{t('users.email')}</TableHead>
                  <TableHead>{t('users.role')}</TableHead>
                  <TableHead>{t('apiKeys.rateLimit')}</TableHead>
                  <TableHead>{t('common.status')}</TableHead>
                  <TableHead>{t('users.mfaEnabled')}</TableHead>
                  <TableHead>{t('users.lastLoginAt')}</TableHead>
                  <TableHead>{t('common.createdAt')}</TableHead>
                  <TableHead className="w-40">{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      {/* Public-facing nickname (large) + login username (small). */}
                      <div className="flex flex-col">
                        <span className="font-medium leading-tight">{user.nickname || user.username}</span>
                        <span className="text-xs text-muted-foreground leading-tight">@{user.username}</span>
                        {user.requireUsernameChange && (
                          <Badge variant="outline" className="mt-1 w-fit text-xs border-orange-400 text-orange-600">
                            {t('users.usernameResetRequired', '需重设用户名')}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{user.email || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'super_admin' ? 'default' : user.role === 'admin' ? 'secondary' : 'outline'}>
                        {user.role === 'super_admin' ? t('users.superAdmin') : 
                         user.role === 'admin' ? t('users.admin') : t('users.user')}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.rateLimit ?? '-'}/min</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {user.banned && (
                          <Badge variant="destructive">{t('users.banned', '已封号')}</Badge>
                        )}
                        <Badge variant={user.isActive ? 'default' : 'destructive'}>
                          {user.isActive ? t('users.active') : t('users.inactive')}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.mfaEnabled ? (
                        <Badge variant="outline">MFA</Badge>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      {user.lastLoginAt ? formatDate(user.lastLoginAt) : '-'}
                    </TableCell>
                    <TableCell>{formatDate(user.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <PermissionGuard permissions={['users:manage']}>
                          {permUser?.id !== user.id && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEdit(user)}
                                title={t('common.edit')}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setCurrentUser(user)
                                  setResetDialogOpen(true)
                                }}
                                title={t('users.resetPassword')}
                              >
                                <KeyRound className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setToggleUserId(user.id)
                                  if (user.isActive) {
                                    setDisableDialogOpen(true)
                                  } else {
                                    setEnableDialogOpen(true)
                                  }
                                }}
                                title={user.isActive ? t('users.disable') : t('users.enable')}
                              >
                                {user.isActive ? (
                                  <PowerOff className="h-4 w-4 text-orange-500" />
                                ) : (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                )}
                              </Button>
                              {!user.banned ? (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setToggleUserId(user.id)
                                    setBanDialogOpen(true)
                                  }}
                                  title={t('users.ban')}
                                >
                                  <Ban className="h-4 w-4 text-destructive" />
                                </Button>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleUnban(user.id)}
                                  title={t('users.unban')}
                                >
                                  <ShieldCheck className="h-4 w-4 text-blue-500" />
                                </Button>
                              )}
                            </>
                          )}
                        </PermissionGuard>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleAudit(user)}
                          title={t('users.audit', '审计')}
                        >
                          <BarChart3 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                      {user.deletionStatus === 'pending' && (
                        <div className="flex items-center gap-1 mt-1">
                          <Badge variant="destructive" className="text-xs">{t('users.deletionPending', '待销户')}</Badge>
                          <PermissionGuard permissions={['users:manage']}>
                            <Button variant="ghost" size="sm" onClick={() => handleApproveDeletion(user.id)} title={t('users.approveDeletion', '批准销户')}>
                              <UserX className="h-3 w-3 text-destructive" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleRejectDeletion(user.id)} title={t('users.rejectDeletion', '拒绝销户')}>
                              <CheckCircle className="h-3 w-3 text-green-500" />
                            </Button>
                          </PermissionGuard>
                        </div>
                      )}
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
        </TabsContent>

        <TabsContent value="invitations">
          <RegistrationInvitationsPage embedded />
        </TabsContent>
      </Tabs>

      {/* Create Dialog — two-step: form → one-time credentials reveal */}
      <Dialog open={createDialogOpen} onOpenChange={(open) => { if (!open) closeCreateDialog(); else setCreateDialogOpen(true) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {createResult ? t('users.credentialsCreated', '账号已创建 — 请立即保存') : t('users.create')}
            </DialogTitle>
            {createResult && (
              <DialogDescription>
                {t('users.credentialsOnceWarning', '以下凭据仅显示一次，关闭后将无法再次查看。请立即复制或保存。')}
              </DialogDescription>
            )}
          </DialogHeader>
          {!createResult ? (
            <>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{t('users.email')}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    {t('users.createAutoGenHint', '用户名、昵称和初始密码将由系统随机生成，创建后展示一次。')}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">{t('users.role')}</Label>
                  <select
                    id="role"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as AdminRole })}
                  >
                    {roles.length > 0
                      ? roles.map(r => <option key={r.id} value={r.name}>{r.name}</option>)
                      : <>
                        <option value="user">{t('users.user')}</option>
                        <option value="admin">{t('users.admin')}</option>
                        <option value="super_admin">{t('users.superAdmin')}</option>
                      </>
                    }
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={closeCreateDialog}>
                  {t('common.cancel')}
                </Button>
                <Button onClick={handleCreate} disabled={creating}>
                  {creating ? t('common.creating', '创建中...') : t('common.create')}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <div className="py-4 space-y-4">
              <div className="rounded-md border border-orange-300 bg-orange-50 dark:bg-orange-950/30 dark:border-orange-800 p-3 flex gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-orange-800 dark:text-orange-200">
                  {t('users.credentialsOnceWarning', '以下凭据仅显示一次，关闭后将无法再次查看。请立即复制或保存。')}
                </p>
              </div>
              <div className="space-y-3">
                {([
                  { field: 'username', label: t('users.username', '用户名'), value: createResult.username },
                  { field: 'nickname', label: t('users.nickname', '昵称'), value: createResult.nickname },
                  { field: 'password', label: t('auth.password', '密码'), value: createResult.initialPassword },
                ] as const).map(({ field, label, value }) => (
                  <div key={field} className="space-y-1">
                    <Label className="text-xs text-muted-foreground">{label}</Label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 block p-2 bg-muted rounded text-sm font-mono break-all">
                        {value}
                      </code>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(field, value)}
                        title={t('common.copy', '复制')}
                      >
                        {copiedField === field ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="rounded-md bg-muted/50 p-3 text-xs text-muted-foreground space-y-1">
                <p>{t('users.requirePasswordChangeHint', '该用户首次登录时必须修改密码。')}</p>
                <p>{t('users.usernameResetOnceHint', '该用户有一次重新设置用户名的机会，之后不可再改；昵称可随时自由修改。')}</p>
              </div>
              <DialogFooter>
                <Button onClick={closeCreateDialog} className="w-full">
                  {t('users.iHaveSaved', '我已保存，关闭')}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('users.edit')}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-role">{t('users.role')}</Label>
              <select
                id="edit-role"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as AdminRole })}
              >
                {roles.length > 0
                  ? roles.map(r => <option key={r.id} value={r.name}>{r.name}</option>)
                  : <>
                    <option value="user">{t('users.user')}</option>
                    <option value="admin">{t('users.admin')}</option>
                    <option value="super_admin">{t('users.superAdmin')}</option>
                  </>
                }
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-rateLimit">{t('apiKeys.rateLimit')}</Label>
              <Input
                id="edit-rateLimit"
                type="number"
                min={1}
                max={100000}
                value={formData.rateLimit}
                onChange={(e) => setFormData({ ...formData, rateLimit: parseInt(e.target.value) || 1000 })}
              />
              <p className="text-xs text-muted-foreground">
                {t('users.rateLimitHint')}
              </p>
            </div>
            <p className="text-xs text-muted-foreground border-l-2 border-muted pl-3">
              {t('users.editNote', 'Email and nickname are the user\'s own data and can only be changed by the user themselves.')}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleSave}>{t('common.save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('users.resetPassword')}</DialogTitle>
          </DialogHeader>
          {!resetResult ? (
            <>
              <DialogDescription>
                {t('users.temporaryPasswordInfo')}
              </DialogDescription>
              <DialogFooter>
                <Button variant="outline" onClick={() => setResetDialogOpen(false)}>
                  {t('common.cancel')}
                </Button>
                <Button onClick={handleResetPassword}>{t('common.confirm')}</Button>
              </DialogFooter>
            </>
          ) : (
            <div className="py-4">
              <p className="text-sm text-muted-foreground mb-2">{t('users.temporaryPassword')}:</p>
              <code className="block p-3 bg-muted rounded text-lg font-mono">
                {resetResult.temporaryPassword}
              </code>
              <p className="text-xs text-muted-foreground mt-2">
                {t('users.temporaryPasswordInfo')}
              </p>
              <Button className="w-full mt-4" onClick={() => setResetDialogOpen(false)}>
                {t('common.confirm')}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Disable Dialog */}
      <AlertDialog open={disableDialogOpen} onOpenChange={setDisableDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('users.confirmDisable')}</AlertDialogTitle>
          </AlertDialogHeader>
          <p className="text-sm text-muted-foreground">
            {t('users.disableConsequences', 'Disabling this user will invalidate all their API keys, revoke elevated console access, and block public endpoint access. The user will only be able to view their personal console.')}
          </p>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={() => toggleUserId && handleToggleActive(toggleUserId, false)} className="bg-orange-500 text-white hover:bg-orange-600">
              {t('users.disable')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Enable Dialog */}
      <AlertDialog open={enableDialogOpen} onOpenChange={setEnableDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('users.confirmEnable')}</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={() => toggleUserId && handleToggleActive(toggleUserId, true)}>
              {t('users.enable')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Ban Dialog */}
      <AlertDialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('users.confirmBan', '确认封号')}</AlertDialogTitle>
          </AlertDialogHeader>
          <p className="text-sm text-muted-foreground">
            {t('users.banConsequences', '封号将完全禁止该用户访问系统任何功能，包括登录、API调用和个人控制台。此操作比禁用更严重。API Key 将全部停用，高级权限同步撤销。')}
          </p>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => toggleUserId && handleBan(toggleUserId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('users.ban', '封号')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* User Audit Dialog */}
      <Dialog open={auditDialogOpen} onOpenChange={setAuditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {t('users.auditTitle', '用户审计')}: {currentUser?.nickname || currentUser?.username}
            </DialogTitle>
          </DialogHeader>
          {auditLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : auditData ? (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{auditData.totalRequests}</div>
                    <div className="text-sm text-muted-foreground">{t('apiKeys.totalRequests', '总请求数')}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{auditData.byStatus?.length || 0}</div>
                    <div className="text-sm text-muted-foreground">{t('users.statusTypes', '状态类型数')}</div>
                  </CardContent>
                </Card>
              </div>
              <div>
                <h4 className="font-medium mb-2">{t('apiKeys.byAction', '按操作')}</h4>
                {auditData.byAction?.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{t('common.noData')}</p>
                ) : (
                  <div className="space-y-1">
                    {auditData.byAction?.map((item: any) => (
                      <div key={item.action} className="flex justify-between text-sm">
                        <span>{item.action}</span>
                        <span className="font-medium">{item.count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <h4 className="font-medium mb-2">{t('users.recentLogs', '最近调用日志（脱敏）')}</h4>
                {auditData.recentLogs?.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{t('common.noData')}</p>
                ) : (
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {auditData.recentLogs?.map((log: any, idx: number) => (
                      <div key={idx} className="flex justify-between text-xs text-muted-foreground border-b py-1">
                        <span>{log.action}</span>
                        <span>{log.ipAddress || '-'}</span>
                        <span>{log.status || '-'}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">{t('common.noData')}</div>
          )}
          <DialogFooter>
            <Button onClick={() => setAuditDialogOpen(false)}>{t('common.close')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
