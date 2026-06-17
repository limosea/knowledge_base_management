import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import type { EmbeddingCoverage } from '@/types'

interface EmbeddingCoverageChartProps {
  data: EmbeddingCoverage | null
}

export function EmbeddingCoverageChart({ data }: EmbeddingCoverageChartProps) {
  const { t } = useTranslation()

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('charts.embeddingCoverage')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            {t('charts.noData')}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('charts.embeddingCoverage')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{t('charts.coverage')}</span>
            <span>{data.coveragePercent.toFixed(1)}%</span>
          </div>
          <Progress value={data.coveragePercent} className="h-2" />
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground">{t('charts.totalEntries')}</div>
            <div className="font-medium">{data.totalEntries}</div>
          </div>
          <div>
            <div className="text-muted-foreground">{t('charts.withEmbedding')}</div>
            <div className="font-medium">{data.withEmbedding}</div>
          </div>
          <div>
            <div className="text-muted-foreground">{t('charts.withoutEmbedding')}</div>
            <div className="font-medium">{data.withoutEmbedding}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}