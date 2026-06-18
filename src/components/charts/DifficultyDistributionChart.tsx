import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface DifficultyDistributionChartProps {
  data: Array<{ level: number; count: number }>
}

const LEVEL_LABELS: Record<number, string> = {
  1: '1 - Very Easy',
  2: '2 - Easy',
  3: '3 - Medium',
  4: '4 - Hard',
  5: '5 - Very Hard',
}

export function DifficultyDistributionChart({ data }: DifficultyDistributionChartProps) {
  const { t } = useTranslation()

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('charts.difficultyDistribution')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] flex items-center justify-center text-muted-foreground">
            {t('charts.noData')}
          </div>
        </CardContent>
      </Card>
    )
  }

  const chartData = data.map(item => ({
    name: LEVEL_LABELS[item.level] ?? `Level ${item.level}`,
    count: item.count,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('charts.difficultyDistribution')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(var(--chart-3))" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
