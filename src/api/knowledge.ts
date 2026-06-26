import { apiClient } from './client'
import type {
  KnowledgeEntry,
  KnowledgeVersion,
  KnowledgeStats,
  AdminKnowledgeListResponse,
  AdminKnowledgeSearchResponse,
  HybridSearchRequest,
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
    libraryId?: string
  }): Promise<AdminKnowledgeListResponse> => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', String(params.page))
    if (params?.limit) searchParams.set('limit', String(params.limit))
    if (params?.category) searchParams.set('category', params.category)
    if (params?.language) searchParams.set('language', params.language)
    if (params?.tags) searchParams.set('tags', params.tags)
    if (params?.search) searchParams.set('search', params.search)
    if (params?.libraryId) searchParams.set('libraryId', params.libraryId)
    const query = searchParams.toString()
    return apiClient.get<AdminKnowledgeListResponse>(`/admin/knowledge${query ? `?${query}` : ''}`)
  },

  get: (id: string): Promise<KnowledgeEntry> => {
    return apiClient.get<KnowledgeEntry>(`/admin/me/knowledge/${id}`)
  },

  adminGet: (id: string): Promise<KnowledgeEntry> => {
    return apiClient.get<KnowledgeEntry>(`/admin/knowledge/${id}`)
  },

  create: (data: CreateEntryRequest): Promise<CreateEntryResponse> => {
    return apiClient.post<CreateEntryResponse>('/admin/me/knowledge', data)
  },

  update: (id: string, data: UpdateEntryRequest): Promise<KnowledgeEntry> => {
    return apiClient.put<KnowledgeEntry>(`/admin/me/knowledge/${id}`, data)
  },

  delete: (id: string): Promise<{ message: string }> => {
    return apiClient.delete(`/admin/me/knowledge/${id}`)
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

  shield: (id: string): Promise<KnowledgeEntry> => {
    return apiClient.post<KnowledgeEntry>(`/admin/knowledge/${id}/shield`)
  },

  unshield: (id: string): Promise<KnowledgeEntry> => {
    return apiClient.post<KnowledgeEntry>(`/admin/knowledge/${id}/unshield`)
  },

  batchShield: (ids: string[]): Promise<{ shielded: number; skipped: number }> => {
    return apiClient.post<{ shielded: number; skipped: number }>('/admin/knowledge/batch-shield', { ids })
  },

  batchUnshield: (ids: string[]): Promise<{ unshielded: number; skipped: number }> => {
    return apiClient.post<{ unshielded: number; skipped: number }>('/admin/knowledge/batch-unshield', { ids })
  },

  selfShield: (id: string): Promise<KnowledgeEntry> => {
    return apiClient.post<KnowledgeEntry>(`/admin/knowledge/${id}/self-shield`)
  },

  selfUnshield: (id: string): Promise<KnowledgeEntry> => {
    return apiClient.post<KnowledgeEntry>(`/admin/knowledge/${id}/self-unshield`)
  },

  /**
   * Hybrid search (elevated / admin-scoped): field fuzzy + semantic vector.
   */
  search: (data: HybridSearchRequest): Promise<AdminKnowledgeSearchResponse> => {
    return apiClient.post<AdminKnowledgeSearchResponse>('/admin/knowledge/search', data)
  },

  /**
   * Hybrid search (personal / creator-scoped): only own entries.
   */
  searchOwn: (data: HybridSearchRequest): Promise<AdminKnowledgeSearchResponse> => {
    return apiClient.post<AdminKnowledgeSearchResponse>('/admin/me/knowledge/search', data)
  },
}
