import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface StatusDistributionChartProps {
  data: Array<{ status: string; count: number }>
}

const STATUS_COLORS: Record<string, string> = {
  success: 'hsl(142, 76%, 36%)',
  failure: 'hsl(45, 93%, 47%)',
  error: 'hsl(0, 84%, 60%)',
}

const DEFAULT_COLOR = 'hsl(var(--chart-1))'

export function StatusDistributionChart({ data }: StatusDistributionChartProps) {
  const { t } = useTranslation()

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('charts.statusDistribution')}</CardTitle>
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
        <CardTitle>{t('charts.statusDistribution')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" allowDecimals={false} />
              <YAxis type="category" dataKey="status" width={120} />
              <Tooltip />
              <Bar dataKey="count">
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={STATUS_COLORS[entry.status] || DEFAULT_COLOR}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
