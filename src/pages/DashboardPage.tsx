import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { systemApi, statsApi, meApi } from '@/api'
import type { DashboardStats, RequestAnalytics, SystemHealth, MyStats, MyDashboardStats } from '@/types'
import { Skeleton } from '@/components/ui/skeleton'
import { BookOpen, Activity, Key, AlertTriangle, Plus, BarChart3 } from 'lucide-react'
import { StatCard } from '@/components/charts/StatCard'
import { SystemStatusCard } from '@/components/charts/SystemStatusCard'
import { RequestTrendChart } from '@/components/charts/RequestTrendChart'
import { KnowledgeTrendsChart } from '@/components/charts/KnowledgeTrendsChart'
import { TopApiKeysTable } from '@/components/charts/TopApiKeysTable'
import { usePermission } from '@/contexts/PermissionContext'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'

export function DashboardPage() {
  const { t } = useTranslation()
  const { hasPermission, isElevated } = usePermission()

  const elevated = isElevated()
  // Per instructions.md: site-wide stats require elevated (TOTP step-up).
  // Basic permissions only cover personal data.
  const hasStats = hasPermission('stats:read') && elevated
  const hasAnalytics = hasPermission('analytics:read') && elevated
  const hasSystem = hasPermission('system:read') && elevated

  const [myStats, setMyStats] = useState<MyStats | null>(null)
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)
  const [requestAnalytics, setRequestAnalytics] = useState<RequestAnalytics | null>(null)
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null)
  const [myDashboardStats, setMyDashboardStats] = useState<MyDashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    const fetchers: Promise<void>[] = [
      meApi.getStats().then((d) => { if (!cancelled) setMyStats(d) }).catch(() => {}),
      meApi.getDashboardStats().then((d) => { if (!cancelled) setMyDashboardStats(d) }).catch(() => {}),
    ]

    if (hasStats) {
      fetchers.push(
        statsApi.getDashboard().then((d) => { if (!cancelled) setDashboardStats(d) }).catch(() => {}),
      )
    }
    if (hasAnalytics) {
      fetchers.push(
        statsApi.getRequestAnalytics({ period: 'day' }).then((d) => { if (!cancelled) setRequestAnalytics(d) }).catch(() => {}),
      )
    }
    if (hasSystem) {
      fetchers.push(
        systemApi.getHealth().then((d) => { if (!cancelled) setSystemHealth(d) }).catch(() => {}),
      )
    }

    Promise.all(fetchers).finally(() => {
      if (!cancelled) setLoading(false)
    })

    return () => { cancelled = true }
  }, [hasStats, hasAnalytics, hasSystem])

  const errorRateDisplay = useMemo(() => {
    const er = dashboardStats?.errorRate
    if (!er || er.total === 0) return '0.0%'
    return `${((er.errors / er.total) * 100).toFixed(1)}%`
  }, [dashboardStats])

  const errorRateDescription = useMemo(() => {
    const er = dashboardStats?.errorRate
    if (!er) return undefined
    return `${er.errors.toLocaleString()} / ${er.total.toLocaleString()}`
  }, [dashboardStats])

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={`p-${i}`} className="h-28" />
          ))}
        </div>
        {(hasStats || hasSystem) && (
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={`g-${i}`} className="h-28" />
            ))}
          </div>
        )}
        {(hasStats || hasAnalytics) && (
          <div className="grid gap-4 lg:grid-cols-2">
            <Skeleton className="h-[300px]" />
            <Skeleton className="h-[300px]" />
          </div>
        )}
      </div>
    )
  }

  const showGlobalStats = hasStats
  const showRequestTrend = hasAnalytics
  const showKnowledgeTrends = hasStats
  const showSystemHealth = hasSystem
  const showTopApiKeys = hasStats

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t('dashboard.title')}</h1>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-muted-foreground">{t('dashboard.personalOverview')}</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/me/analytics">
              <BarChart3 className="h-4 w-4 mr-1" />
              {t('nav.myAnalytics')}
            </Link>
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            title={t('dashboard.myApiKeys')}
            value={myStats?.apiKeys?.active ?? 0}
            icon={Key}
            description={`${t('dashboard.total')}: ${myStats?.apiKeys?.total ?? 0}`}
          />
          <StatCard
            title={t('dashboard.myTodayRequests')}
            value={myStats?.requests?.today ?? 0}
            icon={Activity}
          />
          <StatCard
            title={t('dashboard.myWeekRequests')}
            value={myStats?.requests?.thisWeek ?? 0}
            icon={Activity}
          />
        </div>
        {myDashboardStats && (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">{t('charts.embeddingCoverage')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{t('charts.withEmbedding')}: {myDashboardStats.embeddingCoverage.withEmbedding}</span>
                    <span>{t('charts.withoutEmbedding')}: {myDashboardStats.embeddingCoverage.withoutEmbedding}</span>
                  </div>
                  <Progress value={myDashboardStats.embeddingCoverage.coveragePercent} />
                  <p className="text-xs text-muted-foreground text-right">
                    {myDashboardStats.embeddingCoverage.coveragePercent.toFixed(1)}%
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">{t('charts.topTags')}</CardTitle>
              </CardHeader>
              <CardContent>
                {myDashboardStats.topTags.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {myDashboardStats.topTags.slice(0, 10).map((tag) => (
                      <span key={tag.tag} className="px-2 py-0.5 bg-muted rounded text-xs">
                        {tag.tag} ({tag.count})
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">{t('charts.noData')}</div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {showGlobalStats && (
        <div>
          <h2 className="mb-3 text-lg font-semibold text-muted-foreground">{t('dashboard.globalOverview')}</h2>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
            <StatCard
              title={t('dashboard.knowledgeEntries')}
              value={dashboardStats?.knowledgeEntries?.total ?? 0}
              icon={BookOpen}
            />
            <StatCard
              title={t('dashboard.todayRequests')}
              value={dashboardStats?.requests?.today ?? 0}
              icon={Activity}
            />
            <StatCard
              title={t('dashboard.activeApiKeys')}
              value={dashboardStats?.apiKeys?.active ?? 0}
              icon={Key}
            />
            <StatCard
              title={t('charts.errorRate')}
              value={errorRateDisplay}
              icon={AlertTriangle}
              description={errorRateDescription}
            />
            <StatCard
              title={t('charts.newEntriesWeek')}
              value={dashboardStats?.knowledgeEntries?.createdThisWeek ?? 0}
              icon={Plus}
            />
            {showSystemHealth && (
              <SystemStatusCard status={systemHealth?.status ?? 'unhealthy'} />
            )}
          </div>
        </div>
      )}

      {!showGlobalStats && showSystemHealth && (
        <div>
          <h2 className="mb-3 text-lg font-semibold text-muted-foreground">{t('dashboard.systemOverview')}</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <SystemStatusCard status={systemHealth?.status ?? 'unhealthy'} />
          </div>
        </div>
      )}

      {(showKnowledgeTrends || showRequestTrend) && (
        <div className="grid gap-4 lg:grid-cols-2">
          {showKnowledgeTrends && <KnowledgeTrendsChart />}
          {showRequestTrend && (
            <RequestTrendChart data={requestAnalytics?.requestVolumeTrend ?? []} />
          )}
        </div>
      )}

      {showTopApiKeys && <TopApiKeysTable data={dashboardStats?.topApiKeysToday} />}
    </div>
  )
}
