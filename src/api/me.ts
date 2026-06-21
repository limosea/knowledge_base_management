import { apiClient } from './client'
import type {
  MyApiKey,
  MyApiKeyListResponse,
  MyStats,
  CreateApiKeyRequest,
  UpdateApiKeyRequest,
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
}
