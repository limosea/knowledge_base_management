import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { librariesApi } from '@/api'
import type { PlazaLibrary } from '@/api/libraries'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { Globe, BookOpen, Library as LibraryIcon } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export function PlazaPage() {
  const { t } = useTranslation()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [libraries, setLibraries] = useState<PlazaLibrary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPlaza()
  }, [])

  const fetchPlaza = async () => {
    setLoading(true)
    try {
      const data = await librariesApi.getPlaza()
      setLibraries(data)
    } catch {
      toast({ title: t('common.error'), description: 'Failed to load plaza', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Globe className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">{t('plaza.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('plaza.subtitle')}</p>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-48 w-full" />)}
        </div>
      ) : libraries.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <LibraryIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg text-muted-foreground">{t('plaza.empty')}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {libraries.map((lib) => (
            <Card key={lib.id} className="flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {lib.icon && <span className="text-xl">{lib.icon}</span>}
                    <h3 className="font-semibold text-lg">{lib.name}</h3>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {t('plaza.entriesInLibrary', { count: lib.entryCount })}
                  </Badge>
                </div>
                {lib.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{lib.description}</p>
                )}
                {lib.tags && lib.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {lib.tags.map((tag) => <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>)}
                  </div>
                )}
              </CardHeader>
              <CardContent className="pt-0 flex-1">
                {lib.entries.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">{t('plaza.noEntries')}</p>
                ) : (
                  <div className="space-y-1">
                    {lib.entries.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between px-3 py-2 rounded border cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => navigate(`/entry/${entry.id}`)}
                      >
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span className="text-sm font-medium truncate">{entry.title}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {entry.category && (
                            <Badge variant="outline" className="text-xs">{entry.category}</Badge>
                          )}
                          {entry.tags && entry.tags.length > 0 && (
                            <span className="text-xs text-muted-foreground hidden sm:inline">
                              {entry.tags.slice(0, 2).join(', ')}
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground">{formatDate(entry.createdAt)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
