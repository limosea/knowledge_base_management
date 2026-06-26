import { useEffect, useState } from 'react'
import { meApi } from '@/api'
import type { MyKnowledgeTrends, MyContentDistribution, MyEmbeddingCoverage } from '@/types'
import { Skeleton } from '@/components/ui/skeleton'
import { PersonalKnowledgeTrendsChart } from '@/components/charts/PersonalKnowledgeTrendsChart'
import { QualityDistributionChart } from '@/components/charts/QualityDistributionChart'
import { TopTagsChart } from '@/components/charts/TopTagsChart'
import { DifficultyDistributionChart } from '@/components/charts/DifficultyDistributionChart'
import { LanguageDistributionChart } from '@/components/charts/LanguageDistributionChart'
import { EmbeddingCoverageChart } from '@/components/charts/EmbeddingCoverageChart'
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
      <PersonalKnowledgeTrendsChart data={trends} />
      <div className="grid gap-4 lg:grid-cols-2">
        <QualityDistributionChart data={contentDist?.qualityScoreDistribution ?? []} />
        <EmbeddingCoverageChart data={embedding} />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <TopTagsChart data={contentDist?.topTags ?? []} />
        <DifficultyDistributionChart data={contentDist?.byDifficulty ?? []} />
        <LanguageDistributionChart data={contentDist?.byLanguage ?? []} />
      </div>
    </div>
  )
}