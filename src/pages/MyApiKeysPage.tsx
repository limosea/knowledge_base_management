import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { meApi } from '@/api'
import { usePermission } from '@/contexts/PermissionContext'
import type { MyApiKey, CreateApiKeyRequest, ApiKeyPermission } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
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
import { Plus, Trash2, RefreshCw, Copy, Check, Power, PowerOff, AlertTriangle } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export function MyApiKeysPage() {
  const { t } = useTranslation()
  const { toast } = useToast()
  const { isUserActive } = usePermission()
  const userActive = isUserActive()
  const [keys, setKeys] = useState<MyApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)

  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [regenerateDialogOpen, setRegenerateDialogOpen] = useState(false)
  const [newKeyDialogOpen, setNewKeyDialogOpen] = useState(false)
  const [toggleDialogOpen, setToggleDialogOpen] = useState(false)

  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [regenerateId, setRegenerateId] = useState<string | null>(null)
  const [toggleKey, setToggleKey] = useState<MyApiKey | null>(null)
  const [newKeyValue, setNewKeyValue] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    permissions: ['read'] as ApiKeyPermission[],
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
        description: t('myApiKeys.fetchError'),
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!userActive) {
      toast({
        title: t('common.error'),
        description: t('myApiKeys.userDisabled', 'Your account is disabled. Cannot create API key.'),
        variant: 'destructive',
      })
      return
    }
    try {
      const data: CreateApiKeyRequest = {
        name: formData.name,
        permissions: formData.permissions,
      }
      const result = await meApi.createKey(data)
      setNewKeyValue(result.key || null)
      setCreateDialogOpen(false)
      setNewKeyDialogOpen(true)
      setFormData({ name: '', permissions: ['read'] })
      fetchKeys()
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('myApiKeys.createError'),
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
        description: t('myApiKeys.deleteSuccess'),
      })
      setDeleteDialogOpen(false)
      setDeleteId(null)
      fetchKeys()
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('myApiKeys.deleteError'),
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
        description: t('myApiKeys.regenerateError'),
        variant: 'destructive',
      })
    }
  }

  const handleToggleActive = async () => {
    if (!toggleKey) return
    try {
      await meApi.updateKey(toggleKey.id, { isActive: !toggleKey.isActive })
      toast({
        title: t('common.success'),
        description: toggleKey.isActive
          ? t('myApiKeys.disableSuccess', 'API key disabled')
          : t('myApiKeys.enableSuccess', 'API key enabled'),
      })
      setToggleDialogOpen(false)
      setToggleKey(null)
      fetchKeys()
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('myApiKeys.toggleError', 'Failed to update API key status'),
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
        <Button onClick={() => setCreateDialogOpen(true)} disabled={!userActive}>
          <Plus className="h-4 w-4 mr-2" />
          {t('myApiKeys.createKey')}
        </Button>
      </div>

      {!userActive && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
          <div>
            <p className="font-medium text-destructive">{t('myApiKeys.accountDisabled', 'Account disabled')}</p>
            <p className="text-sm text-destructive/80">
              {t('myApiKeys.accountDisabledDesc', 'Your account has been disabled by an administrator. Your API keys cannot be used and you cannot create new keys.')}
            </p>
          </div>
        </div>
      )}

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
                    <TableCell>
                      {key.isActive ? (
                        <Badge className="bg-green-500">{t('apiKeys.active')}</Badge>
                      ) : (
                        <Badge variant="destructive">{t('apiKeys.inactive')}</Badge>
                      )}
                    </TableCell>
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
                            setToggleKey(key)
                            setToggleDialogOpen(true)
                          }}
                          title={key.isActive ? t('myApiKeys.disable', 'Disable') : t('myApiKeys.enable', 'Enable')}
                        >
                          {key.isActive ? (
                            <PowerOff className="h-4 w-4 text-orange-500" />
                          ) : (
                            <Power className="h-4 w-4 text-green-500" />
                          )}
                        </Button>
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
                {(['read', 'write'] as ApiKeyPermission[]).map((perm) => (
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleCreate} disabled={!userActive}>{t('common.create')}</Button>
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

      {/* Toggle Active Dialog */}
      <AlertDialog open={toggleDialogOpen} onOpenChange={setToggleDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {toggleKey?.isActive
                ? t('myApiKeys.confirmDisable', 'Disable this API key?')
                : t('myApiKeys.confirmEnable', 'Enable this API key?')}
            </AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setToggleKey(null)}>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleToggleActive}
              className={toggleKey?.isActive ? 'bg-orange-500 text-white hover:bg-orange-600' : ''}
            >
              {toggleKey?.isActive ? t('myApiKeys.disable', 'Disable') : t('myApiKeys.enable', 'Enable')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
