import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface CategoryDistributionChartProps {
  data: Array<{ category: string; count: number }>
}

const MAX_ITEMS = 15

export function CategoryDistributionChart({ data }: CategoryDistributionChartProps) {
  const { t } = useTranslation()

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('charts.categoryDistribution')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] flex items-center justify-center text-muted-foreground">
            {t('charts.noData')}
          </div>
        </CardContent>
      </Card>
    )
  }

  const top = data.slice(0, MAX_ITEMS)
  const rest = data.slice(MAX_ITEMS)
  const othersCount = rest.reduce((sum, item) => sum + item.count, 0)

  const chartData = top.map(item => ({
    name: item.category || 'uncategorized',
    count: item.count,
  }))
  if (rest.length > 0) {
    chartData.push({
      name: t('charts.others', { count: rest.length }),
      count: othersCount,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('charts.categoryDistribution')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" allowDecimals={false} />
              <YAxis
                type="category"
                dataKey="name"
                width={130}
                tickFormatter={(v: string) => v.length > 16 ? v.slice(0, 16) + '…' : v}
              />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(var(--chart-2))" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
