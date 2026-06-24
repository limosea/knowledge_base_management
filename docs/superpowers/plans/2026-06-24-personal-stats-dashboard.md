# Personal Stats Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement personal statistics dashboard for regular users, using the new `/admin/me/stats/*` backend endpoints, with summary cards on the dashboard and a dedicated analytics page.

**Architecture:** Add TypeScript types for personal stats endpoints, extend `meApi` with new methods, create reusable wrapper components that fetch from personal endpoints and feed existing chart components, add a new `MyAnalyticsPage`, update the dashboard with enhanced summary cards, add navigation and routing.

**Tech Stack:** React 19, TypeScript, Recharts, React Router v7, react-i18next, Tailwind CSS, Radix UI

## Global Constraints

- Follow existing code patterns (component structure, API client usage, i18n keys)
- All chart components already exist and accept data props - reuse them, don't recreate
- `KnowledgeTrendsChart` fetches data internally - create a new `PersonalKnowledgeTrendsChart` that accepts data prop
- No new dependencies - use existing libraries only
- i18n: add both `en` and `zh` translations for all new strings

---

## File Structure

| File | Action | Purpose |
|------|--------|---------|
| `src/types/index.ts` | Modify | Add `MyDashboardStats`, `MyKnowledgeTrends`, `MyContentDistribution`, `MyEmbeddingCoverage`, `MySearchAnalytics`, `MyApiKeyUsage`, `MyApiKeyUsageDetail` types |
| `src/api/me.ts` | Modify | Add `getDashboardStats`, `getKnowledgeTrends`, `getContentDistribution`, `getEmbeddingCoverage`, `getSearchAnalytics`, `getApiKeyUsage`, `getApiKeyUsageDetail` methods |
| `src/components/charts/PersonalKnowledgeTrendsChart.tsx` | Create | Recharts line chart accepting `KnowledgeTrends` data prop with period selector |
| `src/components/analytics/MyKnowledgeSection.tsx` | Create | Fetches personal knowledge trends + content distribution, renders charts |
| `src/components/analytics/MySearchSection.tsx` | Create | Fetches personal search analytics, renders search charts |
| `src/components/analytics/MyApiUsageSection.tsx` | Create | Fetches personal API key usage, renders usage table + detail |
| `src/components/analytics/MyEmbeddingSection.tsx` | Create | Fetches personal embedding coverage, renders coverage card |
| `src/pages/MyAnalyticsPage.tsx` | Create | Dedicated personal analytics page composing all sections |
| `src/pages/index.ts` | Modify | Export `MyAnalyticsPage` |
| `src/router.tsx` | Modify | Add `/me/analytics` route |
| `src/components/layout/MainLayout.tsx` | Modify | Add "My Analytics" nav item |
| `src/pages/DashboardPage.tsx` | Modify | Enhance personal overview with more cards + link to analytics |
| `src/i18n/index.ts` | Modify | Add translations for new nav item and section titles |

---

### Task 1: Add TypeScript Types for Personal Stats Endpoints

**Files:**
- Modify: `src/types/index.ts:468-477`

**Interfaces:**
- Produces: `MyDashboardStats`, `MyKnowledgeTrends`, `MyContentDistribution`, `MyEmbeddingCoverage`, `MySearchAnalytics`, `MyApiKeyUsage`, `MyApiKeyUsageDetail` types

- [ ] **Step 1: Add new type definitions**

Append the following types after the existing `MyStats` interface (line 477) in `src/types/index.ts`:

