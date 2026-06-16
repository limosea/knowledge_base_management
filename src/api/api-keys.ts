import { apiClient } from './client'
import type {
  ApiKey,
  ApiKeyListResponse,
  CreateApiKeyRequest,
  UpdateApiKeyRequest,
} from '@/types'

export const apiKeysApi = {
  list: (params?: {
    page?: number
    limit?: number
  }): Promise<ApiKeyListResponse> => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', String(params.page))
    if (params?.limit) searchParams.set('limit', String(params.limit))
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
}
