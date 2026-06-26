import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { meApi } from '@/api'
import type { MyApiKeyUsage, MyApiKeyUsageDetail } from '@/types'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatCard } from '@/components/charts/StatCard'
import { TopApiKeysTable } from '@/components/charts/TopApiKeysTable'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Key } from 'lucide-react'
import type { StatsFilterState } from '@/components/charts/StatsFilterBar'

interface MyApiUsageSectionProps {
  filter?: StatsFilterState
}

export function MyApiUsageSection({ filter }: MyApiUsageSectionProps) {
  const { t } = useTranslation()
  const [usage, setUsage] = useState<MyApiKeyUsage | null>(null)
  const [detail, setDetail] = useState<MyApiKeyUsageDetail | null>(null)
  const [selectedKeyId, setSelectedKeyId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    meApi.getApiKeyUsage({ from: filter?.from, to: filter?.to })
      .then((d) => {
        if (cancelled) return
        setUsage(d)
        if (d.keys.length > 0) {
          setSelectedKeyId(d.keys[0].apiKeyId)
        }
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [filter?.from, filter?.to])

  useEffect(() => {
    if (!selectedKeyId) return
    let cancelled = false
    meApi.getApiKeyUsageDetail(selectedKeyId, { period: filter?.period, from: filter?.from, to: filter?.to })
      .then((d) => { if (!cancelled) setDetail(d) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [selectedKeyId, filter?.period, filter?.from, filter?.to])

  if (loading && !usage) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <Skeleton className="h-[300px]" />
        <Skeleton className="h-[300px]" />
      </div>
    )
  }

  const totalRequests = usage?.keys.reduce((sum, k) => sum + k.totalRequests, 0) ?? 0

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title={t('charts.apiKeyUsage')}
          value={totalRequests}
          icon={Key}
        />
        <StatCard
          title={t('dashboard.myApiKeys')}
          value={usage?.keys.length ?? 0}
          icon={Key}
        />
      </div>
      <TopApiKeysTable
        data={usage?.keys.map(k => ({ name: k.apiKeyName, count: k.totalRequests }))}
      />
      {usage && usage.keys.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('charts.apiKeyDetail')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4 flex-wrap">
              {usage.keys.map((k) => (
                <button
                  key={k.apiKeyId}
                  onClick={() => setSelectedKeyId(k.apiKeyId)}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    selectedKeyId === k.apiKeyId
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {k.apiKeyName}
                </button>
              ))}
            </div>
            {detail && detail.totalRequests > 0 ? (
              <div className="space-y-4">
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={detail.trend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="hsl(var(--chart-1))" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                {detail.byAction.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">{t('charts.actionBreakdown')}</h4>
                    <div className="space-y-1">
                      {detail.byAction.map((a, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span>{a.action}</span>
                          <span className="font-mono text-muted-foreground">{a.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                {t('charts.noData')}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}