```typescript
export interface MyDashboardStats {
  knowledgeEntries: {
    total: number
    avgQualityScore: number
    createdThisWeek: number
  }
  apiKeys: {
    total: number
    active: number
  }
  requests: {
    today: number
  }
  embeddingCoverage: {
    totalEntries: number
    withEmbedding: number
    withoutEmbedding: number
    coveragePercent: number
  }
  topTags: Array<{ tag: string; count: number }>
}

export interface MyKnowledgeTrends {
  period: string
  from: string
  to: string
  created: Array<{ date: string; count: number }>
  updated: Array<{ date: string; count: number }>
  deleted: Array<{ date: string; count: number }>
}

export interface MyContentDistribution {
  topTags: Array<{ tag: string; count: number }>
  byFramework: Array<{ framework: string; count: number }>
  byDifficulty: Array<{ level: number; count: number }>
  byLanguage: Array<{ language: string; count: number }>
  qualityScoreDistribution: Array<{ bucket: string; count: number }>
}

export interface MyEmbeddingCoverage {
  totalEntries: number
  withEmbedding: number
  withoutEmbedding: number
  coveragePercent: number
  batchStatusSummary: null
  latestBatch: null
}

export interface MySearchAnalytics {
  period: string
  from: string
  to: string
  totalSearches: number
  searchesOverTime: Array<{ date: string; count: number }>
  topQueries: Array<{ query: string; count: number }>
  topIps: Array<{ ip: string; count: number }>
  hitRate: {
    total: number
    with_results: number
    no_results: number
  }
}

export interface MyApiKeyUsage {
  from: string
  to: string
  keys: Array<{
    apiKeyId: string
    apiKeyName: string
    totalRequests: number
    lastActiveAt: string
  }>
}

export interface MyApiKeyUsageDetail {
  keyId: string
  from: string
  to: string
  totalRequests: number
  byAction: Array<{ action: string; count: number }>
  trend: Array<{ date: string; count: number }>
}
```

- [ ] **Step 2: Verify typecheck passes**

Run: `npx tsc --noEmit`
Expected: No errors

---

### Task 2: Extend meApi with Personal Stats Methods

**Files:**
- Modify: `src/api/me.ts`

**Interfaces:**
- Consumes: Types from Task 1
- Produces: `meApi.getDashboardStats()`, `meApi.getKnowledgeTrends()`, `meApi.getContentDistribution()`, `meApi.getEmbeddingCoverage()`, `meApi.getSearchAnalytics()`, `meApi.getApiKeyUsage()`, `meApi.getApiKeyUsageDetail()`

- [ ] **Step 1: Add imports for new types**

Update the import in `src/api/me.ts` to include the new types:

```typescript
import type {
  MyApiKey,
  MyApiKeyListResponse,
  MyStats,
  MyDashboardStats,
  MyKnowledgeTrends,
  MyContentDistribution,
  MyEmbeddingCoverage,
  MySearchAnalytics,
  MyApiKeyUsage,
  MyApiKeyUsageDetail,
  CreateApiKeyRequest,
  UpdateApiKeyRequest,
} from '@/types'
```

- [ ] **Step 2: Add new API methods**

Append the following methods to the `meApi` object in `src/api/me.ts`:

```typescript
  getDashboardStats: (): Promise<MyDashboardStats> => {
    return apiClient.get<MyDashboardStats>('/admin/me/stats')
  },

  getKnowledgeTrends: (params?: {
    period?: 'day' | 'week' | 'month'
    from?: string
    to?: string
  }): Promise<MyKnowledgeTrends> => {
    const searchParams = new URLSearchParams()
    if (params?.period) searchParams.set('period', params.period)
    if (params?.from) searchParams.set('from', params.from)
    if (params?.to) searchParams.set('to', params.to)
    const query = searchParams.toString()
    return apiClient.get<MyKnowledgeTrends>(`/admin/me/stats/knowledge-trends${query ? `?${query}` : ''}`)
  },

  getContentDistribution: (): Promise<MyContentDistribution> => {
    return apiClient.get<MyContentDistribution>('/admin/me/stats/content-distribution')
  },

  getEmbeddingCoverage: (): Promise<MyEmbeddingCoverage> => {
    return apiClient.get<MyEmbeddingCoverage>('/admin/me/stats/embedding-coverage')
  },

  getSearchAnalytics: (params?: {
    period?: 'day' | 'week' | 'month'
    from?: string
    to?: string
    topN?: number
  }): Promise<MySearchAnalytics> => {
    const searchParams = new URLSearchParams()
    if (params?.period) searchParams.set('period', params.period)
    if (params?.from) searchParams.set('from', params.from)
    if (params?.to) searchParams.set('to', params.to)
    if (params?.topN) searchParams.set('topN', String(params.topN))
    const query = searchParams.toString()
    return apiClient.get<MySearchAnalytics>(`/admin/me/stats/search-analytics${query ? `?${query}` : ''}`)
  },

  getApiKeyUsage: (params?: {
    from?: string
    to?: string
  }): Promise<MyApiKeyUsage> => {
    const searchParams = new URLSearchParams()
    if (params?.from) searchParams.set('from', params.from)
    if (params?.to) searchParams.set('to', params.to)
    const query = searchParams.toString()
    return apiClient.get<MyApiKeyUsage>(`/admin/me/stats/api-key-usage${query ? `?${query}` : ''}`)
  },

  getApiKeyUsageDetail: (keyId: string, params?: {
    period?: 'day' | 'week' | 'month'
    from?: string
    to?: string
  }): Promise<MyApiKeyUsageDetail> => {
    const searchParams = new URLSearchParams()
    if (params?.period) searchParams.set('period', params.period)
    if (params?.from) searchParams.set('from', params.from)
    if (params?.to) searchParams.set('to', params.to)
    const query = searchParams.toString()
    return apiClient.get<MyApiKeyUsageDetail>(`/admin/me/stats/api-key-usage/${keyId}${query ? `?${query}` : ''}`)
  },
```

