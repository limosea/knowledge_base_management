import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { auditLogsApi, type AuditLogListParams } from '@/api/audit-logs'
import { useToast } from '@/hooks/use-toast'
import { Download, Calendar, Filter, FileJson } from 'lucide-react'

interface AuditLogExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentFilters: AuditLogListParams
}

export function AuditLogExportDialog({
  open,
  onOpenChange,
  currentFilters,
}: AuditLogExportDialogProps) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const [exporting, setExporting] = useState(false)
  const [filters, setFilters] = useState<AuditLogListParams>(() => ({
    action: currentFilters.action,
    resourceType: currentFilters.resourceType,
    actorType: currentFilters.actorType,
    source: currentFilters.source,
    status: currentFilters.status,
    startDate: currentFilters.startDate,
    endDate: currentFilters.endDate,
  }))

  const handleExport = async () => {
    setExporting(true)
    try {
      const content = await auditLogsApi.export(filters)

      const blob = new Blob([content], { type: 'application/x-ndjson' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url

      const now = new Date().toISOString().slice(0, 10)
      const suffix = filters.startDate && filters.endDate
        ? `_${filters.startDate}_${filters.endDate}`
        : filters.startDate
          ? `_from_${filters.startDate}`
          : filters.endDate
            ? `_until_${filters.endDate}`
            : ''
      a.download = `audit-logs${suffix}_${now}.ndjson`
      a.click()
      URL.revokeObjectURL(url)

      toast({
        title: t('common.success'),
        description: t('auditLogs.exportSuccess'),
      })
      onOpenChange(false)
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('auditLogs.exportError'),
        variant: 'destructive',
      })
    } finally {
      setExporting(false)
    }
  }

  const activeFilterCount = [
    filters.action,
    filters.resourceType,
    filters.actorType,
    filters.source,
    filters.status,
    filters.startDate,
    filters.endDate,
  ].filter(Boolean).length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            {t('auditLogs.exportTitle')}
          </DialogTitle>
          <DialogDescription>{t('auditLogs.exportDescription')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              {t('auditLogs.exportTimeRange')}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="export-start" className="text-xs text-muted-foreground">
                  {t('auditLogs.startDate')}
                </Label>
                <Input
                  id="export-start"
                  type="date"
                  value={filters.startDate || ''}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="export-end" className="text-xs text-muted-foreground">
                  {t('auditLogs.endDate')}
                </Label>
                <Input
                  id="export-end"
                  type="date"
                  value={filters.endDate || ''}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Filter className="h-4 w-4 text-muted-foreground" />
              {t('auditLogs.exportFilters')}
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {activeFilterCount}
                </Badge>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">{t('auditLogs.action')}</Label>
                <Input
                  placeholder={t('auditLogs.action')}
                  value={filters.action || ''}
                  onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">{t('auditLogs.resourceType')}</Label>
                <Input
                  placeholder={t('auditLogs.resourceType')}
                  value={filters.resourceType || ''}
                  onChange={(e) => setFilters({ ...filters, resourceType: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">{t('auditLogs.actorType')}</Label>
                <Select
                  value={filters.actorType || 'all'}
                  onValueChange={(value) =>
                    setFilters({ ...filters, actorType: value === 'all' ? undefined : value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('auditLogs.allActorTypes')}</SelectItem>
                    <SelectItem value="admin_user">{t('auditLogs.actorType_admin_user')}</SelectItem>
                    <SelectItem value="api_key">{t('auditLogs.actorType_api_key')}</SelectItem>
                    <SelectItem value="system">{t('auditLogs.actorType_system')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">{t('auditLogs.source')}</Label>
                <Select
                  value={filters.source || 'all'}
                  onValueChange={(value) =>
                    setFilters({ ...filters, source: value === 'all' ? undefined : value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('auditLogs.allSources')}</SelectItem>
                    <SelectItem value="admin_panel">{t('auditLogs.source_admin_panel')}</SelectItem>
                    <SelectItem value="public_api">{t('auditLogs.source_public_api')}</SelectItem>
                    <SelectItem value="mcp">{t('auditLogs.source_mcp')}</SelectItem>
                    <SelectItem value="system">{t('auditLogs.source_system')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 col-span-2">
                <Label className="text-xs text-muted-foreground">{t('auditLogs.status')}</Label>
                <Select
                  value={filters.status || 'all'}
                  onValueChange={(value) =>
                    setFilters({ ...filters, status: value === 'all' ? undefined : value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('auditLogs.allStatuses')}</SelectItem>
                    <SelectItem value="success">{t('auditLogs.status_success')}</SelectItem>
                    <SelectItem value="failure">{t('auditLogs.status_failure')}</SelectItem>
                    <SelectItem value="error">{t('auditLogs.status_error')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="rounded-md border bg-muted/50 p-3 flex items-start gap-3">
            <FileJson className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t('auditLogs.exportFormatHint')}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={exporting}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleExport} disabled={exporting}>
            {exporting ? t('auditLogs.exporting') : t('auditLogs.export')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
