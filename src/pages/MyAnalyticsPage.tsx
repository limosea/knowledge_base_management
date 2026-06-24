import { useTranslation } from 'react-i18next'
import { MyKnowledgeSection } from '@/components/analytics/MyKnowledgeSection'
import { MySearchSection } from '@/components/analytics/MySearchSection'
import { MyApiUsageSection } from '@/components/analytics/MyApiUsageSection'

export function MyAnalyticsPage() {
  const { t } = useTranslation()

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">{t('myAnalytics.title')}</h1>

      <section>
        <h2 className="text-xl font-semibold mb-4">{t('myAnalytics.knowledgeSection')}</h2>
        <MyKnowledgeSection />
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">{t('myAnalytics.searchSection')}</h2>
        <MySearchSection />
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">{t('myAnalytics.apiUsageSection')}</h2>
        <MyApiUsageSection />
      </section>
    </div>
  )
}
