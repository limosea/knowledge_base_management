import React from 'react'
import { usePermission } from '@/contexts/PermissionContext'
import type { Permission } from '@/types'

interface PermissionGuardProps {
  children: React.ReactNode
  permissions?: Permission[]
  requireAll?: boolean
  fallback?: React.ReactNode
}

export function PermissionGuard({
  children,
  permissions,
  requireAll = false,
  fallback = null,
}: PermissionGuardProps) {
  const { hasAnyPermission, hasAllPermissions } = usePermission()

  if (permissions && permissions.length > 0) {
    const hasAccess = requireAll ? hasAllPermissions(permissions) : hasAnyPermission(permissions)
    if (!hasAccess) {
      return <>{fallback}</>
    }
  }

  return <>{children}</>
}
