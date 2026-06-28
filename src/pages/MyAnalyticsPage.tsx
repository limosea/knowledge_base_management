import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MyKnowledgeSection } from '@/components/analytics/MyKnowledgeSection'
import { MySearchSection } from '@/components/analytics/MySearchSection'
import { MyApiUsageSection } from '@/components/analytics/MyApiUsageSection'
import { StatsFilterBar } from '@/components/charts/StatsFilterBar'
import type { StatsFilterState } from '@/components/charts/StatsFilterBar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Search, Key } from 'lucide-react'

export function MyAnalyticsPage() {
  const { t } = useTranslation()
  const [filter, setFilter] = useState<StatsFilterState>({ period: 'day' })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{t('myAnalytics.title')}</h1>
        <p className="text-muted-foreground mt-1">{t('myAnalytics.description')}</p>
      </div>
      <StatsFilterBar value={filter} onChange={setFilter} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            {t('myAnalytics.knowledgeSection')}
          </CardTitle>
          <CardDescription>{t('myAnalytics.knowledgeDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <MyKnowledgeSection filter={filter} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            {t('myAnalytics.searchSection')}
          </CardTitle>
          <CardDescription>{t('myAnalytics.searchDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <MySearchSection filter={filter} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            {t('myAnalytics.apiUsageSection')}
          </CardTitle>
          <CardDescription>{t('myAnalytics.apiUsageDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <MyApiUsageSection filter={filter} />
        </CardContent>
      </Card>
    </div>
  )
}
