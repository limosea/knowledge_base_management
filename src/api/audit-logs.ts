import { apiClient } from './client'
import type { AuditLogListResponse, AuditLog } from '@/types'

export const auditLogsApi = {
  list: (params?: {
    page?: number
    limit?: number
    action?: string
    resourceType?: string
    startDate?: string
    endDate?: string
  }): Promise<AuditLogListResponse> => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', String(params.page))
    if (params?.limit) searchParams.set('limit', String(params.limit))
    if (params?.action) searchParams.set('action', params.action)
    if (params?.resourceType) searchParams.set('resourceType', params.resourceType)
    if (params?.startDate) searchParams.set('startDate', params.startDate)
    if (params?.endDate) searchParams.set('endDate', params.endDate)
    const query = searchParams.toString()
    return apiClient.get<AuditLogListResponse>(`/admin/audit-logs${query ? `?${query}` : ''}`)
  },

  export: async (params?: {
    action?: string
    resourceType?: string
    startDate?: string
    endDate?: string
  }): Promise<string> => {
    const searchParams = new URLSearchParams()
    if (params?.action) searchParams.set('action', params.action)
    if (params?.resourceType) searchParams.set('resourceType', params.resourceType)
    if (params?.startDate) searchParams.set('startDate', params.startDate)
    if (params?.endDate) searchParams.set('endDate', params.endDate)
    const query = searchParams.toString()
    
    const token = localStorage.getItem('accessToken')
    const response = await fetch(
      `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'}/admin/audit-logs/export${query ? `?${query}` : ''}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    
    if (!response.ok) {
      throw new Error('Failed to export audit logs')
    }
    
    return response.text()
  },

  get: (id: string): Promise<AuditLog> => {
    return apiClient.get<AuditLog>(`/admin/audit-logs/${id}`)
  },
}
