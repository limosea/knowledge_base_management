import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { statsApi } from '@/api'
import type { ApiKeyUsageDetail } from '@/types'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'

interface ApiKeyDetailDialogProps {
  keyId: string | null
  keyName: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
]

export function ApiKeyDetailDialog({
  keyId,
  keyName,
  open,
  onOpenChange,
}: ApiKeyDetailDialogProps) {
  const { t } = useTranslation()
  const [detail, setDetail] = useState<ApiKeyUsageDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !keyId) {
      setDetail(null)
      setError(null)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    statsApi
      .getApiKeyUsageDetail(keyId, { period: 'day' })
      .then((data) => {
        if (!cancelled) setDetail(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [open, keyId])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{t('charts.apiKeyDetail')}</DialogTitle>
          <DialogDescription>{keyName ?? ''}</DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="space-y-3">
            <Skeleton className="h-8 w-40" />
            <div className="grid gap-4 md:grid-cols-2">
              <Skeleton className="h-[260px]" />
              <Skeleton className="h-[260px]" />
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="text-sm text-destructive">{error}</div>
        )}

        {!loading && !error && detail && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">{t('charts.totalRequests')}:</span>
              <span className="text-2xl font-bold">
                {detail.totalRequests.toLocaleString()}
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="text-sm font-medium mb-2">
                  {t('charts.requestTrendForKey')}
                </h4>
                <div className="h-[260px]">
                  {detail.trend.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                      {t('charts.noData')}
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={detail.trend}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="count"
                          stroke="hsl(var(--chart-1))"
                          strokeWidth={2}
                          dot={{ r: 3 }}
                          name={t('charts.requests')}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">
                  {t('charts.actionBreakdown')}
                </h4>
                <div className="h-[260px]">
                  {detail.byAction.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                      {t('charts.noData')}
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={detail.byAction}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={90}
                          paddingAngle={2}
                          dataKey="count"
                          nameKey="action"
                        >
                          {detail.byAction.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend wrapperStyle={{ fontSize: '12px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
