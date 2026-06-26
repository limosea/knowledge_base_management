import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { librariesApi, categoriesApi } from '@/api'
import type { Library, CreateLibraryRequest, UpdateLibraryRequest } from '@/api/libraries'
import type { Category } from '@/types'
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
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { Shield, ShieldOff, EyeOff, Library as LibraryIcon, Plus, Pencil, Trash2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { IconPicker } from '@/components/IconPicker'
import { getRandomIcon } from '@/components/icon-presets'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
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

interface LibrariesPageProps {
  elevated?: boolean
}

export function LibrariesPage({ elevated = false }: LibrariesPageProps) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [libraries, setLibraries] = useState<Library[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  // CRUD dialog states
  const [createOpen, setCreateOpen] = useState(false)
  const [editLib, setEditLib] = useState<Library | null>(null)
  const [deleteLib, setDeleteLib] = useState<Library | null>(null)
  const [formSaving, setFormSaving] = useState(false)
  const [form, setForm] = useState<{ name: string; description: string; icon: string; tags: string; visibility: 'private' | 'public'; categoryId: string }>({
    name: '', description: '', icon: '', tags: '', visibility: 'private', categoryId: '',
  })

  const limit = 20

  useEffect(() => {
    fetchLibraries()
    fetchCategories()
  }, [page])

  const fetchCategories = async () => {
    try {
      const res = await categoriesApi.adminList({ limit: 100 })
      setCategories(res.data)
    } catch {}
  }

  const fetchLibraries = async () => {
    setLoading(true)
    try {
      const response = elevated
        ? await librariesApi.adminList({ page, limit, search: search || undefined })
        : await librariesApi.list({ page, limit, search: search || undefined })
      setLibraries(response.data)
      setTotal(response.total)
    } catch (error) {
      toast({ title: t('common.error'), description: 'Failed to fetch libraries', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => { setPage(1); fetchLibraries() }

  const openCreate = () => {
    setForm({ name: '', description: '', icon: '', tags: '', visibility: 'private', categoryId: '' })
    setCreateOpen(true)
  }

  const openEdit = (lib: Library) => {
    setForm({
      name: lib.name,
      description: lib.description || '',
      icon: lib.icon || '',
      tags: lib.tags?.join(', ') || '',
      visibility: lib.visibility,
      categoryId: lib.categoryId || '',
    })
    setEditLib(lib)
  }

  const handleCreate = async () => {
    if (!form.name.trim()) return
    setFormSaving(true)
    try {
      const data: CreateLibraryRequest = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        icon: form.icon.trim() || getRandomIcon(),
        tags: form.tags.trim() ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : undefined,
        visibility: form.visibility,
        categoryId: form.categoryId || undefined,
      }
      await librariesApi.create(data)
      toast({ title: t('libraries.created') })
      setCreateOpen(false)
      fetchLibraries()
    } catch {
      toast({ title: t('common.error'), description: t('libraries.createFailed'), variant: 'destructive' })
    } finally {
      setFormSaving(false)
    }
  }

  const handleUpdate = async () => {
    if (!editLib || !form.name.trim()) return
    setFormSaving(true)
    try {
      const data: UpdateLibraryRequest = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        icon: form.icon.trim() || undefined,
        tags: form.tags.trim() ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : undefined,
        visibility: form.visibility,
        categoryId: form.categoryId || undefined,
      }
      await librariesApi.update(editLib.id, data)
      toast({ title: t('libraries.updated') })
      setEditLib(null)
      fetchLibraries()
    } catch {
      toast({ title: t('common.error'), description: t('libraries.updateFailed'), variant: 'destructive' })
    } finally {
      setFormSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteLib) return
    setFormSaving(true)
    try {
      await librariesApi.delete(deleteLib.id)
      toast({ title: t('libraries.deleted') })
      setDeleteLib(null)
      fetchLibraries()
    } catch {
      toast({ title: t('common.error'), description: t('libraries.deleteFailed'), variant: 'destructive' })
    } finally {
      setFormSaving(false)
    }
  }

  const handleShield = async (id: string, shielded: boolean) => {
    try {
      if (shielded) { await librariesApi.unshield(id) } else { await librariesApi.shield(id) }
      toast({ title: shielded ? t('libraries.unshielded') : t('libraries.shielded') })
      fetchLibraries()
    } catch {
      toast({ title: t('common.error'), description: 'Failed to update shield status', variant: 'destructive' })
    }
  }

  const totalPages = Math.ceil(total / limit)
  const basePath = elevated ? '/elevated/knowledge' : '/knowledge'

  const LibraryFormFields = () => (
    <div className="space-y-4 py-2">
      <div className="space-y-1">
        <label className="text-sm font-medium">{t('libraries.name')} *</label>
        <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium">{t('libraries.description')}</label>
        <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium">{t('libraries.iconLabel')}</label>
          <IconPicker value={form.icon} onChange={(icon) => setForm(f => ({ ...f, icon }))} />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">{t('libraries.visibility')}</label>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={form.visibility}
            onChange={e => setForm(f => ({ ...f, visibility: e.target.value as 'private' | 'public' }))}
          >
            <option value="private">{t('common.private')}</option>
            <option value="public">{t('common.public')}</option>
          </select>
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium">{t('libraries.tagsLabel')}</label>
        <Input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder={t('libraries.tagsPlaceholder')} />
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium">{t('libraries.category')}</label>
        <select
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          value={form.categoryId}
          onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
        >
          <option value="">{t('common.none')}</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LibraryIcon className="h-6 w-6" />
          <h1 className="text-2xl font-bold">{elevated ? t('libraries.adminTitle', '全站知识库管理') : t('libraries.title')}</h1>
          <Badge variant="secondary">{total}</Badge>
        </div>
        {!elevated && (
          <Button onClick={openCreate} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            {t('libraries.create')}
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Input
              placeholder={t('libraries.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="max-w-sm"
            />
            <Button onClick={handleSearch} size="sm">{t('common.search')}</Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : libraries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">{t('libraries.empty')}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('libraries.name')}</TableHead>
                  <TableHead>{t('libraries.category')}</TableHead>
                  <TableHead>{t('libraries.description')}</TableHead>
                  <TableHead>{t('libraries.visibility')}</TableHead>
                  <TableHead>{t('libraries.status')}</TableHead>
                  <TableHead>{t('libraries.entryCount')}</TableHead>
                  {!elevated && <TableHead>{t('libraries.createdAt')}</TableHead>}
                  {elevated && <TableHead>{t('libraries.createdBy')}</TableHead>}
                  <TableHead className="text-right">{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {libraries.map((lib) => (
                  <TableRow key={lib.id}>
                    <TableCell className="font-medium">
                      <button
                        onClick={() => navigate(`${basePath}/${lib.id}`)}
                        className="text-primary hover:underline text-left"
                      >
                        <div className="flex items-center gap-2">
                          {lib.icon && (
                            lib.icon.startsWith('data:') || lib.icon.startsWith('http') || lib.icon.startsWith('/')
                              ? <img src={lib.icon} alt="" className="h-5 w-5 rounded object-cover" />
                              : null
                          )}
                          {lib.name}
                        </div>
                      </button>
                    </TableCell>
                    <TableCell>
                      {lib.categoryId
                        ? <Badge variant="outline">{categories.find(c => c.id === lib.categoryId)?.name || '-'}</Badge>
                        : '-'}
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-muted-foreground">{lib.description || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={lib.visibility === 'public' ? 'default' : 'secondary'}>
                        {lib.visibility === 'public' ? t('common.public') : t('common.private')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {lib.shielded && (
                          <Badge variant="destructive" className="text-xs">
                            <Shield className="h-3 w-3 mr-1" />{t('common.shielded')}
                          </Badge>
                        )}
                        {!elevated && lib.selfShielded && (
                          <Badge variant="outline" className="text-xs">
                            <EyeOff className="h-3 w-3 mr-1" />{t('common.selfShielded')}
                          </Badge>
                        )}
                        {lib.shielded || (!elevated && lib.selfShielded) ? null : !lib.shielded && (
                          <Badge variant="secondary" className="text-xs">{t('common.visible')}</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell><span className="text-sm font-medium">{lib.entryCount ?? 0}</span></TableCell>
                    {!elevated && <TableCell>{formatDate(lib.createdAt)}</TableCell>}
                    {elevated && <TableCell className="text-xs text-muted-foreground">{lib.creatorNickname || lib.createdBy}</TableCell>}
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {!elevated && (
                          <>
                            <Button variant="ghost" size="sm" onClick={() => openEdit(lib)} title={t('common.edit')}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setDeleteLib(lib)} title={t('common.delete')}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </>
                        )}
                        {elevated && (
                          <Button variant="ghost" size="sm" onClick={() => handleShield(lib.id, lib.shielded)}
                            title={lib.shielded ? t('libraries.unshield') : t('libraries.shield')}>
                            {lib.shielded ? <ShieldOff className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                {t('common.showing', { from: (page - 1) * limit + 1, to: Math.min(page * limit, total), total })}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                  {t('common.previous')}
                </Button>
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                  {t('common.next')}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('libraries.create')}</DialogTitle>
            <DialogDescription>{t('libraries.createDesc')}</DialogDescription>
          </DialogHeader>
          <LibraryFormFields />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>{t('common.cancel')}</Button>
            <Button onClick={handleCreate} disabled={formSaving || !form.name.trim()}>
              {formSaving ? t('common.saving') : t('common.create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editLib} onOpenChange={(open) => { if (!open) setEditLib(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('libraries.edit')}</DialogTitle>
            <DialogDescription>{t('libraries.editDesc')}</DialogDescription>
          </DialogHeader>
          <LibraryFormFields />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditLib(null)}>{t('common.cancel')}</Button>
            <Button onClick={handleUpdate} disabled={formSaving || !form.name.trim()}>
              {formSaving ? t('common.saving') : t('common.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteLib} onOpenChange={(open) => { if (!open) setDeleteLib(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('libraries.confirmDelete')}</AlertDialogTitle>
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
