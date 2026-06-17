# 统计模块重新设计实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 重新设计和实现知识库管理系统的统计模块，确保前端实现与OpenAPI文档完全一致。

**Architecture:** 创建独立的统计API模块，更新类型定义，重构DashboardPage和AnalyticsPage使用正确的API，更新图表组件以适配新的数据结构。

**Tech Stack:** React, TypeScript, Axios, Recharts, Tailwind CSS

## Global Constraints

- 使用现有的项目结构和代码风格
- 保持与现有组件的兼容性
- 确保TypeScript类型安全
- 遵循项目的ESLint规则

## 文件结构

### 新建文件
- `src/api/stats.ts` - 统计API模块
- `src/components/charts/KnowledgeTrendsChart.tsx` - 知识条目趋势图表
- `src/components/charts/EmbeddingCoverageChart.tsx` - 嵌入覆盖率图表
- `src/components/charts/SearchAnalyticsChart.tsx` - 搜索分析图表
- `src/components/charts/LatencyStatsCard.tsx` - 延迟统计卡片

### 修改文件
- `src/types/index.ts` - 添加统计类型定义
- `src/api/index.ts` - 导出统计API模块
- `src/pages/DashboardPage.tsx` - 重构使用正确的API
- `src/pages/AnalyticsPage.tsx` - 重构使用正确的API
- `src/components/charts/RequestTrendChart.tsx` - 更新数据适配
- `src/components/charts/CategoryPieChart.tsx` - 更新数据适配
- `src/components/charts/QualityBarChart.tsx` - 更新数据适配
- `src/components/charts/ApiKeyStatusChart.tsx` - 更新数据适配
- `src/components/charts/ActionStatsChart.tsx` - 更新数据适配
- `src/components/charts/ActivityTimeline.tsx` - 更新数据适配

---

### Task 1: 创建统计API模块

**Files:**
- Create: `src/api/stats.ts`
- Modify: `src/api/index.ts`

**Interfaces:**
- Consumes: `apiClient` from `./client`
- Produces: `statsApi` object with all statistics methods

- [ ] **Step 1: 创建统计API模块基础结构**

