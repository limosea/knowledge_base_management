import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { registrationApi } from '@/api'
import type { RegistrationInvitation, RegistrationInvitationStatus } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Plus, Ban, Search, Mail } from 'lucide-react'
import { formatDate } from '@/lib/utils'

const statusVariants: Record<RegistrationInvitationStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending: 'default',
  consumed: 'secondary',
  revoked: 'destructive',
  expired: 'outline',
}

interface RegistrationInvitationsPageProps {
  embedded?: boolean
}

export function RegistrationInvitationsPage({ embedded }: RegistrationInvitationsPageProps) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const [invitations, setInvitations] = useState<RegistrationInvitation[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<RegistrationInvitationStatus | 'all'>('all')

  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [createEmail, setCreateEmail] = useState('')
  const [creating, setCreating] = useState(false)
  const [createResult, setCreateResult] = useState<RegistrationInvitation | null>(null)

  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false)
  const [revoking, setRevoking] = useState(false)
  const [currentInvitation, setCurrentInvitation] = useState<RegistrationInvitation | null>(null)

  const limit = 20

  useEffect(() => {
    fetchInvitations()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter])

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1)
      fetchInvitations()
    }, 300)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  const fetchInvitations = async () => {
    setLoading(true)
    try {
      const response = await registrationApi.listInvitations({
        page,
        limit,
        email: search || undefined,
        status: statusFilter === 'all' ? undefined : statusFilter,
      })
      setInvitations(response.data)
      setTotal(response.total)
    } catch (error: unknown) {
      const err = error as { error?: { message?: string } }
      toast({
        title: t('common.error'),
        description: err?.error?.message || t('invitations.fetchError', 'Failed to fetch invitations'),
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!createEmail) return
    setCreating(true)
    try {
      const result = await registrationApi.createInvitation({ email: createEmail })
      setCreateResult({
        id: result.id,
        email: result.email,
        status: 'pending',
        expiresAt: result.expiresAt,
        createdBy: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      fetchInvitations()
    } catch (error: unknown) {
      const err = error as { error?: { message?: string } }
      toast({
        title: t('common.error'),
        description: err?.error?.message || t('invitations.createError', 'Failed to create invitation'),
        variant: 'destructive',
      })
    } finally {
      setCreating(false)
    }
  }

  const handleRevoke = async () => {
    if (!currentInvitation) return
    setRevoking(true)
    try {
      await registrationApi.revokeInvitation(currentInvitation.id)
      toast({
        title: t('common.success'),
        description: t('invitations.revokeSuccess', 'Invitation revoked successfully'),
      })
      setRevokeDialogOpen(false)
      setCurrentInvitation(null)
      fetchInvitations()
    } catch (error: unknown) {
      const err = error as { error?: { message?: string } }
      toast({
        title: t('common.error'),
        description: err?.error?.message || t('invitations.revokeError', 'Failed to revoke invitation'),
        variant: 'destructive',
      })
    } finally {
      setRevoking(false)
    }
  }

  const closeCreateDialog = () => {
    setCreateDialogOpen(false)
    setCreateEmail('')
    setCreateResult(null)
  }

  const openRevokeDialog = (invitation: RegistrationInvitation) => {
    setCurrentInvitation(invitation)
    setRevokeDialogOpen(true)
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-6">
      {!embedded && (
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">{t('invitations.title', 'Registration Invitations')}</h1>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            {t('invitations.create', 'Send Invitation')}
          </Button>
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t('invitations.list', 'Invitations')}</CardTitle>
          {embedded && (
            <Button size="sm" onClick={() => setCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              {t('invitations.create', 'Send Invitation')}
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('invitations.searchPlaceholder', 'Search by email')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as RegistrationInvitationStatus | 'all')}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t('invitations.statusFilter', 'Filter by status')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.all', 'All')}</SelectItem>
                <SelectItem value="pending">{t('invitations.pending', 'Pending')}</SelectItem>
                <SelectItem value="consumed">{t('invitations.consumed', 'Consumed')}</SelectItem>
                <SelectItem value="revoked">{t('invitations.revoked', 'Revoked')}</SelectItem>
                <SelectItem value="expired">{t('invitations.expired', 'Expired')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('users.email')}</TableHead>
                    <TableHead>{t('common.status')}</TableHead>
                    <TableHead>{t('invitations.expiresAt', 'Expires At')}</TableHead>
                    <TableHead>{t('common.createdAt')}</TableHead>
                    <TableHead className="text-right">{t('common.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invitations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        {t('common.noData')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    invitations.map((invitation) => (
                      <TableRow key={invitation.id}>
                        <TableCell>{invitation.email}</TableCell>
                        <TableCell>
                          <Badge variant={statusVariants[invitation.status]}>
                            {t(`invitations.${invitation.status}`, invitation.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(invitation.expiresAt)}</TableCell>
                        <TableCell>{formatDate(invitation.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          {invitation.status === 'pending' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openRevokeDialog(invitation)}
                              title={t('invitations.revoke', 'Revoke')}
                            >
                              <Ban className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                  >
                    {t('common.previous')}
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {t('common.showing', { from: (page - 1) * limit + 1, to: Math.min(page * limit, total), total })}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                  >
                    {t('common.next')}
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={createDialogOpen} onOpenChange={closeCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('invitations.createTitle', 'Send Registration Invitation')}</DialogTitle>
            <DialogDescription>{t('invitations.createDescription', 'Send an email invitation to create a new admin account.')}</DialogDescription>
          </DialogHeader>
          {createResult ? (
            <div className="space-y-4">
              <div className="rounded-md border border-green-500/50 bg-green-500/5 p-3 text-sm text-green-700 dark:text-green-400">
                {t('invitations.createSuccess', 'Invitation sent to {{email}}. The link expires at {{expiresAt}}.', {
                  email: createResult.email,
                  expiresAt: formatDate(createResult.expiresAt),
                })}
              </div>
              <DialogFooter>
                <Button onClick={closeCreateDialog}>{t('common.close')}</Button>
              </DialogFooter>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="createEmail">{t('users.email')}</Label>
                <Input
                  id="createEmail"
                  type="email"
                  placeholder={t('users.email')}
                  value={createEmail}
                  onChange={(e) => setCreateEmail(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={closeCreateDialog}>{t('common.cancel')}</Button>
                <Button onClick={handleCreate} disabled={creating || !createEmail}>
                  {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Mail className="mr-2 h-4 w-4" />
                  {t('invitations.send', 'Send')}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={revokeDialogOpen} onOpenChange={setRevokeDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('invitations.revokeConfirm', 'Revoke Invitation')}</AlertDialogTitle>
          </AlertDialogHeader>
          <p className="text-sm text-muted-foreground">
            {t('invitations.revokeConfirmDesc', 'This will invalidate the invitation link for {{email}}. This action cannot be undone.', { email: currentInvitation?.email })}
          </p>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCurrentInvitation(null)}>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleRevoke} disabled={revoking}>
              {revoking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('common.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
