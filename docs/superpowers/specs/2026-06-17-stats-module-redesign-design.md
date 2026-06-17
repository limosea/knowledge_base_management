# 统计模块重新设计

## 概述

重新设计和实现知识库管理系统的统计模块，确保前端实现与OpenAPI文档完全一致。

## 当前问题

1. **API端点错误**：DashboardPage和AnalyticsPage使用了错误的API端点
2. **类型定义不匹配**：现有类型定义与OpenAPI文档不一致
3. **功能缺失**：多个统计功能未实现（如趋势分析、分布统计等）

## 设计目标

1. 创建统一的统计API模块，实现所有 `/admin/stats/*` 端点
2. 更新类型定义以匹配OpenAPI文档
3. 重构DashboardPage和AnalyticsPage使用正确的API
4. 更新图表组件以适配新的数据结构

## 架构设计

### 1. 新增统计API模块 (`src/api/stats.ts`)

```typescript
// 统计API模块
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

### 2. 类型定义更新 (`src/types/index.ts`)

添加以下类型定义：

```typescript
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

// 知识条目趋势
export interface KnowledgeTrends {
  period: string
  from: string
  to: string
  created: Array<{ date: string; count: number }>
  updated: Array<{ date: string; count: number }>
  deleted: Array<{ date: string; count: number }>
}

// 内容分布
export interface ContentDistribution {
  topTags: Array<{ tag: string; count: number }>
  byFramework: Array<{ framework: string; count: number }>
  byDifficulty: Array<{ level: number; count: number }>
  byLanguage: Array<{ language: string; count: number }>
  qualityScoreDistribution: Array<{ bucket: string; count: number }>
}

// 嵌入覆盖率
export interface EmbeddingCoverage {
  totalEntries: number
  withEmbedding: number
  withoutEmbedding: number
  coveragePercent: number
  batchStatusSummary: Array<Record<string, unknown>>
  latestBatch: Record<string, unknown> | null
}

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

// 审计日志分析
export interface AuditAnalytics {
  byAction: Array<{ action: string; count: number }>
  byStatus: Array<{ status: string; count: number }>
  topErrors: Array<{ errorMessage: string; action: string; count: number }>
  trend: Array<{ date: string; count: number }>
}

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

### 3. 页面重构

#### DashboardPage.tsx
- 使用 `statsApi.getDashboard()` 替代 `systemApi.getStats()` 和 `knowledgeApi.getStats()`
- 使用 `statsApi.getKnowledgeTrends()` 获取趋势数据
- 使用 `statsApi.getRequestAnalytics()` 获取请求分析
- 保留 `systemApi.getHealth()` 调用用于系统状态卡片（此功能独立于统计模块）

#### AnalyticsPage.tsx
- 使用 `statsApi.getContentDistribution()` 获取内容分布
- 使用 `statsApi.getEmbeddingCoverage()` 获取嵌入覆盖率
- 使用 `statsApi.getSearchAnalytics()` 获取搜索分析
- 使用 `statsApi.getApiKeyUsage()` 获取API Key使用排行
- 使用 `statsApi.getAuditAnalytics()` 获取审计日志分析
- 使用 `statsApi.getRequestAnalytics()` 获取请求分析

### 4. 图表组件更新

#### 需要更新的图表组件：

1. **RequestTrendChart.tsx**：
   - 当前：接收 `{ today, thisWeek, thisMonth }` 数据
   - 更新后：接收 `RequestAnalytics.requestVolumeTrend` 数组数据
   - 修改：更新props类型，修改图表渲染逻辑以显示时间趋势

2. **CategoryPieChart.tsx**：
   - 当前：接收 `Record<string, number>` 对象数据
   - 更新后：接收 `ContentDistribution.byFramework` 数组数据
   - 修改：更新props类型，修改图表渲染逻辑以显示框架分布

