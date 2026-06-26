import { apiClient } from './client'
import type {
  ApiKey,
  ApiKeyListResponse,
  CreateApiKeyRequest,
  UpdateApiKeyRequest,
} from '@/types'

export interface ApiKeyListParams {
  page?: number
  limit?: number
  search?: string
  isActive?: boolean
  permission?: string
  userId?: string
}

export const apiKeysApi = {
  list: (params?: ApiKeyListParams): Promise<ApiKeyListResponse> => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', String(params.page))
    if (params?.limit) searchParams.set('limit', String(params.limit))
    if (params?.search) searchParams.set('search', params.search)
    if (params?.isActive !== undefined) searchParams.set('isActive', String(params.isActive))
    if (params?.permission) searchParams.set('permission', params.permission)
    if (params?.userId) searchParams.set('userId', params.userId)
    const query = searchParams.toString()
    return apiClient.get<ApiKeyListResponse>(`/admin/api-keys${query ? `?${query}` : ''}`)
  },

  get: (id: string): Promise<ApiKey> => {
    return apiClient.get<ApiKey>(`/admin/api-keys/${id}`)
  },

  create: (data: CreateApiKeyRequest): Promise<ApiKey> => {
    return apiClient.post<ApiKey>('/admin/api-keys', data)
  },

  update: (id: string, data: UpdateApiKeyRequest): Promise<ApiKey> => {
    return apiClient.put<ApiKey>(`/admin/api-keys/${id}`, data)
  },

  delete: (id: string): Promise<{ message: string }> => {
    return apiClient.delete(`/admin/api-keys/${id}`)
  },

  getUsage: (
    id: string,
    params?: {
      from?: string
      to?: string
    }
  ): Promise<{
    totalRequests: number
    byAction: Array<{ action: string; count: number }>
    trend: Array<{ date: string; count: number }>
    topIps: Array<{ ip: string; count: number }>
    errors: Array<{ message: string; count: number }>
  }> => {
    const searchParams = new URLSearchParams()
    if (params?.from) searchParams.set('from', params.from)
    if (params?.to) searchParams.set('to', params.to)
    const query = searchParams.toString()
    return apiClient.get(`/admin/api-keys/${id}/usage${query ? `?${query}` : ''}`)
  },
}
