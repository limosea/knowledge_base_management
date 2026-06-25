import { useEffect, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { messagesApi } from '@/api'
import type { MessageListItem, MessageDetail, MessageType } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'
import { cn, formatDate, formatRelativeTime } from '@/lib/utils'
import {
  Mail,
  MailOpen,
  Star,
  Trash2,
  CheckCheck,
  RefreshCw,
  Inbox,
} from 'lucide-react'

export function MessagesPage() {
  const { t } = useTranslation()
  const { toast } = useToast()
  const [messages, setMessages] = useState<MessageListItem[]>([])
  const [selectedMessage, setSelectedMessage] = useState<MessageDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [unreadCount, setUnreadCount] = useState(0)
  const [page, setPage] = useState(1)
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [unreadOnly, setUnreadOnly] = useState(false)
  const [starredOnly, setStarredOnly] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const limit = 20

  const fetchMessages = useCallback(async () => {
    setLoading(true)
    try {
      const response = await messagesApi.list({
        page,
        limit,
        type: typeFilter !== 'all' ? typeFilter : undefined,
        unreadOnly: unreadOnly || undefined,
        starredOnly: starredOnly || undefined,
      })
      setMessages(response.items)
      setTotal(response.total)
      setUnreadCount(response.unreadCount)
    } catch {
      toast({
        title: t('common.error'),
        description: t('messages.fetchError'),
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [page, typeFilter, unreadOnly, starredOnly, t, toast])

  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  const handleSelectMessage = async (msg: MessageListItem) => {
    try {
      const detail = await messagesApi.getDetail(msg.id)
      setSelectedMessage(detail)
      if (!msg.isRead) {
        await messagesApi.markAsRead(msg.id)
        setMessages((prev) =>
          prev.map((m) => (m.id === msg.id ? { ...m, isRead: true } : m))
        )
        setUnreadCount((prev) => Math.max(0, prev - 1))
      }
    } catch {
      toast({
        title: t('common.error'),
        description: t('messages.detailError'),
        variant: 'destructive',
      })
    }
  }

  const handleStar = async (id: string, currentStarred: boolean) => {
    try {
      await messagesApi.star(id, !currentStarred)
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, isStarred: !currentStarred } : m))
      )
      if (selectedMessage?.id === id) {
        setSelectedMessage((prev) => prev ? { ...prev, isStarred: !currentStarred } : null)
      }
    } catch {
      toast({
        title: t('common.error'),
        description: t('messages.starError'),
        variant: 'destructive',
      })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await messagesApi.delete(id)
      setMessages((prev) => prev.filter((m) => m.id !== id))
      setTotal((prev) => prev - 1)
      if (selectedMessage?.id === id) {
        setSelectedMessage(null)
      }
    } catch {
      toast({
        title: t('common.error'),
        description: t('messages.deleteError'),
        variant: 'destructive',
      })
    }
  }

  const handleMarkAllRead = async () => {
    try {
      const result = await messagesApi.markAllAsRead()
      setMessages((prev) => prev.map((m) => ({ ...m, isRead: true })))
      setUnreadCount(0)
      toast({
        title: t('common.success'),
        description: t('messages.markAllReadSuccess', { count: result.count }),
      })
    } catch {
      toast({
        title: t('common.error'),
        description: t('messages.markAllReadError'),
        variant: 'destructive',
      })
    }
  }

  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) return
    try {
      const result = await messagesApi.batchDelete(Array.from(selectedIds))
      setMessages((prev) => prev.filter((m) => !selectedIds.has(m.id)))
      setTotal((prev) => Math.max(0, prev - result.count))
      setSelectedIds(new Set())
      if (selectedMessage && selectedIds.has(selectedMessage.id)) {
        setSelectedMessage(null)
      }
      toast({
        title: t('common.success'),
        description: t('messages.batchDeleteSuccess', { count: result.count }),
      })
    } catch {
      toast({
        title: t('common.error'),
        description: t('messages.batchDeleteError'),
        variant: 'destructive',
      })
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === messages.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(messages.map((m) => m.id)))
    }
  }

  const typeBadgeVariant = (type: MessageType) => {
    switch (type) {
      case 'announcement':
        return 'default' as const
      case 'approval':
        return 'secondary' as const
      case 'system':
        return 'outline' as const
    }
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold">{t('messages.title')}</h1>
          {unreadCount > 0 && (
            <Badge variant="destructive">{unreadCount}</Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
              <CheckCheck className="h-4 w-4 mr-1" />
              {t('messages.markAllRead')}
            </Button>
          )}
        </div>
      </div>

      <Card>
        <div className="flex items-center gap-3 p-4 border-b">
          <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1) }}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder={t('messages.allTypes')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('messages.allTypes')}</SelectItem>
              <SelectItem value="announcement">{t('messages.typeAnnouncement')}</SelectItem>
              <SelectItem value="approval">{t('messages.typeApproval')}</SelectItem>
              <SelectItem value="system">{t('messages.typeSystem')}</SelectItem>
            </SelectContent>
          </Select>

          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <Checkbox checked={unreadOnly} onCheckedChange={(checked) => { setUnreadOnly(!!checked); setPage(1) }} />
            {t('messages.unreadOnly')}
          </label>

          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <Checkbox checked={starredOnly} onCheckedChange={(checked) => { setStarredOnly(!!checked); setPage(1) }} />
            {t('messages.starredOnly')}
          </label>

          <div className="flex-1" />

          {selectedIds.size > 0 && (
            <Button variant="destructive" size="sm" onClick={handleBatchDelete}>
              <Trash2 className="h-4 w-4 mr-1" />
              {t('messages.batchDelete')} ({selectedIds.size})
            </Button>
          )}

          <Button variant="ghost" size="icon" onClick={fetchMessages}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex min-h-[600px]">
          {/* Message List */}
          <div className="w-full md:w-96 lg:w-[420px] border-r">
            <div className="flex items-center gap-2 px-4 py-2 border-b">
              <Checkbox
                checked={messages.length > 0 && selectedIds.size === messages.length}
                onCheckedChange={toggleSelectAll}
              />
              <span className="text-sm text-muted-foreground">
                {t('pagination.showing', {
                  from: total === 0 ? 0 : (page - 1) * limit + 1,
                  to: Math.min(page * limit, total),
                  total,
                })}
              </span>
            </div>
            <ScrollArea className="h-[540px]">
              {loading ? (
                <div className="space-y-2 p-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <Inbox className="h-12 w-12 mb-3" />
                  <p>{t('messages.noMessages')}</p>
                </div>
              ) : (
                <div>
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        'flex items-start gap-3 px-4 py-3 border-b cursor-pointer transition-colors hover:bg-muted/50',
                        selectedMessage?.id === msg.id && 'bg-muted',
                        !msg.isRead && 'bg-primary/5'
                      )}
                      onClick={() => handleSelectMessage(msg)}
                    >
                      <div onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedIds.has(msg.id)}
                          onCheckedChange={() => toggleSelect(msg.id)}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {!msg.isRead && (
                            <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                          )}
                          <span className={cn(
                            'text-sm truncate',
                            !msg.isRead ? 'font-semibold' : 'font-medium'
                          )}>
                            {msg.title}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {msg.content}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={typeBadgeVariant(msg.type)} className="text-[10px] px-1.5 py-0">
                            {t(`messages.type${msg.type.charAt(0).toUpperCase() + msg.type.slice(1)}`)}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">
                            {formatRelativeTime(msg.createdAt)}
                          </span>
                          {msg.isStarred && (
                            <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  {t('common.back')}
                </Button>
                <span className="text-xs text-muted-foreground">
                  {page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  {t('pagination.next')}
                </Button>
              </div>
            )}
          </div>

          {/* Message Detail */}
          <div className="flex-1 hidden md:block">
            {!selectedMessage ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Mail className="h-12 w-12 mb-3" />
                <p>{t('messages.selectMessage')}</p>
              </div>
            ) : (
              <div className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">{selectedMessage.title}</h2>
                    <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                      <Badge variant={typeBadgeVariant(selectedMessage.type)}>
                        {t(`messages.type${selectedMessage.type.charAt(0).toUpperCase() + selectedMessage.type.slice(1)}`)}
                      </Badge>
                      {selectedMessage.sender && (
                        <span>{t('messages.from')}: {selectedMessage.sender.name}</span>
                      )}
                      <span>{formatDate(selectedMessage.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleStar(selectedMessage.id, selectedMessage.isStarred)}
                    >
                      <Star
                        className={cn(
                          'h-4 w-4',
                          selectedMessage.isStarred
                            ? 'text-yellow-500 fill-yellow-500'
                            : ''
                        )}
                      />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(selectedMessage.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {selectedMessage.isRead && selectedMessage.readAt && (
                  <p className="text-xs text-muted-foreground">
                    <MailOpen className="h-3 w-3 inline mr-1" />
                    {t('messages.readAt')}: {formatDate(selectedMessage.readAt)}
                  </p>
                )}

                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {selectedMessage.content}
                  </div>
                </div>

                {selectedMessage.metadata && Object.keys(selectedMessage.metadata).length > 0 && (
                  <Card>
                    <CardContent className="pt-4">
                      <h3 className="text-sm font-medium mb-2">{t('messages.metadata')}</h3>
                      <pre className="text-xs bg-muted p-3 rounded-md overflow-auto">
                        {JSON.stringify(selectedMessage.metadata, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>

    </div>
  )
}
