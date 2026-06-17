import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock } from 'lucide-react'

interface LatencyStatsCardProps {
  data?: {
    avgMs: number
    p50Ms: number
    p95Ms: number
  }
}

export function LatencyStatsCard({ data }: LatencyStatsCardProps) {
  const { t } = useTranslation()

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('charts.latencyStats')}</CardTitle>
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
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          {t('charts.latencyStats')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{data.avgMs?.toFixed(1) ?? '0.0'} ms</div>
            <div className="text-sm text-muted-foreground">{t('charts.avgMs')}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{data.p50Ms?.toFixed(1) ?? '0.0'} ms</div>
            <div className="text-sm text-muted-foreground">{t('charts.p50Ms')}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{data.p95Ms?.toFixed(1) ?? '0.0'} ms</div>
            <div className="text-sm text-muted-foreground">{t('charts.p95Ms')}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
