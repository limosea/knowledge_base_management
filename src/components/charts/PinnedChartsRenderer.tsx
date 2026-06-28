import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { statsApi, meApi } from '@/api'
import type {
  KnowledgeTrends,
  RequestAnalytics,
  ContentDistribution,
  EmbeddingCoverage,
  SearchAnalytics,
  ApiKeyUsage,
  DashboardStats,
  MyKnowledgeTrends,
  MyContentDistribution,
  MyEmbeddingCoverage,
  MySearchAnalytics,
  MyApiKeyUsage,
} from '@/types'
import { useDashboardPreferences } from '@/contexts/DashboardPreferencesContext'
import { usePermission } from '@/contexts/PermissionContext'
import { PinnableChartCard } from './PinnableChartCard'
import { chartSizeClass, getChartDef } from './chartRegistry'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { BarChart3 } from 'lucide-react'

// Chart components
import { KnowledgeTrendsChart } from './KnowledgeTrendsChart'
import { RequestTrendChart } from './RequestTrendChart'
import { TopApiKeysTable } from './TopApiKeysTable'
import { LeaderboardSection } from './LeaderboardSection'
import { QualityDistributionChart } from './QualityDistributionChart'
import { EmbeddingCoverageChart } from './EmbeddingCoverageChart'
import { TopTagsChart } from './TopTagsChart'
import { CategoryDistributionChart } from './CategoryDistributionChart'
import { LanguageDistributionChart } from './LanguageDistributionChart'
import { SearchVolumeTrendChart } from './SearchVolumeTrendChart'
import { SearchAnalyticsChart } from './SearchAnalyticsChart'
import { TopSearchIpsChart } from './TopSearchIpsChart'
import { StatusCodeDistributionChart } from './StatusCodeDistributionChart'
import { ApiKeyStatusChart } from './ApiKeyStatusChart'
import { TopEndpointsTable } from './TopEndpointsTable'
import { PersonalKnowledgeTrendsChart } from './PersonalKnowledgeTrendsChart'

interface PinnedChartsRendererProps {
  /** Whether the user has elevated access (for global charts) */
  elevated: boolean
}

/**
 * Renders all user-pinned charts on the dashboard.
 * Fetches required data for each pinned chart based on its category and scope.
 */
