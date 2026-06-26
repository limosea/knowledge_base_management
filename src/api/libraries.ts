import { apiClient } from './client'

export interface Library {
  id: string
  name: string
  description?: string
  icon?: string
  tags?: string[]
  categoryId?: string
  visibility: 'private' | 'public'
  shielded: boolean
  shieldedAt?: string
  selfShielded: boolean
  selfShieldedAt?: string
  createdBy: string
  creatorNickname?: string
  createdAt: string
  updatedAt?: string
  entryCount?: number
}

export interface PlazaLibrary {
  id: string
  name: string
  description?: string
  icon?: string
  tags?: string[]
  categoryId?: string
  creatorNickname: string
  entryCount: number
  createdAt: string
}

export interface PlazaEntry {
  id: string
  title: string
  category?: string
  tags?: string[]
  qualityScore?: number
  createdAt: string
}

export interface LibraryListResponse {
  data: Library[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface CreateLibraryRequest {
  name: string
  description?: string
  icon?: string
  tags?: string[]
  visibility?: 'private' | 'public'
  categoryId?: string
}

export interface UpdateLibraryRequest {
  name?: string
  description?: string
  icon?: string
  tags?: string[]
  visibility?: 'private' | 'public'
  categoryId?: string
}

export interface LibraryStats {
  total: number
  public: number
  private: number
  shielded: number
}

export const librariesApi = {
  list: (params?: {
    page?: number
    limit?: number
    search?: string
  }): Promise<LibraryListResponse> => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', String(params.page))
    if (params?.limit) searchParams.set('limit', String(params.limit))
    if (params?.search) searchParams.set('search', params.search)
    const query = searchParams.toString()
    return apiClient.get<LibraryListResponse>(`/admin/me/libraries${query ? `?${query}` : ''}`)
  },

  get: (id: string): Promise<Library> => {
    return apiClient.get<Library>(`/admin/me/libraries/${id}`)
  },

  adminList: (params?: {
    page?: number
    limit?: number
    search?: string
  }): Promise<LibraryListResponse> => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', String(params.page))
    if (params?.limit) searchParams.set('limit', String(params.limit))
    if (params?.search) searchParams.set('search', params.search)
    const query = searchParams.toString()
    return apiClient.get<LibraryListResponse>(`/admin/library${query ? `?${query}` : ''}`)
  },

  shield: (id: string): Promise<Library> => {
    return apiClient.post<Library>(`/admin/library/${id}/shield`)
  },

  unshield: (id: string): Promise<Library> => {
    return apiClient.post<Library>(`/admin/library/${id}/unshield`)
  },

  selfShield: (id: string): Promise<Library> => {
    return apiClient.post<Library>(`/admin/library/${id}/self-shield`)
  },

  selfUnshield: (id: string): Promise<Library> => {
    return apiClient.post<Library>(`/admin/library/${id}/self-unshield`)
  },

  getPlaza: (): Promise<PlazaLibrary[]> => {
    return apiClient.get<PlazaLibrary[]>('/admin/me/plaza')
  },

  create: (data: CreateLibraryRequest): Promise<Library> => {
    return apiClient.post<Library>('/admin/me/libraries', data)
  },

  update: (id: string, data: UpdateLibraryRequest): Promise<Library> => {
    return apiClient.put<Library>(`/admin/me/libraries/${id}`, data)
  },

  delete: (id: string): Promise<void> => {
    return apiClient.delete(`/admin/me/libraries/${id}`)
  },
}
