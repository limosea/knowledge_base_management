import { apiClient } from './client'
import type { AuditLogListResponse, AuditLog } from '@/types'

export interface AuditLogListParams {
  page?: number
  limit?: number
  action?: string
  resourceType?: string
  actorType?: string
  actorName?: string
  source?: string
  status?: string
  startDate?: string
  endDate?: string
}

function buildQuery(params?: AuditLogListParams): string {
  const searchParams = new URLSearchParams()
  if (params?.page) searchParams.set('page', String(params.page))
  if (params?.limit) searchParams.set('limit', String(params.limit))
  if (params?.action) searchParams.set('action', params.action)
  if (params?.resourceType) searchParams.set('resourceType', params.resourceType)
  if (params?.actorType) searchParams.set('actorType', params.actorType)
  if (params?.actorName) searchParams.set('actorName', params.actorName)
  if (params?.source) searchParams.set('source', params.source)
  if (params?.status) searchParams.set('status', params.status)
  if (params?.startDate) searchParams.set('startDate', params.startDate)
  if (params?.endDate) searchParams.set('endDate', params.endDate)
  const query = searchParams.toString()
  return query ? `?${query}` : ''
}

export const auditLogsApi = {
  list: (params?: AuditLogListParams): Promise<AuditLogListResponse> => {
    return apiClient.get<AuditLogListResponse>(`/admin/audit-logs${buildQuery(params)}`)
  },

  export: async (params?: AuditLogListParams): Promise<string> => {
    const token = localStorage.getItem('accessToken')
    const response = await fetch(`/api/v1/admin/audit-logs/export${buildQuery(params)}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to export audit logs')
    }

    return response.text()
  },

  get: (id: string): Promise<AuditLog> => {
    return apiClient.get<AuditLog>(`/admin/audit-logs/${id}`)
  },
}
