import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface ApiKeyUsageItem {
  apiKeyId: string
  apiKeyName: string
  totalRequests: number
  lastActiveAt: string
}

interface ApiKeyStatusChartProps {
  data: ApiKeyUsageItem[]
  onKeyClick?: (item: ApiKeyUsageItem) => void
}

export function ApiKeyStatusChart({ data, onKeyClick }: ApiKeyStatusChartProps) {
  const { t } = useTranslation()

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('charts.apiKeyUsage')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] flex items-center justify-center text-muted-foreground">
            {t('charts.noData')}
          </div>
        </CardContent>
      </Card>
    )
  }

  const chartData = data.slice(0, 10).map(item => ({
    id: item.apiKeyId,
    name: item.apiKeyName,
    requests: item.totalRequests,
    raw: item,
  }))

  const handleClick = (payload: { id?: string }) => {
    if (!onKeyClick || !payload?.id) return
    const found = chartData.find(d => d.id === payload.id)
    if (found) onKeyClick(found.raw)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('charts.apiKeyUsage')}</CardTitle>
        {onKeyClick && (
          <p className="text-xs text-muted-foreground -mt-2">
            {t('charts.clickToDrillDown', { defaultValue: 'Click a bar to view details' })}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              onClick={(state) => {
                const s = state as { activePayload?: Array<{ payload?: { id?: string } }> } | null
                const payload = s?.activePayload?.[0]?.payload
                if (payload?.id) handleClick(payload)
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} />
              <Tooltip cursor={onKeyClick ? { fill: 'hsl(var(--muted) / 0.5)' } : undefined} />
              <Bar
                dataKey="requests"
                style={onKeyClick ? { cursor: 'pointer' } : undefined}
              >
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill="hsl(var(--chart-1))" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
