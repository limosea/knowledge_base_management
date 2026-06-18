import { apiClient } from './client'
import type {
  LoginRequest,
  LoginResponse,
  MfaLoginRequest,
  MfaRequiredResponse,
  AdminProfile,
  UpdateProfileRequest,
  ChangePasswordRequest,
  MfaSetupResponse,
} from '@/types'

export type LoginResult = LoginResponse | MfaRequiredResponse

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResult> => {
    const response = await apiClient.post<LoginResult>('/admin/auth/login', data, false)
    if ('accessToken' in response) {
      localStorage.setItem('accessToken', response.accessToken)
      localStorage.setItem('refreshToken', response.refreshToken)
      localStorage.setItem('user', JSON.stringify(response.user))
    }
    return response
  },

  loginWithMfa: async (data: MfaLoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/admin/auth/login/mfa', data, false)
    localStorage.setItem('accessToken', response.accessToken)
    localStorage.setItem('refreshToken', response.refreshToken)
    localStorage.setItem('user', JSON.stringify(response.user))
    return response
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/admin/auth/logout')
    } finally {
      apiClient.clearTokens()
    }
  },

  refresh: async (): Promise<void> => {
    const refreshToken = localStorage.getItem('refreshToken')
    if (!refreshToken) throw new Error('No refresh token')
    const response = await apiClient.post<LoginResponse>('/admin/auth/refresh', { refreshToken }, false)
    localStorage.setItem('accessToken', response.accessToken)
    if (response.refreshToken) {
      localStorage.setItem('refreshToken', response.refreshToken)
    }
  },

  getProfile: (): Promise<AdminProfile> => {
    return apiClient.get<AdminProfile>('/admin/auth/profile')
  },

  updateProfile: (data: UpdateProfileRequest): Promise<AdminProfile> => {
    return apiClient.put<AdminProfile>('/admin/auth/profile', data)
  },

  changePassword: (data: ChangePasswordRequest): Promise<void> => {
    return apiClient.post('/admin/auth/change-password', data)
  },

  setupMfa: (): Promise<MfaSetupResponse> => {
    return apiClient.post<MfaSetupResponse>('/admin/auth/mfa/setup')
  },

  enableMfa: (code: string): Promise<void> => {
    return apiClient.post('/admin/auth/mfa/enable', { code })
  },

  disableMfa: (code: string): Promise<void> => {
    return apiClient.post('/admin/auth/mfa/disable', { code })
  },
}
