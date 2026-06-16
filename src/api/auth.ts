import { apiClient } from './client'
import type {
  LoginRequest,
  LoginResponse,
  MfaLoginRequest,
  AdminProfile,
  UpdateProfileRequest,
  ChangePasswordRequest,
  MfaSetupResponse,
} from '@/types'

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', data, false)
    localStorage.setItem('accessToken', response.accessToken)
    localStorage.setItem('refreshToken', response.refreshToken)
    localStorage.setItem('user', JSON.stringify(response.user))
    return response
  },

  loginWithMfa: async (data: MfaLoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login/mfa', data, false)
    localStorage.setItem('accessToken', response.accessToken)
    localStorage.setItem('refreshToken', response.refreshToken)
    localStorage.setItem('user', JSON.stringify(response.user))
    return response
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout')
    } finally {
      apiClient.clearTokens()
    }
  },

  refresh: async (): Promise<void> => {
    const refreshToken = localStorage.getItem('refreshToken')
    if (!refreshToken) throw new Error('No refresh token')
    const response = await apiClient.post<LoginResponse>('/auth/refresh', { refreshToken }, false)
    localStorage.setItem('accessToken', response.accessToken)
    if (response.refreshToken) {
      localStorage.setItem('refreshToken', response.refreshToken)
    }
  },

  getProfile: (): Promise<AdminProfile> => {
    return apiClient.get<AdminProfile>('/auth/profile')
  },

  updateProfile: (data: UpdateProfileRequest): Promise<AdminProfile> => {
    return apiClient.put<AdminProfile>('/auth/profile', data)
  },

  changePassword: (data: ChangePasswordRequest): Promise<void> => {
    return apiClient.post('/auth/change-password', data)
  },

  setupMfa: (): Promise<MfaSetupResponse> => {
    return apiClient.post<MfaSetupResponse>('/auth/mfa/setup')
  },

  enableMfa: (code: string): Promise<void> => {
    return apiClient.post('/auth/mfa/enable', { code })
  },

  disableMfa: (code: string): Promise<void> => {
    return apiClient.post('/auth/mfa/disable', { code })
  },
}
