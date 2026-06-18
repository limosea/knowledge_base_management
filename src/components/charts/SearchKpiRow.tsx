import { useTranslation } from 'react-i18next'
import { Search, Target, SearchX } from 'lucide-react'
import { StatCard } from './StatCard'
import type { SearchAnalytics } from '@/types'

interface SearchKpiRowProps {
  data: SearchAnalytics | null
}

export function SearchKpiRow({ data }: SearchKpiRowProps) {
  const { t } = useTranslation()

  const total = data?.totalSearches ?? 0
  const withResults = data?.hitRate.with_results ?? 0
  const noResults = data?.hitRate.no_results ?? 0
  const hitTotal = data?.hitRate.total ?? 0

  const hitRatePct = hitTotal > 0 ? ((withResults / hitTotal) * 100).toFixed(1) : '0.0'
  const noResultPct = hitTotal > 0 ? ((noResults / hitTotal) * 100).toFixed(1) : '0.0'

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <StatCard
        title={t('charts.totalSearches')}
        value={total}
        icon={Search}
      />
      <StatCard
        title={t('charts.hitRate')}
        value={`${hitRatePct}%`}
        icon={Target}
        description={`${withResults.toLocaleString()} / ${hitTotal.toLocaleString()}`}
      />
      <StatCard
        title={t('charts.noResultRate')}
        value={`${noResultPct}%`}
        icon={SearchX}
        description={`${noResults.toLocaleString()} / ${hitTotal.toLocaleString()}`}
      />
    </div>
  )
}
