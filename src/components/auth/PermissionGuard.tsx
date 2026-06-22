import React from 'react'
import { usePermission } from '@/contexts/PermissionContext'
import type { Permission } from '@/types'

interface PermissionGuardProps {
  children: React.ReactNode
  permissions?: Permission[]
  requireAll?: boolean
  requireElevation?: boolean
  fallback?: React.ReactNode
}

export function PermissionGuard({
  children,
  permissions,
  requireAll = false,
  requireElevation = false,
  fallback = null,
}: PermissionGuardProps) {
  const { hasAnyPermission, hasAllPermissions, isElevated, user } = usePermission()

  if (permissions && permissions.length > 0) {
    const hasAccess = requireAll ? hasAllPermissions(permissions) : hasAnyPermission(permissions)
    if (!hasAccess) {
      return <>{fallback}</>
    }
  }

  if (requireElevation) {
    if (user?.isSuperAdmin) {
      const storedMode = localStorage.getItem('console-mode')
      if (storedMode !== 'elevated') {
        return <>{fallback}</>
      }
    } else if (!isElevated()) {
      return <>{fallback}</>
    }
  }

  return <>{children}</>
}
