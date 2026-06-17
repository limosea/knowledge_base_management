import { useTranslation } from 'react-i18next'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { SearchAnalytics } from '@/types'

interface SearchAnalyticsChartProps {
  data: SearchAnalytics | null
  loading?: boolean
}

export function SearchAnalyticsChart({ data, loading }: SearchAnalyticsChartProps) {
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

  const chartData = data?.searchesOverTime?.map(item => ({
    name: item.date,
    count: item.count,
  })) ?? []

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('analytics.searchTrend')}</CardTitle>
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
        <CardTitle className="text-lg">{t('analytics.searchTrend')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorSearches" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="name"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickFormatter={(value) => value.toLocaleString()}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                formatter={(value) => [(value as number).toLocaleString(), t('analytics.searches')]}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="hsl(var(--primary))"
                fillOpacity={1}
                fill="url(#colorSearches)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        {data && (
          <div className="mt-4 text-center">
            <span className="text-3xl font-bold" style={{ color: 'hsl(var(--primary))' }}>
              {data.totalSearches.toLocaleString()}
            </span>
            <span className="text-muted-foreground ml-1">{t('analytics.totalSearches')}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}