import { apiClient } from './client'
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
  RequestDeletionRequest,
  DeletionResponse,
  LeaderboardData,
  UpdateUsernameRequest,
  UpdateUsernameResponse,
} from '@/types'

export const meApi = {
  listKeys: (params?: {
    page?: number
    limit?: number
  }): Promise<MyApiKeyListResponse> => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', String(params.page))
    if (params?.limit) searchParams.set('limit', String(params.limit))
    const query = searchParams.toString()
    return apiClient.get<MyApiKeyListResponse>(`/admin/me/api-keys${query ? `?${query}` : ''}`)
  },

  getKey: (id: string): Promise<MyApiKey> => {
    return apiClient.get<MyApiKey>(`/admin/me/api-keys/${id}`)
  },

  createKey: (data: CreateApiKeyRequest): Promise<MyApiKey> => {
    return apiClient.post<MyApiKey>('/admin/me/api-keys', data)
  },

  updateKey: (id: string, data: UpdateApiKeyRequest): Promise<MyApiKey> => {
    return apiClient.put<MyApiKey>(`/admin/me/api-keys/${id}`, data)
  },

  deleteKey: (id: string): Promise<{ message: string }> => {
    return apiClient.delete(`/admin/me/api-keys/${id}`)
  },

  regenerateKey: (id: string): Promise<MyApiKey> => {
    return apiClient.post<MyApiKey>(`/admin/me/api-keys/${id}/regenerate`)
  },

  getStats: (): Promise<MyStats> => {
    return apiClient.get<MyStats>('/admin/me/stats')
  },

  getDashboardStats: (): Promise<MyDashboardStats> => {
    return apiClient.get<MyDashboardStats>('/admin/me/stats')
  },

  getKnowledgeTrends: (params?: {
    period?: string
    from?: string
    to?: string
  }): Promise<MyKnowledgeTrends> => {
    const searchParams = new URLSearchParams()
    if (params?.period) searchParams.set('period', params.period)
    if (params?.from) searchParams.set('from', params.from)
    if (params?.to) searchParams.set('to', params.to)
    const query = searchParams.toString()
    return apiClient.get<MyKnowledgeTrends>(
      `/admin/me/stats/knowledge-trends${query ? `?${query}` : ''}`
    )
  },

  getContentDistribution: (params?: {
    from?: string
    to?: string
  }): Promise<MyContentDistribution> => {
    const searchParams = new URLSearchParams()
    if (params?.from) searchParams.set('from', params.from)
    if (params?.to) searchParams.set('to', params.to)
    const query = searchParams.toString()
    return apiClient.get<MyContentDistribution>(
      `/admin/me/stats/content-distribution${query ? `?${query}` : ''}`
    )
  },

  getEmbeddingCoverage: (params?: {
    from?: string
    to?: string
  }): Promise<MyEmbeddingCoverage> => {
    const searchParams = new URLSearchParams()
    if (params?.from) searchParams.set('from', params.from)
    if (params?.to) searchParams.set('to', params.to)
    const query = searchParams.toString()
    return apiClient.get<MyEmbeddingCoverage>(
      `/admin/me/stats/embedding-coverage${query ? `?${query}` : ''}`
    )
  },

  getSearchAnalytics: (params?: {
    period?: string
    from?: string
    to?: string
    topN?: number
    perspective?: 'searchActivity' | 'contentInsights'
  }): Promise<MySearchAnalytics> => {
    const searchParams = new URLSearchParams()
    if (params?.period) searchParams.set('period', params.period)
    if (params?.from) searchParams.set('from', params.from)
    if (params?.to) searchParams.set('to', params.to)
    if (params?.topN) searchParams.set('topN', String(params.topN))
    if (params?.perspective) searchParams.set('perspective', params.perspective)
    const query = searchParams.toString()
    return apiClient.get<MySearchAnalytics>(
      `/admin/me/stats/search-analytics${query ? `?${query}` : ''}`
    )
  },

  getApiKeyUsage: (params?: {
    from?: string
    to?: string
  }): Promise<MyApiKeyUsage> => {
    const searchParams = new URLSearchParams()
    if (params?.from) searchParams.set('from', params.from)
    if (params?.to) searchParams.set('to', params.to)
    const query = searchParams.toString()
    return apiClient.get<MyApiKeyUsage>(
      `/admin/me/stats/api-key-usage${query ? `?${query}` : ''}`
    )
  },

  getApiKeyUsageDetail: (
    keyId: string,
    params?: {
      period?: string
      from?: string
      to?: string
    }
  ): Promise<MyApiKeyUsageDetail> => {
    const searchParams = new URLSearchParams()
    if (params?.period) searchParams.set('period', params.period)
    if (params?.from) searchParams.set('from', params.from)
    if (params?.to) searchParams.set('to', params.to)
    const query = searchParams.toString()
    return apiClient.get<MyApiKeyUsageDetail>(
      `/admin/me/stats/api-key-usage/${keyId}${query ? `?${query}` : ''}`
    )
  },

  requestDeletion: (data: RequestDeletionRequest): Promise<DeletionResponse> => {
    return apiClient.post<DeletionResponse>('/admin/me/request-deletion', data)
  },

  cancelDeletion: (): Promise<DeletionResponse> => {
    return apiClient.delete<DeletionResponse>('/admin/me/request-deletion')
  },

  getLeaderboard: (params?: {
    period?: string
    topN?: number
    scope?: 'global' | 'personal'
    channel?: 'total' | 'api' | 'mcp'
  }): Promise<LeaderboardData> => {
    const searchParams = new URLSearchParams()
    if (params?.period) searchParams.set('period', params.period)
    if (params?.topN) searchParams.set('topN', String(params.topN))
    if (params?.scope) searchParams.set('scope', params.scope)
    if (params?.channel) searchParams.set('channel', params.channel)
    const query = searchParams.toString()
    return apiClient.get<LeaderboardData>(
      `/admin/me/stats/leaderboard${query ? `?${query}` : ''}`
    )
  },

  getDashboardPreferences: (): Promise<{ pinnedCharts: string[] }> => {
    return apiClient.get<{ pinnedCharts: string[] }>('/admin/me/dashboard-preferences')
  },

  updateDashboardPreferences: (pinnedCharts: string[]): Promise<{ pinnedCharts: string[] }> => {
    return apiClient.put<{ pinnedCharts: string[] }>('/admin/me/dashboard-preferences', { pinnedCharts })
  },

  /**
   * One-time self-service username reset.
   *
   * The backend tracks `username_changed_at`: NULL means the user may
   * still reset their username once. After a successful reset all
   * sessions are invalidated and the user must log in again with the
   * new username.
   */
  updateUsername: (data: UpdateUsernameRequest): Promise<UpdateUsernameResponse> => {
    return apiClient.put<UpdateUsernameResponse>('/admin/auth/username', data)
  },
}
