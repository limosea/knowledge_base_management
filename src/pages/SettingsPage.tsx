import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import QRCode from 'qrcode'
import { authApi } from '@/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Shield, ShieldOff, Copy, Check } from 'lucide-react'
import type { AdminProfile, MfaSetupResponse } from '@/types'

export function SettingsPage() {
  const { t } = useTranslation()
  const { toast } = useToast()
  const qrCodeRef = useRef<HTMLCanvasElement>(null)
  const [profile, setProfile] = useState<AdminProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [mfaSetup, setMfaSetup] = useState<MfaSetupResponse | null>(null)
  const [mfaCode, setMfaCode] = useState('')
  const [mfaLoading, setMfaLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    loadProfile()
  }, [])

  useEffect(() => {
    if (mfaSetup?.qrCodeUrl && qrCodeRef.current) {
      QRCode.toCanvas(qrCodeRef.current, mfaSetup.qrCodeUrl, {
        width: 192,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      }).catch(console.error)
    }
  }, [mfaSetup])

  const loadProfile = async () => {
    try {
      const data = await authApi.getProfile()
      setProfile(data)
    } catch {
      toast({
        title: t('common.error'),
        description: t('settings.loadProfileError'),
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSetupMfa = async () => {
    setMfaLoading(true)
    try {
      const setup = await authApi.setupMfa()
      setMfaSetup(setup)
    } catch {
      toast({
        title: t('common.error'),
        description: t('settings.mfaSetupError'),
        variant: 'destructive',
      })
    } finally {
      setMfaLoading(false)
    }
  }

  const handleEnableMfa = async () => {
    if (!mfaCode || mfaCode.length < 6) return

    setMfaLoading(true)
    try {
      await authApi.enableMfa(mfaCode)
      toast({
        title: t('common.success'),
        description: t('settings.mfaEnabledSuccess'),
      })
      setMfaSetup(null)
      setMfaCode('')
      await loadProfile()
    } catch (error: unknown) {
      const err = error as { error?: { message?: string } }
      toast({
        title: t('common.error'),
        description: err?.error?.message || t('settings.mfaEnableError'),
        variant: 'destructive',
      })
    } finally {
      setMfaLoading(false)
    }
  }

  const handleDisableMfa = async () => {
    if (!mfaCode || mfaCode.length < 6) return

    setMfaLoading(true)
    try {
      await authApi.disableMfa(mfaCode)
      toast({
        title: t('common.success'),
        description: t('settings.mfaDisabledSuccess'),
      })
      setMfaCode('')
      await loadProfile()
    } catch (error: unknown) {
      const err = error as { error?: { message?: string } }
      toast({
        title: t('common.error'),
        description: err?.error?.message || t('settings.mfaDisableError'),
        variant: 'destructive',
      })
    } finally {
      setMfaLoading(false)
    }
  }

  const copySecret = async () => {
    if (mfaSetup?.secret) {
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(mfaSetup.secret)
        } else {
          const textArea = document.createElement('textarea')
          textArea.value = mfaSetup.secret
          textArea.style.position = 'fixed'
          textArea.style.left = '-999999px'
          document.body.appendChild(textArea)
          textArea.select()
          document.execCommand('copy')
          document.body.removeChild(textArea)
        }
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch {
        toast({
          title: t('common.error'),
          description: t('settings.copyFailed'),
          variant: 'destructive',
        })
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t('settings.title')}</h1>

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle>{t('settings.profile')}</CardTitle>
          <CardDescription>{t('settings.profileDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">{t('users.username')}</Label>
              <p className="font-medium">{profile?.username}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">{t('users.email')}</Label>
              <p className="font-medium">{profile?.email || '-'}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">{t('users.role')}</Label>
              <p className="font-medium">
                <Badge variant={profile?.role === 'super_admin' ? 'default' : 'secondary'}>
                  {profile?.role === 'super_admin' ? t('users.superAdmin') : t('users.admin')}
                </Badge>
              </p>
            </div>
            <div>
              <Label className="text-muted-foreground">{t('settings.createdAt')}</Label>
              <p className="font-medium">
                {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '-'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* MFA Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {profile?.mfaEnabled ? (
              <Shield className="h-5 w-5 text-green-500" />
            ) : (
              <ShieldOff className="h-5 w-5 text-muted-foreground" />
            )}
            {t('settings.mfaTitle')}
          </CardTitle>
          <CardDescription>{t('settings.mfaDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Label>{t('settings.mfaStatus')}</Label>
            <Badge variant={profile?.mfaEnabled ? 'default' : 'outline'}>
              {profile?.mfaEnabled ? t('settings.mfaEnabled') : t('settings.mfaDisabled')}
            </Badge>
          </div>

          {!profile?.mfaEnabled && !mfaSetup && (
            <Button onClick={handleSetupMfa} disabled={mfaLoading}>
              {mfaLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('settings.mfaSetupButton')}
            </Button>
          )}

          {mfaSetup && (
            <div className="space-y-4 p-4 border rounded-lg">
              <div>
                <Label>{t('settings.mfaScanQr')}</Label>
                <p className="text-sm text-muted-foreground mb-2">{t('settings.mfaScanQrDescription')}</p>
                <div className="bg-white p-2 inline-block rounded">
                  <canvas ref={qrCodeRef} />
                </div>
              </div>

              <div>
                <Label>{t('settings.mfaSecret')}</Label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="flex-1 p-2 bg-muted rounded text-sm font-mono break-all">
                    {mfaSetup.secret}
                  </code>
                  <Button variant="outline" size="icon" onClick={copySecret}>
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{t('settings.mfaSecretDescription')}</p>
              </div>

              <div>
                <Label>{t('settings.mfaBackupCodes')}</Label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {mfaSetup.backupCodes.map((code, index) => (
                    <code key={index} className="p-2 bg-muted rounded text-sm font-mono">
                      {code}
                    </code>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-1">{t('settings.mfaBackupCodesDescription')}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mfaCode">{t('settings.mfaVerifyCode')}</Label>
                <Input
                  id="mfaCode"
                  type="text"
                  placeholder="000000"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleEnableMfa} disabled={mfaLoading || mfaCode.length < 6}>
                  {mfaLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t('settings.mfaEnableButton')}
                </Button>
                <Button variant="outline" onClick={() => { setMfaSetup(null); setMfaCode('') }}>
                  {t('common.cancel')}
                </Button>
              </div>
            </div>
          )}

          {profile?.mfaEnabled && !mfaSetup && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="disableMfaCode">{t('settings.mfaDisableCode')}</Label>
                <Input
                  id="disableMfaCode"
                  type="text"
                  placeholder="000000"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                />
              </div>
              <Button variant="destructive" onClick={handleDisableMfa} disabled={mfaLoading || mfaCode.length < 6}>
                {mfaLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('settings.mfaDisableButton')}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
