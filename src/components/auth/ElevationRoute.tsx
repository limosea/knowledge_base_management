import React from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { usePermission } from '@/contexts/PermissionContext'
import { ElevationDialog } from './ElevationDialog'

interface ElevationRouteProps {
  children: React.ReactNode
}

export function ElevationRoute({ children }: ElevationRouteProps) {
  const { isElevated, canAccessElevated, loading } = usePermission()
  const navigate = useNavigate()

  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const userActive = user.isActive !== false

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!userActive || !canAccessElevated()) {
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
