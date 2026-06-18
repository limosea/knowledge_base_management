import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { statsApi } from '@/api'
import type {
  ContentDistribution,
  EmbeddingCoverage,
  SearchAnalytics,
  ApiKeyUsage,
  AuditAnalytics,
  RequestAnalytics,
} from '@/types'
import { Skeleton } from '@/components/ui/skeleton'
import { CategoryPieChart } from '@/components/charts/CategoryPieChart'
import { QualityDistributionChart } from '@/components/charts/QualityDistributionChart'
import { TopTagsChart } from '@/components/charts/TopTagsChart'
import { DifficultyDistributionChart } from '@/components/charts/DifficultyDistributionChart'
import { LanguageDistributionChart } from '@/components/charts/LanguageDistributionChart'
import { ApiKeyStatusChart } from '@/components/charts/ApiKeyStatusChart'
import { ApiKeyDetailDialog } from '@/components/charts/ApiKeyDetailDialog'
import { RequestTrendChart } from '@/components/charts/RequestTrendChart'
import { ActionStatsChart } from '@/components/charts/ActionStatsChart'
import { ActivityTrendChart } from '@/components/charts/ActivityTrendChart'
import { StatusDistributionChart } from '@/components/charts/StatusDistributionChart'
import { TopErrorsTable } from '@/components/charts/TopErrorsTable'
import { EmbeddingCoverageChart } from '@/components/charts/EmbeddingCoverageChart'
import { SearchAnalyticsChart } from '@/components/charts/SearchAnalyticsChart'
import { SearchVolumeTrendChart } from '@/components/charts/SearchVolumeTrendChart'
import { TopSearchIpsChart } from '@/components/charts/TopSearchIpsChart'
import { SearchKpiRow } from '@/components/charts/SearchKpiRow'
import { StatusCodeDistributionChart } from '@/components/charts/StatusCodeDistributionChart'
import { LatencyStatsCard } from '@/components/charts/LatencyStatsCard'
import { TopEndpointsTable } from '@/components/charts/TopEndpointsTable'

export function AnalyticsPage() {
  const { t } = useTranslation()
  const [contentDistribution, setContentDistribution] = useState<ContentDistribution | null>(null)
  const [embeddingCoverage, setEmbeddingCoverage] = useState<EmbeddingCoverage | null>(null)
  const [searchAnalytics, setSearchAnalytics] = useState<SearchAnalytics | null>(null)
  const [apiKeyUsage, setApiKeyUsage] = useState<ApiKeyUsage | null>(null)
  const [auditAnalytics, setAuditAnalytics] = useState<AuditAnalytics | null>(null)
  const [requestAnalytics, setRequestAnalytics] = useState<RequestAnalytics | null>(null)
  const [loading, setLoading] = useState(true)

  const [drillOpen, setDrillOpen] = useState(false)
  const [selectedKey, setSelectedKey] = useState<{ id: string; name: string } | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          content,
          embedding,
          search,
          apiKeys,
          audit,
          requests,
        ] = await Promise.all([
          statsApi.getContentDistribution(),
          statsApi.getEmbeddingCoverage(),
          statsApi.getSearchAnalytics({ period: 'day' }),
          statsApi.getApiKeyUsage(),
          statsApi.getAuditAnalytics({ period: 'day' }),
          statsApi.getRequestAnalytics({ period: 'day' }),
        ])
        setContentDistribution(content)
        setEmbeddingCoverage(embedding)
        setSearchAnalytics(search)
        setApiKeyUsage(apiKeys)
        setAuditAnalytics(audit)
        setRequestAnalytics(requests)
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="space-y-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="h-6 w-40 mb-4" />
              <div className="grid gap-4 lg:grid-cols-2">
                <Skeleton className="h-[350px]" />
                <Skeleton className="h-[350px]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const handleKeyClick = (item: { apiKeyId: string; apiKeyName: string }) => {
    setSelectedKey({ id: item.apiKeyId, name: item.apiKeyName })
    setDrillOpen(true)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t('analytics.title')}</h1>

      <div className="space-y-10">
        {/* Section 1: Knowledge Analysis */}
        <section>
          <h2 className="text-xl font-semibold mb-4">
            {t('analytics.knowledgeAnalysis')}
          </h2>
          <div className="grid gap-4 lg:grid-cols-2">
            <CategoryPieChart data={contentDistribution?.byFramework ?? []} />
            <QualityDistributionChart
              data={contentDistribution?.qualityScoreDistribution ?? []}
            />
          </div>
          <div className="grid gap-4 lg:grid-cols-3 mt-4">
            <TopTagsChart data={contentDistribution?.topTags ?? []} />
            <DifficultyDistributionChart
              data={contentDistribution?.byDifficulty ?? []}
            />
            <LanguageDistributionChart
              data={contentDistribution?.byLanguage ?? []}
            />
          </div>
        </section>

        {/* Section 2: Search Analysis */}
        <section>
          <h2 className="text-xl font-semibold mb-4">
            {t('analytics.searchAnalysis')}
          </h2>
          <div className="mb-4">
            <SearchKpiRow data={searchAnalytics} />
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <SearchVolumeTrendChart
              data={searchAnalytics?.searchesOverTime ?? []}
            />
            <SearchAnalyticsChart data={searchAnalytics?.topQueries ?? []} />
          </div>
          <div className="grid gap-4 lg:grid-cols-2 mt-4">
            <TopSearchIpsChart data={searchAnalytics?.topIps ?? []} />
            <EmbeddingCoverageChart data={embeddingCoverage} />
          </div>
        </section>

        {/* Section 3: API Analysis */}
        <section>
          <h2 className="text-xl font-semibold mb-4">
            {t('analytics.apiAnalysis')}
          </h2>
          <div className="grid gap-4 lg:grid-cols-3">
            <StatusCodeDistributionChart
              statusCodes={requestAnalytics?.statusCodeDistribution ?? []}
              successRate={requestAnalytics?.successRate}
            />
            <ApiKeyStatusChart
              data={apiKeyUsage?.keys ?? []}
              onKeyClick={handleKeyClick}
            />
            <RequestTrendChart
              data={requestAnalytics?.requestVolumeTrend ?? []}
            />
          </div>
          <div className="mt-4">
            <TopEndpointsTable data={requestAnalytics?.topEndpoints ?? []} />
          </div>
        </section>

        {/* Section 4: Performance & Audit */}
        <section>
          <h2 className="text-xl font-semibold mb-4">
            {t('analytics.performanceAndAudit')}
          </h2>
          <div className="grid gap-4 lg:grid-cols-2">
            <LatencyStatsCard data={requestAnalytics?.latencyStats} />
            <ActionStatsChart data={auditAnalytics?.byAction ?? []} />
          </div>
          <div className="grid gap-4 lg:grid-cols-2 mt-4">
            <ActivityTrendChart data={auditAnalytics?.trend ?? []} />
            <StatusDistributionChart data={auditAnalytics?.byStatus ?? []} />
          </div>
          <div className="mt-4">
            <TopErrorsTable data={auditAnalytics?.topErrors ?? []} />
          </div>
        </section>
      </div>

      <ApiKeyDetailDialog
        keyId={selectedKey?.id ?? null}
        keyName={selectedKey?.name ?? null}
        open={drillOpen}
        onOpenChange={setDrillOpen}
      />
    </div>
  )
}