```typescript
import { apiClient } from './client'
import type {
  DashboardStats,
  KnowledgeTrends,
  ContentDistribution,
  EmbeddingCoverage,
  SearchAnalytics,
  ApiKeyUsage,
  ApiKeyUsageDetail,
  AuditAnalytics,
  RequestAnalytics,
} from '@/types'

export const statsApi = {
  // Dashboard聚合摘要
  getDashboard: (): Promise<DashboardStats> => {
    return apiClient.get<DashboardStats>('/admin/stats/dashboard')
  },
  
  // 知识条目时间趋势
  getKnowledgeTrends: (params?: {
    period?: 'day' | 'week' | 'month'
    from?: string
    to?: string
  }): Promise<KnowledgeTrends> => {
    const searchParams = new URLSearchParams()
    if (params?.period) searchParams.set('period', params.period)
    if (params?.from) searchParams.set('from', params.from)
    if (params?.to) searchParams.set('to', params.to)
    const query = searchParams.toString()
    return apiClient.get<KnowledgeTrends>(`/admin/stats/knowledge-trends${query ? `?${query}` : ''}`)
  },
  
  // 内容多维分布统计
  getContentDistribution: (): Promise<ContentDistribution> => {
    return apiClient.get<ContentDistribution>('/admin/stats/content-distribution')
  },
  
  // 嵌入覆盖率统计
  getEmbeddingCoverage: (): Promise<EmbeddingCoverage> => {
    return apiClient.get<EmbeddingCoverage>('/admin/stats/embedding-coverage')
  },
  
  // 搜索行为分析
  getSearchAnalytics: (params?: {
    period?: 'day' | 'week' | 'month'
    from?: string
    to?: string
    topN?: number
  }): Promise<SearchAnalytics> => {
    const searchParams = new URLSearchParams()
    if (params?.period) searchParams.set('period', params.period)
    if (params?.from) searchParams.set('from', params.from)
    if (params?.to) searchParams.set('to', params.to)
    if (params?.topN) searchParams.set('topN', String(params.topN))
    const query = searchParams.toString()
    return apiClient.get<SearchAnalytics>(`/admin/stats/search-analytics${query ? `?${query}` : ''}`)
  },
  
  // API Key使用排行
  getApiKeyUsage: (params?: {
    from?: string
    to?: string
  }): Promise<ApiKeyUsage> => {
    const searchParams = new URLSearchParams()
    if (params?.from) searchParams.set('from', params.from)
    if (params?.to) searchParams.set('to', params.to)
    const query = searchParams.toString()
    return apiClient.get<ApiKeyUsage>(`/admin/stats/api-key-usage${query ? `?${query}` : ''}`)
  },
  
  // 单个API Key使用明细
  getApiKeyUsageDetail: (keyId: string, params?: {
    period?: 'day' | 'week' | 'month'
    from?: string
    to?: string
  }): Promise<ApiKeyUsageDetail> => {
    const searchParams = new URLSearchParams()
    if (params?.period) searchParams.set('period', params.period)
    if (params?.from) searchParams.set('from', params.from)
    if (params?.to) searchParams.set('to', params.to)
    const query = searchParams.toString()
    return apiClient.get<ApiKeyUsageDetail>(`/admin/stats/api-key-usage/${keyId}${query ? `?${query}` : ''}`)
  },
  
  // 审计日志分析
  getAuditAnalytics: (params?: {
    period?: 'day' | 'week' | 'month'
    from?: string
    to?: string
  }): Promise<AuditAnalytics> => {
    const searchParams = new URLSearchParams()
    if (params?.period) searchParams.set('period', params.period)
    if (params?.from) searchParams.set('from', params.from)
    if (params?.to) searchParams.set('to', params.to)
    const query = searchParams.toString()
    return apiClient.get<AuditAnalytics>(`/admin/stats/audit-analytics${query ? `?${query}` : ''}`)
  },
  
  // 公开API请求分析
  getRequestAnalytics: (params?: {
    period?: 'day' | 'week' | 'month'
    from?: string
    to?: string
  }): Promise<RequestAnalytics> => {
    const searchParams = new URLSearchParams()
    if (params?.period) searchParams.set('period', params.period)
    if (params?.from) searchParams.set('from', params.from)
    if (params?.to) searchParams.set('to', params.to)
    const query = searchParams.toString()
    return apiClient.get<RequestAnalytics>(`/admin/stats/request-analytics${query ? `?${query}` : ''}`)
  }
}
```

- [ ] **Step 2: 更新API索引文件**

修改 `src/api/index.ts` 添加统计API导出：

```typescript
export { apiClient } from './client'
export { authApi } from './auth'
export { apiKeysApi } from './api-keys'
export { knowledgeApi } from './knowledge'
export { adminUsersApi } from './admin-users'
export { auditLogsApi } from './audit-logs'
export { systemApi } from './system'
export { statsApi } from './stats'
```

- [ ] **Step 3: 验证TypeScript编译**

Run: `npm run build`
Expected: 无TypeScript错误

- [ ] **Step 4: 提交更改**

```bash
git add src/api/stats.ts src/api/index.ts
git commit -m "feat: add stats API module"
```

---

### Task 2: 更新类型定义

**Files:**
- Modify: `src/types/index.ts`

**Interfaces:**
- Consumes: 无
- Produces: 所有统计相关的类型定义

- [ ] **Step 1: 添加Dashboard统计类型**

在 `src/types/index.ts` 文件末尾添加：

```typescript
// ========== 统计相关类型 ==========

// Dashboard统计
export interface DashboardStats {
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
  topApiKeysToday?: Array<{
    name: string
    count: number
  }>
  errorRate?: {
    total: number
    errors: number
  }
}
```

- [ ] **Step 2: 添加知识条目趋势类型**

```typescript
// 知识条目趋势
export interface KnowledgeTrends {
  period: string
  from: string
  to: string
  created: Array<{ date: string; count: number }>
  updated: Array<{ date: string; count: number }>
  deleted: Array<{ date: string; count: number }>
}
```

- [ ] **Step 3: 添加内容分布类型**

