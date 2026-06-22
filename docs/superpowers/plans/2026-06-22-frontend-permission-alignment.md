# Frontend Permission Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align frontend with backend's new permission system including fine-grained permissions, three-role model, step-up elevation, and content shielding.

**Architecture:** React Context for permission state management, route guards for access control, separate personal/elevated console navigation, TOTP-based elevation flow.

**Tech Stack:** React, TypeScript, React Router, shadcn/ui, React Context

## Global Constraints

- Permission types must match API exactly: `users:list`, `users:manage`, `content:view_shielded`, `content:shield`, `content:unshield`, `apikeys:list`, `apikeys:manage`, `audit:read`, `analytics:read`, `system:read`, `stats:read`
- Admin roles: `user`, `admin`, `super_admin`
- Elevation duration: 15 minutes (900 seconds)
- super_admin implicitly has all permissions
- MFA is required for elevation

---

## File Structure

```
src/
├── types/
│   ├── index.ts                    # Update: user types, permission types
│   ├── roles.ts                    # Update: permission definitions
│   └── elevation.ts                # Create: elevation types
├── contexts/
│   └── PermissionContext.tsx       # Create: permission state management
├── components/
│   └── auth/
│       ├── PermissionRoute.tsx     # Create: permission-based route guard
│       ├── PermissionGuard.tsx     # Create: permission-based UI guard
│       ├── ElevationRoute.tsx      # Create: elevation-required route
│       └── ElevationDialog.tsx     # Create: TOTP elevation dialog
│   └── layout/
│       ├── MainLayout.tsx          # Modify: navigation filtering
│       ├── ElevationToggle.tsx     # Create: elevation entry/exit button
│       └── ElevationIndicator.tsx  # Create: elevation status banner
│   └── roles/
│       └── PermissionSelector.tsx  # Modify: permission options
├── pages/
│   ├── KnowledgePage.tsx           # Modify: shield/unshield features
│   ├── UsersPage.tsx               # Modify: role support, permission checks
│   └── RolesPage.tsx               # Modify: new permission list
├── api/
│   ├── auth.ts                     # Modify: login response handling
│   ├── elevation.ts                # Create: elevation API
│   ├── admin-users.ts              # Modify: new fields
│   └── knowledge.ts                # Modify: shield APIs
└── router.tsx                      # Modify: permission routes
```

---

## Phase 1: Type System and API Alignment

### Task 1: Update Permission Types

**Files:**
- Modify: `src/types/roles.ts`

**Interfaces:**
- Produces: `Permission` type, `PERMISSION_LABELS`, `PERMISSION_DESCRIPTIONS`

- [ ] **Step 1: Replace entire file content**

```typescript
// src/types/roles.ts
export type Permission =
  | 'users:list'
  | 'users:manage'
  | 'content:view_shielded'
  | 'content:shield'
  | 'content:unshield'
  | 'apikeys:list'
  | 'apikeys:manage'
  | 'audit:read'
  | 'analytics:read'
  | 'system:read'
  | 'stats:read'

export const PERMISSION_LABELS: Record<Permission, string> = {
  'users:list': '列出用户',
  'users:manage': '管理用户',
  'content:view_shielded': '查看已屏蔽内容',
  'content:shield': '屏蔽内容',
  'content:unshield': '解除屏蔽',
  'apikeys:list': '列出 API Key',
  'apikeys:manage': '管理 API Key',
  'audit:read': '查看审计日志',
  'analytics:read': '查看分析数据',
  'system:read': '查看系统信息',
  'stats:read': '查看统计信息',
}

export const PERMISSION_DESCRIPTIONS: Record<Permission, string> = {
  'users:list': '列出全站管理员用户',
  'users:manage': '创建/编辑/停用/重置密码管理员用户（仅 super_admin）',
  'content:view_shielded': '在列表/详情中可见已被屏蔽的库或条目',
  'content:shield': '将他人已公开的库/条目标记为屏蔽',
  'content:unshield': '解除屏蔽，恢复公开',
  'apikeys:list': '列出全站 API Key',
  'apikeys:manage': '管理全站任意 API Key（仅 super_admin）',
  'audit:read': '查看审计日志',
  'analytics:read': '查看分析数据',
  'system:read': '查看系统信息',
  'stats:read': '查看统计信息',
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors related to roles.ts

- [ ] **Step 3: Commit**

```bash
git add src/types/roles.ts
git commit -m "feat(types): update permission types to match API"
```

---

### Task 2: Create Elevation Types

**Files:**
- Create: `src/types/elevation.ts`

**Interfaces:**
- Produces: `ElevationStatus`, `ElevationStepUpResponse`

- [ ] **Step 1: Create elevation types file**

```typescript
// src/types/elevation.ts
import type { Permission } from './roles'

export interface ElevationStatus {
  elevated: boolean
  elevatedUntil?: string
  remainingSeconds?: number
  mfaEnabled: boolean
  isSuperAdmin: boolean
  permissions: {
    held: Permission[]
    baseline: Permission[]
    elevated_only: Permission[]
  }
}

