import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { ApiAnalysisSection } from '@/components/analytics/ApiAnalysisSection'
import { StatsFilterBar } from '@/components/charts/StatsFilterBar'
import type { StatsFilterState } from '@/components/charts/StatsFilterBar'

export function ApiAnalyticsPage() {
  const { t } = useTranslation()
  const [filter, setFilter] = useState<StatsFilterState>({ period: 'day' })
  
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">{t('analytics.apiAnalysis')}</h1>
      <StatsFilterBar value={filter} onChange={setFilter} />
      <ApiAnalysisSection filter={filter} />
    </div>
  )
}
