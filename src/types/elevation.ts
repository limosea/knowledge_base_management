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
