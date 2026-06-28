import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

interface LanguageDistributionChartProps {
  data: Array<{ language: string; count: number }>
}

const MAX_SLICES = 8

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(var(--chart-3) / 0.6)',
  'hsl(var(--chart-4) / 0.6)',
  'hsl(var(--chart-5) / 0.6)',
  'hsl(var(--chart-1) / 0.4)',
]

export function LanguageDistributionChart({ data }: LanguageDistributionChartProps) {
  const { t } = useTranslation()

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('charts.languageDistribution')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] flex items-center justify-center text-muted-foreground">
            {t('charts.noData')}
          </div>
        </CardContent>
      </Card>
    )
  }

  const top = data.slice(0, MAX_SLICES)
  const rest = data.slice(MAX_SLICES)
  const othersCount = rest.reduce((sum, item) => sum + item.count, 0)

  const chartData = [...top]
  if (rest.length > 0) {
    chartData.push({ language: t('charts.others', { count: rest.length }), count: othersCount })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('charts.languageDistribution')}</CardTitle>
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
                dataKey="count"
                nameKey="language"
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
