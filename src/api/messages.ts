import { apiClient } from './client'
import type {
  MessageListResponse,
  MessageDetail,
  SendMessageRequest,
  SendMessageResponse,
  UnreadCountResponse,
  BatchOperationResponse,
} from '@/types'

export const messagesApi = {
  list: (params?: {
    page?: number
    limit?: number
    type?: string
    unreadOnly?: boolean
    starredOnly?: boolean
  }): Promise<MessageListResponse> => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', String(params.page))
    if (params?.limit) searchParams.set('limit', String(params.limit))
    if (params?.type) searchParams.set('type', params.type)
    if (params?.unreadOnly) searchParams.set('unreadOnly', 'true')
    if (params?.starredOnly) searchParams.set('starredOnly', 'true')
    const query = searchParams.toString()
    return apiClient.get<MessageListResponse>(`/admin/messages${query ? `?${query}` : ''}`)
  },

  getDetail: (id: string): Promise<MessageDetail> => {
    return apiClient.get<MessageDetail>(`/admin/messages/${id}`)
  },

  markAsRead: (id: string): Promise<{ success: boolean }> => {
    return apiClient.patch<{ success: boolean }>(`/admin/messages/${id}/read`)
  },

  batchMarkAsRead: (messageIds: string[]): Promise<BatchOperationResponse> => {
    return apiClient.patch<BatchOperationResponse>('/admin/messages/batch-read', { messageIds })
  },

  markAllAsRead: (): Promise<BatchOperationResponse> => {
    return apiClient.patch<BatchOperationResponse>('/admin/messages/read-all')
  },

  star: (id: string, starred: boolean): Promise<{ success: boolean; starred: boolean }> => {
    return apiClient.patch<{ success: boolean; starred: boolean }>(`/admin/messages/${id}/star`, { starred })
  },

  delete: (id: string): Promise<{ success: boolean }> => {
    return apiClient.delete<{ success: boolean }>(`/admin/messages/${id}`)
  },

  batchDelete: (messageIds: string[]): Promise<BatchOperationResponse> => {
    return apiClient.delete<BatchOperationResponse>('/admin/messages/batch', { messageIds })
  },

  getUnreadCount: (): Promise<UnreadCountResponse> => {
    return apiClient.get<UnreadCountResponse>('/admin/messages/unread-count')
  },

  send: (data: SendMessageRequest): Promise<SendMessageResponse> => {
    return apiClient.post<SendMessageResponse>('/admin/messages/send', data)
  },
}
