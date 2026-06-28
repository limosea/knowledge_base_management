import { useEffect, useState } from 'react'
import { statsApi } from '@/api'
import type { ContentDistribution, EmbeddingCoverage } from '@/types'
import { Skeleton } from '@/components/ui/skeleton'
import { QualityDistributionChart } from '@/components/charts/QualityDistributionChart'
import { TopTagsChart } from '@/components/charts/TopTagsChart'
import { CategoryDistributionChart } from '@/components/charts/CategoryDistributionChart'
import { LanguageDistributionChart } from '@/components/charts/LanguageDistributionChart'
import { EmbeddingCoverageChart } from '@/components/charts/EmbeddingCoverageChart'
import { PinnableChartCard } from '@/components/charts/PinnableChartCard'
import type { StatsFilterState } from '@/components/charts/StatsFilterBar'

interface KnowledgeAnalysisSectionProps {
  filter?: StatsFilterState
}

export function KnowledgeAnalysisSection({ filter }: KnowledgeAnalysisSectionProps) {
  const [contentDistribution, setContentDistribution] = useState<ContentDistribution | null>(null)
  const [embeddingCoverage, setEmbeddingCoverage] = useState<EmbeddingCoverage | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    Promise.all([
      statsApi.getContentDistribution({ from: filter?.from, to: filter?.to }),
      statsApi.getEmbeddingCoverage({ from: filter?.from, to: filter?.to }),
    ])
      .then(([content, embedding]) => {
        if (cancelled) return
        setContentDistribution(content)
        setEmbeddingCoverage(embedding)
      })
      .catch(() => {
        // keep previous data on error
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [filter?.period, filter?.from, filter?.to])

  if (loading && !contentDistribution) {
    return (
      <div className="space-y-4">
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
      <div className="grid gap-4 lg:grid-cols-2">
        <PinnableChartCard chartId="quality-distribution" descriptionKey="charts.descriptions.qualityDistribution">
          <QualityDistributionChart data={contentDistribution?.qualityScoreDistribution ?? []} />
        </PinnableChartCard>
        <PinnableChartCard chartId="embedding-coverage" descriptionKey="charts.descriptions.embeddingCoverage">
          <EmbeddingCoverageChart data={embeddingCoverage} />
        </PinnableChartCard>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <PinnableChartCard chartId="top-tags" descriptionKey="charts.descriptions.topTags">
          <TopTagsChart data={contentDistribution?.topTags ?? []} />
        </PinnableChartCard>
        <PinnableChartCard chartId="category-distribution" descriptionKey="charts.descriptions.categoryDistribution">
          <CategoryDistributionChart data={contentDistribution?.byCategory ?? []} />
        </PinnableChartCard>
        <PinnableChartCard chartId="language-distribution" descriptionKey="charts.descriptions.languageDistribution">
          <LanguageDistributionChart data={contentDistribution?.byLanguage ?? []} />
        </PinnableChartCard>
      </div>
    </div>
  )
}
