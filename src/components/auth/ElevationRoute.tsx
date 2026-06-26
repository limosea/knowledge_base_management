import React, { useEffect } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { usePermission } from '@/contexts/PermissionContext'
import { ElevationDialog } from './ElevationDialog'

interface ElevationRouteProps {
  children: React.ReactNode
}

export function ElevationRoute({ children }: ElevationRouteProps) {
  const { isElevated, canAccessElevated, loading, elevation, revokeElevation, refreshElevationStatus } = usePermission()
  const navigate = useNavigate()

  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const userActive = user.isActive !== false
  const userBanned = user.banned === true

  // Periodically refresh elevation status to detect expiry server-side.
  // When the elevation expires, immediately redirect to the personal console.
  useEffect(() => {
    if (!isElevated()) return
    const interval = setInterval(async () => {
      await refreshElevationStatus()
      // The isElevated() check uses the context state which may not have
      // updated yet within this closure; re-check after refresh.
    }, 10_000) // Check every 10 seconds
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isElevated()])

  // Auto-redirect when elevation expires (remainingSeconds hits 0)
  useEffect(() => {
    if (elevation.elevated && (elevation.remainingSeconds ?? 0) <= 0) {
      revokeElevation()
      navigate('/dashboard', { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elevation.remainingSeconds])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Banned users cannot access elevated console at all
  if (userBanned || !userActive || !canAccessElevated()) {
    return <Navigate to="/dashboard" replace />
  }

  if (!isElevated()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <ElevationDialog
            open={true}
            onOpenChange={() => navigate('/dashboard', { replace: true })}
            onSuccess={() => {}}
          />
        </div>
      </div>
    )
  }

  return <>{children}</>
}
