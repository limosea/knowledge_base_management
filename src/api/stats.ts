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
  getDashboard: (): Promise<DashboardStats> => {
    return apiClient.get<DashboardStats>('/admin/stats/dashboard')
  },
  
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
  
  getContentDistribution: (params?: {
    from?: string
    to?: string
  }): Promise<ContentDistribution> => {
    const searchParams = new URLSearchParams()
    if (params?.from) searchParams.set('from', params.from)
    if (params?.to) searchParams.set('to', params.to)
    const query = searchParams.toString()
    return apiClient.get<ContentDistribution>(`/admin/stats/content-distribution${query ? `?${query}` : ''}`)
  },
  
  getEmbeddingCoverage: (params?: {
    from?: string
    to?: string
  }): Promise<EmbeddingCoverage> => {
    const searchParams = new URLSearchParams()
    if (params?.from) searchParams.set('from', params.from)
    if (params?.to) searchParams.set('to', params.to)
    const query = searchParams.toString()
    return apiClient.get<EmbeddingCoverage>(`/admin/stats/embedding-coverage${query ? `?${query}` : ''}`)
  },
  
  getSearchAnalytics: (params?: {
    period?: 'day' | 'week' | 'month'
    from?: string
    to?: string
    topN?: number
    perspective?: 'searchActivity' | 'contentInsights'
  }): Promise<SearchAnalytics> => {
    const searchParams = new URLSearchParams()
    if (params?.period) searchParams.set('period', params.period)
    if (params?.from) searchParams.set('from', params.from)
    if (params?.to) searchParams.set('to', params.to)
    if (params?.topN) searchParams.set('topN', String(params.topN))
    if (params?.perspective) searchParams.set('perspective', params.perspective)
    const query = searchParams.toString()
    return apiClient.get<SearchAnalytics>(`/admin/stats/search-analytics${query ? `?${query}` : ''}`)
  },
  
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
