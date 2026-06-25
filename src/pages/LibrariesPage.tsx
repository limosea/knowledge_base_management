import { Fragment, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { librariesApi, knowledgeApi } from '@/api'
import type { Library, CreateLibraryRequest, UpdateLibraryRequest } from '@/api/libraries'
import type { AdminKnowledgeListItem } from '@/types'
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
import { Shield, ShieldOff, EyeOff, Library as LibraryIcon, ChevronDown, ChevronRight, BookOpen, Plus, Pencil, Trash2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'
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
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [expandedLibId, setExpandedLibId] = useState<string | null>(null)
  const [expandedEntries, setExpandedEntries] = useState<AdminKnowledgeListItem[]>([])
  const [entriesLoading, setEntriesLoading] = useState(false)

  // CRUD dialog states
  const [createOpen, setCreateOpen] = useState(false)
  const [editLib, setEditLib] = useState<Library | null>(null)
  const [deleteLib, setDeleteLib] = useState<Library | null>(null)
  const [formSaving, setFormSaving] = useState(false)
  const [form, setForm] = useState<{ name: string; description: string; icon: string; tags: string; visibility: 'private' | 'public' }>({
    name: '', description: '', icon: '', tags: '', visibility: 'private',
  })

  const limit = 20

  useEffect(() => {
    fetchLibraries()
  }, [page])

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
    setForm({ name: '', description: '', icon: '', tags: '', visibility: 'private' })
    setCreateOpen(true)
  }

  const openEdit = (lib: Library) => {
    setForm({
      name: lib.name,
      description: lib.description || '',
      icon: lib.icon || '',
      tags: lib.tags?.join(', ') || '',
      visibility: lib.visibility,
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
        icon: form.icon.trim() || undefined,
        tags: form.tags.trim() ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : undefined,
        visibility: form.visibility,
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

  const handleSelfShield = async (id: string, selfShielded: boolean) => {
    try {
      if (selfShielded) { await librariesApi.selfUnshield(id) } else { await librariesApi.selfShield(id) }
      toast({ title: selfShielded ? t('libraries.selfUnshielded') : t('libraries.selfShielded') })
      fetchLibraries()
    } catch {
      toast({ title: t('common.error'), description: 'Failed to update self-shield status', variant: 'destructive' })
    }
  }

  const toggleExpand = async (libId: string) => {
    if (expandedLibId === libId) { setExpandedLibId(null); setExpandedEntries([]); return }
    setExpandedLibId(libId)
    setEntriesLoading(true)
    try {
      const res = await knowledgeApi.list({ libraryId: libId, limit: 50 })
      setExpandedEntries(res.data)
    } catch { setExpandedEntries([]) }
    finally { setEntriesLoading(false) }
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
          <Input value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} placeholder="e.g. 📚" />
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
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LibraryIcon className="h-6 w-6" />
          <h1 className="text-2xl font-bold">{t('libraries.title')}</h1>
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
                  <TableHead className="w-8" />
                  <TableHead>{t('libraries.name')}</TableHead>
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
                  <Fragment key={lib.id}>
                    <TableRow>
                      <TableCell>
                        <button onClick={() => toggleExpand(lib.id)} className="p-1 hover:bg-muted rounded">
                          {expandedLibId === lib.id
                            ? <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                        </button>
                      </TableCell>
                      <TableCell className="font-medium">
                        <button
                          onClick={() => navigate(`${basePath}/${lib.id}`)}
                          className="text-primary hover:underline text-left"
                        >
                          <div className="flex items-center gap-2">
                            {lib.icon && <span>{lib.icon}</span>}
                            {lib.name}
                          </div>
                        </button>
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
                          {lib.selfShielded && (
                            <Badge variant="outline" className="text-xs">
                              <EyeOff className="h-3 w-3 mr-1" />{t('common.selfShielded')}
                            </Badge>
                          )}
                          {!lib.shielded && !lib.selfShielded && (
                            <Badge variant="secondary" className="text-xs">{t('common.visible')}</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell><span className="text-sm font-medium">{lib.entryCount ?? 0}</span></TableCell>
                      {!elevated && <TableCell>{formatDate(lib.createdAt)}</TableCell>}
                      {elevated && <TableCell className="text-xs text-muted-foreground">{t('libraries.me')}</TableCell>}
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
                            <>
                              <Button variant="ghost" size="sm" onClick={() => handleShield(lib.id, lib.shielded)}
                                title={lib.shielded ? t('libraries.unshield') : t('libraries.shield')}>
                                {lib.shielded ? <ShieldOff className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleSelfShield(lib.id, lib.selfShielded)}
                                title={lib.selfShielded ? t('libraries.selfUnshield') : t('libraries.selfShield')}>
                                {lib.selfShielded ? <BookOpen className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                    {expandedLibId === lib.id && (
                      <TableRow>
                        <TableCell colSpan={elevated ? 9 : 8} className="bg-muted/30 p-4">
                          {entriesLoading ? (
                            <div className="space-y-2">
                              <Skeleton className="h-8 w-full" /><Skeleton className="h-8 w-full" />
                            </div>
                          ) : expandedEntries.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">{t('plaza.noEntries')}</p>
                          ) : (
                            <div className="space-y-1">
                              <p className="text-xs font-medium text-muted-foreground mb-2">
                                {t('plaza.entriesInLibrary', { count: expandedEntries.length })}
                              </p>
                              {expandedEntries.map((entry) => (
                                <div key={entry.id}
                                  className="flex items-center justify-between px-3 py-2 bg-background rounded border cursor-pointer hover:bg-muted/50"
                                  onClick={() => navigate(`/entry/${entry.id}`)}>
                                  <div className="flex items-center gap-2">
                                    <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span className="text-sm font-medium">{entry.title}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {entry.category && <Badge variant="outline" className="text-xs">{entry.category}</Badge>}
                                    {entry.shielded && <Badge variant="destructive" className="text-xs">{t('common.shielded')}</Badge>}
                                    <span className="text-xs text-muted-foreground">{formatDate(entry.createdAt)}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
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