```typescript
// 内容分布
export interface ContentDistribution {
  topTags: Array<{ tag: string; count: number }>
  byFramework: Array<{ framework: string; count: number }>
  byDifficulty: Array<{ level: number; count: number }>
  byLanguage: Array<{ language: string; count: number }>
  qualityScoreDistribution: Array<{ bucket: string; count: number }>
}
```

- [ ] **Step 4: 添加嵌入覆盖率类型**

```typescript
// 嵌入覆盖率
export interface EmbeddingCoverage {
  totalEntries: number
  withEmbedding: number
  withoutEmbedding: number
  coveragePercent: number
  batchStatusSummary: Array<Record<string, unknown>>
  latestBatch: Record<string, unknown> | null
}
```

- [ ] **Step 5: 添加搜索分析类型**

```typescript
// 搜索分析
export interface SearchAnalytics {
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
```

- [ ] **Step 6: 添加API Key使用类型**

```typescript
// API Key使用
export interface ApiKeyUsage {
  keys: Array<{
    apiKeyId: string
    apiKeyName: string
    totalRequests: number
    lastActiveAt: string
  }>
}

// API Key使用明细
export interface ApiKeyUsageDetail {
  keyId: string
  totalRequests: number
  byAction: Array<{ action: string; count: number }>
  trend: Array<{ date: string; count: number }>
}
```

- [ ] **Step 7: 添加审计日志分析类型**

```typescript
// 审计日志分析
export interface AuditAnalytics {
  byAction: Array<{ action: string; count: number }>
  byStatus: Array<{ status: string; count: number }>
  topErrors: Array<{ errorMessage: string; action: string; count: number }>
  trend: Array<{ date: string; count: number }>
}
```

- [ ] **Step 8: 添加请求分析类型**

```typescript
// 请求分析
export interface RequestAnalytics {
  period: string
  from: string
  to: string
  statusCodeDistribution: Array<{ code: number; count: number }>
  successRate: {
    total: number
    success2xx: number
    clientError4xx: number
    serverError5xx: number
  }
  requestVolumeTrend: Array<{ date: string; total: number; errors: number }>
  latencyStats: {
    avgMs: number
    p50Ms: number
    p95Ms: number
  }
  topEndpoints: Array<{
    method: string
    path: string
    count: number
    avgResponseTime: number
  }>
}
```

- [ ] **Step 9: 验证TypeScript编译**

Run: `npm run build`
Expected: 无TypeScript错误

- [ ] **Step 10: 提交更改**

```bash
git add src/types/index.ts
git commit -m "feat: add statistics type definitions"
```

---

### Task 3: 重构DashboardPage

**Files:**
- Modify: `src/pages/DashboardPage.tsx`

**Interfaces:**
- Consumes: `statsApi` from `@/api`, `systemApi` from `@/api`
- Produces: 更新后的DashboardPage组件

- [ ] **Step 1: 更新导入和状态定义**

```typescript
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { systemApi, statsApi } from '@/api'
import type { DashboardStats, KnowledgeTrends, RequestAnalytics, SystemHealth } from '@/types'
import { Skeleton } from '@/components/ui/skeleton'
import { BookOpen, Activity, Key } from 'lucide-react'
import { StatCard } from '@/components/charts/StatCard'
import { SystemStatusCard } from '@/components/charts/SystemStatusCard'
import { RequestTrendChart } from '@/components/charts/RequestTrendChart'
import { KnowledgeTrendsChart } from '@/components/charts/KnowledgeTrendsChart'

export function DashboardPage() {
  const { t } = useTranslation()
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)
  const [knowledgeTrends, setKnowledgeTrends] = useState<KnowledgeTrends | null>(null)
  const [requestAnalytics, setRequestAnalytics] = useState<RequestAnalytics | null>(null)
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null)
  const [loading, setLoading] = useState(true)
```

- [ ] **Step 2: 更新数据获取逻辑**

```typescript
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashboard, trends, requests, health] = await Promise.all([
          statsApi.getDashboard(),
          statsApi.getKnowledgeTrends({ period: 'week' }),
          statsApi.getRequestAnalytics({ period: 'day' }),
          systemApi.getHealth(),
        ])
        setDashboardStats(dashboard)
        setKnowledgeTrends(trends)
        setRequestAnalytics(requests)
        setSystemHealth(health)
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])
```