- [ ] **Step 3: Verify typecheck passes**

Run: `npx tsc --noEmit`
Expected: No errors

---

### Task 3: Create PersonalKnowledgeTrendsChart Component

**Files:**
- Create: `src/components/charts/PersonalKnowledgeTrendsChart.tsx`

**Interfaces:**
- Consumes: `KnowledgeTrends` type from `@/types`
- Produces: `<PersonalKnowledgeTrendsChart data={trends} />` component

This is needed because the existing `KnowledgeTrendsChart` fetches its own data from `statsApi.getKnowledgeTrends()` internally. The personal version accepts data as a prop.

- [ ] **Step 1: Create the component**

Create `src/components/charts/PersonalKnowledgeTrendsChart.tsx`:

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

- [ ] **Step 2: Verify typecheck passes**

Run: `npx tsc --noEmit`
Expected: No errors

---

### Task 4: Create MyKnowledgeSection Component

**Files:**
- Create: `src/components/analytics/MyKnowledgeSection.tsx`

**Interfaces:**
- Consumes: `meApi.getKnowledgeTrends()`, `meApi.getContentDistribution()`, `meApi.getEmbeddingCoverage()`
- Produces: `<MyKnowledgeSection />` component

- [ ] **Step 1: Create the component**

Create `src/components/analytics/MyKnowledgeSection.tsx`:

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

- [ ] **Step 2: Verify typecheck passes**

Run: `npx tsc --noEmit`
Expected: No errors

---

### Task 5: Create MySearchSection Component

**Files:**
- Create: `src/components/analytics/MySearchSection.tsx`

**Interfaces:**
- Consumes: `meApi.getSearchAnalytics()`
- Produces: `<MySearchSection />` component

- [ ] **Step 1: Create the component**

Create `src/components/analytics/MySearchSection.tsx`:

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

- [ ] **Step 2: Verify typecheck passes**

Run: `npx tsc --noEmit`
Expected: No errors

---

### Task 6: Create MyApiUsageSection Component

**Files:**
- Create: `src/components/analytics/MyApiUsageSection.tsx`

**Interfaces:**
- Consumes: `meApi.getApiKeyUsage()`, `meApi.getApiKeyUsageDetail()`
- Produces: `<MyApiUsageSection />` component

- [ ] **Step 1: Create the component**

Create `src/components/analytics/MyApiUsageSection.tsx`:

```typescript
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { meApi } from '@/api'
import type { MyApiKeyUsage, MyApiKeyUsageDetail } from '@/types'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatCard } from '@/components/charts/StatCard'
import { TopApiKeysTable } from '@/components/charts/TopApiKeysTable'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
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

- [ ] **Step 2: Verify typecheck passes**

Run: `npx tsc --noEmit`
Expected: No errors

---

### Task 7: Create MyAnalyticsPage

**Files:**
- Create: `src/pages/MyAnalyticsPage.tsx`
- Modify: `src/pages/index.ts`

**Interfaces:**
- Consumes: `MyKnowledgeSection`, `MySearchSection`, `MyApiUsageSection`
- Produces: `<MyAnalyticsPage />` exported from pages index

- [ ] **Step 1: Create the page**

Create `src/pages/MyAnalyticsPage.tsx`:

```typescript
import { useTranslation } from 'react-i18next'
import { MyKnowledgeSection } from '@/components/analytics/MyKnowledgeSection'
import { MySearchSection } from '@/components/analytics/MySearchSection'
import { MyApiUsageSection } from '@/components/analytics/MyApiUsageSection'

