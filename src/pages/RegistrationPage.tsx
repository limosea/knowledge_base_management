import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { registrationApi } from '@/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Loader2, CheckCircle, AlertTriangle, ArrowLeft } from 'lucide-react'

const USERNAME_REGEX = /^[a-zA-Z][a-zA-Z0-9_.@-]{2,31}$/
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

export function RegistrationPage() {
  const { t } = useTranslation()
  const { toast } = useToast()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''

  const [verifying, setVerifying] = useState(true)
  const [tokenStatus, setTokenStatus] = useState<'pending' | 'consumed' | 'revoked' | 'expired' | 'invalid' | null>(null)
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [nickname, setNickname] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [completed, setCompleted] = useState(false)

  useEffect(() => {
    if (!token) {
      setVerifying(false)
      setTokenStatus('invalid')
      return
    }

    const verify = async () => {
      try {
        const response = await registrationApi.verifyToken({ token })
        if (response.valid && response.status === 'pending') {
          setTokenStatus('pending')
          if (response.email) {
            setEmail(response.email)
          }
        } else {
          setTokenStatus(response.status)
        }
      } catch {
        setTokenStatus('invalid')
      } finally {
        setVerifying(false)
      }
    }

    verify()
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username || !nickname || !password) return
    if (password !== confirmPassword) {
      toast({
        title: t('common.error'),
        description: t('auth.passwordsDoNotMatch'),
        variant: 'destructive',
      })
      return
    }
    if (!USERNAME_REGEX.test(username)) {
      toast({
        title: t('common.error'),
        description: t('settings.usernameRules'),
        variant: 'destructive',
      })
      return
    }
    if (!PASSWORD_REGEX.test(password)) {
      toast({
        title: t('common.error'),
        description: t('auth.passwordRequirements'),
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    try {
      await registrationApi.completeRegistration({ token, username, nickname, password })
      setCompleted(true)
      toast({
        title: t('common.success'),
        description: t('auth.registrationSuccess', 'Registration successful'),
      })
    } catch (error: unknown) {
      const err = error as { error?: { message?: string } }
      toast({
        title: t('common.error'),
        description: err?.error?.message || t('auth.registrationFailed', 'Registration failed'),
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  if (verifying) {
    return (
      <Card className="shadow-lg">
        <CardContent className="flex items-center justify-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (tokenStatus !== 'pending') {
    const statusText = {
      consumed: t('auth.invitationConsumed', 'This invitation has already been used'),
      revoked: t('auth.invitationRevoked', 'This invitation has been revoked'),
      expired: t('auth.invitationExpired', 'This invitation has expired'),
      invalid: t('auth.invitationInvalid', 'Invalid or missing invitation link'),
    }[tokenStatus || 'invalid']

    return (
      <Card className="shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-destructive">{t('common.error')}</CardTitle>
          <CardDescription>{statusText}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="ghost" className="w-full" asChild>
            <Link to="/login">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('auth.backToLogin')}
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (completed) {
    return (
      <Card className="shadow-lg">
        <CardHeader className="text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-2" />
          <CardTitle className="text-2xl">{t('auth.registrationComplete', 'Registration Complete')}</CardTitle>
          <CardDescription>{t('auth.registrationCompleteDesc', 'Your account has been created. You can now log in.')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full" asChild>
            <Link to="/login">{t('auth.loginButton')}</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{t('auth.registrationTitle', 'Create Account')}</CardTitle>
        <CardDescription>{t('auth.registrationSubtitle', 'Complete your registration using the invitation')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t('users.email')}</Label>
            <Input id="email" type="email" value={email} disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">{t('users.username')}</Label>
            <Input
              id="username"
              type="text"
              placeholder={t('users.username')}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
            />
            <p className="text-xs text-muted-foreground">{t('settings.usernameRules')}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="nickname">{t('users.nickname', 'Nickname')}</Label>
            <Input
              id="nickname"
              type="text"
              placeholder={t('users.nickname', 'Nickname')}
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{t('auth.password')}</Label>
            <Input
              id="password"
              type="password"
              placeholder={t('auth.password')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
          <div className="rounded-md border border-amber-500/50 bg-amber-500/5 p-3 text-sm text-amber-700 dark:text-amber-400 flex gap-2">
            <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>{t('auth.invitationOneTime', 'This invitation can only be used once and will expire.')}</span>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('auth.completeRegistration', 'Complete Registration')}
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
