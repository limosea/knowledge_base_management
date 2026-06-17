import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface LatencyStatsCardProps {
  data?: {
    avgMs: number
    p50Ms: number
    p95Ms: number
  }
  loading?: boolean
}

export function LatencyStatsCard({ data, loading }: LatencyStatsCardProps) {
  const { t } = useTranslation()

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('analytics.latencyStats')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] flex items-center justify-center text-muted-foreground">
            {t('analytics.noData')}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t('analytics.latencyStats')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">{t('analytics.avgLatency')}</span>
            <span className="font-bold">{data.avgMs.toFixed(1)}ms</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">{t('analytics.p50Latency')}</span>
            <span className="font-bold">{data.p50Ms.toFixed(1)}ms</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">{t('analytics.p95Latency')}</span>
            <span className="font-bold">{data.p95Ms.toFixed(1)}ms</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}