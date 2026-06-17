import { useTranslation } from 'react-i18next'
import { formatDistanceToNow } from 'date-fns'
import { zhCN, enUS } from 'date-fns/locale'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import type { AuditLog } from '@/types'

interface ActivityTimelineProps {
  data: Array<{ date: string; count: number }> | AuditLog[]
  loading?: boolean
}

const ACTION_COLORS: Record<string, string> = {
  LOGIN: 'bg-blue-500',
  LOGOUT: 'bg-gray-500',
  CREATE: 'bg-green-500',
  UPDATE: 'bg-yellow-500',
  DELETE: 'bg-red-500',
}

function isAuditLogArray(
  data: ActivityTimelineProps['data']
): data is AuditLog[] {
  return Array.isArray(data) && data.length > 0 && 'id' in data[0]
}

export function ActivityTimeline({ data, loading }: ActivityTimelineProps) {
  const { t, i18n } = useTranslation()

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('analytics.activityTimeline')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            {t('analytics.noData')}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isAuditLogArray(data)) {
    const formatDate = (date: string) => {
      const locale = i18n.language === 'zh' ? zhCN : enUS
      return formatDistanceToNow(new Date(date), { addSuffix: true, locale })
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('analytics.activityTimeline')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-[300px] overflow-y-auto">
            {data.slice(0, 10).map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div
                  className={`w-2 h-2 rounded-full mt-2 ${
                    ACTION_COLORS[log.action] || 'bg-gray-400'
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="text-xs">
                      {log.action}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {log.resourceType}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDate(log.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const chartData = data.map(item => ({
    name: item.date,
    value: item.count,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t('analytics.activityTimeline')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="name"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value) => [value, t('analytics.count')]}
              />
              <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
