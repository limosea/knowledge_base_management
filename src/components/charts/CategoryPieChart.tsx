import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

interface CategoryPieChartProps {
  data: Array<{ framework: string; count: number }>
}

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(var(--chart-6))',
]

const MAX_SLICES = 5

export function CategoryPieChart({ data }: CategoryPieChartProps) {
  const { t } = useTranslation()

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return []
    const sorted = [...data].sort((a, b) => b.count - a.count)
    const top = sorted.slice(0, MAX_SLICES)
    const rest = sorted.slice(MAX_SLICES)
    const othersCount = rest.reduce((sum, item) => sum + item.count, 0)
    const result = top.map(d => ({ name: d.framework, value: d.count }))
    if (rest.length > 0) {
      result.push({ name: t('charts.others', { count: rest.length }), value: othersCount })
    }
    return result
  }, [data, t])

  if (!chartData || chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('charts.frameworkDistribution')}</CardTitle>
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
        <CardTitle>{t('charts.frameworkDistribution')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={110}
                paddingAngle={2}
                fill="hsl(var(--chart-1))"
                dataKey="value"
                nameKey="name"
              >
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
