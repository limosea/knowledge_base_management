import { useTranslation } from 'react-i18next'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface QualityBarChartProps {
  data?: Array<{ bucket: string; count: number }>
  avgScore?: number
  loading?: boolean
}

export function QualityBarChart({ data, avgScore, loading }: QualityBarChartProps) {
  const { t } = useTranslation()

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[250px] w-full" />
        </CardContent>
      </Card>
    )
  }

  const chartData = data && data.length > 0 
    ? data.map(item => ({ name: item.bucket, value: item.count }))
    : [{ name: t('analytics.avgScore'), value: avgScore ?? 0 }]

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'hsl(var(--chart-2))'
    if (score >= 60) return 'hsl(var(--chart-3))'
    return 'hsl(var(--chart-5))'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t('analytics.qualityDistribution')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                type="number"
                domain={[0, 'auto']}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis
                type="category"
                dataKey="name"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value) => [(value as number).toLocaleString(), t('analytics.count')]}
              />
              <Bar
                dataKey="value"
                fill="hsl(var(--primary))"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {avgScore !== undefined && (
          <div className="mt-4 text-center">
            <span className="text-3xl font-bold" style={{ color: getScoreColor(avgScore) }}>
              {avgScore.toFixed(1)}
            </span>
            <span className="text-muted-foreground ml-1">/ 100</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
