import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { messagesApi } from '@/api'
import type { MessageType, TargetType } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { usePermission } from '@/contexts/PermissionContext'

interface SendMessageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function SendMessageDialog({ open, onOpenChange, onSuccess }: SendMessageDialogProps) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const { user } = usePermission()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [type, setType] = useState<MessageType>('announcement')
  const [targetType, setTargetType] = useState<TargetType>('all')
  const [targetValue, setTargetValue] = useState('')
  const [sending, setSending] = useState(false)

  const needsTargetValue = targetType === 'users' || targetType === 'role' || targetType === 'permission'
  const isSuperAdmin = user?.isSuperAdmin ?? false

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !content.trim()) {
      toast({
        title: t('common.error'),
        description: t('messages.fillRequired'),
        variant: 'destructive',
      })
      return
    }

    if (targetType === 'all' && !isSuperAdmin) {
      toast({
        title: t('common.error'),
        description: t('messages.onlySuperAdminAll'),
        variant: 'destructive',
      })
      return
    }

    if (needsTargetValue && !targetValue.trim()) {
      toast({
        title: t('common.error'),
        description: t('messages.targetValueRequired'),
        variant: 'destructive',
      })
      return
    }

    setSending(true)
    try {
      const parsedTargetValue = needsTargetValue
        ? targetValue.split(',').map((s) => s.trim()).filter(Boolean)
        : undefined

      await messagesApi.send({
        title: title.trim(),
        content: content.trim(),
        type,
        targetType,
        targetValue: parsedTargetValue,
      })

      setTitle('')
      setContent('')
      setType('announcement')
      setTargetType('all')
      setTargetValue('')
      onSuccess()
    } catch {
      toast({
        title: t('common.error'),
        description: t('messages.sendError'),
        variant: 'destructive',
      })
    } finally {
      setSending(false)
    }
  }

  const targetValuePlaceholder = () => {
    switch (targetType) {
      case 'users':
        return t('messages.targetUsersPlaceholder')
      case 'role':
        return t('messages.targetRolePlaceholder')
      case 'permission':
        return t('messages.targetPermissionPlaceholder')
      default:
        return ''
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('messages.sendTitle')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('messages.messageTitle')}</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('messages.titlePlaceholder')}
              maxLength={200}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{t('messages.messageContent')}</label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t('messages.contentPlaceholder')}
              rows={5}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('messages.messageType')}</label>
              <Select value={type} onValueChange={(v) => setType(v as MessageType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="announcement">{t('messages.typeAnnouncement')}</SelectItem>
                  <SelectItem value="approval">{t('messages.typeApproval')}</SelectItem>
                  <SelectItem value="system">{t('messages.typeSystem')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t('messages.targetType')}</label>
              <Select
                value={targetType}
                onValueChange={(v) => {
                  setTargetType(v as TargetType)
                  setTargetValue('')
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {isSuperAdmin && (
                    <SelectItem value="all">{t('messages.targetAll')}</SelectItem>
                  )}
                  <SelectItem value="users">{t('messages.targetUsers')}</SelectItem>
                  <SelectItem value="role">{t('messages.targetRole')}</SelectItem>
                  <SelectItem value="permission">{t('messages.targetPermission')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {needsTargetValue && (
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('messages.targetValue')}</label>
              <Input
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                placeholder={targetValuePlaceholder()}
              />
              <p className="text-xs text-muted-foreground">
                {t('messages.targetValueHint')}
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={sending}>
              {sending ? t('messages.sending') : t('messages.send')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
