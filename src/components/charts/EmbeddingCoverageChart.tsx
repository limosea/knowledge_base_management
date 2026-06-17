import { useTranslation } from 'react-i18next'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { EmbeddingCoverage } from '@/types'

interface EmbeddingCoverageChartProps {
  data: EmbeddingCoverage | null
  loading?: boolean
}

const COLORS = [
  'hsl(var(--chart-2))',
  'hsl(var(--chart-5))',
]

export function EmbeddingCoverageChart({ data, loading }: EmbeddingCoverageChartProps) {
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

  const chartData = data ? [
    { name: t('analytics.withEmbedding'), value: data.withEmbedding },
    { name: t('analytics.withoutEmbedding'), value: data.withoutEmbedding },
  ] : []

  if (chartData.length === 0 || (data && data.totalEntries === 0)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('analytics.embeddingCoverage')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] flex items-center justify-center text-muted-foreground">
            {t('analytics.noData')}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t('analytics.embeddingCoverage')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="hsl(var(--primary))"
                dataKey="value"
              >
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value) => [`${value} ${t('analytics.entries')}`, '']}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        {data && (
          <div className="mt-4 text-center">
            <span className="text-3xl font-bold" style={{ color: 'hsl(var(--chart-2))' }}>
              {data.coveragePercent.toFixed(1)}%
            </span>
            <span className="text-muted-foreground ml-1">{t('analytics.coverage')}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}