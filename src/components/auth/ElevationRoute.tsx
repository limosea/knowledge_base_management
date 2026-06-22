import React, { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { usePermission } from '@/contexts/PermissionContext'
import { ElevationDialog } from './ElevationDialog'

interface ElevationRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function ElevationRoute({ children, fallback }: ElevationRouteProps) {
  const { isElevated, canAccessElevated, loading } = usePermission()
  const [showDialog, setShowDialog] = useState(false)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!canAccessElevated()) {
    if (fallback) return <>{fallback}</>
    return <Navigate to="/dashboard" replace />
  }

  if (!isElevated()) {
    return (
      <>
        <ElevationDialog
          open={!showDialog}
          onOpenChange={setShowDialog}
          onSuccess={() => setShowDialog(false)}
        />
        {fallback}
      </>
    )
  }

  return <>{children}</>
}
