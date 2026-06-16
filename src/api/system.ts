import { apiClient } from './client'
import type { SystemStats, SystemHealth } from '@/types'

export const systemApi = {
  getStats: (): Promise<SystemStats> => {
    return apiClient.get<SystemStats>('/admin/system/stats')
  },

  getHealth: (): Promise<SystemHealth> => {
    return apiClient.get<SystemHealth>('/admin/system/health')
  },

  liveness: (): Promise<{ status: 'ok' }> => {
    return apiClient.get<{ status: 'ok' }>('/health', false)
  },
}
