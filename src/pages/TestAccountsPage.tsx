import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { testAccountsApi } from '@/api'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
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
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Plus,
  Search,
  Loader2,
  Copy,
  Check,
  AlertTriangle,
  Ban,
  Trash2,
  FlaskConical,
  Clock,
  CheckCircle2,
  Power,
} from 'lucide-react'
import { PERMISSION_LABELS } from '@/types/roles'
import type { Permission } from '@/types'
import type {
  TestAccount,
  CreateTestAccountResponse,
} from '@/types'

const ALL_PERMISSIONS = Object.keys(PERMISSION_LABELS) as Permission[]

// Expiry presets (seconds). Picked to cover the common short-lived
// testing scenarios — 1h for smoke tests, 1d/7d for feature QA, 30d
// for longer evaluation windows. The custom input lets super_admins
// dial in any other TTL up to a hard cap (enforced server-side).
const EXPIRY_PRESETS: { label: string; seconds: number }[] = [
  { label: '1h', seconds: 60 * 60 },
  { label: '4h', seconds: 4 * 60 * 60 },
  { label: '1d', seconds: 24 * 60 * 60 },
  { label: '7d', seconds: 7 * 24 * 60 * 60 },
  { label: '30d', seconds: 30 * 24 * 60 * 60 },
]

const EXPIRY_CUSTOM_MAX_SECONDS = 90 * 24 * 60 * 60 // 90d ceiling on the client

