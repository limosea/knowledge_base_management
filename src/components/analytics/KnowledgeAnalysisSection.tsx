import { useEffect, useState } from 'react'
import { statsApi } from '@/api'
import type { ContentDistribution, EmbeddingCoverage } from '@/types'
import { Skeleton } from '@/components/ui/skeleton'
import { CategoryPieChart } from '@/components/charts/CategoryPieChart'
import { QualityDistributionChart } from '@/components/charts/QualityDistributionChart'
import { TopTagsChart } from '@/components/charts/TopTagsChart'
import { DifficultyDistributionChart } from '@/components/charts/DifficultyDistributionChart'
import { LanguageDistributionChart } from '@/components/charts/LanguageDistributionChart'
import { EmbeddingCoverageChart } from '@/components/charts/EmbeddingCoverageChart'
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
      statsApi.getContentDistribution(),
      statsApi.getEmbeddingCoverage(),
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
        <CategoryPieChart data={contentDistribution?.byFramework ?? []} />
        <QualityDistributionChart
          data={contentDistribution?.qualityScoreDistribution ?? []}
        />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <TopTagsChart data={contentDistribution?.topTags ?? []} />
        <DifficultyDistributionChart
          data={contentDistribution?.byDifficulty ?? []}
        />
        <LanguageDistributionChart
          data={contentDistribution?.byLanguage ?? []}
        />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <EmbeddingCoverageChart data={embeddingCoverage} />
      </div>
    </div>
  )
}