export interface ElevationStepUpResponse {
  elevated: boolean
  elevatedUntil: string
  expiresIn: number
}

export interface ElevationRevokeResponse {
  elevated: boolean
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/types/elevation.ts
git commit -m "feat(types): add elevation type definitions"
```

---

### Task 3: Update Core Types

**Files:**
- Modify: `src/types/index.ts`

**Interfaces:**
- Consumes: `Permission` from `./roles`
- Produces: Updated `AdminRole`, `LoginResponse`, `AdminProfile`, `AdminUserSummary`, `AdminKnowledgeListItem`

- [ ] **Step 1: Update AdminRole type**

Find line:
```typescript
export type AdminRole = 'admin' | 'super_admin'
```

Replace with:
```typescript
export type AdminRole = 'user' | 'admin' | 'super_admin'
```

- [ ] **Step 2: Update LoginResponse interface**

Find the `LoginResponse` interface and replace with:

```typescript
export interface LoginResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
  requirePasswordChange?: boolean
  user: {
    id: string
    username: string
    role: AdminRole
    email: string
    isSuperAdmin: boolean
    permissions: Permission[]
  }
}
```

- [ ] **Step 3: Update AdminProfile interface**

Find the `AdminProfile` interface and replace with:

```typescript
export interface AdminProfile {
  id: string
  username: string
  email: string
  role: AdminRole
  isSuperAdmin: boolean
  permissions: Permission[]
  mfaEnabled: boolean
  createdAt: string
}
```

- [ ] **Step 4: Update AdminUserSummary interface**

Find the `AdminUserSummary` interface and replace with:

```typescript
export interface AdminUserSummary {
  id: string
  username: string
  email: string
  role: AdminRole
  isActive: boolean
  mfaEnabled: boolean
  lastLoginAt?: string
  createdBy?: string
  createdAt: string
}
```

- [ ] **Step 5: Update AdminKnowledgeListItem interface**

Find the `AdminKnowledgeListItem` interface and replace with:

```typescript
export interface AdminKnowledgeListItem {
  id: string
  title: string
  category?: string
  tags: string[]
  qualityScore?: number
  visibility: 'private' | 'public'
  shielded: boolean
  shieldedAt?: string
  createdAt: string
  createdBy: string
}
```

- [ ] **Step 6: Add elevation export**

Add at the end of the file:

```typescript
export * from './elevation'
```

- [ ] **Step 7: Add Permission import at top**

Add `Permission` to the imports or ensure it's exported:

```typescript
export type { Permission, PERMISSION_LABELS, PERMISSION_DESCRIPTIONS } from './roles'
```

- [ ] **Step 8: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: May have some errors in other files due to interface changes, that's expected

- [ ] **Step 9: Commit**

```bash
git add src/types/index.ts
git commit -m "feat(types): update user and permission types for new API"
```

---

### Task 4: Create Elevation API

**Files:**
- Create: `src/api/elevation.ts`

**Interfaces:**
- Consumes: `ElevationStatus`, `ElevationStepUpResponse`, `ElevationRevokeResponse` from `@/types`
- Produces: `elevationApi` object

- [ ] **Step 1: Create elevation API file**

```typescript
// src/api/elevation.ts
import { apiClient } from './client'
import type { ElevationStatus, ElevationStepUpResponse, ElevationRevokeResponse } from '@/types'

export const elevationApi = {
  stepUp: (code: string): Promise<ElevationStepUpResponse> => {
    return apiClient.post<ElevationStepUpResponse>('/admin/elevation/step-up', { code })
  },

  getStatus: (): Promise<ElevationStatus> => {
    return apiClient.get<ElevationStatus>('/admin/elevation/status')
  },

  revoke: (): Promise<ElevationRevokeResponse> => {
    return apiClient.post<ElevationRevokeResponse>('/admin/elevation/revoke')
  },
}
```

- [ ] **Step 2: Export from api/index.ts**

Add to `src/api/index.ts`:

```typescript
export { elevationApi } from './elevation'
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors in elevation.ts

- [ ] **Step 4: Commit**

```bash
git add src/api/elevation.ts src/api/index.ts
git commit -m "feat(api): add elevation API endpoints"
```

---

### Task 5: Update Auth API

**Files:**
- Modify: `src/api/auth.ts`

**Interfaces:**
- Consumes: Updated `LoginResponse` from `@/types`

- [ ] **Step 1: Update login method to store new fields**

Find the `login` method and update:

```typescript
login: async (data: LoginRequest): Promise<LoginResult> => {
  const response = await apiClient.post<LoginResult>('/admin/auth/login', data, false)
  if ('accessToken' in response) {
    localStorage.setItem('accessToken', response.accessToken)
    localStorage.setItem('refreshToken', response.refreshToken)
    localStorage.setItem('user', JSON.stringify(response.user))
  }
  return response
},
```

The structure remains the same but now `response.user` includes `isSuperAdmin` and `permissions`.

