import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { MySearchSection } from '@/components/analytics/MySearchSection'
import { ContentInsightsSection } from '@/components/analytics/ContentInsightsSection'
import { LeaderboardSection } from '@/components/charts/LeaderboardSection'
import { PinnableChartCard } from '@/components/charts/PinnableChartCard'
import { StatsFilterBar } from '@/components/charts/StatsFilterBar'
import { Button } from '@/components/ui/button'
import type { StatsFilterState } from '@/components/charts/StatsFilterBar'
import { Search, Eye } from 'lucide-react'

type SubView = 'searchActivity' | 'contentInsights'

export function MySearchAnalyticsPage() {
  const { t } = useTranslation()
  const [filter, setFilter] = useState<StatsFilterState>({ period: 'day' })
  const [subView, setSubView] = useState<SubView>('searchActivity')

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">{t('myAnalytics.searchSection')}</h1>

      {/* Sub-navigation tabs */}
      <div className="flex gap-2">
        <Button
          variant={subView === 'searchActivity' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSubView('searchActivity')}
          className="flex items-center gap-1.5"
        >
          <Search className="h-4 w-4" />
          {t('myAnalytics.searchActivity')}
        </Button>
        <Button
          variant={subView === 'contentInsights' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSubView('contentInsights')}
          className="flex items-center gap-1.5"
        >
          <Eye className="h-4 w-4" />
          {t('myAnalytics.contentInsights')}
        </Button>
      </div>

      {/* Sub-view description */}
      <p className="text-muted-foreground text-sm">
        {subView === 'searchActivity'
          ? t('myAnalytics.searchActivityDesc')
          : t('myAnalytics.contentInsightsDesc')}
      </p>

      <StatsFilterBar value={filter} onChange={setFilter} />

      {/* Sub-view content */}
      {subView === 'searchActivity' ? (
        <MySearchSection filter={filter} />
      ) : (
        <ContentInsightsSection filter={filter} />
      )}

      {/* Leaderboards: personal (my content accessed) + global (site-wide public) */}
      <div className="grid gap-4 lg:grid-cols-2">
        <PinnableChartCard chartId="personal-leaderboard" descriptionKey="charts.descriptions.personalLeaderboard">
          <LeaderboardSection scope="personal" />
        </PinnableChartCard>
        <PinnableChartCard chartId="global-leaderboard" descriptionKey="charts.descriptions.globalLeaderboard">
          <LeaderboardSection scope="global" />
        </PinnableChartCard>
      </div>
    </div>
  )
}
