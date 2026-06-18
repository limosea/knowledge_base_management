import { useTranslation } from 'react-i18next'
import { KnowledgeAnalysisSection } from '@/components/analytics/KnowledgeAnalysisSection'

export function KnowledgeAnalyticsPage() {
  const { t } = useTranslation()
  
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">{t('analytics.knowledgeAnalysis')}</h1>
      <KnowledgeAnalysisSection />
    </div>
  )
}
