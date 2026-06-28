import { apiClient } from './client'
import type {
  TestAccount,
  TestAccountListResponse,
  CreateTestAccountRequest,
  CreateTestAccountResponse,
} from '@/types'

/**
 * Test account management — super_admin only.
 *
 * Test accounts are time-limited, manually-deactivatable accounts kept
 * in a physically separate `test_accounts` table so they never leak
 * into public-data queries. The plaintext password is returned EXACTLY
 * ONCE on creation; thereafter it is unrecoverable.
 *
 * Endpoints:
 *   GET    /admin/test-accounts          — list (paginated)
 *   GET    /admin/test-accounts/:id      — get one
 *   POST   /admin/test-accounts          — create (returns creds once)
 *   DELETE /admin/test-accounts/:id      — deactivate (soft, retained)
 *   DELETE /admin/test-accounts/:id/hard — hard delete
 */
export const testAccountsApi = {
  list: (params?: {
    page?: number
    limit?: number
    isActive?: boolean
    search?: string
  }): Promise<TestAccountListResponse> => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', String(params.page))
    if (params?.limit) searchParams.set('limit', String(params.limit))
    if (params?.isActive !== undefined) searchParams.set('isActive', String(params.isActive))
    if (params?.search) searchParams.set('search', params.search)
    const query = searchParams.toString()
    return apiClient.get<TestAccountListResponse>(
      `/admin/test-accounts${query ? `?${query}` : ''}`
    )
  },

  get: (id: string): Promise<TestAccount> => {
    return apiClient.get<TestAccount>(`/admin/test-accounts/${id}`)
  },

  create: (data: CreateTestAccountRequest): Promise<CreateTestAccountResponse> => {
    return apiClient.post<CreateTestAccountResponse>('/admin/test-accounts', data)
  },

  /** Soft-deactivate (flip is_active=false). Row retained for audit. */
  deactivate: (id: string): Promise<{ message: string }> => {
    return apiClient.delete<{ message: string }>(`/admin/test-accounts/${id}`)
  },

  /** Hard delete — row removed entirely. */
  remove: (id: string): Promise<{ message: string }> => {
    return apiClient.delete<{ message: string }>(`/admin/test-accounts/${id}/hard`)
  },
}
