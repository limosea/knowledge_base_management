import React from 'react'
import { useTranslation } from 'react-i18next'
import { usePermission } from '@/contexts/PermissionContext'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Shield, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ElevationIndicator() {
  const { t } = useTranslation()
  const { isElevated, revokeElevation, canAccessElevated } = usePermission()

  if (!canAccessElevated() || !isElevated()) {
    return null
  }

  return (
    <Alert className="rounded-none border-x-0 border-t-0 bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800">
      <Shield className="h-4 w-4 text-orange-600 dark:text-orange-400" />
      <AlertDescription className="flex items-center justify-between w-full">
        <span className="text-orange-800 dark:text-orange-200">
          {t('elevation.activeMode')}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={revokeElevation}
          className="h-6 px-2 text-orange-700 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-900"
        >
          <X className="h-3 w-3 mr-1" />
          {t('elevation.exit')}
        </Button>
      </AlertDescription>
    </Alert>
  )
}
