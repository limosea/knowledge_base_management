import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { authApi } from '@/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Loader2, ArrowLeft, Lock } from 'lucide-react'

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

export function PasswordResetPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !code || !newPassword) return
    if (newPassword !== confirmPassword) {
      toast({
        title: t('common.error'),
        description: t('auth.passwordsDoNotMatch', 'Passwords do not match'),
        variant: 'destructive',
      })
      return
    }
    if (!PASSWORD_REGEX.test(newPassword)) {
      toast({
        title: t('common.error'),
        description: t(
          'auth.passwordRequirements',
          'Password must be at least 8 characters and contain uppercase, lowercase, number and special character',
        ),
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    try {
      const response = await authApi.resetPassword({ email, code, newPassword })
      toast({
        title: t('common.success'),
        description: response.message || t('auth.passwordResetSuccess', 'Password reset successfully'),
      })
      navigate('/login')
    } catch (error: unknown) {
      const err = error as { error?: { message?: string } }
      toast({
        title: t('common.error'),
        description: err?.error?.message || t('auth.passwordResetFailed', 'Failed to reset password'),
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{t('auth.passwordResetTitle')}</CardTitle>
        <CardDescription>{t('auth.passwordResetEnterCode', 'Enter the reset code and your new password')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t('users.email')}</Label>
            <Input
              id="email"
              type="email"
              placeholder={t('users.email')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="code">{t('auth.resetCode', 'Reset Code')}</Label>
            <Input
              id="code"
              type="text"
              placeholder={t('auth.resetCodePlaceholder', '000000')}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 12))}
              required
              autoComplete="one-time-code"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={12}
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
            <Lock className="mr-2 h-4 w-4" />
            {t('auth.resetPasswordButton', 'Reset Password')}
          </Button>
          <Button variant="ghost" className="w-full" asChild>
            <Link to="/login">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('auth.backToLogin')}
            </Link>
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
