# Personal Analytics Components Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create 4 components (1 chart + 3 section components) for the personal stats dashboard.

**Architecture:** Reusable presentational chart components with data props, orchestrated by section components that fetch data via `meApi`.

**Tech Stack:** React 19, TypeScript, Recharts, shadcn/ui, react-i18next

## Global Constraints

- TypeScript strict mode
- Existing chart components accept data props (not fetch internally)
- Use existing `meApi` methods from `src/api/me.ts`
- Use existing types from `src/types/index.ts`

## File Structure

| File | Action | Purpose |
|------|--------|---------|
| `src/components/charts/PersonalKnowledgeTrendsChart.tsx` | Create | Presentational line chart for knowledge trends |
| `src/components/analytics/MyKnowledgeSection.tsx` | Create | Orchestrator for personal knowledge analytics |
| `src/components/analytics/MySearchSection.tsx` | Create | Orchestrator for personal search analytics |
| `src/components/analytics/MyApiUsageSection.tsx` | Create | Orchestrator for personal API key usage |

---

### Task 1: Create PersonalKnowledgeTrendsChart

**Files:**
- Create: `src/components/charts/PersonalKnowledgeTrendsChart.tsx`

**Interfaces:**
- Consumes: `KnowledgeTrends` (or `MyKnowledgeTrends`) from `@/types`
- Produces: `PersonalKnowledgeTrendsChart` component exported as named export

- [ ] **Step 1: Create file with exact code from spec**

```typescript
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { KnowledgeTrends } from '@/types'

interface PersonalKnowledgeTrendsChartProps {
  data: KnowledgeTrends | null
}

export function PersonalKnowledgeTrendsChart({ data }: PersonalKnowledgeTrendsChartProps) {
  const { t } = useTranslation()

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('charts.knowledgeTrends')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            {t('charts.noData')}
          </div>
        </CardContent>
      </Card>
    )
  }

  const chartData = data.created.map((item, i) => ({
    date: item.date,
    created: item.count,
    updated: data.updated[i]?.count ?? 0,
    deleted: data.deleted[i]?.count ?? 0,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('charts.knowledgeTrends')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="created" stroke="hsl(var(--chart-1))" name={t('charts.created')} />
              <Line type="monotone" dataKey="updated" stroke="hsl(var(--chart-2))" name={t('charts.updated')} />
              <Line type="monotone" dataKey="deleted" stroke="hsl(var(--chart-3))" name={t('charts.deleted')} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 2: Note type issue** — `KnowledgeTrends` is the admin type. MyKnowledgeSection passes `MyKnowledgeTrends`. Fix in Task 2 integration step if tsc fails.

---

### Task 2: Create MyKnowledgeSection

**Files:**
- Create: `src/components/analytics/MyKnowledgeSection.tsx`

**Interfaces:**
- Consumes: `MyKnowledgeTrends`, `MyContentDistribution`, `MyEmbeddingCoverage` from `@/types`
- Uses: `meApi` from `@/api`
- Produces: `MyKnowledgeSection` component

- [ ] **Step 1: Create file with exact code from spec**

```typescript
import { useEffect, useState } from 'react'
import { meApi } from '@/api'
import type { MyKnowledgeTrends, MyContentDistribution, MyEmbeddingCoverage } from '@/types'
import { Skeleton } from '@/components/ui/skeleton'
import { PersonalKnowledgeTrendsChart } from '@/components/charts/PersonalKnowledgeTrendsChart'
import { CategoryPieChart } from '@/components/charts/CategoryPieChart'
import { QualityDistributionChart } from '@/components/charts/QualityDistributionChart'
import { TopTagsChart } from '@/components/charts/TopTagsChart'
import { DifficultyDistributionChart } from '@/components/charts/DifficultyDistributionChart'
import { LanguageDistributionChart } from '@/components/charts/LanguageDistributionChart'
import { EmbeddingCoverageChart } from '@/components/charts/EmbeddingCoverageChart'

