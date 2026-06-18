import type { ErrorResponse } from '@/types'

const API_URL = import.meta.env.VITE_API_URL || '/api/v1'

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private getAuthToken(): string | null {
    return localStorage.getItem('accessToken')
  }

  private setAuthToken(token: string): void {
    localStorage.setItem('accessToken', token)
  }

  private getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken')
  }

  private setRefreshToken(token: string): void {
    localStorage.setItem('refreshToken', token)
  }

  clearTokens(): void {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
  }

  private async refreshAccessToken(): Promise<boolean> {
    const refreshToken = this.getRefreshToken()
    if (!refreshToken) return false

    try {
      const response = await fetch(`${this.baseUrl}/admin/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      })

      if (!response.ok) {
        this.clearTokens()
        return false
      }

      const data = await response.json()
      this.setAuthToken(data.accessToken)
      if (data.refreshToken) {
        this.setRefreshToken(data.refreshToken)
      }
      return true
    } catch {
      this.clearTokens()
      return false
    }
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {},
    requireAuth = true
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    if (requireAuth) {
      const token = this.getAuthToken()
      if (token) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
      }
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    })

    if (response.status === 401 && requireAuth) {
      const refreshed = await this.refreshAccessToken()
      if (refreshed) {
        const newToken = this.getAuthToken()
        if (newToken) {
          (headers as Record<string, string>)['Authorization'] = `Bearer ${newToken}`
        }
        const retryResponse = await fetch(`${this.baseUrl}${endpoint}`, {
          ...options,
          headers,
        })
        return this.handleResponse<T>(retryResponse)
      }
      window.location.href = '/login'
      throw new Error('Unauthorized')
    }

    return this.handleResponse<T>(response)
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorData: ErrorResponse
      try {
        errorData = await response.json()
      } catch {
        errorData = {
          error: {
            code: 'UNKNOWN_ERROR',
            message: `HTTP ${response.status}: ${response.statusText}`,
            timestamp: new Date().toISOString(),
          },
        }
      }
      throw errorData
    }

    if (response.status === 204) {
      return {} as T
    }

    const text = await response.text()
    if (!text) {
      return {} as T
    }

    return JSON.parse(text) as T
  }

  async get<T>(endpoint: string, requireAuth = true): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' }, requireAuth)
  }

  async post<T>(endpoint: string, data?: unknown, requireAuth = true): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
      },
      requireAuth
    )
  }

  async put<T>(endpoint: string, data?: unknown, requireAuth = true): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined,
      },
      requireAuth
    )
  }

  async delete<T>(endpoint: string, requireAuth = true): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' }, requireAuth)
  }
}

export const apiClient = new ApiClient(API_URL)
