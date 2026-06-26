import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { knowledgeApi, categoriesApi } from '@/api'
import type { AdminKnowledgeListItem, AdminCategoryListItem } from '@/types'
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { Trash2, Search, Shield, ShieldOff } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { PermissionGuard } from '@/components/auth/PermissionGuard'

interface KnowledgePageProps {
  elevated?: boolean
}

export function KnowledgePage({ elevated = false }: KnowledgePageProps) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [entries, setEntries] = useState<AdminKnowledgeListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [categories, setCategories] = useState<AdminCategoryListItem[]>([])
  const [categoryFilter, setCategoryFilter] = useState('')
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const limit = 20

  useEffect(() => {
    fetchEntries()
  }, [page, categoryFilter])

  useEffect(() => {
    categoriesApi.adminList({ limit: 100 }).then(res => setCategories(res.data)).catch(() => {})
  }, [])

  const fetchEntries = async () => {
    setLoading(true)
    try {
      const response = await knowledgeApi.list({
        page,
        limit,
        search: search || undefined,
        category: categoryFilter || undefined,
      })
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

  const handleCategoryFilter = (value: string) => {
    setCategoryFilter(value)
    setPage(1)
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

  const handleShield = async (id: string) => {
    try {
      await knowledgeApi.shield(id)
      toast({
        title: t('common.success'),
        description: 'Entry shielded successfully',
      })
      fetchEntries()
    } catch (error) {
      toast({
        title: t('common.error'),
        description: 'Failed to shield entry',
        variant: 'destructive',
      })
    }
  }

  const handleUnshield = async (id: string) => {
    try {
      await knowledgeApi.unshield(id)
      toast({
        title: t('common.success'),
        description: 'Entry unshielded successfully',
      })
      fetchEntries()
    } catch (error) {
      toast({
        title: t('common.error'),
        description: 'Failed to unshield entry',
        variant: 'destructive',
      })
    }
  }

  const handleBatchShield = async () => {
    if (selectedIds.length === 0) return
    try {
      const result = await knowledgeApi.batchShield(selectedIds)
      toast({
        title: t('common.success'),
        description: `${result.shielded} entries shielded`,
      })
      setSelectedIds([])
      fetchEntries()
    } catch (error) {
      toast({
        title: t('common.error'),
        description: 'Failed to shield entries',
        variant: 'destructive',
      })
    }
  }

  const handleBatchUnshield = async () => {
    if (selectedIds.length === 0) return
    try {
      const result = await knowledgeApi.batchUnshield(selectedIds)
      toast({
        title: t('common.success'),
        description: `${result.unshielded} entries unshielded`,
      })
      setSelectedIds([])
      fetchEntries()
    } catch (error) {
      toast({
        title: t('common.error'),
        description: 'Failed to unshield entries',
        variant: 'destructive',
      })
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
              <select
                className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={categoryFilter}
                onChange={(e) => handleCategoryFilter(e.target.value)}
              >
                <option value="">{t('knowledge.allCategories')}</option>
                {categories.map((cat) => (
                  <option key={cat.name} value={cat.name}>
                    {cat.name} ({cat.entry_count})
                  </option>
                ))}
              </select>
              <Button variant="outline" size="icon" onClick={handleSearch}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
            {selectedIds.length > 0 && (
              <div className="flex items-center gap-2">
                {elevated && (
                  <>
                    <PermissionGuard permissions={['content:shield']}>
                      <Button variant="outline" onClick={handleBatchShield}>
                        <Shield className="h-4 w-4 mr-2" />
                        {t('knowledge.batchShield')} ({selectedIds.length})
                      </Button>
                    </PermissionGuard>
                    <PermissionGuard permissions={['content:unshield']}>
                      <Button variant="outline" onClick={handleBatchUnshield}>
                        <ShieldOff className="h-4 w-4 mr-2" />
                        {t('knowledge.batchUnshield')} ({selectedIds.length})
                      </Button>
                    </PermissionGuard>
                  </>
                )}
                <Button variant="destructive" onClick={handleBatchDelete}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t('knowledge.batchDelete')} ({selectedIds.length})
                </Button>
              </div>
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
                  <TableHead>{t('knowledge.shielded')}</TableHead>
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
                    <TableCell className="font-medium">
                      <button
                        onClick={() => navigate(`/entry/${entry.id}`, { state: { from: '/knowledge' } })}
                        className="text-primary hover:underline text-left"
                      >
                        {entry.title}
                      </button>
                    </TableCell>
                    <TableCell>
                      {entry.category ? (
                        <Badge variant="outline">{entry.category}</Badge>
                      ) : '-'}
                    </TableCell>
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
                    <TableCell>
                      {entry.shielded ? (
                        <Badge variant="destructive">{t('knowledge.shielded')}</Badge>
                      ) : (
                        <Badge variant="outline">{t('knowledge.notShielded')}</Badge>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(entry.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {elevated && (
                          entry.shielded ? (
                            <PermissionGuard permissions={['content:unshield']}>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleUnshield(entry.id)}
                                title={t('knowledge.unshield')}
                              >
                                <ShieldOff className="h-4 w-4" />
                              </Button>
                            </PermissionGuard>
                          ) : (
                            <PermissionGuard permissions={['content:shield']}>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleShield(entry.id)}
                                title={t('knowledge.shield')}
                              >
                                <Shield className="h-4 w-4" />
                              </Button>
                            </PermissionGuard>
                          )
                        )}
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
