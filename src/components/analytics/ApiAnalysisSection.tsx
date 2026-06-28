import { useEffect, useState } from 'react'
import { statsApi } from '@/api'
import type { ApiKeyUsage, RequestAnalytics } from '@/types'
import type { StatsFilterState } from '@/components/charts/StatsFilterBar'
import { Skeleton } from '@/components/ui/skeleton'
import { ApiKeyStatusChart } from '@/components/charts/ApiKeyStatusChart'
import { ApiKeyDetailDialog } from '@/components/charts/ApiKeyDetailDialog'
import { RequestTrendChart } from '@/components/charts/RequestTrendChart'
import { StatusCodeDistributionChart } from '@/components/charts/StatusCodeDistributionChart'
import { TopEndpointsTable } from '@/components/charts/TopEndpointsTable'
import { PinnableChartCard } from '@/components/charts/PinnableChartCard'

interface Props {
  filter: StatsFilterState
}

export function ApiAnalysisSection({ filter }: Props) {
  const [apiKeyUsage, setApiKeyUsage] = useState<ApiKeyUsage | null>(null)
  const [requestAnalytics, setRequestAnalytics] = useState<RequestAnalytics | null>(null)
  const [loading, setLoading] = useState(true)

  const [drillOpen, setDrillOpen] = useState(false)
  const [selectedKey, setSelectedKey] = useState<{ id: string; name: string } | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    const params = {
      period: filter.period as 'day' | 'week' | 'month',
      from: filter.from,
      to: filter.to,
    }
    Promise.all([
      statsApi.getApiKeyUsage({ from: filter.from, to: filter.to }),
      statsApi.getRequestAnalytics(params),
    ])
      .then(([apiKeys, requests]) => {
        if (cancelled) return
        setApiKeyUsage(apiKeys)
        setRequestAnalytics(requests)
      })
      .catch(() => {
        // keep previous data on error
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [filter])

  const handleKeyClick = (item: { apiKeyId: string; apiKeyName: string }) => {
    setSelectedKey({ id: item.apiKeyId, name: item.apiKeyName })
    setDrillOpen(true)
  }

  if (loading && !requestAnalytics) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-[350px]" />
          <Skeleton className="h-[350px]" />
          <Skeleton className="h-[350px]" />
        </div>
        <Skeleton className="h-60 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-3">
        <PinnableChartCard chartId="status-code-distribution" descriptionKey="charts.descriptions.statusCodeDistribution">
          <StatusCodeDistributionChart
            statusCodes={requestAnalytics?.statusCodeDistribution ?? []}
            successRate={requestAnalytics?.successRate}
          />
        </PinnableChartCard>
        <PinnableChartCard chartId="api-key-status" descriptionKey="charts.descriptions.apiKeyStatus">
          <ApiKeyStatusChart
            data={apiKeyUsage?.keys ?? []}
            onKeyClick={handleKeyClick}
          />
        </PinnableChartCard>
        <PinnableChartCard chartId="request-trend" descriptionKey="charts.descriptions.requestTrend">
          <RequestTrendChart
            data={requestAnalytics?.requestVolumeTrend ?? []}
          />
        </PinnableChartCard>
      </div>
      <PinnableChartCard chartId="top-endpoints" descriptionKey="charts.descriptions.topEndpoints">
        <TopEndpointsTable data={requestAnalytics?.topEndpoints ?? []} />
      </PinnableChartCard>

      <ApiKeyDetailDialog
        keyId={selectedKey?.id ?? null}
        keyName={selectedKey?.name ?? null}
        open={drillOpen}
        onOpenChange={setDrillOpen}
      />
    </div>
  )
}