- [ ] **Step 3: 更新加载状态**

```typescript
  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-[300px]" />
          <Skeleton className="h-[300px]" />
        </div>
      </div>
    )
  }
```

- [ ] **Step 4: 更新渲染逻辑**

```typescript
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t('dashboard.title')}</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t('dashboard.knowledgeEntries')}
          value={dashboardStats?.knowledgeEntries?.total ?? 0}
          icon={BookOpen}
        />
        <StatCard
          title={t('dashboard.todayRequests')}
          value={dashboardStats?.requests?.today ?? 0}
          icon={Activity}
        />
        <StatCard
          title={t('dashboard.activeApiKeys')}
          value={dashboardStats?.apiKeys?.active ?? 0}
          icon={Key}
        />
        <SystemStatusCard
          status={systemHealth?.status ?? 'unhealthy'}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <KnowledgeTrendsChart data={knowledgeTrends} />
        <RequestTrendChart 
          data={requestAnalytics?.requestVolumeTrend ?? []} 
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 5: 验证TypeScript编译**

Run: `npm run build`
Expected: 无TypeScript错误

- [ ] **Step 6: 提交更改**

```bash
git add src/pages/DashboardPage.tsx
git commit -m "feat: refactor DashboardPage to use correct API"
```

---

### Task 4: 重构AnalyticsPage

**Files:**
- Modify: `src/pages/AnalyticsPage.tsx`

**Interfaces:**
- Consumes: `statsApi` from `@/api`
- Produces: 更新后的AnalyticsPage组件

- [ ] **Step 1: 更新导入和状态定义**

```typescript
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
import { ActivityTimeline } from '@/components/charts/ActivityTimeline'
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
```

- [ ] **Step 2: 更新数据获取逻辑**

```typescript
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
```

- [ ] **Step 3: 更新加载状态**

```typescript
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
```

- [ ] **Step 4: 更新渲染逻辑**

```typescript
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
            <ActivityTimeline data={auditAnalytics?.trend ?? []} />
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: 验证TypeScript编译**

Run: `npm run build`
Expected: 无TypeScript错误

- [ ] **Step 6: 提交更改**

```bash
git add src/pages/AnalyticsPage.tsx
git commit -m "feat: refactor AnalyticsPage to use correct API"
```

---

### Task 5: 创建新的图表组件

**Files:**
- Create: `src/components/charts/KnowledgeTrendsChart.tsx`
- Create: `src/components/charts/EmbeddingCoverageChart.tsx`
- Create: `src/components/charts/SearchAnalyticsChart.tsx`
- Create: `src/components/charts/LatencyStatsCard.tsx`

**Interfaces:**
- Consumes: `KnowledgeTrends`, `EmbeddingCoverage`, `SearchAnalytics`, `RequestAnalytics` types
- Produces: 图表组件

- [ ] **Step 1: 创建KnowledgeTrendsChart组件**

```typescript
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { KnowledgeTrends } from '@/types'

interface KnowledgeTrendsChartProps {
  data: KnowledgeTrends | null
}

export function KnowledgeTrendsChart({ data }: KnowledgeTrendsChartProps) {
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

  // 合并创建、更新、删除趋势数据
  const chartData = data.created.map((item, index) => ({
    date: item.date,
    created: item.count,
    updated: data.updated[index]?.count ?? 0,
    deleted: data.deleted[index]?.count ?? 0,
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
              <Line type="monotone" dataKey="created" stroke="#8884d8" name={t('charts.created')} />
              <Line type="monotone" dataKey="updated" stroke="#82ca9d" name={t('charts.updated')} />
              <Line type="monotone" dataKey="deleted" stroke="#ffc658" name={t('charts.deleted')} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 2: 创建EmbeddingCoverageChart组件**

```typescript
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import type { EmbeddingCoverage } from '@/types'

interface EmbeddingCoverageChartProps {
  data: EmbeddingCoverage | null
}

