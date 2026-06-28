import { useEffect, useState } from 'react'
import { statsApi } from '@/api'
import type { SearchAnalyticsSearchActivity } from '@/types'
import type { StatsFilterState } from '@/components/charts/StatsFilterBar'
import { Skeleton } from '@/components/ui/skeleton'
import { SearchAnalyticsChart } from '@/components/charts/SearchAnalyticsChart'
import { SearchVolumeTrendChart } from '@/components/charts/SearchVolumeTrendChart'
import { TopSearchIpsChart } from '@/components/charts/TopSearchIpsChart'
import { SearchKpiRow } from '@/components/charts/SearchKpiRow'
import { PinnableChartCard } from '@/components/charts/PinnableChartCard'

interface Props {
  filter: StatsFilterState
}

export function SearchAnalysisSection({ filter }: Props) {
  const [searchAnalytics, setSearchAnalytics] = useState<SearchAnalyticsSearchActivity | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    statsApi
      .getSearchAnalytics({
        period: filter.period as 'day' | 'week' | 'month',
        from: filter.from,
        to: filter.to,
        perspective: 'searchActivity',
      })
      .then((data) => {
        if (!cancelled && data.perspective === 'searchActivity') setSearchAnalytics(data)
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
        <PinnableChartCard chartId="search-volume-trend" descriptionKey="charts.descriptions.searchVolumeTrend">
          <SearchVolumeTrendChart data={searchAnalytics?.searchesOverTime ?? []} />
        </PinnableChartCard>
        <PinnableChartCard chartId="search-analytics" descriptionKey="charts.descriptions.searchAnalytics">
          <SearchAnalyticsChart data={searchAnalytics?.topQueries ?? []} />
        </PinnableChartCard>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <PinnableChartCard chartId="top-search-ips" descriptionKey="charts.descriptions.topSearchIps">
          <TopSearchIpsChart data={searchAnalytics?.topIps ?? []} />
        </PinnableChartCard>
        <div />
      </div>
    </div>
  )
}
