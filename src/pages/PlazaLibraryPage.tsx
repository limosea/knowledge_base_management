import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { knowledgeApi, librariesApi } from '@/api'
import type { Library } from '@/api/libraries'
import type { AdminKnowledgeListItem } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, Search } from 'lucide-react'
import { formatDate } from '@/lib/utils'

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

  const limit = 20
  const basePath = elevated ? '/elevated/plaza' : '/plaza'
  const entryPath = (id: string) => elevated ? `/elevated/entry/${id}` : `/entry/${id}`
  const navigateToEntry = (id: string) => navigate(entryPath(id), { state: { from: basePath } })

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
        <div className="flex items-center gap-2">
          {library?.icon ? (
            library.icon.startsWith('data:') || library.icon.startsWith('http') || library.icon.startsWith('/')
              ? <img src={library.icon} alt="" className="h-7 w-7 rounded object-cover" />
              : null
          ) : null}
          <h1 className="text-2xl font-bold">{library?.name || '...'}</h1>
          <Badge variant="secondary">{total}</Badge>
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
                  <TableHead>{t('knowledge.titleField')}</TableHead>
                  <TableHead>{t('knowledge.category')}</TableHead>
                  <TableHead>{t('knowledge.tags')}</TableHead>
                  <TableHead>{t('knowledge.qualityScore')}</TableHead>
                  <TableHead>{t('knowledge.shielded')}</TableHead>
                  <TableHead>{t('common.createdAt')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">
                      <button onClick={() => navigateToEntry(entry.id)} className="text-primary hover:underline text-left">
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
    </div>
  )
}
