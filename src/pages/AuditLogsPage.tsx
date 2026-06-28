import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { auditLogsApi, type AuditLogListParams } from '@/api/audit-logs'
import type { AuditLog } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { AuditLogDetailDialog, AuditLogExportDialog } from '@/components/audit'
import {
  Download,
  Search,
  User,
  Clock,
  MapPin,
  Zap,
  Monitor,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Eye,
  Info,
} from 'lucide-react'

const ACTOR_TYPE_OPTIONS = [
  { value: 'admin_user', labelKey: 'actorType_admin_user' },
  { value: 'api_key', labelKey: 'actorType_api_key' },
  { value: 'system', labelKey: 'actorType_system' },
] as const

const SOURCE_OPTIONS = [
  { value: 'admin_panel', labelKey: 'source_admin_panel' },
  { value: 'public_api', labelKey: 'source_public_api' },
  { value: 'mcp', labelKey: 'source_mcp' },
  { value: 'system', labelKey: 'source_system' },
] as const

const STATUS_OPTIONS = [
  { value: 'success', labelKey: 'status_success' },
  { value: 'failure', labelKey: 'status_failure' },
  { value: 'error', labelKey: 'status_error' },
] as const

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'users.superAdmin',
  admin: 'users.admin',
  user: 'users.user',
}

