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
  CodeLoginRequest,
  CodeLoginVerifyRequest,
  RequestPasswordResetRequest,
  ResetPasswordRequest,
  ToggleCodeLoginRequest,
  ToggleCodeLoginResponse,
  EmailChangeRequestResponse,
  EmailChangeConfirmResponse,
} from '@/types'

export type LoginResult = LoginResponse | MfaRequiredResponse

const persistLoginResponse = (response: LoginResponse): void => {
  localStorage.setItem('accessToken', response.accessToken)
  localStorage.setItem('refreshToken', response.refreshToken)
  localStorage.setItem('user', JSON.stringify(response.user))
  if (response.requirePasswordChange) {
    localStorage.setItem('requirePasswordChange', 'true')
  } else {
    localStorage.removeItem('requirePasswordChange')
  }
}

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResult> => {
    const response = await apiClient.post<LoginResult>('/admin/auth/login', data, false)
    if ('accessToken' in response) {
      persistLoginResponse(response as LoginResponse)
    }
    return response
  },

  loginWithMfa: async (data: MfaLoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/admin/auth/login/mfa', data, false)
    persistLoginResponse(response)
    return response
  },

  requestCodeLogin: async (data: CodeLoginRequest): Promise<{ sent: boolean }> => {
    return apiClient.post<{ sent: boolean }>('/admin/auth/login/code/request', data, false)
  },

  loginWithCode: async (data: CodeLoginVerifyRequest): Promise<LoginResult> => {
    const response = await apiClient.post<LoginResult>('/admin/auth/login/code', data, false)
    if ('accessToken' in response) {
      persistLoginResponse(response as LoginResponse)
    }
    return response
  },

  requestPasswordReset: async (data: RequestPasswordResetRequest): Promise<{ sent: boolean }> => {
    return apiClient.post<{ sent: boolean }>('/admin/auth/password-reset/request', data, false)
  },

  resetPassword: async (data: ResetPasswordRequest): Promise<{ message: string }> => {
    return apiClient.post<{ message: string }>('/admin/auth/password-reset', data, false)
  },

  toggleCodeLogin: async (data: ToggleCodeLoginRequest): Promise<ToggleCodeLoginResponse> => {
    return apiClient.put<ToggleCodeLoginResponse>('/admin/auth/code-login', data)
  },

  requestEmailChange: (newEmail: string): Promise<EmailChangeRequestResponse> => {
    return apiClient.post<EmailChangeRequestResponse>('/admin/auth/email-change/request', { newEmail })
  },

  confirmEmailChange: (code: string): Promise<EmailChangeConfirmResponse> => {
    return apiClient.post<EmailChangeConfirmResponse>('/admin/auth/email-change/confirm', { code })
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

  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    await apiClient.put('/admin/auth/password', data)
    localStorage.removeItem('requirePasswordChange')
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
