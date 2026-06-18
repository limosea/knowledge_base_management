import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { SearchAnalysisSection } from '@/components/analytics/SearchAnalysisSection'
import { StatsFilterBar } from '@/components/charts/StatsFilterBar'
import type { FilterState } from '@/components/charts/StatsFilterBar'

export function SearchAnalyticsPage() {
  const { t } = useTranslation()
  const [filter, setFilter] = useState<FilterState | null>(null)
  
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">{t('analytics.searchAnalysis')}</h1>
      <StatsFilterBar onFilterChange={setFilter} />
      {filter && <SearchAnalysisSection filter={filter} />}
    </div>
  )
}
