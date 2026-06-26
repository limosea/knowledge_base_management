import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { systemApi } from '@/api'
import type { SystemHealth, SystemStats, GlobalRateLimit } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { usePermission } from '@/contexts/PermissionContext'
import { Save } from 'lucide-react'

export function SystemPage() {
  const { t } = useTranslation()
  const { toast } = useToast()
  const { user } = usePermission()
  const [health, setHealth] = useState<SystemHealth | null>(null)
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [globalRateLimit, setGlobalRateLimit] = useState<GlobalRateLimit>({ limit: 10000, windowMs: 60000 })
  const [rateLimitEditing, setRateLimitEditing] = useState(false)
  const [rateLimitForm, setRateLimitForm] = useState({ limit: 10000, windowMs: 60000 })
  const isSuperAdmin = user?.isSuperAdmin ?? false

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [healthData, statsData, rateLimitData] = await Promise.all([
          systemApi.getHealth(),
          systemApi.getStats(),
          systemApi.getGlobalRateLimit(),
        ])
        setHealth(healthData)
        setStats(statsData)
        setGlobalRateLimit(rateLimitData)
        setRateLimitForm({ limit: rateLimitData.limit, windowMs: rateLimitData.windowMs })
      } catch (error) {
        console.error('Failed to fetch system data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleSaveGlobalRateLimit = async () => {
    try {
      const result = await systemApi.updateGlobalRateLimit(rateLimitForm)
      setGlobalRateLimit(result)
      setRateLimitEditing(false)
      toast({ title: t('common.success'), description: '全站速率限制已更新' })
    } catch (error) {
      toast({ title: t('common.error'), description: '更新全站速率限制失败', variant: 'destructive' })
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    )
  }

  const statusColors = {
    ok: 'bg-green-500',
    degraded: 'bg-yellow-500',
    unhealthy: 'bg-red-500',
    error: 'bg-red-500',
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t('system.title')}</h1>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Health Status */}
        <Card>
          <CardHeader>
            <CardTitle>{t('system.health')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">{t('system.status')}</span>
              <Badge className={statusColors[health?.status || 'unhealthy']}>
                {t(`system.${health?.status || 'unhealthy'}`)}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">{t('system.version')}</span>
              <span className="text-sm font-mono">{health?.version || '-'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">{t('system.uptime')}</span>
              <span className="text-sm">
                {health?.uptime ? `${Math.floor(health.uptime / 3600)}h ${Math.floor((health.uptime % 3600) / 60)}m` : '-'}
              </span>
            </div>
            
            {health?.checks && (
              <>
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{t('system.database')}</span>
                    <div className="flex items-center gap-2">
                      <Badge className={statusColors[health.checks.database.status]}>
                        {t(`system.${health.checks.database.status}`)}
                      </Badge>
                      {health.checks.database.latency && (
                        <span className="text-xs text-muted-foreground">
                          {health.checks.database.latency}ms
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">{t('system.storage')}</span>
                  <Badge className={statusColors[health.checks.storage.status]}>
                    {t(`system.${health.checks.storage.status}`)}
                  </Badge>
                </div>
                {health.checks.cache && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{t('system.cache')}</span>
                    <div className="flex items-center gap-2">
                      <Badge className={statusColors[health.checks.cache.status]}>
                        {t(`system.${health.checks.cache.status}`)}
                      </Badge>
                      {health.checks.cache.latency && (
                        <span className="text-xs text-muted-foreground">
                          {health.checks.cache.latency}ms
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>{t('system.stats')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats?.knowledgeEntries && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm">{t('dashboard.knowledgeEntries')}</span>
                  <span className="text-lg font-bold">
                    {stats.knowledgeEntries.total.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">{t('knowledge.qualityScore')}</span>
                  <span className="text-lg font-bold">
                    {stats.knowledgeEntries.avgQualityScore?.toFixed(1) || '-'}
                  </span>
                </div>
              </>
            )}
            
            {stats?.apiKeys && (
              <>
                <div className="border-t pt-4 flex items-center justify-between">
                  <span className="text-sm">{t('dashboard.apiKeys')}</span>
                  <span className="text-lg font-bold">
                    {stats.apiKeys.total.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">{t('apiKeys.active')}</span>
                  <Badge className="bg-green-500">{stats.apiKeys.active}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">{t('apiKeys.expired')}</span>
                  <Badge variant="destructive">{stats.apiKeys.expired}</Badge>
                </div>
              </>
            )}
            
            {stats?.requests && (
              <>
                <div className="border-t pt-4 flex items-center justify-between">
                  <span className="text-sm">{t('dashboard.requests')}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <div className="text-center p-2 bg-muted rounded">
                    <div className="text-xs text-muted-foreground">{t('dashboard.today')}</div>
                    <div className="text-lg font-bold">{stats.requests.today}</div>
                  </div>
                  <div className="text-center p-2 bg-muted rounded">
                    <div className="text-xs text-muted-foreground">{t('dashboard.thisWeek')}</div>
                    <div className="text-lg font-bold">{stats.requests.thisWeek}</div>
                  </div>
                  <div className="text-center p-2 bg-muted rounded">
                    <div className="text-xs text-muted-foreground">{t('dashboard.thisMonth')}</div>
                    <div className="text-lg font-bold">{stats.requests.thisMonth}</div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Global Rate Limit Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t('system.globalRateLimit', '全站速率限制')}</CardTitle>
          {isSuperAdmin && !rateLimitEditing && (
            <Button variant="outline" size="sm" onClick={() => {
              setRateLimitForm({ limit: globalRateLimit.limit, windowMs: globalRateLimit.windowMs })
              setRateLimitEditing(true)
            }}>
              {t('common.edit')}
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {rateLimitEditing ? (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="rl-limit">{t('system.rateLimitMax', '最大请求数')}</Label>
                  <Input
                    id="rl-limit"
                    type="number"
                    min={1}
                    max={1000000}
                    value={rateLimitForm.limit}
                    onChange={(e) => setRateLimitForm({ ...rateLimitForm, limit: parseInt(e.target.value) || 10000 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rl-window">{t('system.rateLimitWindow', '时间窗口 (ms)')}</Label>
                  <Input
                    id="rl-window"
                    type="number"
                    min={1000}
                    max={3600000}
                    step={1000}
                    value={rateLimitForm.windowMs}
                    onChange={(e) => setRateLimitForm({ ...rateLimitForm, windowMs: parseInt(e.target.value) || 60000 })}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSaveGlobalRateLimit}>
                  <Save className="h-4 w-4 mr-2" />
                  {t('common.save')}
                </Button>
                <Button variant="outline" onClick={() => setRateLimitEditing(false)}>
                  {t('common.cancel')}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-8">
              <div>
                <div className="text-sm text-muted-foreground">{t('system.rateLimitMax', '最大请求数')}</div>
                <div className="text-2xl font-bold">{globalRateLimit.limit.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">{t('system.rateLimitWindow', '时间窗口')}</div>
                <div className="text-2xl font-bold">{globalRateLimit.windowMs / 1000}s</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}