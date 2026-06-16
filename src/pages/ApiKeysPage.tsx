import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { apiKeysApi } from '@/api'
import type { ApiKey, CreateApiKeyRequest, UpdateApiKeyRequest, Permission } from '@/types'
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
import { Plus, Copy, Pencil, Trash2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export function ApiKeysPage() {
  const { t } = useTranslation()
  const { toast } = useToast()
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [currentKey, setCurrentKey] = useState<ApiKey | null>(null)
  const [newKey, setNewKey] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    permissions: ['read'] as Permission[],
    rateLimit: 100,
    expiresAt: '',
  })

  const limit = 20

  useEffect(() => {
    fetchApiKeys()
  }, [page])

  const fetchApiKeys = async () => {
    setLoading(true)
    try {
      const response = await apiKeysApi.list({ page, limit })
      setApiKeys(response.data)
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
        expiresAt: formData.expiresAt || undefined,
      }
      
      const key = await apiKeysApi.create(data)
      setNewKey(key.key || null)
      toast({
        title: t('common.success'),
        description: t('apiKeys.warningKeyOnce'),
      })
      setCreateDialogOpen(false)
      setFormData({ name: '', permissions: ['read'], rateLimit: 100, expiresAt: '' })
      fetchApiKeys()
    } catch (error) {
      toast({
        title: t('common.error'),
        description: 'Failed to create API key',
        variant: 'destructive',
      })
    }
  }

  const handleEdit = (key: ApiKey) => {
    setCurrentKey(key)
    setFormData({
      name: key.name,
      permissions: key.permissions,
      rateLimit: key.rateLimit,
      expiresAt: key.expiresAt ? key.expiresAt.split('T')[0] : '',
    })
    setEditDialogOpen(true)
  }

  const handleSave = async () => {
    if (!currentKey) return
    
    try {
      const data: UpdateApiKeyRequest = {
        name: formData.name,
        permissions: formData.permissions,
        rateLimit: formData.rateLimit,
      }
      
      await apiKeysApi.update(currentKey.id, data)
      toast({
        title: t('common.success'),
        description: 'API key updated successfully',
      })
      setEditDialogOpen(false)
      fetchApiKeys()
    } catch (error) {
      toast({
        title: t('common.error'),
        description: 'Failed to update API key',
        variant: 'destructive',
      })
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    
    try {
      await apiKeysApi.delete(deleteId)
      toast({
        title: t('common.success'),
        description: 'API key deleted successfully',
      })
      setDeleteDialogOpen(false)
      setDeleteId(null)
      fetchApiKeys()
    } catch (error) {
      toast({
        title: t('common.error'),
        description: 'Failed to delete API key',
        variant: 'destructive',
      })
    }
  }

  const togglePermission = (perm: Permission) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(perm)
        ? prev.permissions.filter(p => p !== perm)
        : [...prev.permissions, perm],
    }))
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: t('apiKeys.keyCopied'),
      })
    } catch {
      toast({
        title: t('common.error'),
        description: 'Failed to copy',
        variant: 'destructive',
      })
    }
  }

  const toggleActive = async (key: ApiKey) => {
    try {
      await apiKeysApi.update(key.id, { isActive: !key.isActive })
      fetchApiKeys()
    } catch (error) {
      toast({
        title: t('common.error'),
        description: 'Failed to update status',
        variant: 'destructive',
      })
    }
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t('apiKeys.title')}</h1>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {t('apiKeys.create')}
        </Button>
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
          ) : apiKeys.length === 0 ? (
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
                  <TableHead>{t('common.status')}</TableHead>
                  <TableHead>{t('apiKeys.lastUsedAt')}</TableHead>
                  <TableHead className="w-24">{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiKeys.map((key) => (
                  <TableRow key={key.id}>
                    <TableCell className="font-medium">{key.name}</TableCell>
                    <TableCell>
                      <code className="text-sm bg-muted px-2 py-1 rounded">
                        {key.keyPrefix}...
                      </code>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {key.permissions.map((perm) => (
                          <Badge key={perm} variant="secondary">
                            {perm}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{key.rateLimit}/min</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleActive(key)}
                      >
                        {key.isActive ? (
                          <Badge className="bg-green-500">{t('apiKeys.active')}</Badge>
                        ) : (
                          <Badge variant="destructive">{t('apiKeys.inactive')}</Badge>
                        )}
                      </Button>
                    </TableCell>
                    <TableCell>
                      {key.lastUsedAt ? formatDate(key.lastUsedAt) : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(key)}
                        >
                          <Pencil className="h-4 w-4" />
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
            <DialogTitle>{t('apiKeys.create')}</DialogTitle>
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
            <div className="space-y-2">
              <Label htmlFor="rateLimit">{t('apiKeys.rateLimit')}</Label>
              <Input
                id="rateLimit"
                type="number"
                value={formData.rateLimit}
                onChange={(e) => setFormData({ ...formData, rateLimit: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiresAt">{t('apiKeys.expiresAt')}</Label>
              <Input
                id="expiresAt"
                type="date"
                value={formData.expiresAt}
                onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
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

      {/* New Key Display Dialog */}
      <Dialog open={!!newKey} onOpenChange={() => setNewKey(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('apiKeys.key')}</DialogTitle>
            <DialogDescription>{t('apiKeys.warningKeyOnce')}</DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 py-4">
            <code className="flex-1 p-2 bg-muted rounded text-sm break-all">
              {newKey}
            </code>
            <Button variant="outline" size="icon" onClick={() => copyToClipboard(newKey!)}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <DialogFooter>
            <Button onClick={() => setNewKey(null)}>{t('common.confirm')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('apiKeys.create')}</DialogTitle>
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
            <div className="space-y-2">
              <Label htmlFor="edit-rateLimit">{t('apiKeys.rateLimit')}</Label>
              <Input
                id="edit-rateLimit"
                type="number"
                value={formData.rateLimit}
                onChange={(e) => setFormData({ ...formData, rateLimit: Number(e.target.value) })}
              />
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
    </div>
  )
}