- [ ] **Step 2: Update loginWithMfa similarly**

```typescript
loginWithMfa: async (data: MfaLoginRequest): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>('/admin/auth/login/mfa', data, false)
  localStorage.setItem('accessToken', response.accessToken)
  localStorage.setItem('refreshToken', response.refreshToken)
  localStorage.setItem('user', JSON.stringify(response.user))
  return response
},
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No new errors

- [ ] **Step 4: Commit**

```bash
git add src/api/auth.ts
git commit -m "feat(api): update auth to handle new user fields"
```

---

### Task 6: Update Knowledge API for Shielding

**Files:**
- Modify: `src/api/knowledge.ts`

**Interfaces:**
- Consumes: `KnowledgeEntry`, `AdminKnowledgeListItem` from `@/types`
- Produces: Shield/unshield API methods

- [ ] **Step 1: Add shield methods to knowledgeApi**

Add the following methods to the `knowledgeApi` object in `src/api/knowledge.ts`:

```typescript
shield: (id: string): Promise<KnowledgeEntry> => {
  return apiClient.post<KnowledgeEntry>(`/admin/knowledge/${id}/shield`)
},

unshield: (id: string): Promise<KnowledgeEntry> => {
  return apiClient.post<KnowledgeEntry>(`/admin/knowledge/${id}/unshield`)
},

batchShield: (ids: string[]): Promise<{ shielded: number; skipped: number }> => {
  return apiClient.post<{ shielded: number; skipped: number }>('/admin/knowledge/batch-shield', { ids })
},

batchUnshield: (ids: string[]): Promise<{ unshielded: number; skipped: number }> => {
  return apiClient.post<{ unshielded: number; skipped: number }>('/admin/knowledge/batch-unshield', { ids })
},
```

- [ ] **Step 2: Import KnowledgeEntry if not already imported**

Ensure at the top of the file:

```typescript
import type { KnowledgeEntry, AdminKnowledgeListItem, KnowledgeListResponse, AdminKnowledgeListResponse } from '@/types'
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No new errors

- [ ] **Step 4: Commit**

```bash
git add src/api/knowledge.ts
git commit -m "feat(api): add shield/unshield endpoints for knowledge"
```

---

### Task 7: Update Permission Selector Component

**Files:**
- Modify: `src/components/roles/PermissionSelector.tsx`

**Interfaces:**
- Consumes: `Permission`, `PERMISSION_LABELS`, `PERMISSION_DESCRIPTIONS` from `@/types`

- [ ] **Step 1: Read current PermissionSelector content**

Read the file to understand current implementation.

- [ ] **Step 2: Update imports**

Update imports to use new permission types:

```typescript
import type { Permission } from '@/types'
import { PERMISSION_LABELS, PERMISSION_DESCRIPTIONS } from '@/types'
```

- [ ] **Step 3: Update available permissions list**

Replace any hardcoded permission list with the new permissions:

```typescript
const AVAILABLE_PERMISSIONS: Permission[] = [
  'users:list',
  'users:manage',
  'content:view_shielded',
  'content:shield',
  'content:unshield',
  'apikeys:list',
  'apikeys:manage',
  'audit:read',
  'analytics:read',
  'system:read',
  'stats:read',
]
```

- [ ] **Step 4: Verify component renders correctly**

Run: `npm run dev`
Expected: App starts without errors

- [ ] **Step 5: Commit**

```bash
git add src/components/roles/PermissionSelector.tsx
git commit -m "feat(components): update permission selector with new permissions"
```

---

## Phase 2: Permission Context and Route Guards

### Task 8: Create PermissionContext

**Files:**
- Create: `src/contexts/PermissionContext.tsx`

**Interfaces:**
- Consumes: `Permission`, `AdminRole`, `ElevationStatus`, `ElevationStepUpResponse` from `@/types`
- Consumes: `elevationApi` from `@/api/elevation`
- Produces: `PermissionContext`, `PermissionProvider`, `usePermission`

- [ ] **Step 1: Create PermissionContext file**

```typescript
// src/contexts/PermissionContext.tsx
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
    return state.elevation.mfaEnabled && state.elevation.elevatedOnly.length > 0
  }, [state.elevation])

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
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors in PermissionContext.tsx

- [ ] **Step 3: Commit**

```bash
git add src/contexts/PermissionContext.tsx
git commit -m "feat(context): add PermissionContext for permission management"
```

---

### Task 9: Create PermissionRoute Component

**Files:**
- Create: `src/components/auth/PermissionRoute.tsx`

**Interfaces:**
- Consumes: `usePermission` from `@/contexts/PermissionContext`
- Consumes: `Permission` from `@/types`

- [ ] **Step 1: Create PermissionRoute component**

```typescript
// src/components/auth/PermissionRoute.tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/auth/PermissionRoute.tsx
git commit -m "feat(components): add PermissionRoute for permission-based routing"
```

---

### Task 10: Create PermissionGuard Component

**Files:**
- Create: `src/components/auth/PermissionGuard.tsx`

**Interfaces:**
- Consumes: `usePermission` from `@/contexts/PermissionContext`
- Consumes: `Permission` from `@/types`

- [ ] **Step 1: Create PermissionGuard component**

```typescript
// src/components/auth/PermissionGuard.tsx
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
  const { hasPermission, hasAnyPermission, hasAllPermissions, isElevated } = usePermission()

  if (permissions && permissions.length > 0) {
    const hasAccess = requireAll ? hasAllPermissions(permissions) : hasAnyPermission(permissions)
    if (!hasAccess) {
      return <>{fallback}</>
    }
  }

  if (requireElevation && !isElevated()) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/auth/PermissionGuard.tsx
