import { useTranslation } from 'react-i18next'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface ApiKeyStatusChartProps {
  data: Array<{
    apiKeyId: string
    apiKeyName: string
    totalRequests: number
    lastActiveAt: string
  }> | {
    total: number
    active: number
    expired: number
  }
  loading?: boolean
}

function isApiKeyUsageArray(
  data: ApiKeyStatusChartProps['data']
): data is Array<{
  apiKeyId: string
  apiKeyName: string
  totalRequests: number
  lastActiveAt: string
}> {
  return Array.isArray(data)
}

export function ApiKeyStatusChart({ data, loading }: ApiKeyStatusChartProps) {
  const { t } = useTranslation()

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[250px] w-full" />
        </CardContent>
      </Card>
    )
  }

  if (isApiKeyUsageArray(data)) {
    const chartData = data.map(item => ({
      name: item.apiKeyName,
      value: item.totalRequests,
      color: 'hsl(var(--primary))',
    })).filter(item => item.value > 0)

    if (chartData.length === 0) {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('analytics.apiKeyUsage')}</CardTitle>
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
          <CardTitle className="text-lg">{t('analytics.apiKeyUsage')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value) => [value, '']}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-center">
            <span className="text-2xl font-bold">{data.length}</span>
            <span className="text-muted-foreground ml-1">{t('dashboard.apiKeys')}</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  const inactive = data.total - data.active - data.expired

  const chartData = [
    { name: t('apiKeys.active'), value: data.active, color: 'hsl(var(--chart-2))' },
    { name: t('apiKeys.expired'), value: data.expired, color: 'hsl(var(--chart-5))' },
    { name: t('apiKeys.inactive'), value: inactive, color: 'hsl(var(--chart-3))' },
  ].filter(item => item.value > 0)

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('analytics.apiKeyStatus')}</CardTitle>
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
        <CardTitle className="text-lg">{t('analytics.apiKeyStatus')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value) => [value, '']}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 text-center">
          <span className="text-2xl font-bold">{data.total}</span>
          <span className="text-muted-foreground ml-1">{t('dashboard.apiKeys')}</span>
        </div>
      </CardContent>
    </Card>
  )
}