export function EmbeddingCoverageChart({ data }: EmbeddingCoverageChartProps) {
  const { t } = useTranslation()

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('charts.embeddingCoverage')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            {t('charts.noData')}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('charts.embeddingCoverage')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{t('charts.coverage')}</span>
            <span>{data.coveragePercent.toFixed(1)}%</span>
          </div>
          <Progress value={data.coveragePercent} className="h-2" />
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground">{t('charts.totalEntries')}</div>
            <div className="font-medium">{data.totalEntries}</div>
          </div>
          <div>
            <div className="text-muted-foreground">{t('charts.withEmbedding')}</div>
            <div className="font-medium">{data.withEmbedding}</div>
          </div>
          <div>
            <div className="text-muted-foreground">{t('charts.withoutEmbedding')}</div>
            <div className="font-medium">{data.withoutEmbedding}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 3: 创建SearchAnalyticsChart组件**

```typescript
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { SearchAnalytics } from '@/types'

interface SearchAnalyticsChartProps {
  data: SearchAnalytics | null
}

export function SearchAnalyticsChart({ data }: SearchAnalyticsChartProps) {
  const { t } = useTranslation()

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('charts.searchAnalytics')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            {t('charts.noData')}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('charts.searchAnalytics')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground">{t('charts.totalSearches')}</div>
            <div className="font-medium">{data.totalSearches}</div>
          </div>
          <div>
            <div className="text-muted-foreground">{t('charts.hitRate')}</div>
            <div className="font-medium">
              {data.hitRate.total > 0 
                ? ((data.hitRate.with_results / data.hitRate.total) * 100).toFixed(1)
                : 0}%
            </div>
          </div>
        </div>
        
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.topQueries.slice(0, 5)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="query" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 4: 创建LatencyStatsCard组件**

```typescript
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock } from 'lucide-react'
import type { RequestAnalytics } from '@/types'

interface LatencyStatsCardProps {
  data: RequestAnalytics['latencyStats'] | undefined
}

