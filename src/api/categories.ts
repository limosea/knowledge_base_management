import { apiClient } from './client'
import type {
  Category,
  CategoryListResponse,
  AdminCategoryListResponse,
  AdminCategoryStats,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CategoryStats,
} from '@/types'

export const categoriesApi = {
  list: (): Promise<CategoryListResponse> => {
    return apiClient.get<CategoryListResponse>('/categories')
  },

  getStatsByName: (name: string): Promise<CategoryStats> => {
    return apiClient.get<CategoryStats>(`/categories/${encodeURIComponent(name)}/stats`)
  },

  adminList: (params?: {
    page?: number
    limit?: number
    search?: string
  }): Promise<AdminCategoryListResponse> => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', String(params.page))
    if (params?.limit) searchParams.set('limit', String(params.limit))
    if (params?.search) searchParams.set('search', params.search)
    const query = searchParams.toString()
    return apiClient.get<AdminCategoryListResponse>(`/admin/categories${query ? `?${query}` : ''}`)
  },

  adminGet: (id: string): Promise<Category> => {
    return apiClient.get<Category>(`/admin/categories/${id}`)
  },

  adminCreate: (data: CreateCategoryRequest): Promise<Category> => {
    return apiClient.post<Category>('/admin/categories', data)
  },

  adminUpdate: (id: string, data: UpdateCategoryRequest): Promise<Category> => {
    return apiClient.put<Category>(`/admin/categories/${id}`, data)
  },

  adminDelete: (id: string): Promise<void> => {
    return apiClient.delete(`/admin/categories/${id}`)
  },

  adminGetStats: (id: string): Promise<AdminCategoryStats> => {
    return apiClient.get<AdminCategoryStats>(`/admin/categories/${id}/stats`)
  },
}
