import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import type { Permission, AdminRole, ElevationStatus } from '@/types'
import { elevationApi } from '@/api/elevation'

interface PermissionUser {
  id: string
  username: string
  role: AdminRole
  isSuperAdmin: boolean
  email: string
}

interface ElevationState {
  elevated: boolean
  elevatedUntil?: string
  remainingSeconds?: number
  mfaEnabled: boolean
  baseline: Permission[]
  elevatedOnly: Permission[]
}

interface PermissionState {
  user: PermissionUser | null
  permissions: Permission[]
  elevation: ElevationState
  loading: boolean
}

interface PermissionContextType extends PermissionState {
  hasPermission: (permission: Permission) => boolean
  hasAnyPermission: (permissions: Permission[]) => boolean
  hasAllPermissions: (permissions: Permission[]) => boolean
  hasMinRole: (minRole: AdminRole) => boolean
  isElevated: () => boolean
  canAccessElevated: () => boolean
  stepUp: (code: string) => Promise<{ success: boolean; error?: string }>
  revokeElevation: () => Promise<void>
  refreshElevationStatus: () => Promise<void>
  refreshPermissions: () => Promise<void>
}

const PermissionContext = createContext<PermissionContextType | null>(null)

const roleHierarchy: Record<AdminRole, number> = {
  user: 1,
  admin: 2,
  super_admin: 3,
}

export function PermissionProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PermissionState>({
    user: null,
    permissions: [],
    elevation: {
      elevated: false,
      mfaEnabled: false,
      baseline: [],
      elevatedOnly: [],
    },
    loading: true,
  })

  const getUserFromStorage = useCallback((): PermissionUser | null => {
    try {
      const userStr = localStorage.getItem('user')
      if (!userStr) return null
      const user = JSON.parse(userStr)
      return {
        id: user.id,
        username: user.username,
        role: user.role,
        isSuperAdmin: user.isSuperAdmin ?? user.role === 'super_admin',
        email: user.email,
      }
    } catch {
      return null
    }
  }, [])

  const refreshElevationStatus = useCallback(async () => {
    try {
      const status: ElevationStatus = await elevationApi.getStatus()
      setState(prev => ({
        ...prev,
        user: prev.user ? { ...prev.user, isSuperAdmin: status.isSuperAdmin } : prev.user,
        elevation: {
          elevated: status.elevated,
          elevatedUntil: status.elevatedUntil,
          remainingSeconds: status.remainingSeconds,
          mfaEnabled: status.mfaEnabled,
          baseline: status.permissions.baseline,
          elevatedOnly: status.permissions.elevated_only,
        },
        permissions: status.permissions.held,
      }))
    } catch (error) {
      console.error('Failed to refresh elevation status:', error)
    }
  }, [])

  const refreshPermissions = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true }))
    const user = getUserFromStorage()
    if (!user) {
      setState(prev => ({ ...prev, loading: false }))
      return
    }
    setState(prev => ({ ...prev, user }))
    await refreshElevationStatus()
    setState(prev => ({ ...prev, loading: false }))
  }, [getUserFromStorage, refreshElevationStatus])

  useEffect(() => {
    refreshPermissions()
  }, [refreshPermissions])

  const hasPermission = useCallback(
    (permission: Permission): boolean => {
      if (state.user?.isSuperAdmin) return true
      return state.permissions.includes(permission)
    },
    [state.user?.isSuperAdmin, state.permissions]
  )

  const hasAnyPermission = useCallback(
    (permissions: Permission[]): boolean => {
      if (state.user?.isSuperAdmin) return true
      return permissions.some(p => state.permissions.includes(p))
    },
    [state.user?.isSuperAdmin, state.permissions]
  )

  const hasAllPermissions = useCallback(
    (permissions: Permission[]): boolean => {
      if (state.user?.isSuperAdmin) return true
      return permissions.every(p => state.permissions.includes(p))
    },
    [state.user?.isSuperAdmin, state.permissions]
  )

  const hasMinRole = useCallback(
    (minRole: AdminRole): boolean => {
      if (!state.user) return false
      return roleHierarchy[state.user.role] >= roleHierarchy[minRole]
    },
    [state.user]
  )

  const isElevated = useCallback((): boolean => {
    if (state.user?.isSuperAdmin) return true
    return state.elevation.elevated && (state.elevation.remainingSeconds ?? 0) > 0
  }, [state.user?.isSuperAdmin, state.elevation])

  const canAccessElevated = useCallback((): boolean => {
    if (state.user?.isSuperAdmin) return state.elevation.mfaEnabled
    return state.elevation.mfaEnabled && state.elevation.elevatedOnly.length > 0
  }, [state.user?.isSuperAdmin, state.elevation])

  const stepUp = useCallback(
    async (code: string): Promise<{ success: boolean; error?: string }> => {
      try {
        const response = await elevationApi.stepUp(code)
        setState(prev => ({
          ...prev,
          elevation: {
            ...prev.elevation,
            elevated: true,
            elevatedUntil: response.elevatedUntil,
            remainingSeconds: response.expiresIn,
          },
        }))
        return { success: true }
      } catch (error: unknown) {
        const err = error as { response?: { data?: { message?: string; code?: string } } }
        const message = err.response?.data?.message || '提权失败'
        return { success: false, error: message }
      }
    },
    []
  )

  const revokeElevation = useCallback(async () => {
    try {
      await elevationApi.revoke()
      setState(prev => ({
        ...prev,
        elevation: {
          ...prev.elevation,
          elevated: false,
          elevatedUntil: undefined,
          remainingSeconds: undefined,
        },
      }))
    } catch (error) {
      console.error('Failed to revoke elevation:', error)
    }
  }, [])

  return (
    <PermissionContext.Provider
      value={{
        ...state,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        hasMinRole,
        isElevated,
        canAccessElevated,
        stepUp,
        revokeElevation,
        refreshElevationStatus,
        refreshPermissions,
      }}
    >
      {children}
    </PermissionContext.Provider>
  )
}

export function usePermission(): PermissionContextType {
  const context = useContext(PermissionContext)
  if (!context) {
    throw new Error('usePermission must be used within a PermissionProvider')
  }
  return context
}
