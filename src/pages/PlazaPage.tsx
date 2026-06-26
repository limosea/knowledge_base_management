import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { librariesApi } from '@/api'
import type { Library } from '@/api/libraries'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { Globe, Library as LibraryIcon, Shield, ShieldOff, Search } from 'lucide-react'
import { PermissionGuard } from '@/components/auth/PermissionGuard'

interface PlazaPageProps {
  elevated?: boolean
}

export function PlazaPage({ elevated = false }: PlazaPageProps) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [libraries, setLibraries] = useState<Library[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchPlaza()
  }, [])

  const fetchPlaza = async () => {
    setLoading(true)
    try {
      if (elevated) {
        const res = await librariesApi.adminList({ limit: 100 })
        setLibraries(res.data)
      } else {
        const data = await librariesApi.getPlaza()
        setLibraries(data as unknown as Library[])
      }
    } catch {
      toast({ title: t('common.error'), description: 'Failed to load plaza', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleShield = async (id: string) => {
    try {
      await librariesApi.shield(id)
      toast({ title: t('common.success'), description: t('libraries.shielded') })
      fetchPlaza()
    } catch {
      toast({ title: t('common.error'), description: t('libraries.shieldError'), variant: 'destructive' })
    }
  }

  const handleUnshield = async (id: string) => {
    try {
      await librariesApi.unshield(id)
      toast({ title: t('common.success'), description: t('libraries.unshielded') })
      fetchPlaza()
    } catch {
      toast({ title: t('common.error'), description: t('libraries.unshieldError'), variant: 'destructive' })
    }
  }

  const basePath = elevated ? '/elevated/plaza' : '/plaza'

  // Client-side fuzzy filter for libraries
  const filteredLibraries = search.trim()
    ? libraries.filter(lib => {
        const q = search.toLowerCase()
        return (
          lib.name.toLowerCase().includes(q) ||
          (lib.description || '').toLowerCase().includes(q) ||
          (lib.tags || []).some(t => t.toLowerCase().includes(q)) ||
          (lib.creatorNickname || '').toLowerCase().includes(q)
        )
      })
    : libraries

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Globe className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">{t('plaza.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('plaza.subtitle')}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Input
          placeholder={t('plaza.searchPlaceholder', '搜索知识库名称、描述、标签...')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Button variant="outline" size="icon">
          <Search className="h-4 w-4" />
        </Button>
        {search && (
          <span className="text-sm text-muted-foreground">
            {filteredLibraries.length} / {libraries.length} 结果
          </span>
        )}
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40 w-full" />)}
        </div>
      ) : filteredLibraries.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <LibraryIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg text-muted-foreground">{t('plaza.empty')}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredLibraries.map((lib) => (
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
                    {t('plaza.entriesInLibrary', { count: lib.entryCount ?? 0 })}
                  </Badge>
                </div>
                {lib.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{lib.description}</p>
                )}
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-xs text-muted-foreground">{lib.creatorNickname}</span>
                  {elevated && lib.shielded && (
                    <Badge variant="destructive" className="text-xs">{t('libraries.shielded')}</Badge>
                  )}
                  {lib.tags && lib.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {lib.tags.slice(0, 3).map((tag) => <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>)}
                    </div>
                  )}
                </div>
                {elevated && (
                  <div className="flex items-center gap-2 mt-2" onClick={(e) => e.stopPropagation()}>
                    {lib.shielded ? (
                      <PermissionGuard permissions={['content:unshield']}>
                        <Button variant="outline" size="sm" onClick={() => handleUnshield(lib.id)}>
                          <ShieldOff className="h-4 w-4 mr-2" />
                          {t('libraries.unshield')}
                        </Button>
                      </PermissionGuard>
                    ) : (
                      <PermissionGuard permissions={['content:shield']}>
                        <Button variant="outline" size="sm" onClick={() => handleShield(lib.id)}>
                          <Shield className="h-4 w-4 mr-2" />
                          {t('libraries.shield')}
                        </Button>
                      </PermissionGuard>
                    )}
                  </div>
                )}
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
