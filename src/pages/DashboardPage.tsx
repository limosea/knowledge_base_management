import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { systemApi, knowledgeApi } from '@/api'
import type { SystemStats, KnowledgeStats } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { BookOpen, Key, Activity, Calendar } from 'lucide-react'

export function DashboardPage() {
  const { t } = useTranslation()
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null)
  const [knowledgeStats, setKnowledgeStats] = useState<KnowledgeStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [sys, kn] = await Promise.all([
          systemApi.getStats(),
          knowledgeApi.getStats(),
        ])
        setSystemStats(sys)
        setKnowledgeStats(kn)
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const stats = [
    {
      title: t('dashboard.knowledgeEntries'),
      value: knowledgeStats?.total ?? 0,
      icon: BookOpen,
    },
    {
      title: t('dashboard.apiKeys'),
      value: systemStats?.apiKeys?.active ?? 0,
      icon: Key,
    },
    {
      title: t('dashboard.today'),
      value: systemStats?.requests?.today ?? 0,
      icon: Activity,
    },
    {
      title: t('dashboard.thisMonth'),
      value: systemStats?.requests?.thisMonth ?? 0,
      icon: Calendar,
    },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t('dashboard.title')}</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
