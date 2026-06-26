import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { apiKeysApi } from '@/api'
import type { ApiKey, UpdateApiKeyRequest, ApiKeyPermission } from '@/types'
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
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Pencil, BarChart3, ChevronDown, ChevronRight, Search } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface KeyUsageData {
  totalRequests: number
  byAction: Array<{ action: string; count: number }>
  trend: Array<{ date: string; count: number }>
  topIps: Array<{ ip: string; count: number }>
  errors: Array<{ message: string; count: number }>
}

export function ApiKeysPage() {
  const { t } = useTranslation()
  const { toast } = useToast()
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [permissionFilter, setPermissionFilter] = useState<'all' | ApiKeyPermission>('all')
  const [groupByOwner, setGroupByOwner] = useState(false)

  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [auditDialogOpen, setAuditDialogOpen] = useState(false)
  const [currentKey, setCurrentKey] = useState<ApiKey | null>(null)
  const [auditData, setAuditData] = useState<KeyUsageData | null>(null)
  const [auditLoading, setAuditLoading] = useState(false)
  const [expandedOwners, setExpandedOwners] = useState<Set<string>>(new Set())

  const [formData, setFormData] = useState({
    name: '',
    permissions: ['read'] as ApiKeyPermission[],
  })

  const limit = 20

  useEffect(() => {
    fetchApiKeys()
  }, [page, statusFilter, permissionFilter])

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1)
      fetchApiKeys()
    }, 300)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  const fetchApiKeys = async () => {
    setLoading(true)
    try {
      const response = await apiKeysApi.list({
        page,
        limit,
        search: search || undefined,
        isActive: statusFilter === 'all' ? undefined : statusFilter === 'active',
        permission: permissionFilter === 'all' ? undefined : permissionFilter,
      })
      setApiKeys(response.data)
      setTotal(response.total)
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('apiKeys.fetchError', 'Failed to fetch API keys'),
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (key: ApiKey) => {
    setCurrentKey(key)
    setFormData({
      name: key.name,
      permissions: key.permissions,
    })
    setEditDialogOpen(true)
  }

  const handleSave = async () => {
    if (!currentKey) return
    try {
      const data: UpdateApiKeyRequest = {
        name: formData.name,
        permissions: formData.permissions,
      }
      await apiKeysApi.update(currentKey.id, data)
      toast({
        title: t('common.success'),
        description: t('apiKeys.updateSuccess', 'API key updated successfully'),
      })
      setEditDialogOpen(false)
      fetchApiKeys()
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('apiKeys.updateError', 'Failed to update API key'),
        variant: 'destructive',
      })
    }
  }

  const togglePermission = (perm: ApiKeyPermission) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(perm)
        ? prev.permissions.filter((p) => p !== perm)
        : [...prev.permissions, perm],
    }))
  }

  const toggleActive = async (key: ApiKey) => {
    try {
      await apiKeysApi.update(key.id, { isActive: !key.isActive })
      fetchApiKeys()
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('apiKeys.statusError', 'Failed to update status'),
        variant: 'destructive',
      })
    }
  }

  const handleAudit = async (key: ApiKey) => {
    setCurrentKey(key)
    setAuditDialogOpen(true)
    setAuditLoading(true)
    try {
      const data = await apiKeysApi.getUsage(key.id)
      setAuditData(data)
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('apiKeys.auditError', 'Failed to load audit data'),
        variant: 'destructive',
      })
      setAuditData(null)
    } finally {
      setAuditLoading(false)
    }
  }

  const groupedKeys = useMemo(() => {
    const map = new Map<string, { owner: string; keys: ApiKey[] }>()
    for (const key of apiKeys) {
      const ownerId = key.ownerId || 'unknown'
      const ownerName = key.ownerNickname || key.ownerUsername || t('apiKeys.unknownOwner', 'Unknown')
      if (!map.has(ownerId)) {
        map.set(ownerId, { owner: ownerName, keys: [] })
      }
      map.get(ownerId)!.keys.push(key)
    }
    return Array.from(map.entries())
  }, [apiKeys, t])

  const toggleOwnerExpanded = (ownerId: string) => {
    setExpandedOwners((prev) => {
      const next = new Set(prev)
      if (next.has(ownerId)) {
        next.delete(ownerId)
      } else {
        next.add(ownerId)
      }
      return next
    })
  }

  const renderKeyStatus = (key: ApiKey) => {
    if (key.isUserDisabled) {
      return (
        <Badge variant="destructive" title={t('apiKeys.userDisabledTooltip', 'User disabled; all keys blocked')}>
          {t('apiKeys.userDisabled', 'User disabled')}
        </Badge>
      )
    }
    if (!key.isActive) {
      return <Badge variant="destructive">{t('apiKeys.inactive')}</Badge>
    }
    return <Badge className="bg-green-500">{t('apiKeys.active')}</Badge>
  }

  const renderKeyTable = (keys: ApiKey[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t('apiKeys.name')}</TableHead>
          <TableHead>{t('apiKeys.keyPrefix')}</TableHead>
          <TableHead>{t('apiKeys.permissions')}</TableHead>
          <TableHead>{t('apiKeys.rateLimit')}</TableHead>
          <TableHead>{t('common.status')}</TableHead>
          <TableHead>{t('apiKeys.lastUsedAt')}</TableHead>
          <TableHead>{t('common.createdAt')}</TableHead>
          <TableHead className="w-24">{t('common.actions')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {keys.map((key) => (
          <TableRow key={key.id}>
            <TableCell className="font-medium">{key.name}</TableCell>
            <TableCell>
              <code className="text-sm bg-muted px-2 py-1 rounded">{key.keyPrefix}...</code>
            </TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-1">
                {key.permissions.map((perm) => (
                  <Badge key={perm} variant="secondary">
                    {perm}
                  </Badge>
                ))}
              </div>
            </TableCell>
            <TableCell>{key.rateLimit}/min</TableCell>
            <TableCell>
              <Button variant="ghost" size="sm" onClick={() => toggleActive(key)}>
                {renderKeyStatus(key)}
              </Button>
            </TableCell>
            <TableCell>{key.lastUsedAt ? formatDate(key.lastUsedAt) : '-'}</TableCell>
            <TableCell>{formatDate(key.createdAt)}</TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" onClick={() => handleEdit(key)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleAudit(key)}>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t('apiKeys.title')}</h1>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-col gap-4 md:flex-row md:items-end flex-1">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('apiKeys.searchPlaceholder', 'Search by name or owner...')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder={t('common.status')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('apiKeys.allStatus', 'All statuses')}</SelectItem>
                    <SelectItem value="active">{t('apiKeys.active')}</SelectItem>
                    <SelectItem value="inactive">{t('apiKeys.inactive')}</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={permissionFilter} onValueChange={(v) => setPermissionFilter(v as typeof permissionFilter)}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder={t('apiKeys.permissions')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('apiKeys.allPermissions', 'All permissions')}</SelectItem>
                    <SelectItem value="read">read</SelectItem>
                    <SelectItem value="write">write</SelectItem>
                    <SelectItem value="admin">admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={groupByOwner ? 'default' : 'outline'}
                size="sm"
                onClick={() => setGroupByOwner((v) => !v)}
              >
                {t('apiKeys.groupByOwner', 'Group by owner')}
              </Button>
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
          ) : apiKeys.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">{t('common.noData')}</div>
          ) : groupByOwner ? (
            <div className="space-y-4">
              {groupedKeys.map(([ownerId, { owner, keys }]) => (
                <Card key={ownerId} className="border">
                  <CardHeader className="py-3">
                    <CardTitle
                      className="text-base flex items-center gap-2 cursor-pointer"
                      onClick={() => toggleOwnerExpanded(ownerId)}
                    >
                      {expandedOwners.has(ownerId) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                      <span>{t('apiKeys.owner', 'Owner')}: {owner}</span>
                      <Badge variant="outline">{keys.length}</Badge>
                    </CardTitle>
                  </CardHeader>
                  {expandedOwners.has(ownerId) && (
                    <CardContent className="pt-0">{renderKeyTable(keys)}</CardContent>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            renderKeyTable(apiKeys)
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

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('apiKeys.edit', 'Edit API Key')}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">{t('apiKeys.name')}</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('apiKeys.permissions')}</Label>
              <div className="flex gap-2">
                {(['read', 'write', 'admin'] as const).map((perm) => (
                  <Button
                    key={perm}
                    variant={formData.permissions.includes(perm) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => togglePermission(perm)}
                  >
                    {perm}
                  </Button>
                ))}
              </div>
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

      {/* Audit Dialog */}
      <Dialog open={auditDialogOpen} onOpenChange={setAuditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {t('apiKeys.auditTitle', 'API Key Audit')}: {currentKey?.name}
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
                    <div className="text-sm text-muted-foreground">{t('apiKeys.totalRequests', 'Total requests')}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{auditData.errors.length}</div>
                    <div className="text-sm text-muted-foreground">{t('apiKeys.errorTypes', 'Error types')}</div>
                  </CardContent>
                </Card>
              </div>
              <div>
                <h4 className="font-medium mb-2">{t('apiKeys.byAction', 'By action')}</h4>
                {auditData.byAction.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{t('common.noData')}</p>
                ) : (
                  <div className="space-y-1">
                    {auditData.byAction.map((item) => (
                      <div key={item.action} className="flex justify-between text-sm">
                        <span>{item.action}</span>
                        <span className="font-medium">{item.count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <h4 className="font-medium mb-2">{t('apiKeys.topIps', 'Top IPs')}</h4>
                {auditData.topIps.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{t('common.noData')}</p>
                ) : (
                  <div className="space-y-1">
                    {auditData.topIps.map((item) => (
                      <div key={item.ip} className="flex justify-between text-sm">
                        <span>{item.ip}</span>
                        <span className="font-medium">{item.count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <h4 className="font-medium mb-2">{t('apiKeys.errors', 'Recent errors')}</h4>
                {auditData.errors.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{t('common.noData')}</p>
                ) : (
                  <div className="space-y-1">
                    {auditData.errors.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="truncate max-w-[300px]">{item.message}</span>
                        <span className="font-medium">{item.count}</span>
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
