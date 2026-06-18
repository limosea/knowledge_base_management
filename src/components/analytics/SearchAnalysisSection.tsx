import { useEffect, useState } from 'react'
import { statsApi } from '@/api'
import type { SearchAnalytics } from '@/types'
import type { StatsFilterState } from '@/components/charts/StatsFilterBar'
import { Skeleton } from '@/components/ui/skeleton'
import { SearchAnalyticsChart } from '@/components/charts/SearchAnalyticsChart'
import { SearchVolumeTrendChart } from '@/components/charts/SearchVolumeTrendChart'
import { TopSearchIpsChart } from '@/components/charts/TopSearchIpsChart'
import { SearchKpiRow } from '@/components/charts/SearchKpiRow'

interface Props {
  filter: StatsFilterState
}

export function SearchAnalysisSection({ filter }: Props) {
  const [searchAnalytics, setSearchAnalytics] = useState<SearchAnalytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    statsApi
      .getSearchAnalytics({
        period: filter.period as 'day' | 'week' | 'month',
        from: filter.from,
        to: filter.to,
      })
      .then((data) => {
        if (!cancelled) setSearchAnalytics(data)
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

  if (loading && !searchAnalytics) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-28 w-full" />
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-[300px]" />
          <Skeleton className="h-[300px]" />
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-[300px]" />
          <Skeleton className="h-[300px]" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <SearchKpiRow data={searchAnalytics} />
      <div className="grid gap-4 lg:grid-cols-2">
        <SearchVolumeTrendChart
          data={searchAnalytics?.searchesOverTime ?? []}
        />
        <SearchAnalyticsChart data={searchAnalytics?.topQueries ?? []} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <TopSearchIpsChart data={searchAnalytics?.topIps ?? []} />
        <div />
      </div>
    </div>
  )
}
