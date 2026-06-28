import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { meApi } from '@/api'
import type { LeaderboardData } from '@/types'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trophy, BookOpen, FileText, Tag } from 'lucide-react'
import { Link } from 'react-router-dom'

interface LeaderboardSectionProps {
  scope: 'personal' | 'global'
  title?: string
}

const PERIOD_OPTIONS = [
  { value: 'day', labelKey: 'charts.presetDay' },
  { value: 'week', labelKey: 'charts.presetWeek' },
  { value: 'month', labelKey: 'charts.presetMonth' },
] as const

const CHANNEL_OPTIONS = [
  { value: 'total', labelKey: 'charts.channelTotal' },
  { value: 'api', labelKey: 'charts.channelApi' },
  { value: 'mcp', labelKey: 'charts.channelMcp' },
] as const

export function LeaderboardSection({ scope, title }: LeaderboardSectionProps) {
  const { t } = useTranslation()
  const [data, setData] = useState<LeaderboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [period, setPeriod] = useState<string>('week')
  const [channel, setChannel] = useState<'total' | 'api' | 'mcp'>('total')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(false)
    meApi.getLeaderboard({ period, scope, channel })
      .then((d) => { if (!cancelled) setData(d) })
      .catch(() => { if (!cancelled) setError(true) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [period, scope, channel])

  if (loading && !data) {
    return (
      <div className="space-y-3">
        <div className="grid gap-4 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[320px]" />
          ))}
        </div>
      </div>
    )
  }

  const sectionTitle = title ?? (
    scope === 'personal'
      ? t('charts.personalLeaderboard')
      : t('charts.globalLeaderboard')
  )

  const sectionDesc = scope === 'personal'
    ? t('charts.personalLeaderboardDesc')
    : t('charts.globalLeaderboardDesc')

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-muted-foreground flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            {sectionTitle}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">{sectionDesc}</p>
        </div>
        <div className="flex gap-1">
          {CHANNEL_OPTIONS.map((opt) => (
            <Button
              key={opt.value}
              variant={channel === opt.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChannel(opt.value as 'total' | 'api' | 'mcp')}
              className="h-7 text-xs"
            >
              {t(opt.labelKey)}
            </Button>
          ))}
          <span className="w-px bg-border mx-1" />
          {PERIOD_OPTIONS.map((opt) => (
            <Button
              key={opt.value}
              variant={period === opt.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriod(opt.value)}
              className="h-7 text-xs"
            >
              {t(opt.labelKey)}
            </Button>
          ))}
        </div>
      </div>

      {error && !data && (
        <div className="text-sm text-muted-foreground text-center py-2">
          {t('charts.noData')}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Top Libraries */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              {t('charts.topLibraries')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data?.topLibraries && data.topLibraries.length > 0 ? (
              <div className="space-y-1.5">
                {data.topLibraries.map((lib, i) => (
                  <div key={lib.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-5 text-right font-mono text-xs ${i < 3 ? 'text-amber-500 font-bold' : 'text-muted-foreground'}`}>
                        {i + 1}
                      </span>
                      <Link
                        to={scope === 'global' ? `/plaza/${lib.id}` : `/knowledge/${lib.id}`}
                        className="truncate hover:underline text-foreground"
                      >
                        {lib.name}
                      </Link>
                    </div>
                    <span className="font-mono text-muted-foreground text-xs shrink-0 ml-2">
                      {lib.viewCount} {t('charts.viewCount')}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
                {t('charts.noData')}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Entries */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="h-4 w-4" />
              {t('charts.topEntries')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data?.topEntries && data.topEntries.length > 0 ? (
              <div className="space-y-1.5">
                {data.topEntries.map((entry, i) => (
                  <div key={entry.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-5 text-right font-mono text-xs ${i < 3 ? 'text-amber-500 font-bold' : 'text-muted-foreground'}`}>
                        {i + 1}
                      </span>
                      <Link
                        to={scope === 'global' ? `/elevated/entry/${entry.id}` : `/entry/${entry.id}`}
                        className="truncate hover:underline text-foreground"
                      >
                        {entry.title}
                      </Link>
                    </div>
                    <span className="font-mono text-muted-foreground text-xs shrink-0 ml-2">
                      {entry.viewCount} {t('charts.viewCount')}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
                {t('charts.noData')}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Tags (searched) */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Tag className="h-4 w-4" />
              {t('charts.searchedTags')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data?.topTags && data.topTags.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {data.topTags.map((tag, i) => (
                  <span
                    key={tag.tag}
                    className={`px-2 py-0.5 rounded text-xs ${
                      i < 3
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {tag.tag}
                    <span className="ml-1 font-mono opacity-70">({tag.count})</span>
                  </span>
                ))}
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
                {t('charts.noData')}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
