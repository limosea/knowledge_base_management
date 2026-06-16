import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react'

interface SystemStatusCardProps {
  status: 'ok' | 'degraded' | 'unhealthy'
  loading?: boolean
}

export function SystemStatusCard({ status, loading }: SystemStatusCardProps) {
  const { t } = useTranslation()

  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-24" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-20" />
        </CardContent>
      </Card>
    )
  }

  const statusConfig = {
    ok: {
      icon: ShieldCheck,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      label: t('system.ok'),
    },
    degraded: {
      icon: ShieldAlert,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
      label: t('system.degraded'),
    },
    unhealthy: {
      icon: ShieldX,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
      label: t('system.unhealthy'),
    },
  }

  const config = statusConfig[status] || statusConfig.unhealthy
  const Icon = config.icon

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{t('dashboard.systemStatus')}</CardTitle>
        <Icon className={`h-4 w-4 ${config.color}`} />
      </CardHeader>
      <CardContent>
        <Badge className={`${config.bgColor} ${config.color} hover:${config.bgColor}`}>
          {config.label}
        </Badge>
      </CardContent>
    </Card>
  )
}
