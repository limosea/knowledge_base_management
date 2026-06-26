import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { KnowledgeAnalysisSection } from '@/components/analytics/KnowledgeAnalysisSection'
import { StatsFilterBar } from '@/components/charts/StatsFilterBar'
import type { StatsFilterState } from '@/components/charts/StatsFilterBar'

export function KnowledgeAnalyticsPage() {
  const { t } = useTranslation()
  const [filter, setFilter] = useState<StatsFilterState>({ period: 'day' })
  
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">{t('analytics.knowledgeAnalysis')}</h1>
      <StatsFilterBar value={filter} onChange={setFilter} />
      <KnowledgeAnalysisSection filter={filter} />
    </div>
  )
}
