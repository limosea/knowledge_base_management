import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { authApi } from '@/api'
import { usePermission } from '@/contexts/PermissionContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Loader2, ArrowLeft, Mail } from 'lucide-react'
import type { LoginResponse } from '@/types'

export function CodeLoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { refreshPermissions } = usePermission()
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [loading, setLoading] = useState(false)

  const startCountdown = (seconds: number) => {
    setCountdown(seconds)
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setLoading(true)
    try {
      const response = await authApi.requestCodeLogin({ email })
      if (response.sent) {
        setCodeSent(true)
        startCountdown(60)
        toast({
          title: t('common.success'),
          description: t('auth.codeSent', 'Verification code sent to your email'),
        })
      } else {
        toast({
          title: t('common.error'),
          description: t('auth.codeSendFailed', 'Unable to send verification code. Please check your email or contact an administrator.'),
          variant: 'destructive',
        })
      }
    } catch (error: unknown) {
      const err = error as { error?: { message?: string } }
      toast({
        title: t('common.error'),
        description: err?.error?.message || t('auth.codeSendFailed'),
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !code) return

    setLoading(true)
    try {
      const response = await authApi.loginWithCode({ email, code })
      if ('mfaRequired' in response && response.mfaRequired) {
        navigate('/login/mfa', { state: { tempToken: response.tempToken } })
      } else if ('requirePasswordChange' in response && response.requirePasswordChange) {
        navigate('/change-password', { state: { email } })
      } else {
        const user = (response as LoginResponse).user
        if (user && user.isActive === false) {
          authApi.logout()
          toast({
            title: t('common.error'),
            description: t('auth.accountDisabled'),
            variant: 'destructive',
          })
          setLoading(false)
          return
        }
        await refreshPermissions()
        navigate('/dashboard')
      }
    } catch (error: unknown) {
      const err = error as { error?: { message?: string } }
      toast({
        title: t('common.error'),
        description: err?.error?.message || t('auth.invalidCode'),
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{t('auth.codeLoginTitle', 'Verification Code Login')}</CardTitle>
        <CardDescription>
          {codeSent
            ? t('auth.codeLoginSubtitleSent', 'Enter the verification code sent to your email')
            : t('auth.codeLoginSubtitle', 'Sign in with a one-time code sent to your email')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!codeSent ? (
          <form onSubmit={handleRequestCode} className="space-y-4">
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
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Mail className="mr-2 h-4 w-4" />
              {t('auth.sendCode', 'Send Verification Code')}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('users.email')}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">{t('auth.verificationCode', 'Verification Code')}</Label>
              <Input
                id="code"
                type="text"
                placeholder={t('auth.codeLoginCodePlaceholder', '000000')}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 12))}
                required
                autoComplete="one-time-code"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={12}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading || code.length < 4}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('auth.loginButton')}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleRequestCode}
              disabled={loading || countdown > 0}
            >
              {countdown > 0
                ? t('auth.resendCode', 'Resend code in {{seconds}}s', { seconds: countdown })
                : t('auth.resendCodeNow', 'Resend code')}
            </Button>
          </form>
        )}

        <div className="flex flex-col gap-2 pt-2">
          <Button type="button" variant="ghost" className="w-full" asChild>
            <Link to="/login">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('auth.backToPasswordLogin', 'Back to password login')}
            </Link>
          </Button>
          <Button type="button" variant="link" className="w-full" asChild>
            <Link to="/password-reset/request">{t('auth.forgotPassword')}</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
