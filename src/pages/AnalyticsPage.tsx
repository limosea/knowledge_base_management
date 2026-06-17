import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { statsApi } from '@/api'
import type { 
  ContentDistribution, 
  EmbeddingCoverage, 
  SearchAnalytics, 
  ApiKeyUsage, 
  AuditAnalytics, 
  RequestAnalytics 
} from '@/types'
import { Skeleton } from '@/components/ui/skeleton'
import { CategoryPieChart } from '@/components/charts/CategoryPieChart'
import { QualityBarChart } from '@/components/charts/QualityBarChart'
import { ApiKeyStatusChart } from '@/components/charts/ApiKeyStatusChart'
import { RequestTrendChart } from '@/components/charts/RequestTrendChart'
import { ActionStatsChart } from '@/components/charts/ActionStatsChart'
import { ActivityTrendChart } from '@/components/charts/ActivityTrendChart'
import { EmbeddingCoverageChart } from '@/components/charts/EmbeddingCoverageChart'
import { SearchAnalyticsChart } from '@/components/charts/SearchAnalyticsChart'
import { LatencyStatsCard } from '@/components/charts/LatencyStatsCard'

export function AnalyticsPage() {
  const { t } = useTranslation()
  const [contentDistribution, setContentDistribution] = useState<ContentDistribution | null>(null)
  const [embeddingCoverage, setEmbeddingCoverage] = useState<EmbeddingCoverage | null>(null)
  const [searchAnalytics, setSearchAnalytics] = useState<SearchAnalytics | null>(null)
  const [apiKeyUsage, setApiKeyUsage] = useState<ApiKeyUsage | null>(null)
  const [auditAnalytics, setAuditAnalytics] = useState<AuditAnalytics | null>(null)
  const [requestAnalytics, setRequestAnalytics] = useState<RequestAnalytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          content,
          embedding,
          search,
          apiKeys,
          audit,
          requests
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
          <div>
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="grid gap-4 lg:grid-cols-2">
              <Skeleton className="h-[350px]" />
              <Skeleton className="h-[350px]" />
            </div>
          </div>
          <div>
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="grid gap-4 lg:grid-cols-2">
              <Skeleton className="h-[350px]" />
              <Skeleton className="h-[350px]" />
            </div>
          </div>
          <div>
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="grid gap-4 lg:grid-cols-2">
              <Skeleton className="h-[350px]" />
              <Skeleton className="h-[350px]" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t('analytics.title')}</h1>

      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            📚 {t('analytics.knowledgeAnalysis')}
          </h2>
          <div className="grid gap-4 lg:grid-cols-2">
            <CategoryPieChart
              data={contentDistribution?.byFramework ?? []}
            />
            <QualityBarChart
              data={contentDistribution?.qualityScoreDistribution ?? []}
            />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            🔍 {t('analytics.searchAnalysis')}
          </h2>
          <div className="grid gap-4 lg:grid-cols-2">
            <SearchAnalyticsChart data={searchAnalytics} />
            <EmbeddingCoverageChart data={embeddingCoverage} />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            🔐 {t('analytics.apiAnalysis')}
          </h2>
          <div className="grid gap-4 lg:grid-cols-2">
            <ApiKeyStatusChart
              data={apiKeyUsage?.keys ?? []}
            />
            <RequestTrendChart
              data={requestAnalytics?.requestVolumeTrend ?? []}
            />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            📊 {t('analytics.performanceAnalysis')}
          </h2>
          <div className="grid gap-4 lg:grid-cols-2">
            <LatencyStatsCard data={requestAnalytics?.latencyStats} />
            <ActionStatsChart data={auditAnalytics?.byAction ?? []} />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            📋 {t('analytics.auditAnalysis')}
          </h2>
          <div className="grid gap-4 lg:grid-cols-2">
            <ActivityTrendChart data={auditAnalytics?.trend ?? []} />
          </div>
        </div>
      </div>
    </div>
  )
}
