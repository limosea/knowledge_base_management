import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { ApiAnalysisSection } from '@/components/analytics/ApiAnalysisSection'
import { StatsFilterBar } from '@/components/charts/StatsFilterBar'
import type { FilterState } from '@/components/charts/StatsFilterBar'

export function ApiAnalyticsPage() {
  const { t } = useTranslation()
  const [filter, setFilter] = useState<FilterState | null>(null)
  
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">{t('analytics.apiAnalysis')}</h1>
      <StatsFilterBar onFilterChange={setFilter} />
      {filter && <ApiAnalysisSection filter={filter} />}
    </div>
  )
}