function formatExpiry(seconds: number): string {
  if (seconds <= 0) return '-'
  const d = Math.floor(seconds / 86400)
  const h = Math.floor((seconds % 86400) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (d > 0) return `${d}d ${h}h`
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

function isExpired(acc: TestAccount): boolean {
  return new Date(acc.expiresAt).getTime() <= Date.now()
}

export function TestAccountsPage() {
  const { t } = useTranslation()
  const { toast } = useToast()

  const [accounts, setAccounts] = useState<TestAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all')

  // Create dialog state — two phases like UsersPage:
  //   1) configure expiry/permissions/note
  //   2) reveal one-time credentials (password never retrievable again)
  const [createOpen, setCreateOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [createResult, setCreateResult] = useState<CreateTestAccountResponse | null>(null)
  const [expiresInSeconds, setExpiresInSeconds] = useState<number>(EXPIRY_PRESETS[2].seconds)
  const [customExpiry, setCustomExpiry] = useState<string>('')
  const [selectedPermissions, setSelectedPermissions] = useState<Permission[]>([])
  const [note, setNote] = useState('')
  const [copiedField, setCopiedField] = useState<string | null>(null)

  // Deactivate + hard-delete confirmation state
  const [deactivateTarget, setDeactivateTarget] = useState<TestAccount | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<TestAccount | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const fetchAccounts = useCallback(async () => {
    setLoading(true)
    try {
      const isActive =
        filterActive === 'active' ? true : filterActive === 'inactive' ? false : undefined
      const data = await testAccountsApi.list({
        page: 1,
        limit: 200,
        isActive,
        search: search.trim() || undefined,
      })
      setAccounts(data.data)
    } catch (error: unknown) {
      const err = error as { error?: { message?: string } }
      toast({
        title: t('common.error'),
        description: err?.error?.message || t('testAccounts.loadError', '加载测试账号失败'),
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [filterActive, search, t, toast])

  useEffect(() => {
    fetchAccounts()
  }, [fetchAccounts])

  const copyToClipboard = async (field: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch {
      toast({
        title: t('common.error'),
        description: t('common.copyFailed', '复制失败'),
        variant: 'destructive',
      })
    }
  }

  const resetCreateForm = () => {
    setExpiresInSeconds(EXPIRY_PRESETS[2].seconds)
    setCustomExpiry('')
    setSelectedPermissions([])
    setNote('')
    setCreateResult(null)
  }

  const closeCreateDialog = () => {
    setCreateOpen(false)
    resetCreateForm()
  }

  const handleCreate = async () => {
    let ttl = expiresInSeconds
    if (customExpiry.trim()) {
      const parsed = parseInt(customExpiry, 10)
      if (Number.isNaN(parsed) || parsed <= 0) {
        toast({
          title: t('common.error'),
          description: t('testAccounts.invalidExpiry', '有效期必须为正整数（秒）'),
          variant: 'destructive',
        })
        return
      }
      if (parsed > EXPIRY_CUSTOM_MAX_SECONDS) {
        toast({
          title: t('common.error'),
          description: t('testAccounts.expiryTooLong', '有效期最长 90 天'),
          variant: 'destructive',
        })
        return
      }
      ttl = parsed
    }

    setCreating(true)
    try {
      const result = await testAccountsApi.create({
        expiresInSeconds: ttl,
        permissions: selectedPermissions,
        note: note.trim() || undefined,
      })
      setCreateResult(result)
      await fetchAccounts()
      toast({
        title: t('common.success'),
        description: t('testAccounts.created', '测试账号已创建，请立即保存凭据'),
      })
    } catch (error: unknown) {
      const err = error as { error?: { message?: string } }
      toast({
        title: t('common.error'),
        description: err?.error?.message || t('testAccounts.createError', '创建测试账号失败'),
        variant: 'destructive',
      })
    } finally {
      setCreating(false)
    }
  }

  const handleDeactivate = async () => {
    if (!deactivateTarget) return
    setActionLoading(true)
    try {
      await testAccountsApi.deactivate(deactivateTarget.id)
      toast({
        title: t('common.success'),
        description: t('testAccounts.deactivated', '测试账号已停用'),
      })
      setDeactivateTarget(null)
      await fetchAccounts()
    } catch (error: unknown) {
      const err = error as { error?: { message?: string } }
      toast({
        title: t('common.error'),
        description: err?.error?.message || t('testAccounts.deactivateError', '停用失败'),
        variant: 'destructive',
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleHardDelete = async () => {
    if (!deleteTarget) return
    setActionLoading(true)
    try {
      await testAccountsApi.remove(deleteTarget.id)
      toast({
        title: t('common.success'),
        description: t('testAccounts.deleted', '测试账号已彻底删除'),
      })
      setDeleteTarget(null)
      await fetchAccounts()
    } catch (error: unknown) {
      const err = error as { error?: { message?: string } }
      toast({
        title: t('common.error'),
        description: err?.error?.message || t('testAccounts.deleteError', '删除失败'),
        variant: 'destructive',
      })
    } finally {
      setActionLoading(false)
    }
  }

  const togglePermission = (perm: Permission) => {
    setSelectedPermissions(prev =>
      prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FlaskConical className="h-7 w-7" />
            {t('testAccounts.title', '测试账号')}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t('testAccounts.subtitle', '时效性测试账号，与正式账号物理隔离，不会出现在公开数据中。')}
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {t('testAccounts.create', '创建测试账号')}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('testAccounts.list', '账号列表')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={t('testAccounts.searchPlaceholder', '按用户名或昵称搜索…')}
                className="pl-9"
              />
            </div>
            <div className="flex gap-1 border rounded-md p-1">
              {(['all', 'active', 'inactive'] as const).map(opt => (
                <Button
                  key={opt}
                  size="sm"
                  variant={filterActive === opt ? 'default' : 'ghost'}
                  onClick={() => setFilterActive(opt)}
                >
                  {t(`testAccounts.filter_${opt}`, opt)}
                </Button>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={fetchAccounts} disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t('common.refresh', '刷新')}
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : accounts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {t('common.noData', '暂无数据')}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>{t('testAccounts.account', '账号')}</TableHead>
                  <TableHead className="w-[180px]">{t('testAccounts.permissions', '权限')}</TableHead>
                  <TableHead className="w-[110px]">{t('testAccounts.status', '状态')}</TableHead>
                  <TableHead className="w-[150px]">{t('testAccounts.expiresAt', '过期时间')}</TableHead>
                  <TableHead className="w-[150px]">{t('testAccounts.lastLogin', '最近登录')}</TableHead>
                  <TableHead className="w-[140px]">{t('testAccounts.createdAt', '创建时间')}</TableHead>
                  <TableHead className="w-[120px] text-right">{t('common.actions', '操作')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts.map(acc => {
                  const expired = isExpired(acc)
                  const inactive = !acc.isActive || expired
                  return (
                    <TableRow key={acc.id}>
                      <TableCell>
                        {/*
                          For test accounts the username is the primary
                          identifier admins act on (login/audit), so it
                          is shown large; nickname is the public display
                          snapshot, shown muted below.
                        */}
                        <div className="flex flex-col">
                          <span className="font-medium font-mono leading-tight">
                            {acc.username}
                          </span>
                          <span className="text-xs text-muted-foreground leading-tight">
                            {acc.nickname}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {acc.permissions.length === 0 ? (
                          <span className="text-xs text-muted-foreground">-</span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {acc.permissions.slice(0, 3).map(p => (
                              <Badge key={p} variant="secondary" className="text-[10px] h-4 px-1">
                                {PERMISSION_LABELS[p as Permission] || p}
                              </Badge>
                            ))}
                            {acc.permissions.length > 3 && (
                              <Badge variant="outline" className="text-[10px] h-4 px-1">
                                +{acc.permissions.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {inactive ? (
                          <Badge variant="outline" className="border-muted-foreground/40 text-muted-foreground">
                            <Ban className="h-3 w-3 mr-1" />
                            {expired
                              ? t('testAccounts.expired', '已过期')
                              : t('testAccounts.disabled', '已停用')}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-green-500 text-green-600">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            {t('testAccounts.active', '活跃')}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-xs">
                          {new Date(acc.expiresAt).toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">
                          {acc.lastLoginAt ? new Date(acc.lastLoginAt).toLocaleString() : '-'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">
                          {new Date(acc.createdAt).toLocaleDateString()}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {!inactive && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              title={t('testAccounts.deactivate', '停用')}
                              onClick={() => setDeactivateTarget(acc)}
                            >
                              <Power className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            title={t('testAccounts.hardDelete', '彻底删除')}
                            onClick={() => setDeleteTarget(acc)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog — two-step: form → one-time credentials reveal */}
      <Dialog open={createOpen} onOpenChange={open => { if (!open) closeCreateDialog(); else setCreateOpen(true) }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {createResult
                ? t('testAccounts.credentialsCreated', '测试账号已创建 — 请立即保存')
                : t('testAccounts.create', '创建测试账号')}
            </DialogTitle>
            {createResult && (
              <DialogDescription>
                {t('testAccounts.credentialsOnceWarning', '以下凭据（尤其是密码）仅显示一次，关闭后将无法再次查看。请立即复制或保存。')}
              </DialogDescription>
            )}
          </DialogHeader>

          {!createResult ? (
            <>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label>{t('testAccounts.expiry', '有效期')}</Label>
                  <div className="flex flex-wrap gap-2">
                    {EXPIRY_PRESETS.map(preset => (
                      <Button
                        key={preset.seconds}
                        type="button"
                        size="sm"
                        variant={expiresInSeconds === preset.seconds && !customExpiry ? 'default' : 'outline'}
                        onClick={() => {
                          setExpiresInSeconds(preset.seconds)
                          setCustomExpiry('')
                        }}
                      >
                        {preset.label}
                      </Button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={1}
                      max={EXPIRY_CUSTOM_MAX_SECONDS}
                      placeholder={t('testAccounts.customExpiryPlaceholder', '自定义（秒）')}
                      value={customExpiry}
                      onChange={e => setCustomExpiry(e.target.value)}
                    />
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      ≈ {formatExpiry(customExpiry ? parseInt(customExpiry, 10) || 0 : expiresInSeconds)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {t('testAccounts.expiryHint', '过期后账号将自动失效；也可随时手动停用。')}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>{t('testAccounts.permissions', '权限')}</Label>
                  <div className="rounded-md border p-3 max-h-48 overflow-y-auto grid grid-cols-1 gap-2">
                    {ALL_PERMISSIONS.map(p => (
                      <label
                        key={p}
                        className="flex items-start gap-2 cursor-pointer text-sm"
                      >
                        <Checkbox
                          checked={selectedPermissions.includes(p)}
                          onCheckedChange={() => togglePermission(p)}
                        />
                        <div className="flex flex-col">
                          <span>{PERMISSION_LABELS[p]}</span>
                          <span className="text-xs text-muted-foreground font-mono">{p}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t('testAccounts.permissionsHint', '不分配任何权限即为只读最小权限账号。')}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="note">{t('testAccounts.note', '备注')}</Label>
                  <Input
                    id="note"
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    placeholder={t('testAccounts.notePlaceholder', '可选，便于标识用途')}
                  />
                </div>

                <div className="rounded-md bg-muted/50 p-3 text-xs text-muted-foreground space-y-1">
                  <p>{t('testAccounts.autoGenHint', '用户名、昵称、密码均由系统随机生成；创建后展示一次。')}</p>
                  <p>{t('testAccounts.isolationHint', '测试账号与正式管理员账号物理隔离，不会出现在公开数据或用户管理列表中。')}</p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={closeCreateDialog}>
                  {t('common.cancel')}
                </Button>
                <Button onClick={handleCreate} disabled={creating}>
                  {creating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {t('common.create')}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <div className="py-4 space-y-4">
              <div className="rounded-md border border-orange-300 bg-orange-50 dark:bg-orange-950/30 dark:border-orange-800 p-3 flex gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-orange-800 dark:text-orange-200">
                  {t('testAccounts.credentialsOnceWarning', '以下凭据（尤其是密码）仅显示一次，关闭后将无法再次查看。请立即复制或保存。')}
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
                <div className="rounded-md bg-muted/50 p-3 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('testAccounts.expiresAt', '过期时间')}</span>
                    <span className="font-medium">
                      {new Date(createResult.expiresAt).toLocaleString()}
                    </span>
                  </div>
                  {createResult.permissions.length > 0 && (
                    <div className="flex justify-between gap-2">
                      <span className="text-muted-foreground whitespace-nowrap">{t('testAccounts.permissions', '权限')}</span>
                      <span className="font-mono text-right break-all">
                        {createResult.permissions.join(', ')}
                      </span>
                    </div>
                  )}
                </div>
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

      {/* Deactivate confirm */}
      <AlertDialog
        open={!!deactivateTarget}
        onOpenChange={open => { if (!open) setDeactivateTarget(null) }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('testAccounts.deactivate', '停用测试账号')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('testAccounts.deactivateConfirm', '停用后该账号将无法登录，但保留记录用于审计。此操作可逆吗？')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>
              {t('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeactivate}
              disabled={actionLoading}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {actionLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t('testAccounts.deactivate', '停用')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Hard delete confirm */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={open => { if (!open) setDeleteTarget(null) }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('testAccounts.hardDelete', '彻底删除测试账号')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('testAccounts.hardDeleteConfirm', '彻底删除将移除该账号的所有数据，且无法恢复。确定继续？')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>
              {t('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleHardDelete}
              disabled={actionLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {actionLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t('common.delete', '删除')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
