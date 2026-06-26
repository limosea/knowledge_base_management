import { apiClient } from './client'
import type {
  AdminUserSummary,
  AdminUserListResponse,
  CreateAdminUserRequest,
  UpdateAdminUserRequest,
  ResetPasswordResponse,
  DeletionResponse,
  AuditData,
} from '@/types'

export const adminUsersApi = {
  list: (params?: {
    page?: number
    limit?: number
    search?: string
    role?: string
    isActive?: boolean
    mfaEnabled?: boolean
    createdAfter?: string
    createdBefore?: string
    lastLoginAfter?: string
    lastLoginBefore?: string
  }): Promise<AdminUserListResponse> => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', String(params.page))
    if (params?.limit) searchParams.set('limit', String(params.limit))
    if (params?.search) searchParams.set('search', params.search)
    if (params?.role) searchParams.set('role', params.role)
    if (params?.isActive !== undefined) searchParams.set('isActive', String(params.isActive))
    if (params?.mfaEnabled !== undefined) searchParams.set('mfaEnabled', String(params.mfaEnabled))
    if (params?.createdAfter) searchParams.set('createdAfter', params.createdAfter)
    if (params?.createdBefore) searchParams.set('createdBefore', params.createdBefore)
    if (params?.lastLoginAfter) searchParams.set('lastLoginAfter', params.lastLoginAfter)
    if (params?.lastLoginBefore) searchParams.set('lastLoginBefore', params.lastLoginBefore)
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

  ban: (id: string): Promise<{ message: string }> => {
    return apiClient.post(`/admin/users/${id}/ban`)
  },

  unban: (id: string): Promise<{ message: string }> => {
    return apiClient.post(`/admin/users/${id}/unban`)
  },

  resetPassword: (id: string): Promise<ResetPasswordResponse> => {
    return apiClient.post<ResetPasswordResponse>(`/admin/users/${id}/reset-password`)
  },

  approveDeletion: (id: string): Promise<DeletionResponse> => {
    return apiClient.post<DeletionResponse>(`/admin/users/${id}/approve-deletion`)
  },

  rejectDeletion: (id: string): Promise<DeletionResponse> => {
    return apiClient.post<DeletionResponse>(`/admin/users/${id}/reject-deletion`)
  },

  getAudit: (id: string, params?: { from?: string; to?: string }): Promise<AuditData> => {
    const searchParams = new URLSearchParams()
    if (params?.from) searchParams.set('from', params.from)
    if (params?.to) searchParams.set('to', params.to)
    const query = searchParams.toString()
    return apiClient.get(`/admin/stats/user-audit/${id}${query ? `?${query}` : ''}`)
  },
}
