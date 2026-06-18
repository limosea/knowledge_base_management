import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams, useNavigate } from 'react-router-dom'
import { knowledgeApi } from '@/api'
import type { KnowledgeEntry } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, RotateCcw } from 'lucide-react'
import { formatDate } from '@/lib/utils'

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

  // TODO: 继续添加页面渲染逻辑
  return <div>KnowledgeDetailPage</div>
}