import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { systemApi, statsApi } from '@/api'
import type { DashboardStats, RequestAnalytics, SystemHealth } from '@/types'
import { Skeleton } from '@/components/ui/skeleton'
import { BookOpen, Activity, Key, AlertTriangle, Plus } from 'lucide-react'
import { StatCard } from '@/components/charts/StatCard'
import { SystemStatusCard } from '@/components/charts/SystemStatusCard'
import { RequestTrendChart } from '@/components/charts/RequestTrendChart'
import { KnowledgeTrendsChart } from '@/components/charts/KnowledgeTrendsChart'
import { TopApiKeysTable } from '@/components/charts/TopApiKeysTable'

export function DashboardPage() {
  const { t } = useTranslation()
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)
  const [requestAnalytics, setRequestAnalytics] = useState<RequestAnalytics | null>(null)
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashboard, requests, health] = await Promise.all([
          statsApi.getDashboard(),
          statsApi.getRequestAnalytics({ period: 'day' }),
          systemApi.getHealth(),
        ])
        setDashboardStats(dashboard)
        setRequestAnalytics(requests)
        setSystemHealth(health)
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

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
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-[300px]" />
          <Skeleton className="h-[300px]" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t('dashboard.title')}</h1>
      </div>

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
        <SystemStatusCard
          status={systemHealth?.status ?? 'unhealthy'}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <KnowledgeTrendsChart />
        <RequestTrendChart
          data={requestAnalytics?.requestVolumeTrend ?? []}
        />
      </div>

      <TopApiKeysTable data={dashboardStats?.topApiKeysToday} />
    </div>
  )
}