export function LatencyStatsCard({ data }: LatencyStatsCardProps) {
  const { t } = useTranslation()

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('charts.latencyStats')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            {t('charts.noData')}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          {t('charts.latencyStats')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{data.avgMs}</div>
            <div className="text-sm text-muted-foreground">{t('charts.avgMs')}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{data.p50Ms}</div>
            <div className="text-sm text-muted-foreground">{t('charts.p50Ms')}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{data.p95Ms}</div>
            <div className="text-sm text-muted-foreground">{t('charts.p95Ms')}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 5: 验证TypeScript编译**

Run: `npm run build`
Expected: 无TypeScript错误

- [ ] **Step 6: 提交更改**

```bash
git add src/components/charts/KnowledgeTrendsChart.tsx src/components/charts/EmbeddingCoverageChart.tsx src/components/charts/SearchAnalyticsChart.tsx src/components/charts/LatencyStatsCard.tsx
git commit -m "feat: add new chart components for statistics"
```

---

### Task 6: 更新现有图表组件

**Files:**
- Modify: `src/components/charts/RequestTrendChart.tsx`
- Modify: `src/components/charts/CategoryPieChart.tsx`
- Modify: `src/components/charts/QualityBarChart.tsx`
- Modify: `src/components/charts/ApiKeyStatusChart.tsx`
- Modify: `src/components/charts/ActionStatsChart.tsx`
- Modify: `src/components/charts/ActivityTimeline.tsx`

**Interfaces:**
- Consumes: 新的类型定义
- Produces: 更新后的图表组件

- [ ] **Step 1: 更新RequestTrendChart组件**

修改 `src/components/charts/RequestTrendChart.tsx`：

```typescript
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface RequestTrendChartProps {
  data: Array<{ date: string; total: number; errors: number }>
}

export function RequestTrendChart({ data }: RequestTrendChartProps) {
  const { t } = useTranslation()

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('charts.requestTrend')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            {t('charts.noData')}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('charts.requestTrend')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="total" stroke="#8884d8" name={t('charts.total')} />
              <Line type="monotone" dataKey="errors" stroke="#ffc658" name={t('charts.errors')} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 2: 更新CategoryPieChart组件**

修改 `src/components/charts/CategoryPieChart.tsx`：

```typescript
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

interface CategoryPieChartProps {
  data: Array<{ framework: string; count: number }>
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

export function CategoryPieChart({ data }: CategoryPieChartProps) {
  const { t } = useTranslation()

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('charts.frameworkDistribution')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] flex items-center justify-center text-muted-foreground">
            {t('charts.noData')}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('charts.frameworkDistribution')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ framework, percent }) => `${framework} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 3: 更新QualityBarChart组件**

修改 `src/components/charts/QualityBarChart.tsx`：

```typescript
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface QualityBarChartProps {
  data: Array<{ bucket: string; count: number }>
}

export function QualityBarChart({ data }: QualityBarChartProps) {
  const { t } = useTranslation()

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('charts.qualityDistribution')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] flex items-center justify-center text-muted-foreground">
            {t('charts.noData')}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('charts.qualityDistribution')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="bucket" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 4: 更新ApiKeyStatusChart组件**

修改 `src/components/charts/ApiKeyStatusChart.tsx`：

```typescript
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface ApiKeyStatusChartProps {
  data: Array<{
    apiKeyId: string
    apiKeyName: string
    totalRequests: number
    lastActiveAt: string
  }>
}

export function ApiKeyStatusChart({ data }: ApiKeyStatusChartProps) {
  const { t } = useTranslation()

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('charts.apiKeyUsage')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] flex items-center justify-center text-muted-foreground">
            {t('charts.noData')}
          </div>
        </CardContent>
      </Card>
    )
  }

  const chartData = data.slice(0, 10).map(item => ({
    name: item.apiKeyName,
    requests: item.totalRequests,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('charts.apiKeyUsage')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="requests" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 5: 更新ActionStatsChart组件**

修改 `src/components/charts/ActionStatsChart.tsx`：

```typescript
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface ActionStatsChartProps {
  data: Array<{ action: string; count: number }>
}

export function ActionStatsChart({ data }: ActionStatsChartProps) {
  const { t } = useTranslation()

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('charts.actionDistribution')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] flex items-center justify-center text-muted-foreground">
            {t('charts.noData')}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('charts.actionDistribution')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="action" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 6: 更新ActivityTimeline组件**

修改 `src/components/charts/ActivityTimeline.tsx`：

```typescript
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface ActivityTimelineProps {
  data: Array<{ date: string; count: number }>
}

export function ActivityTimeline({ data }: ActivityTimelineProps) {
  const { t } = useTranslation()

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('charts.activityTimeline')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] flex items-center justify-center text-muted-foreground">
            {t('charts.noData')}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('charts.activityTimeline')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 7: 验证TypeScript编译**

Run: `npm run build`
Expected: 无TypeScript错误

- [ ] **Step 8: 提交更改**

```bash
git add src/components/charts/RequestTrendChart.tsx src/components/charts/CategoryPieChart.tsx src/components/charts/QualityBarChart.tsx src/components/charts/ApiKeyStatusChart.tsx src/components/charts/ActionStatsChart.tsx src/components/charts/ActivityTimeline.tsx
git commit -m "feat: update existing chart components to use new data structures"
```

---

### Task 7: 测试和验证

**Files:**
- 无新建文件
- 无修改文件

**Interfaces:**
- 无

- [ ] **Step 1: 运行TypeScript编译**

Run: `npm run build`
Expected: 无TypeScript错误

- [ ] **Step 2: 运行ESLint检查**

Run: `npm run lint`
Expected: 无ESLint错误

- [ ] **Step 3: 启动开发服务器**

Run: `npm run dev`
Expected: 服务器正常启动，无控制台错误

- [ ] **Step 4: 测试DashboardPage**

1. 访问Dashboard页面
2. 验证统计卡片显示正确的数据
3. 验证图表正确渲染
4. 验证加载状态正常显示

- [ ] **Step 5: 测试AnalyticsPage**

1. 访问Analytics页面
2. 验证所有图表正确渲染
3. 验证数据与OpenAPI文档一致
4. 验证加载状态正常显示

- [ ] **Step 6: 最终提交**

```bash
git add .
git commit -m "feat: complete statistics module redesign"
```