import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { authApi } from '@/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Loader2, ArrowLeft, Mail } from 'lucide-react'

export function PasswordResetRequestPage() {
  const { t } = useTranslation()
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setLoading(true)
    try {
      const response = await authApi.requestPasswordReset({ email })
      if (response.sent) {
        setSent(true)
        toast({
          title: t('common.success'),
          description: t('auth.passwordResetSent', 'Password reset code sent to your email'),
        })
      } else {
        toast({
          title: t('common.error'),
          description: t('auth.passwordResetSendFailed', 'Unable to send reset code. Please check your email.'),
          variant: 'destructive',
        })
      }
    } catch (error: unknown) {
      const err = error as { error?: { message?: string } }
      toast({
        title: t('common.error'),
        description: err?.error?.message || t('auth.passwordResetSendFailed'),
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{t('auth.passwordResetTitle', 'Reset Password')}</CardTitle>
        <CardDescription>
          {sent
            ? t('auth.passwordResetSubtitleSent', 'Check your email for the reset code')
            : t('auth.passwordResetSubtitle', 'Enter your email to receive a password reset code')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {sent ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {t('auth.passwordResetCheckEmail', 'If the email exists in our system, a reset code has been sent. Please check your inbox and spam folder.')}
            </p>
            <Button variant="outline" className="w-full" asChild>
              <Link to="/password-reset">{t('auth.haveResetCode', 'I have a reset code')}</Link>
            </Button>
            <Button variant="ghost" className="w-full" asChild>
              <Link to="/login">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t('auth.backToLogin', 'Back to login')}
              </Link>
            </Button>
          </div>
        ) : (
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
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Mail className="mr-2 h-4 w-4" />
              {t('auth.sendResetCode', 'Send Reset Code')}
            </Button>
            <Button variant="ghost" className="w-full" asChild>
              <Link to="/login">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t('auth.backToLogin')}
              </Link>
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
