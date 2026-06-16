import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { systemApi, knowledgeApi, auditLogsApi } from '@/api'
import type { SystemStats, KnowledgeStats, AuditLog, SystemHealth } from '@/types'
import { Skeleton } from '@/components/ui/skeleton'
import { BookOpen, Activity, Key } from 'lucide-react'
import { StatCard } from '@/components/charts/StatCard'
import { SystemStatusCard } from '@/components/charts/SystemStatusCard'
import { RequestTrendChart } from '@/components/charts/RequestTrendChart'
import { RecentActivityList } from '@/components/charts/RecentActivityList'

export function DashboardPage() {
  const { t } = useTranslation()
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null)
  const [knowledgeStats, setKnowledgeStats] = useState<KnowledgeStats | null>(null)
  const [recentLogs, setRecentLogs] = useState<AuditLog[]>([])
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sys, kn, logs, health] = await Promise.all([
          systemApi.getStats(),
          knowledgeApi.getStats(),
          auditLogsApi.list({ limit: 10 }),
          systemApi.getHealth(),
        ])
        setSystemStats(sys)
        setKnowledgeStats(kn)
        setRecentLogs(logs.data)
        setSystemHealth(health)
      } catch (error) {
        console.error('Failed to fetch data:', error)
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t('dashboard.knowledgeEntries')}
          value={knowledgeStats?.total ?? 0}
          icon={BookOpen}
        />
        <StatCard
          title={t('dashboard.todayRequests')}
          value={systemStats?.requests?.today ?? 0}
          icon={Activity}
        />
        <StatCard
          title={t('dashboard.activeApiKeys')}
          value={systemStats?.apiKeys?.active ?? 0}
          icon={Key}
        />
        <SystemStatusCard
          status={systemHealth?.status ?? 'unhealthy'}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <RequestTrendChart
          data={{
            today: systemStats?.requests?.today ?? 0,
            thisWeek: systemStats?.requests?.thisWeek ?? 0,
            thisMonth: systemStats?.requests?.thisMonth ?? 0,
          }}
        />
        <RecentActivityList data={recentLogs} />
      </div>
    </div>
  )
}
