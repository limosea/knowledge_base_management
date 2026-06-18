import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { statsApi } from '@/api'
import type { KnowledgeTrends } from '@/types'
import { cn } from '@/lib/utils'

type Period = 'day' | 'week' | 'month'

export function KnowledgeTrendsChart() {
  const { t } = useTranslation()
  const [data, setData] = useState<KnowledgeTrends | null>(null)
  const [period, setPeriod] = useState<Period>('week')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    statsApi
      .getKnowledgeTrends({ period })
      .then((d) => {
        if (!cancelled) setData(d)
      })
      .catch(() => {
        // keep previous data on error
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [period])

  const periodBtn = (p: Period) =>
    cn(
      'h-7 px-2.5 text-xs rounded-md border transition-colors',
      period === p
        ? 'bg-primary text-primary-foreground border-primary'
        : 'bg-background hover:bg-accent border-input'
    )

  const chartData =
    data?.created.map((item, index) => ({
      date: item.date,
      created: item.count,
      updated: data.updated[index]?.count ?? 0,
      deleted: data.deleted[index]?.count ?? 0,
    })) ?? []

  return (
    <Card className="relative">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>{t('charts.knowledgeTrends')}</CardTitle>
        <div className="flex gap-1">
          <button type="button" className={periodBtn('day')} onClick={() => setPeriod('day')}>
            {t('filter.day')}
          </button>
          <button type="button" className={periodBtn('week')} onClick={() => setPeriod('week')}>
            {t('filter.week')}
          </button>
          <button type="button" className={periodBtn('month')} onClick={() => setPeriod('month')}>
            {t('filter.month')}
          </button>
        </div>
      </CardHeader>
      <CardContent>
        {loading && !data && (
          <div className="h-[300px] flex items-center justify-center">
            <Skeleton className="h-full w-full" />
          </div>
        )}
        {(!loading || data) && chartData.length === 0 && (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            {t('charts.noData')}
          </div>
        )}
        {chartData.length > 0 && (
          <div className="h-[300px] relative">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10 rounded-md">
                <Skeleton className="h-2 w-24" />
              </div>
            )}
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="created" stroke="hsl(var(--chart-1))" name={t('charts.created')} />
                <Line type="monotone" dataKey="updated" stroke="hsl(var(--chart-2))" name={t('charts.updated')} />
                <Line type="monotone" dataKey="deleted" stroke="hsl(var(--chart-3))" name={t('charts.deleted')} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
