import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { authApi } from '@/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Loader2, ArrowLeft } from 'lucide-react'

interface MfaLocationState {
  tempToken: string
}

export function MfaPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()
  const [mfaCode, setMfaCode] = useState('')
  const [loading, setLoading] = useState(false)

  const state = location.state as MfaLocationState | null
  const tempToken = state?.tempToken

  if (!tempToken) {
    navigate('/login', { replace: true })
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!mfaCode || mfaCode.length < 6) return

    setLoading(true)
    try {
      await authApi.loginWithMfa({ tempToken, mfaCode })
      navigate('/dashboard')
    } catch (error: unknown) {
      const err = error as { error?: { message?: string } }
      toast({
        title: t('common.error'),
        description: err?.error?.message || t('auth.mfaInvalidCode'),
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    navigate('/login')
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{t('auth.mfaTitle')}</CardTitle>
        <CardDescription>{t('auth.mfaSubtitle')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mfaCode">{t('auth.mfaCode')}</Label>
            <Input
              id="mfaCode"
              type="text"
              placeholder={t('auth.mfaCodePlaceholder')}
              value={mfaCode}
              onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              required
              autoComplete="one-time-code"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading || mfaCode.length < 6}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('auth.mfaVerifyButton')}
          </Button>
          <Button type="button" variant="ghost" className="w-full" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('common.back')}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
