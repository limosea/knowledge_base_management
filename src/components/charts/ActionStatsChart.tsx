import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface ActionStatsChartProps {
  data: Array<{ action: string; count: number }>
}

const MAX_ITEMS = 10

export function ActionStatsChart({ data }: ActionStatsChartProps) {
  const { t } = useTranslation()

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return []
    const sorted = [...data].sort((a, b) => b.count - a.count)
    const top = sorted.slice(0, MAX_ITEMS)
    const rest = sorted.slice(MAX_ITEMS)
    const othersCount = rest.reduce((sum, item) => sum + item.count, 0)
    const result = top.map(d => ({ action: d.action, count: d.count }))
    if (rest.length > 0) {
      result.push({ action: t('charts.others', { count: rest.length }), count: othersCount })
    }
    return result
  }, [data, t])

  if (!chartData || chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('charts.actionDistribution')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] flex items-center justify-center text-muted-foreground">
            {t('charts.noData')}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('charts.actionDistribution')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" allowDecimals={false} />
              <YAxis type="category" dataKey="action" width={180} tickFormatter={(v: string) => v.length > 25 ? v.slice(0, 22) + '...' : v} />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(var(--chart-1))" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