3. **QualityBarChart.tsx**：
   - 当前：接收 `avgScore` 单个数值
   - 更新后：接收 `ContentDistribution.qualityScoreDistribution` 数组数据
   - 修改：更新props类型，修改图表渲染逻辑以显示质量分区间分布

4. **ApiKeyStatusChart.tsx**：
   - 当前：接收 `{ total, active, expired }` 对象数据
   - 更新后：接收 `ApiKeyUsage.keys` 数组数据
   - 修改：更新props类型，修改图表渲染逻辑以显示API Key使用排行

5. **ActionStatsChart.tsx**：
   - 当前：接收 `Record<string, number>` 对象数据
   - 更新后：接收 `AuditAnalytics.byAction` 数组数据
   - 修改：更新props类型，修改图表渲染逻辑以显示审计日志分析

6. **ActivityTimeline.tsx**：
   - 当前：接收 `AuditLog[]` 数组数据
   - 更新后：接收 `AuditAnalytics.trend` 数组数据
   - 修改：更新props类型，修改图表渲染逻辑以显示时间趋势

#### 新增图表组件：

1. **KnowledgeTrendsChart.tsx**：
   - 功能：显示知识条目创建/更新/删除趋势
   - 数据源：`statsApi.getKnowledgeTrends()`
   - 图表类型：折线图，显示三条趋势线

2. **EmbeddingCoverageChart.tsx**：
   - 功能：显示嵌入覆盖率
   - 数据源：`statsApi.getEmbeddingCoverage()`
   - 图表类型：进度条或饼图

3. **SearchAnalyticsChart.tsx**：
   - 功能：显示搜索分析
   - 数据源：`statsApi.getSearchAnalytics()`
   - 图表类型：组合图表（搜索量趋势、热门查询、成功率）

4. **LatencyStatsCard.tsx**：
   - 功能：显示延迟统计
   - 数据源：`statsApi.getRequestAnalytics()`
   - 图表类型：卡片组件，显示avgMs、p50Ms、p95Ms

## 数据流

1. **DashboardPage**：
   ```
   用户访问 → DashboardPage → statsApi.getDashboard() → 显示统计卡片
                          → statsApi.getKnowledgeTrends() → 显示趋势图表
                          → statsApi.getRequestAnalytics() → 显示请求分析
   ```

2. **AnalyticsPage**：
   ```
   用户访问 → AnalyticsPage → statsApi.getContentDistribution() → 显示内容分布
                           → statsApi.getEmbeddingCoverage() → 显示嵌入覆盖率
                           → statsApi.getSearchAnalytics() → 显示搜索分析
                           → statsApi.getApiKeyUsage() → 显示API Key使用
                           → statsApi.getAuditAnalytics() → 显示审计日志分析
   ```

## 错误处理

1. **API错误**：所有API调用都使用try-catch包装，显示适当的错误消息
2. **加载状态**：所有页面都显示Skeleton加载状态
3. **空数据**：图表组件处理空数据情况，显示适当的占位符

## 测试策略

1. **单元测试**：测试API模块的每个方法
2. **组件测试**：测试图表组件的数据适配
3. **集成测试**：测试页面与API的集成
4. **E2E测试**：测试完整的用户流程

## 实施步骤

1. 创建 `src/api/stats.ts` 模块
2. 更新 `src/types/index.ts` 添加新类型
3. 更新 `src/api/index.ts` 导出新模块
4. 重构 `DashboardPage.tsx`
5. 重构 `AnalyticsPage.tsx`
6. 更新现有图表组件
7. 新增必要的图表组件
8. 测试和验证

## 风险和缓解

1. **API不兼容**：确保与后端API文档一致
2. **数据格式变化**：使用TypeScript类型确保类型安全
3. **性能问题**：实现适当的缓存和加载状态

## 成功标准

1. 所有统计功能与OpenAPI文档完全一致
2. 前端代码类型安全，无TypeScript错误
3. 图表正确显示所有统计数据
4. 用户界面响应良好，加载状态适当
5. 所有测试通过