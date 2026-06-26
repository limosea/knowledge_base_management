import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams, useNavigate } from 'react-router-dom'
import { knowledgeApi } from '@/api'
import type { KnowledgeEntry } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, RotateCcw } from 'lucide-react'

interface KnowledgeDetailPageProps {
  elevated?: boolean
}

export function KnowledgeDetailPage({ elevated = false }: KnowledgeDetailPageProps) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const backPath = elevated ? '/elevated/knowledge' : '/knowledge'
  const [entry, setEntry] = useState<KnowledgeEntry | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEntry = async () => {
    if (!id) return
    
    setLoading(true)
    setError(null)
    try {
      const data = await knowledgeApi.get(id)
      setEntry(data)
    } catch (err) {
      setError(t('knowledge.detailPage.loadError'))
      toast({
        title: t('common.error'),
        description: t('knowledge.detailPage.loadError'),
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEntry()
  }, [id])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-24" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !entry) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate(backPath)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">{t('knowledge.detailPage.notFound')}</h1>
        </div>
        <Card>
          <CardContent className="py-8">
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">{error || t('knowledge.detailPage.notFound')}</p>
              <Button onClick={fetchEntry}>
                <RotateCcw className="h-4 w-4 mr-2" />
                {t('knowledge.detailPage.retry')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getDifficultyStars = (level: number | undefined) => {
    if (!level) return '-'
    return '★'.repeat(level) + '☆'.repeat(5 - level)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate(backPath)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">{entry.title}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('knowledge.detailPage.metadata')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">{t('knowledge.category')}</p>
              <p className="font-medium">
                {entry.category ? (
                  <Badge variant="outline">{entry.category}</Badge>
                ) : '-'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('knowledge.language')}</p>
              <p className="font-medium">{entry.language || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('knowledge.difficultyLevel')}</p>
              <p className="font-medium">{getDifficultyStars(entry.difficultyLevel)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('knowledge.qualityScore')}</p>
              <p className="font-medium">
                {entry.qualityScore !== undefined ? entry.qualityScore.toFixed(1) : '-'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('knowledge.detailPage.version')}</p>
              <p className="font-medium">v{entry.entryVersion}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('knowledge.detailPage.createdBy')}</p>
              <p className="font-medium">{entry.creatorNickname || entry.createdBy}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('common.createdAt')}</p>
              <p className="font-medium">{formatDate(entry.createdAt)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('common.updatedAt')}</p>
              <p className="font-medium">{formatDate(entry.updatedAt)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {entry.tags && entry.tags.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-2">
              {entry.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {entry.summary && (
        <Card>
          <CardHeader>
            <CardTitle>{t('knowledge.detailPage.summary')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{entry.summary}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t('knowledge.detailPage.content')}</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="whitespace-pre-wrap font-sans text-sm">{entry.content}</pre>
        </CardContent>
      </Card>

      {entry.structuredData && Object.keys(entry.structuredData).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('knowledge.detailPage.structuredData')}</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
              {JSON.stringify(entry.structuredData, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
