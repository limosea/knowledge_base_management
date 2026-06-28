import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { systemApi, statsApi, meApi } from '@/api'
import type { DashboardStats, SystemHealth, MyStats, MyDashboardStats } from '@/types'
import { Skeleton } from '@/components/ui/skeleton'
import { BookOpen, Activity, Key, AlertTriangle, Plus, Library, Settings2, BarChart3 } from 'lucide-react'
import { StatCard } from '@/components/charts/StatCard'
import { SystemStatusCard } from '@/components/charts/SystemStatusCard'
import { PinnedChartsRenderer } from '@/components/charts/PinnedChartsRenderer'
import { CHART_REGISTRY } from '@/components/charts/chartRegistry'
import { useDashboardPreferences } from '@/contexts/DashboardPreferencesContext'
import { usePermission } from '@/contexts/PermissionContext'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

export function DashboardPage() {
  const { t } = useTranslation()
  const { hasPermission, isElevated } = usePermission()
  const { pinnedCharts, setPinnedCharts } = useDashboardPreferences()

  const elevated = isElevated()
  const hasStats = hasPermission('stats:read') && elevated
  const hasSystem = hasPermission('system:read') && elevated

  const [myStats, setMyStats] = useState<MyStats | null>(null)
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null)
  const [myDashboardStats, setMyDashboardStats] = useState<MyDashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [customizeOpen, setCustomizeOpen] = useState(false)
  const [draftPinned, setDraftPinned] = useState<string[]>([])

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
    if (hasSystem) {
      fetchers.push(
        systemApi.getHealth().then((d) => { if (!cancelled) setSystemHealth(d) }).catch(() => {}),
      )
    }

    Promise.all(fetchers).finally(() => {
      if (!cancelled) setLoading(false)
    })

    return () => { cancelled = true }
  }, [hasStats, hasSystem])

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

  // Available charts based on user scope
  const availableCharts = useMemo(() => {
    const scope = elevated ? 'global' : 'personal'
    return CHART_REGISTRY.filter(
      (c) => c.scope === scope || c.scope === 'both',
    )
  }, [elevated])

  const openCustomize = () => {
    setDraftPinned([...pinnedCharts])
    setCustomizeOpen(true)
  }

  const saveCustomize = () => {
    setPinnedCharts(draftPinned)
    setCustomizeOpen(false)
  }

  const toggleDraftChart = (chartId: string) => {
    setDraftPinned((prev) =>
      prev.includes(chartId)
        ? prev.filter((id) => id !== chartId)
        : [...prev, chartId],
    )
  }

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
      </div>
    )
  }

  const showGlobalStats = hasStats
  const showSystemHealth = hasSystem

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t('dashboard.title')}</h1>
        <Dialog open={customizeOpen} onOpenChange={setCustomizeOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" onClick={openCustomize}>
              <Settings2 className="h-4 w-4 mr-1" />
              {t('dashboard.customizeDashboard')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t('dashboard.customizeDashboard')}</DialogTitle>
              <DialogDescription>
                {t('dashboard.customizeDescription')}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              {/* Group by category */}
              {(['knowledge', 'search', 'api', 'leaderboard'] as const).map((category) => {
                const categoryCharts = availableCharts.filter((c) => c.category === category)
                if (categoryCharts.length === 0) return null
                const categoryLabel =
                  category === 'knowledge' ? t('nav.knowledge') :
                  category === 'search' ? t('analytics.searchAnalysis') :
                  category === 'api' ? t('nav.apiKeys') :
                  t('charts.leaderboard')
                return (
                  <div key={category}>
                    <h4 className="text-sm font-semibold text-muted-foreground mb-2">{categoryLabel}</h4>
                    <div className="space-y-2">
                      {categoryCharts.map((chart) => (
                        <div key={chart.id} className="flex items-center gap-3 py-1">
                          <Checkbox
                            id={`chart-${chart.id}`}
                            checked={draftPinned.includes(chart.id)}
                            onCheckedChange={() => toggleDraftChart(chart.id)}
                          />
                          <Label
                            htmlFor={`chart-${chart.id}`}
                            className="text-sm cursor-pointer flex-1"
                          >
                            {t(chart.titleKey)}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button variant="outline" onClick={() => setCustomizeOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button onClick={saveCustomize}>
                {t('common.save')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Personal Overview - stat cards (always shown) */}
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <StatCard
            title={t('charts.myLibraries')}
            value={myDashboardStats?.libraries?.total ?? 0}
            icon={Library}
          />
          <StatCard
            title={t('charts.myEntries')}
            value={myDashboardStats?.knowledgeEntries?.total ?? 0}
            icon={BookOpen}
            description={`${t('dashboard.total')}: ${myDashboardStats?.knowledgeEntries?.total ?? 0}`}
          />
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
                {myDashboardStats.embeddingCoverage.totalEntries > 0 ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{t('charts.totalEntries')}: {myDashboardStats.embeddingCoverage.totalEntries}</span>
                      <span className="text-muted-foreground">
                        ({t('charts.withEmbedding')}: {myDashboardStats.embeddingCoverage.withEmbedding} / {t('charts.withoutEmbedding')}: {myDashboardStats.embeddingCoverage.withoutEmbedding})
                      </span>
                    </div>
                    <Progress value={myDashboardStats.embeddingCoverage.coveragePercent} />
                    <p className="text-xs text-muted-foreground text-right">
                      {myDashboardStats.embeddingCoverage.coveragePercent.toFixed(1)}%
                    </p>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground text-center py-4">{t('charts.noData')}</div>
                )}
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

      {/* Global Overview - stat cards */}
      {showGlobalStats && (
        <div>
          <h2 className="mb-3 text-lg font-semibold text-muted-foreground">{t('dashboard.globalOverview')}</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title={t('charts.myLibraries')}
              value={dashboardStats?.libraries?.total ?? 0}
              icon={Library}
            />
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
          </div>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6 mt-4">
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

      {/* Pinned Charts Section */}
      <div>
        <h2 className="mb-3 text-lg font-semibold text-muted-foreground">{t('dashboard.pinnedCharts')}</h2>
        <PinnedChartsRenderer elevated={elevated} />
      </div>
    </div>
  )
}
