import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import QRCode from 'qrcode'
import { authApi, meApi } from '@/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Shield, ShieldOff, Copy, Check, Trash2, UserCog, AlertTriangle } from 'lucide-react'
import type { AdminProfile, MfaSetupResponse } from '@/types'

// Mirrors the backend USERNAME_REGEX / policy so the client can give
// immediate feedback before round-tripping to the server.
const USERNAME_REGEX = /^[a-zA-Z][a-zA-Z0-9_.@-]{2,31}$/

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
  const [deletionMfaCode, setDeletionMfaCode] = useState('')
  const [deletionLoading, setDeletionLoading] = useState(false)
  const [deletionPending, setDeletionPending] = useState(false)

  // One-time username reset state. `usernameResetAvailable` is sourced
  // from the profile (`usernameChangedAt` is NULL ⇒ available). Once
  // the user submits a new username, the backend invalidates all
  // sessions — we surface a "please log in again" notice instead of
  // silently refreshing.
  const [newUsername, setNewUsername] = useState('')
  const [usernameResetLoading, setUsernameResetLoading] = useState(false)
  const [usernameResetDone, setUsernameResetDone] = useState(false)

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

  const handleResetUsername = async () => {
    const trimmed = newUsername.trim()
    if (!trimmed) return
    if (!USERNAME_REGEX.test(trimmed)) {
      toast({
        title: t('common.error'),
        description: t('settings.usernameResetInvalid', '用户名格式无效：3-32 字符，以字母开头，仅允许字母、数字、_ . @ -'),
        variant: 'destructive',
      })
      return
    }
    if (trimmed === profile?.username) {
      toast({
        title: t('common.error'),
        description: t('settings.usernameResetSame', '新用户名不能与当前用户名相同'),
        variant: 'destructive',
      })
      return
    }
    setUsernameResetLoading(true)
    try {
      await meApi.updateUsername({ newUsername: trimmed })
      setUsernameResetDone(true)
      toast({
        title: t('common.success'),
        description: t('settings.usernameResetSuccess', '用户名已更新，请使用新用户名重新登录'),
      })
    } catch (error: unknown) {
      const err = error as { error?: { message?: string } }
      toast({
        title: t('common.error'),
        description: err?.error?.message || t('settings.usernameResetError', '用户名重设失败'),
        variant: 'destructive',
      })
    } finally {
      setUsernameResetLoading(false)
    }
  }

  const handleRequestDeletion = async () => {
    if (!deletionMfaCode || deletionMfaCode.length < 6) return
    setDeletionLoading(true)
    try {
      await meApi.requestDeletion({ mfaCode: deletionMfaCode })
      toast({ title: t('common.success'), description: t('settings.deletionRequested', '销户申请已提交，等待管理员审批') })
      setDeletionPending(true)
      setDeletionMfaCode('')
    } catch (error: unknown) {
      const err = error as { error?: { message?: string } }
      toast({ title: t('common.error'), description: err?.error?.message || t('settings.deletionError', '销户申请失败'), variant: 'destructive' })
    } finally {
      setDeletionLoading(false)
    }
  }

  const handleCancelDeletion = async () => {
    setDeletionLoading(true)
    try {
      await meApi.cancelDeletion()
      toast({ title: t('common.success'), description: t('settings.deletionCancelled', '销户申请已取消') })
      setDeletionPending(false)
    } catch (error: unknown) {
      const err = error as { error?: { message?: string } }
      toast({ title: t('common.error'), description: err?.error?.message || '取消失败', variant: 'destructive' })
    } finally {
      setDeletionLoading(false)
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
              <Label className="text-muted-foreground">{t('users.nickname', 'Nickname')}</Label>
              <p className="font-medium">{profile?.nickname || '-'}</p>
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

      {/* Username Reset Card */}
      {/*
        One-time username reset. Available iff `usernameChangedAt` is
        null (i.e. the account was admin-created with a random
        username and never renamed). After a successful reset the
        backend revokes all sessions, so we show a "log in again"
        notice and hide the form. Admins who created their own
        username at signup (usernameResetAvailable === false) see a
        locked, read-only state explaining that the username is
        immutable.
      */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5" />
            {t('settings.usernameResetTitle', '重设用户名')}
          </CardTitle>
          <CardDescription>
            {t('settings.usernameResetDescription', '用户名用于登录与管理审计，仅可重设一次。重设成功后所有会话将立即失效，请使用新用户名重新登录。')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">{t('users.username')}</Label>
              <p className="font-medium font-mono">{profile?.username}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">{t('settings.usernameResetStatus', '重设状态')}</Label>
              <p className="font-medium">
                {profile?.usernameChangedAt ? (
                  <Badge variant="outline" className="border-muted-foreground/40 text-muted-foreground">
                    {t('settings.usernameResetUsed', '已使用 · {{date}}', { date: new Date(profile.usernameChangedAt).toLocaleDateString() })}
                  </Badge>
                ) : profile?.requireUsernameChange ? (
                  <Badge variant="outline" className="border-orange-400 text-orange-600">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {t('settings.usernameResetRequired', '需重设')}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-green-500 text-green-600">
                    {t('settings.usernameResetAvailable', '可用')}
                  </Badge>
                )}
              </p>
            </div>
          </div>

          {usernameResetDone ? (
            <div className="rounded-md border border-green-500/50 bg-green-500/5 p-3 text-sm text-green-700 dark:text-green-400">
              {t('settings.usernameResetDoneNotice', '用户名已更新。当前会话已失效，请使用新用户名重新登录。')}
            </div>
          ) : profile?.usernameChangedAt || profile?.usernameResetAvailable === false ? (
            <p className="text-sm text-muted-foreground">
              {t('settings.usernameResetLocked', '您的用户名已不可修改。用户名是稳定的登录与审计标识，仅可在首次重设机会内修改一次。')}
            </p>
          ) : (
            <div className="space-y-3">
              {profile?.requireUsernameChange && (
                <div className="rounded-md border border-orange-500/50 bg-orange-500/5 p-3 text-sm text-orange-700 dark:text-orange-400">
                  {t('settings.usernameResetRequiredNotice', '您的账号由管理员创建并分配了随机用户名，请尽快重设为便于记忆的用户名。')}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="newUsername">{t('settings.newUsername', '新用户名')}</Label>
                <Input
                  id="newUsername"
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="3-32 chars, start with a letter"
                  maxLength={32}
                  autoComplete="off"
                />
                <p className="text-xs text-muted-foreground">
                  {t('settings.usernameRules', '3-32 字符，以字母开头，仅允许字母、数字、_ . @ -')}
                </p>
              </div>
              <Button
                onClick={handleResetUsername}
                disabled={usernameResetLoading || !newUsername.trim() || !USERNAME_REGEX.test(newUsername.trim())}
              >
                {usernameResetLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('settings.usernameResetButton', '重设用户名')}
              </Button>
            </div>
          )}
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

      {/* Account Deletion Card */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            {t('settings.deleteAccount', '销户申请')}
          </CardTitle>
          <CardDescription>{t('settings.deleteAccountDescription', '提交销户申请后，管理员审批通过后将禁用您的账户和所有API密钥。此操作不可由您自行撤销。')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {deletionPending ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="destructive">{t('settings.deletionPending', '待审批')}</Badge>
                <span className="text-sm text-muted-foreground">{t('settings.deletionPendingInfo', '您的销户申请正在等待管理员审批')}</span>
              </div>
              <Button variant="outline" onClick={handleCancelDeletion} disabled={deletionLoading}>
                {deletionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('settings.cancelDeletion', '取消销户申请')}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {!profile?.mfaEnabled ? (
                <p className="text-sm text-muted-foreground">{t('settings.deletionRequiresMfa', '请先启用MFA后才能申请销户')}</p>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="deletionMfaCode">{t('settings.mfaVerifyCode', 'MFA验证码')}</Label>
                    <Input
                      id="deletionMfaCode"
                      type="text"
                      placeholder="000000"
                      value={deletionMfaCode}
                      onChange={(e) => setDeletionMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      maxLength={6}
                    />
                  </div>
                  <Button
                    variant="destructive"
                    onClick={handleRequestDeletion}
                    disabled={deletionLoading || deletionMfaCode.length < 6}
                  >
                    {deletionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t('settings.requestDeletion', '提交销户申请')}
                  </Button>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
