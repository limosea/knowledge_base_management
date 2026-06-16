import { useEffect, useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { systemApi, knowledgeApi, auditLogsApi } from '@/api'
import type { SystemStats, KnowledgeStats, AuditLog } from '@/types'
import { Skeleton } from '@/components/ui/skeleton'
import { CategoryPieChart } from '@/components/charts/CategoryPieChart'
import { QualityBarChart } from '@/components/charts/QualityBarChart'
import { ApiKeyStatusChart } from '@/components/charts/ApiKeyStatusChart'
import { RequestTrendChart } from '@/components/charts/RequestTrendChart'
import { ActionStatsChart } from '@/components/charts/ActionStatsChart'
import { ActivityTimeline } from '@/components/charts/ActivityTimeline'

export function AnalyticsPage() {
  const { t } = useTranslation()
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null)
  const [knowledgeStats, setKnowledgeStats] = useState<KnowledgeStats | null>(null)
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sys, kn, logs] = await Promise.all([
          systemApi.getStats(),
          knowledgeApi.getStats(),
          auditLogsApi.list({ limit: 500 }),
        ])
        setSystemStats(sys)
        setKnowledgeStats(kn)
        setAuditLogs(logs.data)
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const actionStats = useMemo(() => {
    const stats: Record<string, number> = {}
    auditLogs.forEach((log) => {
      stats[log.action] = (stats[log.action] || 0) + 1
    })
    return stats
  }, [auditLogs])

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="space-y-8">
          <div>
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="grid gap-4 lg:grid-cols-2">
              <Skeleton className="h-[350px]" />
              <Skeleton className="h-[350px]" />
            </div>
          </div>
          <div>
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="grid gap-4 lg:grid-cols-2">
              <Skeleton className="h-[350px]" />
              <Skeleton className="h-[350px]" />
            </div>
          </div>
          <div>
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="grid gap-4 lg:grid-cols-2">
              <Skeleton className="h-[350px]" />
              <Skeleton className="h-[350px]" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t('analytics.title')}</h1>

      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            📚 {t('analytics.knowledgeAnalysis')}
          </h2>
          <div className="grid gap-4 lg:grid-cols-2">
            <CategoryPieChart
              data={knowledgeStats?.byCategory ?? {}}
            />
            <QualityBarChart
              avgScore={knowledgeStats?.avgQualityScore}
            />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            🔐 {t('analytics.apiAnalysis')}
          </h2>
          <div className="grid gap-4 lg:grid-cols-2">
            <ApiKeyStatusChart
              data={systemStats?.apiKeys ?? { total: 0, active: 0, expired: 0 }}
            />
            <RequestTrendChart
              data={{
                today: systemStats?.requests?.today ?? 0,
                thisWeek: systemStats?.requests?.thisWeek ?? 0,
                thisMonth: systemStats?.requests?.thisMonth ?? 0,
              }}
            />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            📋 {t('analytics.auditAnalysis')}
          </h2>
          <div className="grid gap-4 lg:grid-cols-2">
            <ActionStatsChart data={actionStats} />
            <ActivityTimeline data={auditLogs} />
          </div>
        </div>
      </div>
    </div>
  )
}
