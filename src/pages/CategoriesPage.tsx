import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { categoriesApi } from '@/api'
import type { AdminCategoryListItem, AdminCategoryStats } from '@/types'
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
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { Plus, Pencil, Trash2, BarChart3, Search } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export function CategoriesPage() {
  const { t } = useTranslation()
  const { toast } = useToast()
  const [categories, setCategories] = useState<AdminCategoryListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [statsDialogOpen, setStatsDialogOpen] = useState(false)
  const [currentCategory, setCurrentCategory] = useState<AdminCategoryListItem | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [statsData, setStatsData] = useState<AdminCategoryStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(false)

  const [formData, setFormData] = useState({ name: '' })

  const limit = 20

  useEffect(() => {
    fetchCategories()
  }, [page])

  useEffect(() => {
    setPage(1)
    fetchCategories()
  }, [search])

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const response = await categoriesApi.adminList({ page, limit, search: search || undefined })
      setCategories(response.data)
      setTotal(response.total)
    } catch (error) {
      toast({
        title: t('common.error'),
        description: 'Failed to fetch categories',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!formData.name.trim()) return
    try {
      await categoriesApi.adminCreate({ name: formData.name.trim() })
      toast({ title: t('common.success'), description: 'Category created successfully' })
      setCreateDialogOpen(false)
      setFormData({ name: '' })
      fetchCategories()
    } catch (error: any) {
      const msg = error?.error?.code === 'CONFLICT' ? 'Category name already exists' : 'Failed to create category'
      toast({ title: t('common.error'), description: msg, variant: 'destructive' })
    }
  }

  const handleEdit = (category: AdminCategoryListItem) => {
    setCurrentCategory(category)
    setFormData({ name: category.name })
    setEditDialogOpen(true)
  }

  const handleSave = async () => {
    if (!currentCategory || !formData.name.trim()) return
    try {
      await categoriesApi.adminUpdate(currentCategory.id, { name: formData.name.trim() })
      toast({ title: t('common.success'), description: 'Category updated successfully' })
      setEditDialogOpen(false)
      fetchCategories()
    } catch (error: any) {
      const msg = error?.error?.code === 'CONFLICT' ? 'Category name already exists' : 'Failed to update category'
      toast({ title: t('common.error'), description: msg, variant: 'destructive' })
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await categoriesApi.adminDelete(deleteId)
      toast({ title: t('common.success'), description: 'Category deleted successfully' })
      setDeleteDialogOpen(false)
      setDeleteId(null)
      fetchCategories()
    } catch (error: any) {
      const msg = error?.error?.code === 'BAD_REQUEST' ? 'Cannot delete category with existing entries' : 'Failed to delete category'
      toast({ title: t('common.error'), description: msg, variant: 'destructive' })
    }
  }

  const handleViewStats = async (category: AdminCategoryListItem) => {
    setCurrentCategory(category)
    setStatsDialogOpen(true)
    setStatsLoading(true)
    setStatsData(null)
    try {
      const data = await categoriesApi.adminGetStats(category.id)
      setStatsData(data)
    } catch (error) {
      toast({ title: t('common.error'), description: 'Failed to fetch stats', variant: 'destructive' })
    } finally {
      setStatsLoading(false)
    }
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t('categories.title')}</h1>
        <Button onClick={() => { setFormData({ name: '' }); setCreateDialogOpen(true) }}>
          <Plus className="h-4 w-4 mr-2" />
          {t('categories.create')}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('common.search') + '...'}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">{t('common.noData')}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('categories.name')}</TableHead>
                  <TableHead>{t('categories.entryCount')}</TableHead>
                  <TableHead>{t('common.createdAt')}</TableHead>
                  <TableHead>{t('common.updatedAt')}</TableHead>
                  <TableHead className="w-32">{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((cat) => (
                  <TableRow key={cat.id}>
                    <TableCell className="font-medium">{cat.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{cat.entry_count}</Badge>
                    </TableCell>
                    <TableCell>{formatDate(cat.created_at)}</TableCell>
                    <TableCell>{formatDate(cat.updated_at)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleViewStats(cat)}>
                          <BarChart3 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(cat)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => { setDeleteId(cat.id); setDeleteDialogOpen(true) }}
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
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
                  {t('common.back')}
                </Button>
                <span className="text-sm">{page} / {totalPages}</span>
                <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
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
            <DialogTitle>{t('categories.create')}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cat-name">{t('categories.name')}</Label>
              <Input
                id="cat-name"
                value={formData.name}
                onChange={(e) => setFormData({ name: e.target.value })}
                placeholder={t('categories.namePlaceholder')}
                maxLength={100}
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

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('categories.edit')}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-cat-name">{t('categories.name')}</Label>
              <Input
                id="edit-cat-name"
                value={formData.name}
                onChange={(e) => setFormData({ name: e.target.value })}
                maxLength={100}
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

      {/* Stats Dialog */}
      <Dialog open={statsDialogOpen} onOpenChange={setStatsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('categories.stats')} - {currentCategory?.name}</DialogTitle>
          </DialogHeader>
          {statsLoading ? (
            <div className="space-y-3 py-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : statsData ? (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">{t('categories.totalEntries')}</p>
                  <p className="text-2xl font-bold">{statsData.total_entries}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">{t('categories.avgQualityScore')}</p>
                  <p className="text-2xl font-bold">{statsData.avg_quality_score?.toFixed(1) ?? '-'}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">{t('categories.recentEntries')}</p>
                  <p className="text-2xl font-bold">{statsData.recent_entries}</p>
                </div>
              </div>

              {Object.keys(statsData.by_language || {}).length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">{t('categories.byLanguage')}</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(statsData.by_language).map(([lang, count]) => (
                      <Badge key={lang} variant="outline">{lang}: {count}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {Object.keys(statsData.by_difficulty || {}).length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">{t('categories.byDifficulty')}</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(statsData.by_difficulty).map(([level, count]) => (
                      <Badge key={level} variant="outline">{t('categories.level')} {level}: {count}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {Object.keys(statsData.by_framework || {}).length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">{t('categories.byFramework')}</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(statsData.by_framework).map(([fw, count]) => (
                      <Badge key={fw} variant="outline">{fw}: {count}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">{t('common.noData')}</div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('categories.confirmDelete')}</AlertDialogTitle>
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
