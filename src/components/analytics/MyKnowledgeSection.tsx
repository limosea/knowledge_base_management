import { useEffect, useState } from 'react'
import { meApi } from '@/api'
import type { MyKnowledgeTrends, MyContentDistribution, MyEmbeddingCoverage } from '@/types'
import { Skeleton } from '@/components/ui/skeleton'
import { PersonalKnowledgeTrendsChart } from '@/components/charts/PersonalKnowledgeTrendsChart'
import { QualityDistributionChart } from '@/components/charts/QualityDistributionChart'
import { TopTagsChart } from '@/components/charts/TopTagsChart'
import { CategoryDistributionChart } from '@/components/charts/CategoryDistributionChart'
import { LanguageDistributionChart } from '@/components/charts/LanguageDistributionChart'
import { EmbeddingCoverageChart } from '@/components/charts/EmbeddingCoverageChart'
import { PinnableChartCard } from '@/components/charts/PinnableChartCard'
import type { StatsFilterState } from '@/components/charts/StatsFilterBar'

interface MyKnowledgeSectionProps {
  filter?: StatsFilterState
}

export function MyKnowledgeSection({ filter }: MyKnowledgeSectionProps) {
  const [trends, setTrends] = useState<MyKnowledgeTrends | null>(null)
  const [contentDist, setContentDist] = useState<MyContentDistribution | null>(null)
  const [embedding, setEmbedding] = useState<MyEmbeddingCoverage | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    Promise.all([
      meApi.getKnowledgeTrends({ period: filter?.period, from: filter?.from, to: filter?.to }),
      meApi.getContentDistribution({ from: filter?.from, to: filter?.to }),
      meApi.getEmbeddingCoverage({ from: filter?.from, to: filter?.to }),
    ])
      .then(([t, c, e]) => {
        if (cancelled) return
        setTrends(t)
        setContentDist(c)
        setEmbedding(e)
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [filter?.period, filter?.from, filter?.to])

  if (loading && !trends) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[300px]" />
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-[350px]" />
          <Skeleton className="h-[350px]" />
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-[350px]" />
          <Skeleton className="h-[350px]" />
          <Skeleton className="h-[350px]" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <PinnableChartCard chartId="personal-knowledge-trends" descriptionKey="charts.descriptions.personalKnowledgeTrends">
        <PersonalKnowledgeTrendsChart data={trends} />
      </PinnableChartCard>
      <div className="grid gap-4 lg:grid-cols-2">
        <PinnableChartCard chartId="quality-distribution" descriptionKey="charts.descriptions.qualityDistribution">
          <QualityDistributionChart data={contentDist?.qualityScoreDistribution ?? []} />
        </PinnableChartCard>
        <PinnableChartCard chartId="embedding-coverage" descriptionKey="charts.descriptions.embeddingCoverage">
          <EmbeddingCoverageChart data={embedding} />
        </PinnableChartCard>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <PinnableChartCard chartId="top-tags" descriptionKey="charts.descriptions.topTags">
          <TopTagsChart data={contentDist?.topTags ?? []} />
        </PinnableChartCard>
        <PinnableChartCard chartId="category-distribution" descriptionKey="charts.descriptions.categoryDistribution">
          <CategoryDistributionChart data={contentDist?.byCategory ?? []} />
        </PinnableChartCard>
        <PinnableChartCard chartId="language-distribution" descriptionKey="charts.descriptions.languageDistribution">
          <LanguageDistributionChart data={contentDist?.byLanguage ?? []} />
        </PinnableChartCard>
      </div>
    </div>
  )
}