export function AuditLogsPage() {
  const { t } = useTranslation()
  const { toast } = useToast()
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState<AuditLogListParams>({
    action: '',
    resourceType: '',
    actorType: '',
    source: '',
    status: '',
    startDate: '',
    endDate: '',
  })

  const [detailLogId, setDetailLogId] = useState<string | null>(null)
  const [exportOpen, setExportOpen] = useState(false)

  const limit = 20
  const totalPages = Math.ceil(total / limit)

  useEffect(() => {
    fetchLogs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const response = await auditLogsApi.list({
        page,
        limit,
        action: filters.action || undefined,
        resourceType: filters.resourceType || undefined,
        actorType: filters.actorType || undefined,
        source: filters.source || undefined,
        status: filters.status || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
      })
      setLogs(response.data)
      setTotal(response.total)
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('auditLogs.fetchError'),
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFilter = () => {
    setPage(1)
    fetchLogs()
  }

  const handleReset = () => {
    setFilters({
      action: '',
      resourceType: '',
      actorType: '',
      source: '',
      status: '',
      startDate: '',
      endDate: '',
    })
    setPage(1)
    fetchLogs()
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t('auditLogs.title')}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t('auditLogs.subtitle')}
            </p>
          </div>
          <Button onClick={() => setExportOpen(true)}>
            <Download className="h-4 w-4 mr-2" />
            {t('auditLogs.export')}
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              {t('filter.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              <Input
                placeholder={t('auditLogs.action')}
                value={filters.action}
                onChange={(e) => setFilters({ ...filters, action: e.target.value })}
              />
              <Input
                placeholder={t('auditLogs.resourceType')}
                value={filters.resourceType}
                onChange={(e) => setFilters({ ...filters, resourceType: e.target.value })}
              />
              <Select
                value={filters.actorType || 'all'}
                onValueChange={(value) =>
                  setFilters({ ...filters, actorType: value === 'all' ? '' : value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('auditLogs.actorType')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('auditLogs.allActorTypes')}</SelectItem>
                  {ACTOR_TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {t(`auditLogs.${opt.labelKey}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={filters.source || 'all'}
                onValueChange={(value) =>
                  setFilters({ ...filters, source: value === 'all' ? '' : value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('auditLogs.source')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('auditLogs.allSources')}</SelectItem>
                  {SOURCE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {t(`auditLogs.${opt.labelKey}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={filters.status || 'all'}
                onValueChange={(value) =>
                  setFilters({ ...filters, status: value === 'all' ? '' : value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('auditLogs.status')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('auditLogs.allStatuses')}</SelectItem>
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {t(`auditLogs.${opt.labelKey}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="date"
                placeholder={t('auditLogs.startDate')}
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              />
              <Input
                type="date"
                placeholder={t('auditLogs.endDate')}
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              />
              <div className="flex items-center gap-2 sm:col-span-2 md:col-span-3 lg:col-span-1 lg:justify-end">
                <Button variant="outline" onClick={handleReset} className="gap-1.5">
                  <RotateCcw className="h-4 w-4" />
                  {t('common.reset')}
                </Button>
                <Button onClick={handleFilter} className="gap-1.5">
                  <Search className="h-4 w-4" />
                  {t('auditLogs.filter')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {t('common.noData')}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[120px]">
                      <HeaderCell icon={<User className="h-3.5 w-3.5" />} label={t('auditLogs.who')} tooltip={t('auditLogs.whoTooltip')} />
                    </TableHead>
                    <TableHead className="w-[110px]">
                      <HeaderCell icon={<Clock className="h-3.5 w-3.5" />} label={t('auditLogs.when')} tooltip={t('auditLogs.whenTooltip')} />
                    </TableHead>
                    <TableHead>
                      <HeaderCell icon={<Zap className="h-3.5 w-3.5" />} label={t('auditLogs.what')} tooltip={t('auditLogs.whatTooltip')} />
                    </TableHead>
                    <TableHead className="w-[120px]">
                      <HeaderCell icon={<MapPin className="h-3.5 w-3.5" />} label={t('auditLogs.where')} tooltip={t('auditLogs.whereTooltip')} />
                    </TableHead>
                    <TableHead className="w-[110px]">
                      <HeaderCell icon={<Monitor className="h-3.5 w-3.5" />} label={t('auditLogs.how')} tooltip={t('auditLogs.howTooltip')} />
                    </TableHead>
                    <TableHead className="w-[90px]">
                      <HeaderCell icon={<CheckCircle2 className="h-3.5 w-3.5" />} label={t('auditLogs.result')} tooltip={t('auditLogs.resultTooltip')} />
                    </TableHead>
                    <TableHead className="w-[48px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow
                      key={log.id}
                      className="cursor-pointer"
                      onClick={() => setDetailLogId(log.id)}
                    >
                      <TableCell className="py-3 align-middle">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-medium truncate max-w-[110px]">
                            {log.actorName || t(`auditLogs.actorType_${log.actorType}`)}
                          </span>
                          {log.actorRole && (
                            <span className="text-[11px] text-muted-foreground">
                              {ROLE_LABELS[log.actorRole] ? t(ROLE_LABELS[log.actorRole]) : log.actorRole}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-3 align-middle">
                        <TimeCell date={log.createdAt} />
                      </TableCell>
                      <TableCell className="py-3 align-middle">
                        <div className="flex flex-col gap-1">
                          <Badge variant="secondary" className="w-fit font-mono text-[11px] px-1.5 py-0 h-5">
                            {log.action}
                          </Badge>
                          {log.resourceType && (
                            <span className="text-xs text-muted-foreground">
                              {log.resourceType}
                              {log.resourceId && (
                                <span className="font-mono ml-1 opacity-70">#{log.resourceId.slice(0, 8)}</span>
                              )}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-3 align-middle">
                        <span className="text-sm font-mono text-muted-foreground">
                          {log.ipAddress || '-'}
                        </span>
                      </TableCell>
                      <TableCell className="py-3 align-middle">
                        <SourceBadge source={log.source} />
                      </TableCell>
                      <TableCell className="py-3 align-middle">
                        <ResultPill status={log.status} httpStatusCode={log.httpStatusCode} />
                      </TableCell>
                      <TableCell className="py-3 align-middle">
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {!loading && totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t">
                <div className="text-sm text-muted-foreground">
                  {t('pagination.showing', {
                    from: (page - 1) * limit + 1,
                    to: Math.min(page * limit, total),
                    total,
                  })}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    {t('common.back')}
                  </Button>
                  <span className="text-sm min-w-[4rem] text-center">
                    {page} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                  >
                    {t('pagination.next')}
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <AuditLogDetailDialog
          logId={detailLogId}
          open={!!detailLogId}
          onOpenChange={(open) => !open && setDetailLogId(null)}
        />

        <AuditLogExportDialog
          open={exportOpen}
          onOpenChange={setExportOpen}
          currentFilters={filters}
        />
      </div>
    </TooltipProvider>
  )
}

function HeaderCell({
  icon,
  label,
  tooltip,
}: {
  icon: React.ReactNode
  label: string
  tooltip: string
}) {
  return (
    <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider">
      {icon}
      {label}
      <Tooltip>
        <TooltipTrigger asChild>
          <Info className="h-3 w-3 text-muted-foreground/70 hover:text-muted-foreground cursor-help" />
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </div>
  )
}

function TimeCell({ date }: { date: string }) {
  const d = new Date(date)
  const datePart = d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  const timePart = d.toLocaleTimeString('zh-CN', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

  return (
    <div className="flex flex-col gap-0 leading-tight">
      <span className="text-sm">{datePart}</span>
      <span className="text-xs text-muted-foreground font-mono">{timePart}</span>
    </div>
  )
}

function SourceBadge({ source }: { source: AuditLog['source'] }) {
  const { t } = useTranslation()
  const styles: Record<AuditLog['source'], string> = {
    admin_panel: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
    public_api: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    mcp: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
    system: 'bg-slate-500/10 text-slate-600 dark:text-slate-400',
  }

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${styles[source]}`}>
      {t(`auditLogs.source_${source}`)}
    </span>
  )
}

function ResultPill({
  status,
  httpStatusCode,
}: {
  status?: AuditLog['status']
  httpStatusCode?: number | null
}) {
  if (!status) {
    return <span className="text-xs text-muted-foreground">-</span>
  }

  const config = {
    success: {
      icon: <CheckCircle2 className="h-3.5 w-3.5" />,
      className: 'bg-green-500/15 text-green-700 dark:text-green-400',
    },
    failure: {
      icon: <AlertCircle className="h-3.5 w-3.5" />,
      className: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
    },
    error: {
      icon: <XCircle className="h-3.5 w-3.5" />,
      className: 'bg-red-500/15 text-red-700 dark:text-red-400',
    },
  }

  const { icon, className } = config[status]

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${className}`}>
      {icon}
      {httpStatusCode !== undefined && httpStatusCode !== null ? httpStatusCode : '-'}
    </span>
  )
}