export function MyAnalyticsPage() {
  const { t } = useTranslation()

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">{t('myAnalytics.title')}</h1>

      <section>
        <h2 className="text-xl font-semibold mb-4">{t('myAnalytics.knowledgeSection')}</h2>
        <MyKnowledgeSection />
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">{t('myAnalytics.searchSection')}</h2>
        <MySearchSection />
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">{t('myAnalytics.apiUsageSection')}</h2>
        <MyApiUsageSection />
      </section>
    </div>
  )
}
```

- [ ] **Step 2: Export from pages index**

Add to `src/pages/index.ts`:

```typescript
export { MyAnalyticsPage } from './MyAnalyticsPage'
```

- [ ] **Step 3: Verify typecheck passes**

Run: `npx tsc --noEmit`
Expected: No errors

---

### Task 8: Add Route and Navigation

**Files:**
- Modify: `src/router.tsx`
- Modify: `src/components/layout/MainLayout.tsx`

**Interfaces:**
- Consumes: `MyAnalyticsPage`
- Produces: `/me/analytics` route, "My Analytics" nav item

- [ ] **Step 1: Add route to router.tsx**

In `src/router.tsx`, add import for `MyAnalyticsPage` and add the route under the `MainLayout` children (after the `/messages` route, around line 91):

```typescript
import {
  // ... existing imports ...
  MyAnalyticsPage,
} from '@/pages'
```

Add route entry:

```typescript
      {
        path: '/me/analytics',
        element: <MyAnalyticsPage />,
      },
```

- [ ] **Step 2: Add nav item to MainLayout**

In `src/components/layout/MainLayout.tsx`, import `BarChart3` from lucide-react:

```typescript
import {
  // ... existing imports ...
  BarChart3,
} from 'lucide-react'
```

Add a new nav item to the `navSections` personal console section (after the messages item, around line 67):

```typescript
      {
        path: '/me/analytics',
        icon: BarChart3,
        labelKey: 'nav.myAnalytics',
      },