export function PinnedChartsRenderer({ elevated }: PinnedChartsRendererProps) {
  const { t } = useTranslation()
  const { pinnedCharts, loading: prefsLoading } = useDashboardPreferences()
  const { hasPermission } = usePermission()
  const hasStats = hasPermission('stats:read') && elevated
  const hasAnalytics = hasPermission('analytics:read') && elevated

  // Data states — one per data source
  const [_globalKnowledgeTrends, setGlobalKnowledgeTrends] = useState<KnowledgeTrends | null>(null)
  const [globalRequestAnalytics, setGlobalRequestAnalytics] = useState<RequestAnalytics | null>(null)
  const [globalContentDist, setGlobalContentDist] = useState<ContentDistribution | null>(null)
  const [globalEmbedding, setGlobalEmbedding] = useState<EmbeddingCoverage | null>(null)
  const [globalSearch, setGlobalSearch] = useState<SearchAnalytics | null>(null)
  const [globalApiKeys, setGlobalApiKeys] = useState<ApiKeyUsage | null>(null)
  const [globalDashboard, setGlobalDashboard] = useState<DashboardStats | null>(null)

  const [myKnowledgeTrends, setMyKnowledgeTrends] = useState<MyKnowledgeTrends | null>(null)
  const [myContentDist, setMyContentDist] = useState<MyContentDistribution | null>(null)
  const [myEmbedding, setMyEmbedding] = useState<MyEmbeddingCoverage | null>(null)
  const [mySearch, setMySearch] = useState<MySearchAnalytics | null>(null)
  const [myApiUsage, setMyApiUsage] = useState<MyApiKeyUsage | null>(null)

  const [loading, setLoading] = useState(true)

  /**
   * Check whether a chart should use personal data.
   * - "personal" scope → always personal
   * - "both" scope → personal when user is NOT elevated
   * - "global" scope → always global
   */
  const usePersonalData = (chartId: string): boolean => {
    const def = getChartDef(chartId)
    if (!def) return false
    if (def.scope === 'personal') return true
    if (def.scope === 'both' && !elevated) return true
    return false
  }

  useEffect(() => {
    if (pinnedCharts.length === 0) {
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)

    // Split charts into personal vs global data needs
    const personalChartIds = pinnedCharts.filter(usePersonalData)
    const globalChartIds = pinnedCharts.filter((id) => !usePersonalData(id))

    // ── Global data needs ──
    const needsGlobalKnowledge = globalChartIds.some((id) =>
      ['knowledge-trends', 'quality-distribution', 'embedding-coverage', 'top-tags', 'category-distribution', 'language-distribution'].includes(id)
    )
    const needsGlobalApi = globalChartIds.some((id) =>
      ['request-trend', 'status-code-distribution', 'api-key-status', 'top-endpoints'].includes(id)
    )
    const needsGlobalSearch = globalChartIds.some((id) =>
      ['search-volume-trend', 'search-analytics', 'top-search-ips'].includes(id)
    )
    const needsGlobalDashboard = globalChartIds.includes('top-api-keys')

    // ── Personal data needs ──
    const needsPersonalKnowledge = personalChartIds.some((id) =>
      ['personal-knowledge-trends', 'quality-distribution', 'embedding-coverage', 'top-tags', 'category-distribution', 'language-distribution'].includes(id)
    )
    const needsPersonalSearch = personalChartIds.some((id) =>
      ['search-volume-trend', 'top-search-ips'].includes(id)
    )
    const needsPersonalApi = personalChartIds.includes('top-api-keys')

    const fetchers: Promise<void>[] = []

    // Global data (only for elevated users with permissions)
    if (hasStats || hasAnalytics) {
      if (needsGlobalKnowledge) {
        fetchers.push(
          Promise.all([
            statsApi.getKnowledgeTrends({ period: 'week' }),
            statsApi.getContentDistribution(),
            statsApi.getEmbeddingCoverage(),
          ]).then(([kt, cd, ec]) => {
            if (!cancelled) {
              setGlobalKnowledgeTrends(kt)
              setGlobalContentDist(cd)
              setGlobalEmbedding(ec)
            }
          }).catch(() => {}),
        )
      }
      if (needsGlobalApi) {
        fetchers.push(
          Promise.all([
            statsApi.getRequestAnalytics({ period: 'day' }),
            statsApi.getApiKeyUsage(),
          ]).then(([ra, ak]) => {
            if (!cancelled) {
              setGlobalRequestAnalytics(ra)
              setGlobalApiKeys(ak)
            }
          }).catch(() => {}),
        )
      }
      if (needsGlobalSearch) {
        fetchers.push(
          statsApi.getSearchAnalytics({ period: 'day' })
            .then((d) => { if (!cancelled) setGlobalSearch(d) })
            .catch(() => {}),
        )
      }
      if (needsGlobalDashboard) {
        fetchers.push(
          statsApi.getDashboard()
            .then((d) => { if (!cancelled) setGlobalDashboard(d) })
            .catch(() => {}),
        )
      }
    }

    // Personal data (always available to any authenticated user)
    if (needsPersonalKnowledge) {
      fetchers.push(
        Promise.all([
          meApi.getKnowledgeTrends({ period: 'week' }),
          meApi.getContentDistribution(),
          meApi.getEmbeddingCoverage(),
        ]).then(([kt, cd, ec]) => {
          if (!cancelled) {
            setMyKnowledgeTrends(kt)
            setMyContentDist(cd)
            setMyEmbedding(ec)
          }
        }).catch(() => {}),
      )
    }
    if (needsPersonalSearch) {
      fetchers.push(
        meApi.getSearchAnalytics({ period: 'day' })
          .then((d) => { if (!cancelled) setMySearch(d) })
          .catch(() => {}),
      )
    }
    if (needsPersonalApi) {
      fetchers.push(
        meApi.getApiKeyUsage()
          .then((d) => { if (!cancelled) setMyApiUsage(d) })
          .catch(() => {}),
      )
    }

    if (fetchers.length === 0) {
      setLoading(false)
      return
    }

    Promise.all(fetchers).finally(() => {
      if (!cancelled) setLoading(false)
    })

    return () => { cancelled = true }
  }, [pinnedCharts, hasStats, hasAnalytics, elevated])

  if (prefsLoading || loading) {
    return (
      <div className="grid gap-4 grid-cols-12">
        {pinnedCharts.slice(0, 4).map((_, i) => (
          <Skeleton key={i} className="col-span-12 md:col-span-6 h-[300px]" />
        ))}
      </div>
    )
  }

  if (pinnedCharts.length === 0) {
    return (
      <div className="text-center py-12 space-y-4">
        <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground/40" />
        <p className="text-muted-foreground">{t('dashboard.noPinnedCharts')}</p>
        <Button variant="outline" asChild>
          <Link to="/me/analytics">
            <BarChart3 className="h-4 w-4 mr-2" />
            {t('dashboard.goToAnalytics')}
          </Link>
        </Button>
      </div>
    )
  }

  const renderChart = (chartId: string): React.ReactNode => {
    // Determine data source: personal for personal-scope or both-scope (non-elevated)
    const isPersonal = usePersonalData(chartId)

    switch (chartId) {
      // ── Knowledge (global scope) ─────────────────────────────
      case 'knowledge-trends':
        return <KnowledgeTrendsChart />

      // ── Knowledge (both scope — data source depends on elevation) ──
      case 'quality-distribution':
        return (
          <QualityDistributionChart
            data={(isPersonal ? myContentDist : globalContentDist)?.qualityScoreDistribution ?? []}
          />
        )
      case 'embedding-coverage':
        return (
          <EmbeddingCoverageChart
            data={isPersonal ? myEmbedding : globalEmbedding}
          />
        )
      case 'top-tags':
        return (
          <TopTagsChart
            data={(isPersonal ? myContentDist : globalContentDist)?.topTags ?? []}
          />
        )
      case 'category-distribution':
        return (
          <CategoryDistributionChart
            data={(isPersonal ? myContentDist : globalContentDist)?.byCategory ?? []}
          />
        )
      case 'language-distribution':
        return (
          <LanguageDistributionChart
            data={(isPersonal ? myContentDist : globalContentDist)?.byLanguage ?? []}
          />
        )

      // ── Personal Knowledge ───────────────────────────────
      case 'personal-knowledge-trends':
        return <PersonalKnowledgeTrendsChart data={myKnowledgeTrends} />

      // ── Search (both/global scope) ──────────────────────
      case 'search-volume-trend':
        return (
          <SearchVolumeTrendChart
            data={(isPersonal ? mySearch : globalSearch)?.searchesOverTime ?? []}
          />
        )
      case 'search-analytics':
        return (
          <SearchAnalyticsChart
            data={globalSearch?.topQueries ?? []}
          />
        )
      case 'top-search-ips':
        return (
          <TopSearchIpsChart
            data={(isPersonal ? mySearch : globalSearch)?.topIps ?? []}
          />
        )

      // ── API (global scope) ─────────────────────────────
      case 'request-trend':
        return (
          <RequestTrendChart
            data={globalRequestAnalytics?.requestVolumeTrend ?? []}
          />
        )
      case 'status-code-distribution':
        return (
          <StatusCodeDistributionChart
            statusCodes={globalRequestAnalytics?.statusCodeDistribution ?? []}
            successRate={globalRequestAnalytics?.successRate}
          />
        )
      case 'api-key-status':
        return (
          <ApiKeyStatusChart
            data={globalApiKeys?.keys ?? []}
            onKeyClick={() => {}}
          />
        )
      case 'top-endpoints':
        return (
          <TopEndpointsTable
            data={globalRequestAnalytics?.topEndpoints ?? []}
          />
        )
      case 'top-api-keys':
        return (
          <TopApiKeysTable
            data={globalDashboard?.topApiKeysToday ?? (myApiUsage?.keys.map((k) => ({ name: k.apiKeyName, count: k.totalRequests })))}
          />
        )

      // ── Leaderboard ────────────────────────────────────
      case 'personal-leaderboard':
        return <LeaderboardSection scope="personal" />
      case 'global-leaderboard':
        return <LeaderboardSection scope="global" />

      default:
        return null
    }
  }

  return (
    <div className="grid gap-4 grid-cols-12">
      {pinnedCharts.map((chartId) => {
        const def = getChartDef(chartId)
        if (!def) return null
        const chart = renderChart(chartId)
        if (!chart) return null
        return (
          <div key={chartId} className={chartSizeClass(def.size)}>
            <PinnableChartCard
              chartId={chartId}
              descriptionKey={def.descriptionKey}
              mode="dashboard"
            >
              {chart}
            </PinnableChartCard>
          </div>
        )
      })}
    </div>
  )
}
