import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { MyApiUsageSection } from '@/components/analytics/MyApiUsageSection'
import { StatsFilterBar } from '@/components/charts/StatsFilterBar'
import type { StatsFilterState } from '@/components/charts/StatsFilterBar'

export function MyApiAnalyticsPage() {
  const { t } = useTranslation()
  const [filter, setFilter] = useState<StatsFilterState>({ period: 'day' })

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">{t('myAnalytics.apiUsageSection')}</h1>
      <StatsFilterBar value={filter} onChange={setFilter} />
      <MyApiUsageSection filter={filter} />
    </div>
  )
}