```

- [ ] **Step 3: Verify typecheck passes**

Run: `npx tsc --noEmit`
Expected: No errors

---

### Task 9: Add i18n Translations

**Files:**
- Modify: `src/i18n/index.ts`

**Interfaces:**
- Produces: English and Chinese translations for new nav item and analytics page sections

- [ ] **Step 1: Add English translations**

In the `en` translation object, add to the `nav` section (after `messages`):

```typescript
myAnalytics: 'My Analytics',
```

Add new `myAnalytics` section after `elevation`:

```typescript
myAnalytics: {
  title: 'My Analytics',
  knowledgeSection: 'Knowledge Analysis',
  searchSection: 'Search Analysis',
  apiUsageSection: 'API Usage',
},
```

- [ ] **Step 2: Add Chinese translations**

In the `zh` translation object, add to the `nav` section (after `messages`):

```typescript
myAnalytics: '我的分析',
```

Add new `myAnalytics` section after `elevation`:

```typescript
myAnalytics: {
  title: '我的分析',
  knowledgeSection: '知识库分析',
  searchSection: '搜索分析',
  apiUsageSection: 'API 使用',
},
```

- [ ] **Step 3: Verify typecheck passes**

Run: `npx tsc --noEmit`
Expected: No errors

---

### Task 10: Enhance DashboardPage with Personal Stats

**Files:**
- Modify: `src/pages/DashboardPage.tsx`

**Interfaces:**
- Consumes: `meApi.getDashboardStats()`
- Produces: Enhanced personal overview section with embedding coverage + top tags + link to analytics

- [ ] **Step 1: Update imports and state**

Update the imports in `DashboardPage.tsx` to include the new type and link component:

```typescript
import { Link } from 'react-router-dom'
import type { DashboardStats, RequestAnalytics, SystemHealth, MyStats, MyDashboardStats } from '@/types'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { BarChart3 } from 'lucide-react'
```

Add state for the new dashboard stats:

```typescript
const [myDashboardStats, setMyDashboardStats] = useState<MyDashboardStats | null>(null)
```

- [ ] **Step 2: Fetch enhanced personal stats**

In the `useEffect`, add a fetch for the enhanced personal stats:

```typescript
fetchers.push(
  meApi.getDashboardStats().then((d) => { if (!cancelled) setMyDashboardStats(d) }).catch(() => {}),
)
```

- [ ] **Step 3: Enhance personal overview section**

Replace the personal overview section (lines 109-129) with an enhanced version that shows embedding coverage, top tags, and a link to analytics:

```tsx
<div>
  <div className="flex items-center justify-between mb-3">
    <h2 className="text-lg font-semibold text-muted-foreground">{t('dashboard.personalOverview')}</h2>
    <Button variant="ghost" size="sm" asChild>
      <Link to="/me/analytics">
        <BarChart3 className="h-4 w-4 mr-1" />
        {t('nav.myAnalytics')}
      </Link>
    </Button>
  </div>
  <div className="grid gap-4 md:grid-cols-3">
    <StatCard
      title={t('dashboard.myApiKeys')}
      value={myStats?.apiKeys?.active ?? 0}
      icon={Key}
      description={`${t('dashboard.total')}: ${myStats?.apiKeys?.total ?? 0}`}
    />
    <StatCard
      title={t('dashboard.myTodayRequests')}
      value={myStats?.requests?.today ?? 0}
      icon={Activity}
    />
    <StatCard
      title={t('dashboard.myWeekRequests')}
      value={myStats?.requests?.thisWeek ?? 0}
      icon={Activity}
    />
  </div>
  {myDashboardStats && (
    <div className="mt-4 grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">{t('charts.embeddingCoverage')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{t('charts.withEmbedding')}: {myDashboardStats.embeddingCoverage.withEmbedding}</span>
              <span>{t('charts.withoutEmbedding')}: {myDashboardStats.embeddingCoverage.withoutEmbedding}</span>
            </div>
            <Progress value={myDashboardStats.embeddingCoverage.coveragePercent} />
            <p className="text-xs text-muted-foreground text-right">
              {myDashboardStats.embeddingCoverage.coveragePercent.toFixed(1)}%
            </p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">{t('charts.topTags')}</CardTitle>
        </CardHeader>
        <CardContent>
          {myDashboardStats.topTags.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {myDashboardStats.topTags.slice(0, 10).map((tag) => (
                <span key={tag.tag} className="px-2 py-0.5 bg-muted rounded text-xs">
                  {tag.tag} ({tag.count})
                </span>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">{t('charts.noData')}</div>
          )}
        </CardContent>
      </Card>
    </div>
  )}
</div>
```

- [ ] **Step 4: Verify typecheck passes**

Run: `npx tsc --noEmit`
Expected: No errors

---

### Task 11: Verify Build

**Files:**
- None (verification only)

- [ ] **Step 1: Run full build**

Run: `npm run build`
Expected: Build succeeds with no errors

- [ ] **Step 2: Run dev server and verify pages load**

Run: `npm run dev` (in background)
Then verify:
- `/dashboard` loads with enhanced personal overview (embedding coverage + top tags + analytics link)
- `/me/analytics` loads with knowledge, search, and API usage sections
- Navigation sidebar shows "My Analytics" item
- Clicking "My Analytics" link from dashboard navigates correctly
- All charts render without errors
- Language toggle works (English/Chinese)

- [ ] **Step 3: Clean up**

Kill the dev server process.

---

## Spec Self-Review

1. **Spec coverage:** All 6 new personal stats endpoints are covered: dashboard summary, knowledge trends, content distribution, embedding coverage, search analytics, API key usage (+ detail). Dashboard enhanced with summary cards + link. Dedicated analytics page created with all sections.

2. **Placeholder scan:** No TBD/TODO found. All code blocks contain complete implementations.

3. **Type consistency:** All type names match between tasks (MyDashboardStats, MyKnowledgeTrends, etc.). API method names are consistent (meApi.getDashboardStats, meApi.getKnowledgeTrends, etc.). Chart component props match the types they consume.
