import { useEffect, useRef, useCallback, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import type { MessageListItem } from '@/types'

const WS_URL = import.meta.env.VITE_WS_URL || ''

interface UseMessagesWebSocketReturn {
  unreadCount: number
  newMessage: MessageListItem | null
  connected: boolean
  clearNewMessage: () => void
}

export function useMessagesWebSocket(): UseMessagesWebSocketReturn {
  const socketRef = useRef<Socket | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const [newMessage, setNewMessage] = useState<MessageListItem | null>(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) return

    const socket = io(`${WS_URL}/admin/messages`, {
      auth: { token },
      transports: ['websocket', 'polling'],
    })

    socketRef.current = socket

    socket.on('connect', () => {
      setConnected(true)
    })

    socket.on('disconnect', () => {
      setConnected(false)
    })

    socket.on('unread_count_update', (data: { count: number }) => {
      setUnreadCount(data.count)
    })

    socket.on('new_message', (data: MessageListItem) => {
      setNewMessage(data)
      setUnreadCount((prev) => prev + 1)
    })

    socket.on('unread_messages', (data: { items: MessageListItem[] }) => {
      if (data.items.length > 0) {
        setUnreadCount((prev) => Math.max(prev, data.items.length))
      }
    })

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [])

  const clearNewMessage = useCallback(() => {
    setNewMessage(null)
  }, [])

  return { unreadCount, newMessage, connected, clearNewMessage }
}
