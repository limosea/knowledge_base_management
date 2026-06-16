import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { systemApi } from '@/api'
import type { SystemHealth, SystemStats } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

export function SystemPage() {
  const { t } = useTranslation()
  const [health, setHealth] = useState<SystemHealth | null>(null)
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [healthData, statsData] = await Promise.all([
          systemApi.getHealth(),
          systemApi.getStats(),
        ])
        setHealth(healthData)
        setStats(statsData)
      } catch (error) {
        console.error('Failed to fetch system data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    )
  }

  const statusColors = {
    ok: 'bg-green-500',
    degraded: 'bg-yellow-500',
    unhealthy: 'bg-red-500',
    error: 'bg-red-500',
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t('system.title')}</h1>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Health Status */}
        <Card>
          <CardHeader>
            <CardTitle>{t('system.health')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">{t('system.status')}</span>
              <Badge className={statusColors[health?.status || 'unhealthy']}>
                {t(`system.${health?.status || 'unhealthy'}`)}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">{t('system.version')}</span>
              <span className="text-sm font-mono">{health?.version || '-'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">{t('system.uptime')}</span>
              <span className="text-sm">
                {health?.uptime ? `${Math.floor(health.uptime / 3600)}h ${Math.floor((health.uptime % 3600) / 60)}m` : '-'}
              </span>
            </div>
            
            {health?.checks && (
              <>
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{t('system.database')}</span>
                    <div className="flex items-center gap-2">
                      <Badge className={statusColors[health.checks.database.status]}>
                        {t(`system.${health.checks.database.status}`)}
                      </Badge>
                      {health.checks.database.latency && (
                        <span className="text-xs text-muted-foreground">
                          {health.checks.database.latency}ms
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">{t('system.storage')}</span>
                  <Badge className={statusColors[health.checks.storage.status]}>
                    {t(`system.${health.checks.storage.status}`)}
                  </Badge>
                </div>
                {health.checks.cache && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{t('system.cache')}</span>
                    <div className="flex items-center gap-2">
                      <Badge className={statusColors[health.checks.cache.status]}>
                        {t(`system.${health.checks.cache.status}`)}
                      </Badge>
                      {health.checks.cache.latency && (
                        <span className="text-xs text-muted-foreground">
                          {health.checks.cache.latency}ms
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>{t('system.stats')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats?.knowledgeEntries && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm">{t('dashboard.knowledgeEntries')}</span>
                  <span className="text-lg font-bold">
                    {stats.knowledgeEntries.total.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">{t('knowledge.qualityScore')}</span>
                  <span className="text-lg font-bold">
                    {stats.knowledgeEntries.avgQualityScore?.toFixed(1) || '-'}
                  </span>
                </div>
              </>
            )}
            
            {stats?.apiKeys && (
              <>
                <div className="border-t pt-4 flex items-center justify-between">
                  <span className="text-sm">{t('dashboard.apiKeys')}</span>
                  <span className="text-lg font-bold">
                    {stats.apiKeys.total.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">{t('apiKeys.active')}</span>
                  <Badge className="bg-green-500">{stats.apiKeys.active}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">{t('apiKeys.expired')}</span>
                  <Badge variant="destructive">{stats.apiKeys.expired}</Badge>
                </div>
              </>
            )}
            
            {stats?.requests && (
              <>
                <div className="border-t pt-4 flex items-center justify-between">
                  <span className="text-sm">{t('dashboard.requests')}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <div className="text-center p-2 bg-muted rounded">
                    <div className="text-xs text-muted-foreground">{t('dashboard.today')}</div>
                    <div className="text-lg font-bold">{stats.requests.today}</div>
                  </div>
                  <div className="text-center p-2 bg-muted rounded">
                    <div className="text-xs text-muted-foreground">{t('dashboard.thisWeek')}</div>
                    <div className="text-lg font-bold">{stats.requests.thisWeek}</div>
                  </div>
                  <div className="text-center p-2 bg-muted rounded">
                    <div className="text-xs text-muted-foreground">{t('dashboard.thisMonth')}</div>
                    <div className="text-lg font-bold">{stats.requests.thisMonth}</div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}