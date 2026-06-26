import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MyKnowledgeSection } from '@/components/analytics/MyKnowledgeSection'
import { MySearchSection } from '@/components/analytics/MySearchSection'
import { MyApiUsageSection } from '@/components/analytics/MyApiUsageSection'
import { StatsFilterBar } from '@/components/charts/StatsFilterBar'
import type { StatsFilterState } from '@/components/charts/StatsFilterBar'

export function MyAnalyticsPage() {
  const { t } = useTranslation()
  const [filter, setFilter] = useState<StatsFilterState>({ period: 'day' })

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">{t('myAnalytics.title')}</h1>
      <StatsFilterBar value={filter} onChange={setFilter} />

      <section>
        <h2 className="text-xl font-semibold mb-4">{t('myAnalytics.knowledgeSection')}</h2>
        <MyKnowledgeSection filter={filter} />
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">{t('myAnalytics.searchSection')}</h2>
        <MySearchSection filter={filter} />
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">{t('myAnalytics.apiUsageSection')}</h2>
        <MyApiUsageSection filter={filter} />
      </section>
    </div>
  )
}
