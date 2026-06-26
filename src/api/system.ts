import { apiClient } from './client'
import type { SystemStats, SystemHealth, GlobalRateLimit, UpdateGlobalRateLimitRequest } from '@/types'

export const systemApi = {
  getStats: (): Promise<SystemStats> => {
    return apiClient.get<SystemStats>('/admin/system/stats')
  },

  getHealth: (): Promise<SystemHealth> => {
    return apiClient.get<SystemHealth>('/admin/system/health')
  },

  getGlobalRateLimit: (): Promise<GlobalRateLimit> => {
    return apiClient.get<GlobalRateLimit>('/admin/system/rate-limit')
  },

  updateGlobalRateLimit: (data: UpdateGlobalRateLimitRequest): Promise<GlobalRateLimit> => {
    return apiClient.put<GlobalRateLimit>('/admin/system/rate-limit', data)
  },

  liveness: (): Promise<{ status: 'ok' }> => {
    return apiClient.get<{ status: 'ok' }>('/health', false)
  },
}
