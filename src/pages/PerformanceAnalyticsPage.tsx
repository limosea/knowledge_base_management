import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { PerformanceAuditSection } from '@/components/analytics/PerformanceAuditSection'
import { StatsFilterBar } from '@/components/charts/StatsFilterBar'
import type { StatsFilterState } from '@/components/charts/StatsFilterBar'

export function PerformanceAnalyticsPage() {
  const { t } = useTranslation()
  const [filter, setFilter] = useState<StatsFilterState>({ period: 'day' })
  
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">{t('analytics.performanceAndAudit')}</h1>
      <StatsFilterBar value={filter} onChange={setFilter} />
      <PerformanceAuditSection filter={filter} />
    </div>
  )
}
