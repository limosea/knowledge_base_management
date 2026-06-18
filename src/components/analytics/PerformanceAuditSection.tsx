import { useEffect, useState } from 'react'
import { statsApi } from '@/api'
import type { AuditAnalytics, RequestAnalytics } from '@/types'
import type { StatsFilterState } from '@/components/charts/StatsFilterBar'
import { Skeleton } from '@/components/ui/skeleton'
import { ActionStatsChart } from '@/components/charts/ActionStatsChart'
import { ActivityTrendChart } from '@/components/charts/ActivityTrendChart'
import { StatusDistributionChart } from '@/components/charts/StatusDistributionChart'
import { TopErrorsTable } from '@/components/charts/TopErrorsTable'
import { LatencyStatsCard } from '@/components/charts/LatencyStatsCard'

interface Props {
  filter: StatsFilterState
}

export function PerformanceAuditSection({ filter }: Props) {
  const [auditAnalytics, setAuditAnalytics] = useState<AuditAnalytics | null>(null)
  const [requestAnalytics, setRequestAnalytics] = useState<RequestAnalytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    const params = {
      period: filter.period as 'day' | 'week' | 'month',
      from: filter.from,
      to: filter.to,
    }
    Promise.all([
      statsApi.getAuditAnalytics(params),
      statsApi.getRequestAnalytics(params),
    ])
      .then(([audit, requests]) => {
        if (cancelled) return
        setAuditAnalytics(audit)
        setRequestAnalytics(requests)
      })
      .catch(() => {
        // keep previous data on error
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [filter])

  if (loading && !auditAnalytics) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-[350px]" />
          <Skeleton className="h-[350px]" />
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-[350px]" />
          <Skeleton className="h-[350px]" />
        </div>
        <Skeleton className="h-60 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <LatencyStatsCard data={requestAnalytics?.latencyStats} />
        <ActionStatsChart data={auditAnalytics?.byAction ?? []} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <ActivityTrendChart data={auditAnalytics?.trend ?? []} />
        <StatusDistributionChart data={auditAnalytics?.byStatus ?? []} />
      </div>
      <TopErrorsTable data={auditAnalytics?.topErrors ?? []} />
    </div>
  )
}
