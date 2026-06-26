import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { librariesApi } from '@/api'
import type { PlazaLibrary } from '@/api/libraries'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { Globe, Library as LibraryIcon } from 'lucide-react'

interface PlazaPageProps {
  elevated?: boolean
}

export function PlazaPage({ elevated = false }: PlazaPageProps) {
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

  const basePath = elevated ? '/elevated/plaza' : '/plaza'

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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40 w-full" />)}
        </div>
      ) : libraries.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <LibraryIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg text-muted-foreground">{t('plaza.empty')}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {libraries.map((lib) => (
            <Card
              key={lib.id}
              className="flex flex-col cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(`${basePath}/${lib.id}`)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {lib.icon && (lib.icon.startsWith('data:') || lib.icon.startsWith('http') || lib.icon.startsWith('/'))
                      ? <img src={lib.icon} alt="" className="h-6 w-6 rounded object-cover" />
                      : null}
                    <h3 className="font-semibold text-lg">{lib.name}</h3>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {t('plaza.entriesInLibrary', { count: lib.entryCount })}
                  </Badge>
                </div>
                {lib.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{lib.description}</p>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">{lib.creatorNickname}</span>
                  {lib.tags && lib.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {lib.tags.slice(0, 3).map((tag) => <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>)}
                    </div>
                  )}
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
