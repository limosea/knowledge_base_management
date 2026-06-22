import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { usePermission } from '@/contexts/PermissionContext'
import { Button } from '@/components/ui/button'
import { ElevationDialog } from '@/components/auth/ElevationDialog'
import { Shield, ShieldOff, Clock } from 'lucide-react'

export function ElevationToggle() {
  const { t } = useTranslation()
  const { isElevated, canAccessElevated, elevation, revokeElevation } = usePermission()
  const [showDialog, setShowDialog] = useState(false)
  const [remainingTime, setRemainingTime] = useState<string>('')

  useEffect(() => {
    if (!elevation.elevated || !elevation.remainingSeconds) {
      setRemainingTime('')
      return
    }

    const updateTime = () => {
      const seconds = elevation.remainingSeconds ?? 0
      if (seconds <= 0) {
        setRemainingTime('')
        return
      }
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      setRemainingTime(`${mins}:${secs.toString().padStart(2, '0')}`)
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [elevation.elevated, elevation.remainingSeconds])

  if (!canAccessElevated()) {
    return null
  }

  if (isElevated()) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 text-sm text-orange-600 dark:text-orange-400">
          <Clock className="h-4 w-4" />
          <span>{remainingTime}</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={revokeElevation}
          className="text-orange-600 border-orange-300 hover:bg-orange-50 dark:text-orange-400 dark:border-orange-700 dark:hover:bg-orange-950"
        >
          <ShieldOff className="h-4 w-4 mr-1" />
          {t('elevation.exit')}
        </Button>
      </div>
    )
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowDialog(true)}
        className="text-primary"
      >
        <Shield className="h-4 w-4 mr-1" />
        {t('elevation.enter')}
      </Button>
      <ElevationDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        onSuccess={() => setShowDialog(false)}
      />
    </>
  )
}
