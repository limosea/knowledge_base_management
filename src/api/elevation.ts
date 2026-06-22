import { apiClient } from './client'
import type { ElevationStatus, ElevationStepUpResponse, ElevationRevokeResponse } from '@/types'

export const elevationApi = {
  stepUp: (code: string): Promise<ElevationStepUpResponse> => {
    return apiClient.post<ElevationStepUpResponse>('/admin/elevation/step-up', { code })
  },

  getStatus: (): Promise<ElevationStatus> => {
    return apiClient.get<ElevationStatus>('/admin/elevation/status')
  },

  revoke: (): Promise<ElevationRevokeResponse> => {
    return apiClient.post<ElevationRevokeResponse>('/admin/elevation/revoke')
  },
}
