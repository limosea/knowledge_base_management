import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { adminUsersApi, adminRolesApi } from '@/api'
import type { AdminUserSummary, UpdateAdminUserRequest, ResetPasswordResponse, AdminRole } from '@/types'
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
import { useToast } from '@/hooks/use-toast'
import { Plus, Pencil, KeyRound, Ban, CheckCircle, UserX } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export function UsersPage() {
  const { t } = useTranslation()
  const { toast } = useToast()
  const [users, setUsers] = useState<AdminUserSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [disableDialogOpen, setDisableDialogOpen] = useState(false)
  const [enableDialogOpen, setEnableDialogOpen] = useState(false)
  const [toggleUserId, setToggleUserId] = useState<string | null>(null)
  const [resetDialogOpen, setResetDialogOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<AdminUserSummary | null>(null)
  const [resetResult, setResetResult] = useState<ResetPasswordResponse | null>(null)
  const [roles, setRoles] = useState<Role[]>([])
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    role: 'user' as AdminRole,
    rateLimit: 1000,
  })

  const limit = 20
  const { user: permUser } = usePermission()

  useEffect(() => {
    fetchUsers()
  }, [page])

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
      const response = await adminUsersApi.list({ page, limit })
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
    try {
      await adminUsersApi.create({
        username: formData.username,
        password: formData.password,
        email: formData.email || undefined,
        role: formData.role,
      })
      toast({
        title: t('common.success'),
        description: 'User created successfully',
      })
      setCreateDialogOpen(false)
      setFormData({ username: '', password: '', email: '', role: 'user', rateLimit: 1000 })
      fetchUsers()
    } catch (error) {
      toast({
        title: t('common.error'),
        description: 'Failed to create user',
        variant: 'destructive',
      })
    }
  }

  const handleEdit = (user: AdminUserSummary) => {
    setCurrentUser(user)
    setFormData({
      username: user.username,
      password: '',
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
        email: formData.email || undefined,
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
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t('users.title')}</h1>
        <PermissionGuard permissions={['users:manage']}>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {t('users.create')}
          </Button>
        </PermissionGuard>
      </div>

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
                  <TableHead>{t('users.username')}</TableHead>
                  <TableHead>{t('users.email')}</TableHead>
                  <TableHead>{t('users.role')}</TableHead>
                  <TableHead>{t('apiKeys.rateLimit')}</TableHead>
                  <TableHead>{t('common.status')}</TableHead>
                  <TableHead>{t('users.mfaEnabled')}</TableHead>
                  <TableHead>{t('users.lastLoginAt')}</TableHead>
                  <TableHead className="w-32">{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.nickname || user.username}</TableCell>
                    <TableCell>{user.email || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'super_admin' ? 'default' : user.role === 'admin' ? 'secondary' : 'outline'}>
                        {user.role === 'super_admin' ? t('users.superAdmin') : 
                         user.role === 'admin' ? t('users.admin') : t('users.user')}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.rateLimit ?? '-'}/min</TableCell>
                    <TableCell>
                      <Badge variant={user.isActive ? 'default' : 'destructive'}>
                        {user.isActive ? t('users.active') : t('users.inactive')}
                      </Badge>
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
                    <TableCell>
                      <PermissionGuard permissions={['users:manage']}>
                        {permUser?.id !== user.id && (
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(user)}
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
                            >
                              {user.isActive ? (
                                <Ban className="h-4 w-4 text-orange-500" />
                              ) : (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              )}
                            </Button>
                          </div>
                        )}
                      </PermissionGuard>
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

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('users.create')}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="username">{t('users.username')}</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('auth.password')}</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">{t('users.passwordRequirements')}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t('users.email')}</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
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
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleCreate}>{t('common.create')}</Button>
          </DialogFooter>
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
              <Label htmlFor="edit-email">{t('users.email')}</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
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
                {t('users.rateLimitHint', '每分钟最大请求数，由管理员设定')}
              </p>
            </div>
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
    </div>
  )
}
