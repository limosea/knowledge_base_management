import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { formatDistanceToNow } from 'date-fns'
import { zhCN, enUS } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import type { AuditLog } from '@/types'

interface RecentActivityListProps {
  data: AuditLog[]
  loading?: boolean
}

export function RecentActivityList({ data, loading }: RecentActivityListProps) {
  const { t, i18n } = useTranslation()

  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const formatDate = (date: string) => {
    const locale = i18n.language === 'zh' ? zhCN : enUS
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale })
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">{t('dashboard.recentActivity')}</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/audit-logs">{t('dashboard.viewAll')}</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {!data || data.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            {t('common.noData')}
          </div>
        ) : (
          <div className="space-y-3">
            {data.slice(0, 5).map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Badge variant="outline">{log.action}</Badge>
                  <span className="text-sm">{log.resourceType}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatDate(log.createdAt)}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
