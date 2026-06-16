import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { knowledgeApi } from '@/api'
import type { AdminKnowledgeListItem, KnowledgeEntry, UpdateEntryRequest } from '@/types'
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
import { Pencil, Trash2, Search } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export function KnowledgePage() {
  const { t } = useTranslation()
  const { toast } = useToast()
  const [entries, setEntries] = useState<AdminKnowledgeListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [currentEntry, setCurrentEntry] = useState<KnowledgeEntry | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    summary: '',
    category: '',
    tags: '',
    language: '',
    framework: '',
    difficulty_level: 1,
  })

  const limit = 20

  useEffect(() => {
    fetchEntries()
  }, [page])

  const fetchEntries = async () => {
    setLoading(true)
    try {
      const response = await knowledgeApi.list({ page, limit, search: search || undefined })
      setEntries(response.data)
      setTotal(response.total)
    } catch (error) {
      toast({
        title: t('common.error'),
        description: 'Failed to fetch knowledge entries',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setPage(1)
    fetchEntries()
  }

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

  const handleDelete = async () => {
    if (!deleteId) return
    
    try {
      await knowledgeApi.delete(deleteId)
      toast({
        title: t('common.success'),
        description: 'Entry deleted successfully',
      })
      setDeleteDialogOpen(false)
      setDeleteId(null)
      fetchEntries()
    } catch (error) {
      toast({
        title: t('common.error'),
        description: 'Failed to delete entry',
        variant: 'destructive',
      })
    }
  }

  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) return
    
    try {
      await knowledgeApi.batchDelete(selectedIds)
      toast({
        title: t('common.success'),
        description: `${selectedIds.length} entries deleted`,
      })
      setSelectedIds([])
      fetchEntries()
    } catch (error) {
      toast({
        title: t('common.error'),
        description: 'Failed to delete entries',
        variant: 'destructive',
      })
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === entries.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(entries.map(e => e.id))
    }
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t('knowledge.title')}</h1>
      </div>

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
            {selectedIds.length > 0 && (
              <Button variant="destructive" onClick={handleBatchDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                {t('knowledge.batchDelete')} ({selectedIds.length})
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t('common.noData')}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedIds.length === entries.length}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>{t('knowledge.titleField')}</TableHead>
                  <TableHead>{t('knowledge.category')}</TableHead>
                  <TableHead>{t('knowledge.tags')}</TableHead>
                  <TableHead>{t('knowledge.qualityScore')}</TableHead>
                  <TableHead>{t('common.createdAt')}</TableHead>
                  <TableHead className="w-24">{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(entry.id)}
                        onCheckedChange={() => toggleSelect(entry.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{entry.title}</TableCell>
                    <TableCell>{entry.category || '-'}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {entry.tags?.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      {entry.qualityScore !== undefined
                        ? entry.qualityScore.toFixed(1)
                        : '-'}
                    </TableCell>
                    <TableCell>{formatDate(entry.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(entry.id)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setDeleteId(entry.id)
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

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('knowledge.edit')}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">{t('knowledge.titleField')}</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">{t('knowledge.content')}</Label>
              <textarea
                id="content"
                className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">{t('knowledge.category')}</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="language">{t('knowledge.language')}</Label>
                <Input
                  id="language"
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">{t('knowledge.tags')}</Label>
              <Input
                id="tags"
                placeholder="tag1, tag2, tag3"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
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
