import { apiClient } from './client'
import type {
  VerifyRegistrationTokenRequest,
  VerifyRegistrationTokenResponse,
  CompleteRegistrationRequest,
  CompleteRegistrationResponse,
  CreateRegistrationInvitationRequest,
  CreateRegistrationInvitationResponse,
  RegistrationInvitationListResponse,
  RegistrationInvitationStatus,
} from '@/types'

export const registrationApi = {
  verifyToken: (data: VerifyRegistrationTokenRequest): Promise<VerifyRegistrationTokenResponse> => {
    return apiClient.post<VerifyRegistrationTokenResponse>('/admin/registration/verify', data, false)
  },

  completeRegistration: (data: CompleteRegistrationRequest): Promise<CompleteRegistrationResponse> => {
    return apiClient.post<CompleteRegistrationResponse>('/admin/registration/complete', data, false)
  },

  createInvitation: (
    data: CreateRegistrationInvitationRequest,
  ): Promise<CreateRegistrationInvitationResponse> => {
    return apiClient.post<CreateRegistrationInvitationResponse>('/admin/registration/invitations', data)
  },

  listInvitations: (params?: {
    page?: number
    limit?: number
    email?: string
    status?: RegistrationInvitationStatus
  }): Promise<RegistrationInvitationListResponse> => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', String(params.page))
    if (params?.limit) searchParams.set('limit', String(params.limit))
    if (params?.email) searchParams.set('email', params.email)
    if (params?.status) searchParams.set('status', params.status)
    const query = searchParams.toString()
    return apiClient.get<RegistrationInvitationListResponse>(
      `/admin/registration/invitations${query ? `?${query}` : ''}`,
    )
  },

  revokeInvitation: (id: string): Promise<{ id: string; revoked: boolean }> => {
    return apiClient.post<{ id: string; revoked: boolean }>(`/admin/registration/invitations/${id}/revoke`)
  },
}
