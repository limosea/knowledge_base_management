import { apiClient } from './client'
import type {
  AdminUserSummary,
  AdminUserListResponse,
  CreateAdminUserRequest,
  UpdateAdminUserRequest,
  ResetPasswordResponse,
} from '@/types'

export const adminUsersApi = {
  list: (params?: {
    page?: number
    limit?: number
  }): Promise<AdminUserListResponse> => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', String(params.page))
    if (params?.limit) searchParams.set('limit', String(params.limit))
    const query = searchParams.toString()
    return apiClient.get<AdminUserListResponse>(`/admin/users${query ? `?${query}` : ''}`)
  },

  get: (id: string): Promise<AdminUserSummary> => {
    return apiClient.get<AdminUserSummary>(`/admin/users/${id}`)
  },

  create: (data: CreateAdminUserRequest): Promise<AdminUserSummary> => {
    return apiClient.post<AdminUserSummary>('/admin/users', data)
  },

  update: (id: string, data: UpdateAdminUserRequest): Promise<AdminUserSummary> => {
    return apiClient.put<AdminUserSummary>(`/admin/users/${id}`, data)
  },

  delete: (id: string): Promise<{ message: string }> => {
    return apiClient.delete(`/admin/users/${id}`)
  },

  resetPassword: (id: string): Promise<ResetPasswordResponse> => {
    return apiClient.post<ResetPasswordResponse>(`/admin/users/${id}/reset-password`)
  },
}
