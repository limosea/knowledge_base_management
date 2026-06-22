import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { usePermission } from '@/contexts/PermissionContext'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Shield, Loader2 } from 'lucide-react'

interface ElevationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function ElevationDialog({ open, onOpenChange, onSuccess }: ElevationDialogProps) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const navigate = useNavigate()
  const { stepUp, elevation } = usePermission()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (code.length < 6) return

    setLoading(true)
    const result = await stepUp(code)
    setLoading(false)

    if (result.success) {
      toast({
        title: t('common.success'),
        description: t('elevation.success'),
      })
      onSuccess()
    } else {
      toast({
        title: t('common.error'),
        description: result.error || t('elevation.failed'),
        variant: 'destructive',
      })
    }
  }

  const handleSetupMfa = () => {
    navigate('/settings')
    onOpenChange(false)
  }

  if (!elevation.mfaEnabled) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              {t('elevation.mfaRequired')}
            </DialogTitle>
            <DialogDescription>{t('elevation.mfaRequiredDescription')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleSetupMfa}>{t('elevation.setupMfa')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {t('elevation.title')}
          </DialogTitle>
          <DialogDescription>{t('elevation.description')}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="py-4">
            <Label htmlFor="totp-code">{t('elevation.totpCode')}</Label>
            <Input
              id="totp-code"
              type="text"
              placeholder="000000"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="mt-2 text-center text-2xl tracking-widest"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={code.length < 6 || loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('elevation.confirm')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
