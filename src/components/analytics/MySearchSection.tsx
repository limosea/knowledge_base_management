import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { meApi } from '@/api'
import type { MySearchAnalytics } from '@/types'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatCard } from '@/components/charts/StatCard'
import { SearchVolumeTrendChart } from '@/components/charts/SearchVolumeTrendChart'
import { TopSearchIpsChart } from '@/components/charts/TopSearchIpsChart'
import { Search } from 'lucide-react'
import type { StatsFilterState } from '@/components/charts/StatsFilterBar'

interface MySearchSectionProps {
  filter?: StatsFilterState
}

export function MySearchSection({ filter }: MySearchSectionProps) {
  const { t } = useTranslation()
  const [data, setData] = useState<MySearchAnalytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    meApi.getSearchAnalytics({ period: filter?.period, from: filter?.from, to: filter?.to })
      .then((d) => { if (!cancelled) setData(d) })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [filter?.period, filter?.from, filter?.to])

  if (loading && !data) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <Skeleton className="h-[300px]" />
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-[300px]" />
          <Skeleton className="h-[300px]" />
        </div>
      </div>
    )
  }

  const hitRate = data?.hitRate
    ? data.hitRate.total > 0
      ? `${((data.hitRate.with_results / data.hitRate.total) * 100).toFixed(1)}%`
      : '0%'
    : '0%'

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title={t('charts.totalSearches')}
          value={data?.totalSearches ?? 0}
          icon={Search}
        />
        <StatCard
          title={t('charts.hitRate')}
          value={hitRate}
          icon={Search}
        />
        <StatCard
          title={t('charts.noResultRate')}
          value={
            data?.hitRate && data.hitRate.total > 0
              ? `${((data.hitRate.no_results / data.hitRate.total) * 100).toFixed(1)}%`
              : '0%'
          }
          icon={Search}
        />
      </div>
      <SearchVolumeTrendChart data={data?.searchesOverTime ?? []} />
      <div className="grid gap-4 lg:grid-cols-2">
        <TopSearchIpsChart data={data?.topIps ?? []} />
        <Card>
          <CardHeader>
            <CardTitle>{t('charts.searchQueries')}</CardTitle>
          </CardHeader>
          <CardContent>
            {data?.topQueries && data.topQueries.length > 0 ? (
              <div className="space-y-2">
                {data.topQueries.slice(0, 10).map((q, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="truncate mr-2">{q.query}</span>
                    <span className="font-mono text-muted-foreground">{q.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                {t('charts.noData')}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}