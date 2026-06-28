import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { meApi } from '@/api'
import type { MySearchAnalyticsContentInsights } from '@/types'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatCard } from '@/components/charts/StatCard'
import { SearchVolumeTrendChart } from '@/components/charts/SearchVolumeTrendChart'
import { PinnableChartCard } from '@/components/charts/PinnableChartCard'
import { Eye, FileText, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { StatsFilterState } from '@/components/charts/StatsFilterBar'

interface ContentInsightsSectionProps {
  filter?: StatsFilterState
}

export function ContentInsightsSection({ filter }: ContentInsightsSectionProps) {
  const { t } = useTranslation()
  const [data, setData] = useState<MySearchAnalyticsContentInsights | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    meApi.getSearchAnalytics({
      period: filter?.period,
      from: filter?.from,
      to: filter?.to,
      perspective: 'contentInsights',
    })
      .then((d) => { if (!cancelled && d.perspective === 'contentInsights') setData(d) })
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

  if (!data) return null

  return (
    <div className="space-y-4">
      {/* KPI cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title={t('charts.totalHitsOnMyContent')}
          value={data.totalHitsOnMyContent}
          icon={Eye}
          description={t('charts.totalHitsOnMyContentDesc')}
        />
        <StatCard
          title={t('charts.topFoundEntry')}
          value={data.topFoundEntries.length > 0 ? data.topFoundEntries[0].title : '-'}
          icon={FileText}
          description={t('charts.topFoundEntryDesc')}
        />
        <StatCard
          title={t('charts.topReferralQuery')}
          value={data.topReferralQueries.length > 0 ? data.topReferralQueries[0].query : '-'}
          icon={Search}
          description={t('charts.topReferralQueryDesc')}
        />
      </div>

      {/* Hits over time */}
      <PinnableChartCard chartId="content-hits-trend" descriptionKey="charts.descriptions.contentHitsTrend">
        <SearchVolumeTrendChart data={data.hitsOverTime} />
      </PinnableChartCard>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Top found entries */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              {t('charts.topFoundEntries')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.topFoundEntries.length > 0 ? (
              <div className="space-y-2">
                {data.topFoundEntries.map((entry, i) => (
                  <div key={entry.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-5 text-right font-mono text-xs ${i < 3 ? 'text-amber-500 font-bold' : 'text-muted-foreground'}`}>
                        {i + 1}
                      </span>
                      <Link to={`/entry/${entry.id}`} className="truncate hover:underline text-foreground">
                        {entry.title}
                      </Link>
                    </div>
                    <span className="font-mono text-muted-foreground text-xs shrink-0 ml-2">
                      {entry.hitCount} {t('charts.hitCount')}
                    </span>
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

        {/* Top referral queries */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              {t('charts.topReferralQueries')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.topReferralQueries.length > 0 ? (
              <div className="space-y-2">
                {data.topReferralQueries.map((q, i) => (
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
