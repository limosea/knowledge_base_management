import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, Label } from 'recharts'

interface StatusCodeDistributionChartProps {
  statusCodes: Array<{ code: number; count: number }>
  successRate: {
    total: number
    success2xx: number
    clientError4xx: number
    serverError5xx: number
  } | undefined
}

function colorForStatus(code: number): string {
  if (code >= 200 && code < 300) return 'hsl(var(--chart-1))'
  if (code >= 300 && code < 400) return 'hsl(var(--chart-2))'
  if (code >= 400 && code < 500) return 'hsl(var(--chart-3))'
  if (code >= 500) return 'hsl(var(--chart-4))'
  return 'hsl(var(--chart-5))'
}

export function StatusCodeDistributionChart({
  statusCodes,
  successRate,
}: StatusCodeDistributionChartProps) {
  const { t } = useTranslation()

  const displayData = useMemo(() => {
    if (successRate) {
      return [
        { name: '2xx', value: successRate.success2xx, fill: 'hsl(var(--chart-1))' },
        { name: '4xx', value: successRate.clientError4xx, fill: 'hsl(var(--chart-3))' },
        { name: '5xx', value: successRate.serverError5xx, fill: 'hsl(var(--chart-4))' },
      ].filter(d => d.value > 0)
    }
    return (statusCodes ?? []).map(d => ({
      name: String(d.code),
      value: d.count,
      fill: colorForStatus(d.code),
    }))
  }, [statusCodes, successRate])

  const successPercent = useMemo(() => {
    if (!successRate || successRate.total === 0) return 0
    return (successRate.success2xx / successRate.total) * 100
  }, [successRate])

  if (!displayData || displayData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('charts.statusCodeDistribution')}</CardTitle>
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
        <CardTitle>{t('charts.statusCodeDistribution')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={displayData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={2}
                dataKey="value"
                nameKey="name"
              >
                {displayData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
                <Label
                  position="center"
                  content={(props) => {
                    const viewBox = (props as { viewBox?: { cx?: number; cy?: number } }).viewBox
                    const cx = Number(viewBox?.cx ?? 0)
                    const cy = Number(viewBox?.cy ?? 0)
                    return (
                      <g>
                        <text
                          x={cx}
                          y={cy - 8}
                          textAnchor="middle"
                          className="fill-foreground text-2xl font-bold"
                        >
                          {successPercent.toFixed(1)}%
                        </text>
                        <text
                          x={cx}
                          y={cy + 14}
                          textAnchor="middle"
                          className="fill-muted-foreground text-xs"
                        >
                          {t('charts.successRate')}
                        </text>
                      </g>
                    )
                  }}
                />
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
