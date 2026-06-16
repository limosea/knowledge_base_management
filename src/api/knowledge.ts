import { apiClient } from './client'
import type {
  KnowledgeEntry,
  KnowledgeVersion,
  KnowledgeStats,
  AdminKnowledgeListResponse,
  CreateEntryRequest,
  UpdateEntryRequest,
  CreateEntryResponse,
} from '@/types'

export const knowledgeApi = {
  list: (params?: {
    page?: number
    limit?: number
    category?: string
    language?: string
    tags?: string
    search?: string
  }): Promise<AdminKnowledgeListResponse> => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', String(params.page))
    if (params?.limit) searchParams.set('limit', String(params.limit))
    if (params?.category) searchParams.set('category', params.category)
    if (params?.language) searchParams.set('language', params.language)
    if (params?.tags) searchParams.set('tags', params.tags)
    if (params?.search) searchParams.set('search', params.search)
    const query = searchParams.toString()
    return apiClient.get<AdminKnowledgeListResponse>(`/admin/knowledge${query ? `?${query}` : ''}`)
  },

  get: (id: string): Promise<KnowledgeEntry> => {
    return apiClient.get<KnowledgeEntry>(`/admin/knowledge/${id}`)
  },

  create: (data: CreateEntryRequest): Promise<CreateEntryResponse> => {
    return apiClient.post<CreateEntryResponse>('/knowledge', data)
  },

  update: (id: string, data: UpdateEntryRequest): Promise<KnowledgeEntry> => {
    return apiClient.put<KnowledgeEntry>(`/admin/knowledge/${id}`, data)
  },

  delete: (id: string): Promise<{ message: string }> => {
    return apiClient.delete(`/admin/knowledge/${id}`)
  },

  batchDelete: (ids: string[]): Promise<{ message: string; deleted: number }> => {
    return apiClient.post('/admin/knowledge/batch-delete', { ids })
  },

  getVersions: (id: string): Promise<KnowledgeVersion[]> => {
    return apiClient.get<KnowledgeVersion[]>(`/admin/knowledge/${id}/versions`)
  },

  getVersion: (id: string, version: number): Promise<KnowledgeVersion> => {
    return apiClient.get<KnowledgeVersion>(`/admin/knowledge/${id}/versions/${version}`)
  },

  getStats: (): Promise<KnowledgeStats> => {
    return apiClient.get<KnowledgeStats>('/admin/knowledge/stats')
  },
}
