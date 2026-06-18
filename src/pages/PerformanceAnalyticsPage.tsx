import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { PerformanceAuditSection } from '@/components/analytics/PerformanceAuditSection'
import { StatsFilterBar } from '@/components/charts/StatsFilterBar'
import type { FilterState } from '@/components/charts/StatsFilterBar'

export function PerformanceAnalyticsPage() {
  const { t } = useTranslation()
  const [filter, setFilter] = useState<FilterState | null>(null)
  
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">{t('analytics.performanceAndAudit')}</h1>
      <StatsFilterBar onFilterChange={setFilter} />
      {filter && <PerformanceAuditSection filter={filter} />}
    </div>
  )
}
