import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams, useNavigate } from 'react-router-dom'
import { knowledgeApi } from '@/api'
import type { KnowledgeEntry } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, RotateCcw } from 'lucide-react'

export function KnowledgeDetailPage() {
  const { t } = useTranslation()
  const { toast } = useToast()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
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
          <Button variant="ghost" size="icon" onClick={() => navigate('/knowledge')}>
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

  // TODO: 继续添加成功状态的渲染逻辑
  return <div>Success</div>
}