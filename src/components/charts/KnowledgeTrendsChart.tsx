import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { KnowledgeTrends } from '@/types'

interface KnowledgeTrendsChartProps {
  data: KnowledgeTrends | null
}

export function KnowledgeTrendsChart({ data }: KnowledgeTrendsChartProps) {
  const { t } = useTranslation()

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('charts.knowledgeTrends')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            {t('charts.noData')}
          </div>
        </CardContent>
      </Card>
    )
  }

  // 合并创建、更新、删除趋势数据
  const chartData = data.created.map((item, index) => ({
    date: item.date,
    created: item.count,
    updated: data.updated[index]?.count ?? 0,
    deleted: data.deleted[index]?.count ?? 0,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('charts.knowledgeTrends')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
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
      </CardContent>
    </Card>
  )
}
