import { apiClient } from './client'
import type { Role, CreateRoleRequest, UpdateRoleRequest } from '@/types'

export const adminRolesApi = {
  async getRoles(): Promise<Role[]> {
    return apiClient.get<Role[]>('/admin/roles')
  },

  async getRole(id: string): Promise<Role> {
    return apiClient.get<Role>(`/admin/roles/${id}`)
  },

  async createRole(data: CreateRoleRequest): Promise<Role> {
    return apiClient.post<Role>('/admin/roles', data)
  },

  async updateRole(id: string, data: UpdateRoleRequest): Promise<Role> {
    return apiClient.put<Role>(`/admin/roles/${id}`, data)
  },

  async deleteRole(id: string): Promise<void> {
    await apiClient.delete(`/admin/roles/${id}`)
  },
}