export function MyKnowledgeSection() {
  const [trends, setTrends] = useState<MyKnowledgeTrends | null>(null)
  const [contentDist, setContentDist] = useState<MyContentDistribution | null>(null)
  const [embedding, setEmbedding] = useState<MyEmbeddingCoverage | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    Promise.all([
      meApi.getKnowledgeTrends({ period: 'week' }),
      meApi.getContentDistribution(),
      meApi.getEmbeddingCoverage(),
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
  }, [])

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
        <CategoryPieChart data={contentDist?.byFramework ?? []} />
        <QualityDistributionChart data={contentDist?.qualityScoreDistribution ?? []} />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <TopTagsChart data={contentDist?.topTags ?? []} />
        <DifficultyDistributionChart data={contentDist?.byDifficulty ?? []} />
        <LanguageDistributionChart data={contentDist?.byLanguage ?? []} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <EmbeddingCoverageChart data={embedding} />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Fix type issues if tsc fails** — `PersonalKnowledgeTrendsChart` expects `KnowledgeTrends` but receives `MyKnowledgeTrends`. Fix chart type to `MyKnowledgeTrends`. `EmbeddingCoverageChart` expects `EmbeddingCoverage` but receives `MyEmbeddingCoverage`. Fix chart type to accept `MyEmbeddingCoverage`.

---

### Task 3: Create MySearchSection

**Files:**
- Create: `src/components/analytics/MySearchSection.tsx`

**Interfaces:**
- Consumes: `MySearchAnalytics` from `@/types`
- Uses: `meApi` from `@/api`
- Produces: `MySearchSection` component

- [ ] **Step 1: Create file with exact code from spec**

```typescript
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { meApi } from '@/api'
import type { MySearchAnalytics } from '@/types'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatCard } from '@/components/charts/StatCard'
import { SearchVolumeTrendChart } from '@/components/charts/SearchVolumeTrendChart'
import { TopSearchIpsChart } from '@/components/charts/TopSearchIpsChart'
import { Search } from 'lucide-react'

export function MySearchSection() {
  const { t } = useTranslation()
  const [data, setData] = useState<MySearchAnalytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    meApi.getSearchAnalytics({ period: 'day' })
      .then((d) => { if (!cancelled) setData(d) })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  if (loading && !data) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <Skeleton className="h-[300px]" />
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-[300px]" />
          <Skeleton className="h-[300px]" />
        </div>
      </div>
    )
  }

  const hitRate = data?.hitRate
    ? data.hitRate.total > 0
      ? `${((data.hitRate.with_results / data.hitRate.total) * 100).toFixed(1)}%`
      : '0%'
    : '0%'

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title={t('charts.totalSearches')}
          value={data?.totalSearches ?? 0}
          icon={Search}
        />
        <StatCard
          title={t('charts.hitRate')}
          value={hitRate}
          icon={Search}
        />
        <StatCard
          title={t('charts.noResultRate')}
          value={
            data?.hitRate && data.hitRate.total > 0
              ? `${((data.hitRate.no_results / data.hitRate.total) * 100).toFixed(1)}%`
              : '0%'
          }
          icon={Search}
        />
      </div>
      <SearchVolumeTrendChart data={data?.searchesOverTime ?? []} />
      <div className="grid gap-4 lg:grid-cols-2">
        <TopSearchIpsChart data={data?.topIps ?? []} />
        <Card>
          <CardHeader>
            <CardTitle>{t('charts.searchQueries')}</CardTitle>
          </CardHeader>
          <CardContent>
            {data?.topQueries && data.topQueries.length > 0 ? (
              <div className="space-y-2">
                {data.topQueries.slice(0, 10).map((q, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="truncate mr-2">{q.query}</span>
                    <span className="font-mono text-muted-foreground">{q.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                {t('charts.noData')}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
```

---

### Task 4: Create MyApiUsageSection

**Files:**
- Create: `src/components/analytics/MyApiUsageSection.tsx`

**Interfaces:**
- Consumes: `MyApiKeyUsage`, `MyApiKeyUsageDetail` from `@/types`
- Uses: `meApi` from `@/api`
- Produces: `MyApiUsageSection` component

- [ ] **Step 1: Create file with exact code from spec**

```typescript
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { meApi } from '@/api'
import type { MyApiKeyUsage, MyApiKeyUsageDetail } from '@/types'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatCard } from '@/components/charts/StatCard'
import { TopApiKeysTable } from '@/components/charts/TopApiKeysTable'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Key } from 'lucide-react'

export function MyApiUsageSection() {
  const { t } = useTranslation()
  const [usage, setUsage] = useState<MyApiKeyUsage | null>(null)
  const [detail, setDetail] = useState<MyApiKeyUsageDetail | null>(null)
  const [selectedKeyId, setSelectedKeyId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    meApi.getApiKeyUsage()
      .then((d) => {
        if (cancelled) return
        setUsage(d)
        if (d.keys.length > 0) {
          setSelectedKeyId(d.keys[0].apiKeyId)
        }
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (!selectedKeyId) return
    let cancelled = false
    meApi.getApiKeyUsageDetail(selectedKeyId, { period: 'day' })
      .then((d) => { if (!cancelled) setDetail(d) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [selectedKeyId])

  if (loading && !usage) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <Skeleton className="h-[300px]" />
        <Skeleton className="h-[300px]" />
      </div>
    )
  }

  const totalRequests = usage?.keys.reduce((sum, k) => sum + k.totalRequests, 0) ?? 0

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title={t('charts.apiKeyUsage')}
          value={totalRequests}
          icon={Key}
        />
        <StatCard
          title={t('dashboard.myApiKeys')}
          value={usage?.keys.length ?? 0}
          icon={Key}
        />
      </div>
      <TopApiKeysTable
        data={usage?.keys.map(k => ({ name: k.apiKeyName, count: k.totalRequests }))}
      />
      {usage && usage.keys.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('charts.apiKeyDetail')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4 flex-wrap">
              {usage.keys.map((k) => (
                <button
                  key={k.apiKeyId}
                  onClick={() => setSelectedKeyId(k.apiKeyId)}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    selectedKeyId === k.apiKeyId
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {k.apiKeyName}
                </button>
              ))}
            </div>
            {detail && detail.totalRequests > 0 ? (
              <div className="space-y-4">
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={detail.trend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="hsl(var(--chart-1))" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                {detail.byAction.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">{t('charts.actionBreakdown')}</h4>
                    <div className="space-y-1">
                      {detail.byAction.map((a, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span>{a.action}</span>
                          <span className="font-mono text-muted-foreground">{a.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                {t('charts.noData')}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
```

---

### Task 5: Type Check and Fix

- [ ] **Step 1: Run `npx tsc --noEmit`** — Check for type errors
- [ ] **Step 2: Fix any type mismatches** — Likely:
  - `PersonalKnowledgeTrendsChart` type: `KnowledgeTrends` → `MyKnowledgeTrends`
  - `EmbeddingCoverageChart` type: `EmbeddingCoverage` → `MyEmbeddingCoverage`
- [ ] **Step 3: Re-run `npx tsc --noEmit`** — Verify clean

### Task 6: Commit

- [ ] **Step 1: Stage and commit**

```bash
git add src/components/charts/PersonalKnowledgeTrendsChart.tsx src/components/analytics/MyKnowledgeSection.tsx src/components/analytics/MySearchSection.tsx src/components/analytics/MyApiUsageSection.tsx
git commit -m "feat: add personal analytics chart and section components"
```