git commit -m "feat(components): add PermissionGuard for UI permission control"
```

---

### Task 11: Create ElevationRoute Component

**Files:**
- Create: `src/components/auth/ElevationRoute.tsx`

**Interfaces:**
- Consumes: `usePermission` from `@/contexts/PermissionContext`

- [ ] **Step 1: Create ElevationRoute component**

```typescript
// src/components/auth/ElevationRoute.tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/auth/ElevationRoute.tsx
git commit -m "feat(components): add ElevationRoute for elevation-required pages"
```

---

### Task 12: Create ElevationDialog Component

**Files:**
- Create: `src/components/auth/ElevationDialog.tsx`

**Interfaces:**
- Consumes: `usePermission` from `@/contexts/PermissionContext`

- [ ] **Step 1: Create ElevationDialog component**

```typescript
// src/components/auth/ElevationDialog.tsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { usePermission } from '@/contexts/PermissionContext'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Shield, Loader2 } from 'lucide-react'

interface ElevationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function ElevationDialog({ open, onOpenChange, onSuccess }: ElevationDialogProps) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const navigate = useNavigate()
  const { stepUp, elevation } = usePermission()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (code.length < 6) return

    setLoading(true)
    const result = await stepUp(code)
    setLoading(false)

    if (result.success) {
      toast({
        title: t('common.success'),
        description: t('elevation.success'),
      })
      onSuccess()
    } else {
      toast({
        title: t('common.error'),
        description: result.error || t('elevation.failed'),
        variant: 'destructive',
      })
    }
  }

  const handleSetupMfa = () => {
    navigate('/settings')
    onOpenChange(false)
  }

  if (!elevation.mfaEnabled) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              {t('elevation.mfaRequired')}
            </DialogTitle>
            <DialogDescription>{t('elevation.mfaRequiredDescription')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleSetupMfa}>{t('elevation.setupMfa')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {t('elevation.title')}
          </DialogTitle>
          <DialogDescription>{t('elevation.description')}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="py-4">
            <Label htmlFor="totp-code">{t('elevation.totpCode')}</Label>
            <Input
              id="totp-code"
              type="text"
              placeholder="000000"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="mt-2 text-center text-2xl tracking-widest"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={code.length < 6 || loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('elevation.confirm')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/auth/ElevationDialog.tsx
git commit -m "feat(components): add ElevationDialog for TOTP verification"
```

---

### Task 13: Create ElevationToggle Component

**Files:**
- Create: `src/components/layout/ElevationToggle.tsx`

**Interfaces:**
- Consumes: `usePermission` from `@/contexts/PermissionContext`

- [ ] **Step 1: Create ElevationToggle component**

```typescript
// src/components/layout/ElevationToggle.tsx
import React, { useState, useEffect } from 'react'
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/layout/ElevationToggle.tsx
git commit -m "feat(components): add ElevationToggle for entering/exiting elevated mode"
```

---

### Task 14: Create ElevationIndicator Component

**Files:**
- Create: `src/components/layout/ElevationIndicator.tsx`

**Interfaces:**
- Consumes: `usePermission` from `@/contexts/PermissionContext`

- [ ] **Step 1: Create ElevationIndicator component**

```typescript
// src/components/layout/ElevationIndicator.tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/layout/ElevationIndicator.tsx
git commit -m "feat(components): add ElevationIndicator banner for elevated mode"
```

---

### Task 15: Integrate PermissionProvider in App

**Files:**
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `PermissionProvider` from `@/contexts/PermissionContext`

- [ ] **Step 1: Read current App.tsx**

Read the file to understand current structure.

- [ ] **Step 2: Add PermissionProvider import**

```typescript
import { PermissionProvider } from '@/contexts/PermissionContext'
```

- [ ] **Step 3: Wrap app with PermissionProvider**

Wrap the app content (inside ThemeProvider, around router) with:

```typescript
<PermissionProvider>
  {/* existing content */}
</PermissionProvider>
```

- [ ] **Step 4: Verify app starts**

Run: `npm run dev`
Expected: App starts without errors

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx
git commit -m "feat(app): integrate PermissionProvider"
```

---

### Task 16: Update Router with Permission Routes

**Files:**
- Modify: `src/router.tsx`

**Interfaces:**
- Consumes: `PermissionRoute`, `ElevationRoute` from `@/components/auth`
- Consumes: `usePermission` from `@/contexts/PermissionContext`

- [ ] **Step 1: Add imports**

Add to imports:

```typescript
import { PermissionRoute } from '@/components/auth/PermissionRoute'
import { ElevationRoute } from '@/components/auth/ElevationRoute'
```

- [ ] **Step 2: Update ProtectedRoute to use PermissionContext**

Replace the existing `ProtectedRoute`, `SuperAdminRoute`, `AdminRoute` components with permission-based routes:

```typescript
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const accessToken = localStorage.getItem('accessToken')
  if (!accessToken) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}
```

- [ ] **Step 3: Update route definitions**

Replace the route definitions with permission-based routes:

```typescript
export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/login/mfa',
        element: <MfaPage />,
      },
    ],
  },
  {
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: '/dashboard',
        element: <DashboardPage />,
      },
      {
        path: '/analytics',
        element: <Navigate to="/analytics/knowledge" replace />,
      },
      {
        path: '/analytics/knowledge',
        element: (
          <PermissionRoute permissions={['analytics:read']}>
            <KnowledgeAnalyticsPage />
          </PermissionRoute>
        ),
      },
      {
        path: '/analytics/search',
        element: (
          <PermissionRoute permissions={['stats:read']}>
            <SearchAnalyticsPage />
          </PermissionRoute>
        ),
      },
      {
        path: '/analytics/api',
        element: (
          <PermissionRoute permissions={['stats:read']}>
            <ApiAnalyticsPage />
          </PermissionRoute>
        ),
      },
      {
        path: '/analytics/performance',
        element: (
          <PermissionRoute permissions={['audit:read']}>
            <PerformanceAnalyticsPage />
          </PermissionRoute>
        ),
      },
      {
        path: '/knowledge',
        element: <KnowledgePage />,
      },
      {
        path: '/knowledge/:id',
        element: <KnowledgeDetailPage />,
      },
      {
        path: '/categories',
        element: <CategoriesPage />,
      },
      {
        path: '/users',
        element: (
          <PermissionRoute permissions={['users:list']}>
            <UsersPage />
          </PermissionRoute>
        ),
      },
      {
        path: '/roles',
        element: (
          <ElevationRoute>
            <RolesPage />
          </ElevationRoute>
        ),
      },
      {
        path: '/api-keys',
        element: (
          <PermissionRoute permissions={['apikeys:list']}>
            <ApiKeysPage />
          </PermissionRoute>
        ),
      },
      {
        path: '/me/api-keys',
        element: <MyApiKeysPage />,
      },
      {
        path: '/audit-logs',
        element: (
          <PermissionRoute permissions={['audit:read']}>
            <AuditLogsPage />
          </PermissionRoute>
        ),
      },
      {
        path: '/system',
        element: (
          <PermissionRoute permissions={['system:read']}>
            <SystemPage />
          </PermissionRoute>
        ),
      },
      {
        path: '/settings',
        element: <SettingsPage />,
      },
    ],
  },
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
])
```

- [ ] **Step 4: Commit**

```bash
git add src/router.tsx
git commit -m "feat(router): update routes with permission-based access control"
```

---

### Task 17: Update MainLayout Navigation

**Files:**
- Modify: `src/components/layout/MainLayout.tsx`

**Interfaces:**
- Consumes: `usePermission` from `@/contexts/PermissionContext`
- Consumes: `Permission` from `@/types`
- Consumes: `ElevationToggle`, `ElevationIndicator` from components

- [ ] **Step 1: Update imports**

Add imports:

```typescript
import { usePermission } from '@/contexts/PermissionContext'
import type { Permission } from '@/types'
import { ElevationToggle } from './ElevationToggle'
import { ElevationIndicator } from './ElevationIndicator'
```

- [ ] **Step 2: Update NavItem interface**

Replace the `NavItem` interface:

```typescript
interface NavItem {
  path?: string
  icon: React.ComponentType<{ className?: string }>
  labelKey: string
  collapsible?: boolean
  children?: NavItem[]
  permissions?: Permission[]
  requireAll?: boolean
  requireElevation?: boolean
  superAdminOnly?: boolean
}
```

- [ ] **Step 3: Update navSections with permission-based items**

Replace `navSections` with:

```typescript
const navSections: NavSection[] = [
  {
    titleKey: 'nav.personalConsole',
    items: [
      {
        path: '/dashboard',
        icon: LayoutDashboard,
        labelKey: 'nav.overview',
      },
      {
        path: '/me/api-keys',
        icon: User,
        labelKey: 'nav.myApiKeys',
      },
    ],
  },
  {
    titleKey: 'nav.knowledgeBase',
    items: [
      { path: '/knowledge', icon: BookOpen, labelKey: 'nav.knowledge' },
      { path: '/categories', icon: Tag, labelKey: 'nav.categories' },
    ],
  },
  {
    titleKey: 'nav.elevatedConsole',
    items: [
      {
        path: '/users',
        icon: Users,
        labelKey: 'nav.userManagement',
        permissions: ['users:list'],
      },
      {
        path: '/roles',
        icon: Shield,
        labelKey: 'nav.roleManagement',
        superAdminOnly: true,
        requireElevation: true,
      },
      {
        path: '/api-keys',
        icon: Key,
        labelKey: 'nav.apiKeys',
        permissions: ['apikeys:list'],
      },
    ],
  },
  {
    titleKey: 'nav.system',
    items: [
      {
        path: '/audit-logs',
        icon: FileText,
        labelKey: 'nav.auditLogs',
        permissions: ['audit:read'],
      },
      {
        path: '/system',
        icon: Activity,
        labelKey: 'nav.systemMonitor',
        permissions: ['system:read'],
      },
      {
        icon: BarChart3,
        labelKey: 'nav.analytics',
        collapsible: true,
        children: [
          { path: '/analytics/knowledge', icon: BookOpen, labelKey: 'analytics.knowledgeAnalysis', permissions: ['analytics:read'] },
          { path: '/analytics/search', icon: Search, labelKey: 'analytics.searchAnalysis', permissions: ['stats:read'] },
          { path: '/analytics/api', icon: KeyRound, labelKey: 'analytics.apiAnalysis', permissions: ['stats:read'] },
          { path: '/analytics/performance', icon: Gauge, labelKey: 'analytics.performanceAndAudit', permissions: ['audit:read'] },
        ],
      },
      { path: '/settings', icon: Settings, labelKey: 'nav.settings' },
    ],
  },
]
```

- [ ] **Step 4: Update filter logic**

Replace the filter logic in the nav render with:

```typescript
const { hasPermission, hasAnyPermission, isElevated, user: permUser, canAccessElevated } = usePermission()

const filterItems = (items: NavItem[]): NavItem[] => {
  return items.filter(item => {
    if (item.superAdminOnly && !permUser?.isSuperAdmin) return false
    if (item.permissions && !hasAnyPermission(item.permissions)) return false
    if (item.requireElevation && !canAccessElevated()) return false
    if (item.children) {
      item.children = filterItems(item.children)
    }
    return true
  })
}
```

- [ ] **Step 5: Add ElevationToggle to header**

Add `ElevationToggle` component to the desktop header, before the user dropdown:

```typescript
<div className="flex items-center gap-2">
  <ElevationToggle />
  <Button variant="ghost" size="icon" onClick={toggleLanguage}>
    <Languages className="h-5 w-5" />
  </Button>
  {/* ... rest of header */}
</div>
```

- [ ] **Step 6: Add ElevationIndicator before main content**

Add before `<main>` or at top of main content area:

```typescript
<ElevationIndicator />
```

- [ ] **Step 7: Update role badge display**

Update the role badge to show the actual role:

```typescript
<Badge variant="outline">
  {user.role === 'super_admin' ? t('users.superAdmin') : 
   user.role === 'admin' ? t('users.admin') : t('users.user')}
</Badge>
```

- [ ] **Step 8: Commit**

```bash
git add src/components/layout/MainLayout.tsx
git commit -m "feat(layout): update navigation with permission-based filtering and elevation toggle"
```

---

## Phase 3: Feature Component Updates

### Task 18: Update UsersPage

**Files:**
- Modify: `src/pages/UsersPage.tsx`

**Interfaces:**
- Consumes: `usePermission`, `PermissionGuard` from `@/components/auth`
- Consumes: Updated `AdminUserSummary`, `AdminRole` from `@/types`

- [ ] **Step 1: Add imports**

```typescript
import { PermissionGuard } from '@/components/auth/PermissionGuard'
import { usePermission } from '@/contexts/PermissionContext'
```

- [ ] **Step 2: Update form data type**

Update `formData` state to include all roles:

```typescript
const [formData, setFormData] = useState({
  username: '',
  password: '',
  email: '',
  role: 'user' as AdminRole,
})
```

- [ ] **Step 3: Update role select options**

Update role select in create dialog:

```typescript
<select
  id="role"
  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
  value={formData.role}
  onChange={(e) => setFormData({ ...formData, role: e.target.value as AdminRole })}
>
  <option value="user">{t('users.user')}</option>
  <option value="admin">{t('users.admin')}</option>
</select>
```

- [ ] **Step 4: Update role badge in table**

Update role badge to handle all roles:

```typescript
<Badge variant={user.role === 'super_admin' ? 'default' : user.role === 'admin' ? 'secondary' : 'outline'}>
  {user.role === 'super_admin' ? t('users.superAdmin') : 
   user.role === 'admin' ? t('users.admin') : t('users.user')}
</Badge>
```

- [ ] **Step 5: Wrap action buttons with PermissionGuard**

Wrap create button:

```typescript
<PermissionGuard permissions={['users:manage']} requireElevation>
  <Button onClick={() => setCreateDialogOpen(true)}>
    <Plus className="h-4 w-4 mr-2" />
    {t('users.create')}
  </Button>
</PermissionGuard>
```

Wrap action buttons in table:

```typescript
<PermissionGuard permissions={['users:manage']} requireElevation>
  <div className="flex items-center gap-1">
    <Button variant="ghost" size="icon" onClick={() => handleEdit(user)}>
      <Pencil className="h-4 w-4" />
    </Button>
    {/* ... other buttons */}
  </div>
</PermissionGuard>
```

- [ ] **Step 6: Use usePermission for current user check**

Replace manual localStorage check:

```typescript
const { user: permUser } = usePermission()

// In action buttons check:
{permUser?.id !== user.id && (
  // ... action buttons
)}
```

- [ ] **Step 7: Commit**

```bash
git add src/pages/UsersPage.tsx
git commit -m "feat(users): update page with permission guards and all roles"
```

---

### Task 19: Update KnowledgePage with Shield Features

**Files:**
- Modify: `src/pages/KnowledgePage.tsx`

**Interfaces:**
- Consumes: `usePermission`, `PermissionGuard` from `@/components/auth`
- Consumes: Shield API methods from `@/api/knowledge`

- [ ] **Step 1: Read current KnowledgePage**

Read the file to understand current structure.

- [ ] **Step 2: Add imports**

```typescript
import { PermissionGuard } from '@/components/auth/PermissionGuard'
import { usePermission } from '@/contexts/PermissionContext'
import { knowledgeApi } from '@/api'
```

- [ ] **Step 3: Add shield state and handlers**

Add to component:

```typescript
const [selectedIds, setSelectedIds] = useState<string[]>([])
const { isElevated, hasPermission } = usePermission()

const handleShield = async (id: string) => {
  try {
    await knowledgeApi.shield(id)
    toast({ title: t('common.success'), description: t('knowledge.shieldSuccess') })
    fetchKnowledge()
  } catch (error) {
    toast({ title: t('common.error'), description: String(error), variant: 'destructive' })
  }
}

const handleUnshield = async (id: string) => {
  try {
    await knowledgeApi.unshield(id)
    toast({ title: t('common.success'), description: t('knowledge.unshieldSuccess') })
    fetchKnowledge()
  } catch (error) {
    toast({ title: t('common.error'), description: String(error), variant: 'destructive' })
  }
}

const handleBatchShield = async () => {
  if (selectedIds.length === 0) return
  try {
    const result = await knowledgeApi.batchShield(selectedIds)
    toast({ title: t('common.success'), description: t('knowledge.batchShieldSuccess', { count: result.shielded }) })
    setSelectedIds([])
    fetchKnowledge()
  } catch (error) {
    toast({ title: t('common.error'), description: String(error), variant: 'destructive' })
  }
}

const handleBatchUnshield = async () => {
  if (selectedIds.length === 0) return
  try {
    const result = await knowledgeApi.batchUnshield(selectedIds)
    toast({ title: t('common.success'), description: t('knowledge.batchUnshieldSuccess', { count: result.unshielded }) })
    setSelectedIds([])
    fetchKnowledge()
  } catch (error) {
    toast({ title: t('common.error'), description: String(error), variant: 'destructive' })
  }
}
```

- [ ] **Step 4: Add visibility and shielded columns to table**

Add columns after qualityScore:

```typescript
<TableHead>{t('knowledge.visibility')}</TableHead>
<TableHead>{t('knowledge.shielded')}</TableHead>
```

Add cell render:

```typescript
<TableCell>
  <Badge variant={entry.visibility === 'public' ? 'default' : 'secondary'}>
    {entry.visibility}
  </Badge>
</TableCell>
<TableCell>
  {entry.shielded ? (
    <Badge variant="destructive">{t('knowledge.shielded')}</Badge>
  ) : (
    <span className="text-muted-foreground">-</span>
  )}
</TableCell>
```

- [ ] **Step 5: Add shield action buttons**

Add to action column:

```typescript
<PermissionGuard permissions={['content:shield']} requireElevation>
  {entry.shielded ? (
    <Button variant="outline" size="sm" onClick={() => handleUnshield(entry.id)}>
      {t('knowledge.unshield')}
    </Button>
  ) : (
    <Button variant="destructive" size="sm" onClick={() => handleShield(entry.id)}>
      {t('knowledge.shield')}
    </Button>
  )}
</PermissionGuard>
```

- [ ] **Step 6: Add batch action toolbar**

Add before table:

```typescript
{selectedIds.length > 0 && isElevated() && hasPermission('content:shield') && (
  <div className="flex items-center gap-2 p-2 bg-muted rounded-lg mb-4">
    <span className="text-sm">{t('knowledge.selected', { count: selectedIds.length })}</span>
    <Button size="sm" variant="destructive" onClick={handleBatchShield}>
      {t('knowledge.batchShield')}
    </Button>
    <Button size="sm" variant="outline" onClick={handleBatchUnshield}>
      {t('knowledge.batchUnshield')}
    </Button>
    <Button size="sm" variant="ghost" onClick={() => setSelectedIds([])}>
      {t('common.clear')}
    </Button>
  </div>
)}
```

- [ ] **Step 7: Add checkbox for row selection**

Add checkbox column at start of table:

```typescript
<TableHead className="w-12">
  <Checkbox
    checked={selectedIds.length === data.length && data.length > 0}
    onCheckedChange={(checked) => {
      if (checked) {
        setSelectedIds(data.map(e => e.id))
      } else {
        setSelectedIds([])
      }
    }}
  />
</TableHead>
```

Add checkbox to each row:

```typescript
<TableCell>
  <Checkbox
    checked={selectedIds.includes(entry.id)}
    onCheckedChange={(checked) => {
      if (checked) {
        setSelectedIds([...selectedIds, entry.id])
      } else {
        setSelectedIds(selectedIds.filter(id => id !== entry.id))
      }
    }}
  />
</TableCell>
```

- [ ] **Step 8: Import Checkbox component**

```typescript
import { Checkbox } from '@/components/ui/checkbox'
```

- [ ] **Step 9: Commit**

```bash
git add src/pages/KnowledgePage.tsx
git commit -m "feat(knowledge): add shield/unshield features with batch operations"
```

---

### Task 20: Add i18n Translations

**Files:**
- Modify: `src/i18n/index.ts` or translation files

- [ ] **Step 1: Add elevation translations**

Add to translation files:

```typescript
// elevation translations
elevation: {
  title: '高级控制台验证',
  description: '请输入您的身份验证器应用显示的6位数字验证码',
  totpCode: 'TOTP 验证码',
  confirm: '确认',
  success: '已进入高级控制台',
  failed: '验证码无效',
  enter: '进入高级控制台',
  exit: '退出高级控制台',
  activeMode: '高级模式 · 您拥有扩展权限',
  mfaRequired: '需要启用 MFA',
  mfaRequiredDescription: '进入高级控制台需要先启用多因素认证',
  setupMfa: '设置 MFA',
},
```

- [ ] **Step 2: Add knowledge shield translations**

```typescript
knowledge: {
  // ... existing
  visibility: '可见性',
  shielded: '已屏蔽',
  shield: '屏蔽',
  unshield: '解除屏蔽',
  batchShield: '批量屏蔽',
  batchUnshield: '批量解除',
  shieldSuccess: '已屏蔽该条目',
  unshieldSuccess: '已解除屏蔽',
  batchShieldSuccess: '已屏蔽 {{count}} 个条目',
  batchUnshieldSuccess: '已解除 {{count}} 个条目',
  selected: '已选择 {{count}} 个条目',
},
```

- [ ] **Step 3: Add navigation translations**

```typescript
nav: {
  // ... existing
  personalConsole: '个人控制台',
  elevatedConsole: '高级控制台',
},
```

- [ ] **Step 4: Commit**

```bash
git add src/i18n/
git commit -m "feat(i18n): add elevation and shield feature translations"
```

---

### Task 21: Export New Components

**Files:**
- Create or modify: `src/components/auth/index.ts`

- [ ] **Step 1: Create auth components index**

```typescript
// src/components/auth/index.ts
export { PermissionRoute } from './PermissionRoute'
export { PermissionGuard } from './PermissionGuard'
export { ElevationRoute } from './ElevationRoute'
export { ElevationDialog } from './ElevationDialog'
```

- [ ] **Step 2: Update layout components index**

Add to `src/components/layout/index.ts`:

```typescript
export { ElevationToggle } from './ElevationToggle'
export { ElevationIndicator } from './ElevationIndicator'
```

- [ ] **Step 3: Commit**

```bash
git add src/components/auth/index.ts src/components/layout/index.ts
git commit -m "feat(components): export auth and layout components"
```

---

## Final Steps

### Task 22: Verify Build and Type Check

- [ ] **Step 1: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 2: Run build**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 3: Run lint if available**

Run: `npm run lint`
Expected: No lint errors (or acceptable warnings)

---

### Task 23: Final Commit

- [ ] **Step 1: Stage all remaining changes**

```bash
git add -A
```

- [ ] **Step 2: Create final commit**

```bash
git commit -m "feat: complete frontend permission alignment with backend API

- Update permission types to match API (11 permissions)
- Add three-role model support (user, admin, super_admin)
- Implement PermissionContext for centralized permission management
- Add PermissionRoute and PermissionGuard for access control
- Implement Step-up Elevation with TOTP verification
- Add content shield/unshield functionality
- Update navigation with personal/elevated console separation
- Update UsersPage to support all roles
- Add i18n translations for new features"
```

---

## Self-Review Checklist

After completing all tasks:

1. **Spec coverage**: Each section of the spec has a corresponding task
2. **No placeholders**: All code blocks contain complete implementation
3. **Type consistency**: Types match across all files (Permission, AdminRole, etc.)
4. **File paths**: All file paths are exact and correct
