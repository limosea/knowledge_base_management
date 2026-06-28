import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface SearchAnalyticsChartProps {
  data: Array<{ query: string; count: number }>
}

const MAX_ITEMS = 10

export function SearchAnalyticsChart({ data }: SearchAnalyticsChartProps) {
  const { t } = useTranslation()

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('charts.searchQueries')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            {t('charts.noData')}
          </div>
        </CardContent>
      </Card>
    )
  }

  const top = data.slice(0, MAX_ITEMS)
  const rest = data.slice(MAX_ITEMS)
  const othersCount = rest.reduce((sum, item) => sum + item.count, 0)

  const chartData = [...top]
  if (rest.length > 0) {
    chartData.push({ query: t('charts.others', { count: rest.length }), count: othersCount })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('charts.searchQueries')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="query" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" height={60} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(var(--chart-1))" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
