import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { auditLogsApi } from '@/api'
import type { AuditLog } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
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
import { Download } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export function AuditLogsPage() {
  const { t } = useTranslation()
  const { toast } = useToast()
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState({
    action: '',
    resourceType: '',
    startDate: '',
    endDate: '',
  })

  const limit = 20

  useEffect(() => {
    fetchLogs()
  }, [page])

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const response = await auditLogsApi.list({
        page,
        limit,
        action: filters.action || undefined,
        resourceType: filters.resourceType || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
      })
      setLogs(response.data)
      setTotal(response.total)
    } catch (error) {
      toast({
        title: t('common.error'),
        description: 'Failed to fetch audit logs',
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

  const handleExport = async () => {
    setExporting(true)
    try {
      const content = await auditLogsApi.export({
        action: filters.action || undefined,
        resourceType: filters.resourceType || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
      })
      
      const blob = new Blob([content], { type: 'application/x-ndjson' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'audit-logs.ndjson'
      a.click()
      URL.revokeObjectURL(url)
      
      toast({
        title: t('common.success'),
        description: 'Logs exported successfully',
      })
    } catch (error) {
      toast({
        title: t('common.error'),
        description: 'Failed to export logs',
        variant: 'destructive',
      })
    } finally {
      setExporting(false)
    }
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t('auditLogs.title')}</h1>
        <Button onClick={handleExport} disabled={exporting}>
          <Download className="h-4 w-4 mr-2" />
          {t('auditLogs.export')}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Input
              placeholder={t('auditLogs.action')}
              value={filters.action}
              onChange={(e) => setFilters({ ...filters, action: e.target.value })}
              className="w-32"
            />
            <Input
              placeholder={t('auditLogs.resourceType')}
              value={filters.resourceType}
              onChange={(e) => setFilters({ ...filters, resourceType: e.target.value })}
              className="w-32"
            />
            <Input
              type="date"
              placeholder={t('auditLogs.startDate')}
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="w-40"
            />
            <Input
              type="date"
              placeholder={t('auditLogs.endDate')}
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="w-40"
            />
            <Button onClick={handleFilter}>{t('auditLogs.filter')}</Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t('common.noData')}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('auditLogs.action')}</TableHead>
                  <TableHead>{t('auditLogs.resourceType')}</TableHead>
                  <TableHead>{t('auditLogs.resourceId')}</TableHead>
                  <TableHead>{t('auditLogs.ipAddress')}</TableHead>
                  <TableHead>{t('common.createdAt')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <Badge variant="outline">{log.action}</Badge>
                    </TableCell>
                    <TableCell>{log.resourceType}</TableCell>
                    <TableCell>{log.resourceId || '-'}</TableCell>
                    <TableCell>{log.ipAddress || '-'}</TableCell>
                    <TableCell>{formatDate(log.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
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
                  {t('common.back')}
                </Button>
                <span className="text-sm">
                  {page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  {t('pagination.page')}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}