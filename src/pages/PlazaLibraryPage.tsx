import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { knowledgeApi, librariesApi } from '@/api'
import type { Library } from '@/api/libraries'
import type { AdminKnowledgeListItem, AdminKnowledgeSearchItem } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, Search, Shield, ShieldOff } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { PermissionGuard } from '@/components/auth/PermissionGuard'

interface PlazaLibraryPageProps {
  elevated?: boolean
}

export function PlazaLibraryPage({ elevated = false }: PlazaLibraryPageProps) {
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
  const [searchMode, setSearchMode] = useState<'field' | 'semantic' | 'hybrid'>('hybrid')
  const [searchResults, setSearchResults] = useState<AdminKnowledgeSearchItem[] | null>(null)
  const [queryTimeMs, setQueryTimeMs] = useState<number | undefined>(undefined)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const limit = 20
  const basePath = elevated ? '/elevated/plaza' : '/plaza'
  const entryPath = (id: string) => elevated ? `/elevated/entry/${id}` : `/entry/${id}`
  const navigateToEntry = (id: string) => navigate(entryPath(id), { state: { from: `${basePath}/${libraryId}` } })

  useEffect(() => {
    if (libraryId) fetchLibrary()
  }, [libraryId])

  useEffect(() => {
    fetchEntries()
  }, [page, libraryId])

  const fetchLibrary = async () => {
    try {
      const lib = elevated ? await librariesApi.adminGet(libraryId!) : await librariesApi.get(libraryId!)
      setLibrary(lib)
    } catch {
      toast({ title: t('common.error'), description: 'Failed to load library', variant: 'destructive' })
    }
  }

  const fetchEntries = async () => {
    if (!libraryId) return
    setLoading(true)
    try {
      if (search.trim() && searchMode !== 'field') {
        // Use hybrid search API
        const res = await knowledgeApi.search({ query: search.trim(), mode: searchMode, libraryId, page, limit })
        setSearchResults(res.data)
        setEntries(res.data as unknown as AdminKnowledgeListItem[])
        setTotal(res.total)
        setQueryTimeMs(res.queryTimeMs)
      } else {
        setSearchResults(null)
        setQueryTimeMs(undefined)
        const res = await knowledgeApi.list({ libraryId, page, limit, search: search || undefined })
        setEntries(res.data)
        setTotal(res.total)
      }
    } catch {
      toast({ title: t('common.error'), description: 'Failed to fetch entries', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => { setPage(1); fetchEntries() }

  const handleLibraryShield = async () => {
    if (!libraryId) return
    try {
      await librariesApi.shield(libraryId)
      toast({ title: t('common.success'), description: t('libraries.shielded') })
      fetchLibrary()
    } catch {
      toast({ title: t('common.error'), description: t('libraries.shieldError'), variant: 'destructive' })
    }
  }

  const handleLibraryUnshield = async () => {
    if (!libraryId) return
    try {
      await librariesApi.unshield(libraryId)
      toast({ title: t('common.success'), description: t('libraries.unshielded') })
      fetchLibrary()
    } catch {
      toast({ title: t('common.error'), description: t('libraries.unshieldError'), variant: 'destructive' })
    }
  }

  const handleEntryShield = async (id: string) => {
    try {
      await knowledgeApi.shield(id)
      toast({ title: t('common.success'), description: t('knowledge.shieldSuccess') })
      fetchEntries()
    } catch {
      toast({ title: t('common.error'), description: t('knowledge.shieldError'), variant: 'destructive' })
    }
  }

  const handleEntryUnshield = async (id: string) => {
    try {
      await knowledgeApi.unshield(id)
      toast({ title: t('common.success'), description: t('knowledge.unshieldSuccess') })
      fetchEntries()
    } catch {
      toast({ title: t('common.error'), description: t('knowledge.unshieldError'), variant: 'destructive' })
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === entries.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(entries.map(e => e.id))
    }
  }

  const handleBatchShield = async () => {
    if (selectedIds.length === 0) return
    try {
      const result = await knowledgeApi.batchShield(selectedIds)
      toast({ title: t('common.success'), description: t('knowledge.batchShieldSuccess', { count: result.shielded }) })
      setSelectedIds([])
      fetchEntries()
    } catch {
      toast({ title: t('common.error'), description: t('knowledge.shieldError'), variant: 'destructive' })
    }
  }

  const handleBatchUnshield = async () => {
    if (selectedIds.length === 0) return
    try {
      const result = await knowledgeApi.batchUnshield(selectedIds)
      toast({ title: t('common.success'), description: t('knowledge.batchUnshieldSuccess', { count: result.unshielded }) })
      setSelectedIds([])
      fetchEntries()
    } catch {
      toast({ title: t('common.error'), description: t('knowledge.unshieldError'), variant: 'destructive' })
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
          <Link to={basePath} className="hover:text-foreground">{t('plaza.title')}</Link>
          <span className="mx-2">/</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {library?.icon ? (
            library.icon.startsWith('data:') || library.icon.startsWith('http') || library.icon.startsWith('/')
              ? <img src={library.icon} alt="" className="h-7 w-7 rounded object-cover" />
              : null
          ) : null}
          <h1 className="text-2xl font-bold">{library?.name || '...'}</h1>
          <Badge variant="secondary">{total}</Badge>
          {elevated && library?.shielded && (
            <Badge variant="destructive">{t('libraries.shielded')}</Badge>
          )}
          {elevated && library?.shielded && (
            <PermissionGuard permissions={['content:unshield']}>
              <Button variant="outline" size="sm" onClick={handleLibraryUnshield}>
                <ShieldOff className="h-4 w-4 mr-2" />
                {t('libraries.unshield')}
              </Button>
            </PermissionGuard>
          )}
          {elevated && library && !library.shielded && (
            <PermissionGuard permissions={['content:shield']}>
              <Button variant="outline" size="sm" onClick={handleLibraryShield}>
                <Shield className="h-4 w-4 mr-2" />
                {t('libraries.shield')}
              </Button>
            </PermissionGuard>
          )}
        </div>
      </div>

      {library && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Badge variant={library.visibility === 'public' ? 'default' : 'secondary'}>
            {library.visibility === 'public' ? t('common.public') : t('common.private')}
          </Badge>
          {library.description && <span className="truncate max-w-md">{library.description}</span>}
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Input
                placeholder={t('common.search')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-64"
              />
              <select
                className="flex h-9 rounded-md border border-input bg-background px-2 text-sm"
                value={searchMode}
                onChange={(e) => setSearchMode(e.target.value as 'field' | 'semantic' | 'hybrid')}
              >
                <option value="hybrid">🔍 混合搜索</option>
                <option value="field">📝 字段模糊</option>
                <option value="semantic">🧠 语义匹配</option>
              </select>
              <Button variant="outline" size="icon" onClick={handleSearch}>
                <Search className="h-4 w-4" />
              </Button>
              {queryTimeMs !== undefined && (
                <span className="text-xs text-muted-foreground">{queryTimeMs}ms</span>
              )}
            </div>
            {elevated && selectedIds.length > 0 && (
              <div className="flex items-center gap-2">
                <PermissionGuard permissions={['content:shield']}>
                  <Button variant="outline" size="sm" onClick={handleBatchShield}>
                    <Shield className="h-4 w-4 mr-2" />
                    {t('knowledge.batchShield')} ({selectedIds.length})
                  </Button>
                </PermissionGuard>
                <PermissionGuard permissions={['content:unshield']}>
                  <Button variant="outline" size="sm" onClick={handleBatchUnshield}>
                    <ShieldOff className="h-4 w-4 mr-2" />
                    {t('knowledge.batchUnshield')} ({selectedIds.length})
                  </Button>
                </PermissionGuard>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">{t('plaza.noEntries')}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  {elevated && (
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedIds.length === entries.length && entries.length > 0}
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                  )}
                  <TableHead>{t('knowledge.titleField')}</TableHead>
                  {searchResults && <TableHead className="w-20">相关度</TableHead>}
                  <TableHead>{t('knowledge.category')}</TableHead>
                  <TableHead>{t('knowledge.tags')}</TableHead>
                  <TableHead>{t('knowledge.qualityScore')}</TableHead>
                  <TableHead>{t('knowledge.shielded')}</TableHead>
                  <TableHead>{t('common.createdAt')}</TableHead>
                  {elevated && <TableHead className="w-24">{t('common.actions')}</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => {
                  const searchItem = searchResults?.find(s => s.id === entry.id)
                  return (
                  <TableRow key={entry.id}>
                    {elevated && (
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.includes(entry.id)}
                          onCheckedChange={() => toggleSelect(entry.id)}
                        />
                      </TableCell>
                    )}
                    <TableCell className="font-medium">
                      <button onClick={() => navigateToEntry(entry.id)} className="text-primary hover:underline text-left">
                        {entry.title}
                      </button>
                    </TableCell>
                    {searchItem && (
                      <TableCell>
                        <div className="flex flex-col text-xs">
                          <span className="font-medium text-primary">{(searchItem.searchScore * 100).toFixed(0)}%</span>
                          <span className="text-muted-foreground" title={`语义: ${(searchItem.semanticScore * 100).toFixed(0)}% 字段: ${(searchItem.fieldScore * 100).toFixed(0)}%`}>
                            S:{(searchItem.semanticScore * 100).toFixed(0)} F:{(searchItem.fieldScore * 100).toFixed(0)}
                          </span>
                        </div>
                      </TableCell>
                    )}
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
                    {elevated && (
                      <TableCell>
                        {entry.shielded ? (
                          <PermissionGuard permissions={['content:unshield']}>
                            <Button variant="ghost" size="icon" onClick={() => handleEntryUnshield(entry.id)} title={t('knowledge.unshield')}>
                              <ShieldOff className="h-4 w-4" />
                            </Button>
                          </PermissionGuard>
                        ) : (
                          <PermissionGuard permissions={['content:shield']}>
                            <Button variant="ghost" size="icon" onClick={() => handleEntryShield(entry.id)} title={t('knowledge.shield')}>
                              <Shield className="h-4 w-4" />
                            </Button>
                          </PermissionGuard>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                  )
                })}
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
    </div>
  )
}
