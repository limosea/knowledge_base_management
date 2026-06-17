import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useTranslation } from 'react-i18next'
import type { KnowledgeTrends } from '@/types'

interface KnowledgeTrendsChartProps {
  data: KnowledgeTrends | null
  loading?: boolean
}

export function KnowledgeTrendsChart({ data, loading }: KnowledgeTrendsChartProps) {
  const { t } = useTranslation()

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[200px] w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t('dashboard.knowledgeTrends')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] flex items-center justify-center text-muted-foreground">
          {data ? 'Chart will be implemented in Task 4' : 'No data available'}
        </div>
      </CardContent>
    </Card>
  )
}