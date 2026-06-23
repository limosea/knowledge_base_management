import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { authApi } from '@/api'
import { usePermission } from '@/contexts/PermissionContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'

interface ChangePasswordLocationState {
  username?: string
}

export function ChangePasswordPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()
  const { refreshPermissions } = usePermission()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const state = location.state as ChangePasswordLocationState | null
  const username = state?.username

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentPassword || !newPassword || !confirmPassword) return

    if (newPassword !== confirmPassword) {
      toast({
        title: t('common.error'),
        description: t('validation.passwordMatch'),
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    try {
      await authApi.changePassword({ currentPassword, newPassword })
      await refreshPermissions()
      navigate('/dashboard', { replace: true })
    } catch (error: unknown) {
      const err = error as { error?: { message?: string } }
      toast({
        title: t('common.error'),
        description: err?.error?.message || t('auth.changePasswordFailed'),
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{t('auth.changePasswordTitle')}</CardTitle>
        <CardDescription>{t('auth.changePasswordSubtitle')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {username && (
            <div className="text-center text-sm text-muted-foreground">
              {t('auth.username')}: <span className="font-medium">{username}</span>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="currentPassword">{t('auth.currentPassword')}</Label>
            <Input
              id="currentPassword"
              type="password"
              placeholder={t('auth.currentPassword')}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">{t('auth.newPassword')}</Label>
            <Input
              id="newPassword"
              type="password"
              placeholder={t('auth.newPassword')}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t('auth.confirmPassword')}</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder={t('auth.confirmPassword')}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('auth.changePasswordButton')}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
