import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { knowledgeApi, librariesApi } from '@/api'
import type { Library } from '@/api/libraries'
import type { AdminKnowledgeListItem, CreateEntryRequest, UpdateEntryRequest } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import {
  ArrowLeft, Plus, Pencil, Trash2, Shield, ShieldOff, EyeOff, Search,
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface LibraryEntriesPageProps {
  elevated?: boolean
}

export function LibraryEntriesPage({ elevated = false }: LibraryEntriesPageProps) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const navigate = useNavigate()
  const { libraryId } = useParams<{ libraryId: string }>()
  const [library, setLibrary] = useState<Library | null>(null)
  const [entries, setEntries] = useState<AdminKnowledgeListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  // CRUD states
  const [createOpen, setCreateOpen] = useState(false)
  const [editEntry, setEditEntry] = useState<AdminKnowledgeListItem | null>(null)
  const [deleteEntry, setDeleteEntry] = useState<AdminKnowledgeListItem | null>(null)
  const [formSaving, setFormSaving] = useState(false)
  const [form, setForm] = useState({ title: '', content: '', summary: '', tags: '', visibility: 'private' as 'private' | 'public' })

  const limit = 20
  const basePath = elevated ? '/elevated/knowledge' : '/knowledge'

  useEffect(() => {
    if (libraryId) fetchLibrary()
  }, [libraryId])

  useEffect(() => {
    fetchEntries()
  }, [page, libraryId])

  const fetchLibrary = async () => {
    try {
      const lib = await librariesApi.get(libraryId!)
      setLibrary(lib)
    } catch {
      toast({ title: t('common.error'), description: 'Failed to load library', variant: 'destructive' })
    }
  }

  const fetchEntries = async () => {
    if (!libraryId) return
    setLoading(true)
    try {
      const res = await knowledgeApi.list({ libraryId, page, limit, search: search || undefined })
      setEntries(res.data)
      setTotal(res.total)
    } catch {
      toast({ title: t('common.error'), description: 'Failed to fetch entries', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => { setPage(1); fetchEntries() }

  const handleCreate = async () => {
    if (!form.title.trim() || !form.content.trim() || !libraryId) return
    setFormSaving(true)
    try {
      const data: CreateEntryRequest = {
        title: form.title.trim(),
        content: form.content.trim(),
        summary: form.summary.trim() || undefined,
        tags: form.tags.trim() ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : undefined,
        visibility: form.visibility,
        library_id: libraryId,
      }
      await knowledgeApi.create(data)
      toast({ title: t('knowledge.entryCreated') })
      setCreateOpen(false)
      setForm({ title: '', content: '', summary: '', tags: '', visibility: 'private' })
      fetchEntries()
      fetchLibrary()
    } catch {
      toast({ title: t('common.error'), description: t('knowledge.createFailed'), variant: 'destructive' })
    } finally {
      setFormSaving(false)
    }
  }

  const openEdit = async (entry: AdminKnowledgeListItem) => {
    try {
      const detail = await knowledgeApi.get(entry.id)
      setForm({
        title: detail.title,
        content: detail.content,
        summary: detail.summary || '',
        tags: detail.tags?.join(', ') || '',
        visibility: entry.visibility,
      })
      setEditEntry(entry)
    } catch {
      toast({ title: t('common.error'), description: 'Failed to load entry', variant: 'destructive' })
    }
  }

  const handleUpdate = async () => {
    if (!editEntry || !form.title.trim() || !form.content.trim()) return
    setFormSaving(true)
    try {
      const data: UpdateEntryRequest = {
        title: form.title.trim(),
        content: form.content.trim(),
        summary: form.summary.trim() || undefined,
        tags: form.tags.trim() ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : undefined,
      }
      await knowledgeApi.update(editEntry.id, data)
      toast({ title: t('knowledge.entryUpdated') })
      setEditEntry(null)
      fetchEntries()
    } catch {
      toast({ title: t('common.error'), description: t('knowledge.updateFailed'), variant: 'destructive' })
    } finally {
      setFormSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteEntry) return
    setFormSaving(true)
    try {
      await knowledgeApi.delete(deleteEntry.id)
      toast({ title: t('knowledge.entryDeleted') })
      setDeleteEntry(null)
      fetchEntries()
      fetchLibrary()
    } catch {
      toast({ title: t('common.error'), description: 'Failed to delete entry', variant: 'destructive' })
    } finally {
      setFormSaving(false)
    }
  }

  const handleShield = async (entry: AdminKnowledgeListItem) => {
    try {
      if (entry.shielded) { await knowledgeApi.unshield(entry.id) }
      else { await knowledgeApi.shield(entry.id) }
      toast({ title: entry.shielded ? t('knowledge.unshieldSuccess') : t('knowledge.shieldSuccess') })
      fetchEntries()
    } catch {
      toast({ title: t('common.error'), variant: 'destructive' })
    }
  }

  const handleSelfShield = async (entry: AdminKnowledgeListItem) => {
    // Self-shield is a personal-console action only; not available in elevated mode
    try {
      if (entry.selfShielded) { await knowledgeApi.selfUnshield(entry.id) }
      else { await knowledgeApi.selfShield(entry.id) }
      toast({ title: entry.selfShielded ? t('knowledge.selfUnshielded') : t('knowledge.selfShielded') })
      fetchEntries()
    } catch {
      toast({ title: t('common.error'), variant: 'destructive' })
    }
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to={basePath}>
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div className="text-sm text-muted-foreground">
          <Link to={basePath} className="hover:text-foreground">{t('libraries.title')}</Link>
          <span className="mx-2">/</span>
        </div>
        <div className="flex items-center gap-2">
          {library?.icon && (
            library.icon.startsWith('data:') || library.icon.startsWith('http') || library.icon.startsWith('/')
              ? <img src={library.icon} alt="" className="h-8 w-8 rounded object-cover" />
              : <span className="text-2xl">{library.icon}</span>
          )}
          <h1 className="text-2xl font-bold">{library?.name || '...'}</h1>
          <Badge variant="secondary">{total}</Badge>
        </div>
      </div>

      {library && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Badge variant={library.visibility === 'public' ? 'default' : 'secondary'}>
            {library.visibility === 'public' ? t('common.public') : t('common.private')}
          </Badge>
          {library.shielded && <Badge variant="destructive"><Shield className="h-3 w-3 mr-1" />{t('common.shielded')}</Badge>}
          {library.selfShielded && !elevated && <Badge variant="outline"><EyeOff className="h-3 w-3 mr-1" />{t('common.selfShielded')}</Badge>}
          {library.description && <span className="truncate max-w-md">{library.description}</span>}
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Input
                placeholder={t('common.search')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-64"
              />
              <Button variant="outline" size="icon" onClick={handleSearch}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
            {!elevated && (
              <Button onClick={() => setCreateOpen(true)} size="sm">
                <Plus className="h-4 w-4 mr-1" />
                {t('knowledge.createEntry')}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">{t('common.noData')}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('knowledge.titleField')}</TableHead>
                  <TableHead>{t('knowledge.category')}</TableHead>
                  <TableHead>{t('knowledge.tags')}</TableHead>
                  <TableHead>{t('knowledge.qualityScore')}</TableHead>
                  <TableHead>{t('knowledge.shielded')}</TableHead>
                  <TableHead>{t('common.createdAt')}</TableHead>
                  <TableHead className="w-24">{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">
                      <button onClick={() => navigate(elevated ? `/elevated/entry/${entry.id}` : `/entry/${entry.id}`)} className="text-primary hover:underline text-left">
                        {entry.title}
                      </button>
                    </TableCell>
                    <TableCell>{entry.category ? <Badge variant="outline">{entry.category}</Badge> : '-'}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {entry.tags?.slice(0, 3).map((tag) => <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>)}
                      </div>
                    </TableCell>
                    <TableCell>{entry.qualityScore !== undefined ? entry.qualityScore.toFixed(1) : '-'}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {entry.shielded && <Badge variant="destructive">{t('knowledge.shielded')}</Badge>}
                        {!elevated && entry.selfShielded && <Badge variant="outline">{t('common.selfShielded')}</Badge>}
                        {!entry.shielded && !(entry.selfShielded && !elevated) && <Badge variant="secondary">{t('common.visible')}</Badge>}
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(entry.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {elevated && (
                          <Button variant="ghost" size="icon" onClick={() => handleShield(entry)}
                            title={entry.shielded ? t('knowledge.unshield') : t('knowledge.shield')}>
                            {entry.shielded ? <ShieldOff className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                          </Button>
                        )}
                        {!elevated && (
                          <>
                            <Button variant="ghost" size="icon" onClick={() => handleSelfShield(entry)}
                              title={entry.selfShielded ? t('knowledge.selfUnshield') : t('knowledge.selfShield')}>
                              <EyeOff className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => openEdit(entry)}
                              title={t('common.edit')}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => setDeleteEntry(entry)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                {t('pagination.showing', { from: (page - 1) * limit + 1, to: Math.min(page * limit, total), total })}
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>{t('common.back')}</Button>
                <span className="text-sm">{page} / {totalPages}</span>
                <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>{t('pagination.page')}</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Entry Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('knowledge.createEntry')}</DialogTitle>
            <DialogDescription>{t('knowledge.createEntryDesc')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <label className="text-sm font-medium">{t('knowledge.titleField')} *</label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">{t('knowledge.content')} *</label>
              <textarea
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={form.content}
                onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">{t('knowledge.visibility')}</label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={form.visibility}
                  onChange={e => setForm(f => ({ ...f, visibility: e.target.value as 'private' | 'public' }))}
                >
                  <option value="private">{t('common.private')}</option>
                  <option value="public">{t('common.public')}</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">{t('knowledge.tags')}</label>
                <Input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder={t('knowledge.tagsPlaceholder')} />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">{t('knowledge.summary')}</label>
              <textarea
                className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={form.summary}
                onChange={e => setForm(f => ({ ...f, summary: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>{t('common.cancel')}</Button>
            <Button onClick={handleCreate} disabled={formSaving || !form.title.trim() || !form.content.trim()}>
              {formSaving ? t('common.saving') : t('common.create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Entry Dialog */}
      <Dialog open={!!editEntry} onOpenChange={(open) => { if (!open) setEditEntry(null) }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('knowledge.editEntry')}</DialogTitle>
            <DialogDescription>{t('knowledge.editEntryDesc')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <label className="text-sm font-medium">{t('knowledge.titleField')} *</label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">{t('knowledge.content')} *</label>
              <textarea
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={form.content}
                onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">{t('knowledge.tags')}</label>
                <Input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder={t('knowledge.tagsPlaceholder')} />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">{t('knowledge.summary')}</label>
              <textarea
                className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={form.summary}
                onChange={e => setForm(f => ({ ...f, summary: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditEntry(null)}>{t('common.cancel')}</Button>
            <Button onClick={handleUpdate} disabled={formSaving || !form.title.trim() || !form.content.trim()}>
              {formSaving ? t('common.saving') : t('common.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Entry Confirmation */}
      <AlertDialog open={!!deleteEntry} onOpenChange={(open) => { if (!open) setDeleteEntry(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('knowledge.confirmDelete')}</AlertDialogTitle>
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
