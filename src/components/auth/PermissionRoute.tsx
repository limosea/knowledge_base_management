import React from 'react'
import { Navigate } from 'react-router-dom'
import { usePermission } from '@/contexts/PermissionContext'
import type { Permission } from '@/types'

interface PermissionRouteProps {
  children: React.ReactNode
  permissions?: Permission[]
  requireAll?: boolean
  requireElevation?: boolean
  fallback?: React.ReactNode
  redirectTo?: string
}

export function PermissionRoute({
  children,
  permissions,
  requireAll = false,
  requireElevation = false,
  fallback,
  redirectTo = '/dashboard',
}: PermissionRouteProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, isElevated, loading } = usePermission()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (permissions && permissions.length > 0) {
    const hasAccess = requireAll ? hasAllPermissions(permissions) : hasAnyPermission(permissions)
    if (!hasAccess) {
      if (fallback) return <>{fallback}</>
      return <Navigate to={redirectTo} replace />
    }
  }

  if (requireElevation && !isElevated()) {
    if (fallback) return <>{fallback}</>
    return <Navigate to={redirectTo} replace />
  }

  return <>{children}</>
}
