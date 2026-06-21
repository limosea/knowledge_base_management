export interface ErrorResponse {
  error: {
    code: string
    message: string
    timestamp: string
  }
}

export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface PaginatedResponse<T> extends PaginationMeta {
  data: T[]
}

export type AdminRole = 'admin' | 'super_admin'
export type ApiKeyPermission = 'read' | 'write' | 'admin'
export type EmbeddingStatus = 'processing' | 'completed' | 'failed'

export interface LoginRequest {
  username: string
  password: string
}

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
  }
}

export interface MfaRequiredResponse {
  mfaRequired: boolean
  tempToken: string
}

export interface MfaLoginRequest {
  tempToken: string
  mfaCode: string
}

export interface AdminProfile {
  id: string
  username: string
  email: string
  role: AdminRole
  mfaEnabled: boolean
  createdAt: string
}

export interface UpdateProfileRequest {
  email?: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

export interface MfaSetupResponse {
  secret: string
  qrCodeUrl: string
  backupCodes: string[]
}

export interface ApiKey {
  id: string
  key?: string
  keyPrefix: string
  name: string
  permissions: ApiKeyPermission[]
  rateLimit: number
  isActive: boolean
  lastUsedAt?: string
  expiresAt?: string
  createdAt: string
}

export type ApiKeyListResponse = PaginatedResponse<ApiKey>

export interface CreateApiKeyRequest {
  name: string
  permissions?: ApiKeyPermission[]
  rateLimit?: number
  expiresAt?: string
}

export interface UpdateApiKeyRequest {
  name?: string
  permissions?: ApiKeyPermission[]
  rateLimit?: number
  isActive?: boolean
}

export interface KnowledgeEntry {
  id: string
  title: string
  content: string
  summary?: string
  category?: string
  tags: string[]
  language?: string
  framework?: string
  difficultyLevel?: number
  qualityScore?: number
  structuredData?: Record<string, unknown>
  createdBy: string
  entryVersion: number
  isLatest: boolean
  createdAt: string
  updatedAt: string
}

export type KnowledgeListResponse = PaginatedResponse<KnowledgeEntry>

export interface CreateEntryRequest {
  title: string
  content: string
  summary?: string
  category?: string
  tags?: string[]
  language?: string
  framework?: string
  difficulty_level?: number
  structured_data?: Record<string, unknown>
}

export interface UpdateEntryRequest {
  title?: string
  content?: string
  summary?: string
  category?: string
  tags?: string[]
  language?: string
  framework?: string
  difficulty_level?: number
  structured_data?: Record<string, unknown>
  change_summary?: string
}

export interface CreateEntryResponse {
  id: string
  entry_version: number
  embedding_status: EmbeddingStatus
  created_at: string
}

export interface KnowledgeVersion {
  version: number
  title: string
  content: string
  changeSummary?: string
  createdAt: string
  createdBy: string
}

export interface KnowledgeStats {
  total: number
  byCategory: Record<string, number>
  avgQualityScore?: number
}

export interface AdminKnowledgeListItem {
  id: string
  title: string
  category?: string
  tags: string[]
  qualityScore?: number
  createdAt: string
  createdBy: string
}

export type AdminKnowledgeListResponse = PaginatedResponse<AdminKnowledgeListItem>

export interface AdminUserSummary {
  id: string
  username: string
  email: string
  role: AdminRole
  isActive: boolean
  mfaEnabled: boolean
  lastLoginAt?: string
  createdAt: string
}

export type AdminUserListResponse = PaginatedResponse<AdminUserSummary>

export interface CreateAdminUserRequest {
  username: string
  password: string
  email?: string
  role?: AdminRole
}

export interface UpdateAdminUserRequest {
  email?: string
  role?: AdminRole
  isActive?: boolean
}

export interface ResetPasswordResponse {
  id: string
  username: string
  temporaryPassword: string
  requirePasswordChange: boolean
  message: string
}

export interface AuditLog {
  id: string
  action: string
  resourceType: string
  resourceId?: string
  details?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
  apiKeyId?: string
  createdAt: string
}

export type AuditLogListResponse = PaginatedResponse<AuditLog>

export interface SystemStats {
  knowledgeEntries: {
    total: number
    byCategory: Record<string, number>
    avgQualityScore?: number
  }
  apiKeys: {
    total: number
    active: number
    expired: number
  }
  requests: {
    today: number
    thisWeek: number
    thisMonth: number
  }
}

export interface SystemHealth {
  status: 'ok' | 'degraded' | 'unhealthy'
  timestamp: string
  version: string
  uptime: number
  checks: {
    database: {
      status: 'ok' | 'error'
      latency?: number
      error?: string
    }
    storage: {
      status: 'ok' | 'error'
      error?: string
    }
    cache?: {
      status: 'ok' | 'error'
      latency?: number
      error?: string
    }
  }
}

// ==================== Stats API Types ====================

export interface DashboardStats {
  knowledgeEntries: {
    total: number
    avgQualityScore: number
    createdThisWeek: number
  }
  apiKeys: {
    total: number
    active: number
  }
  requests: {
    today: number
  }
  topApiKeysToday?: Array<{
    name: string
    count: number
  }>
  errorRate?: {
    total: number
    errors: number
  }
}

export interface KnowledgeTrends {
  period: string
  from: string
  to: string
  created: Array<{ date: string; count: number }>
  updated: Array<{ date: string; count: number }>
  deleted: Array<{ date: string; count: number }>
}

export interface ContentDistribution {
  topTags: Array<{ tag: string; count: number }>
  byFramework: Array<{ framework: string; count: number }>
  byDifficulty: Array<{ level: number; count: number }>
  byLanguage: Array<{ language: string; count: number }>
  qualityScoreDistribution: Array<{ bucket: string; count: number }>
}

export interface EmbeddingCoverage {
  totalEntries: number
  withEmbedding: number
  withoutEmbedding: number
  coveragePercent: number
  batchStatusSummary: Array<Record<string, unknown>>
  latestBatch: Record<string, unknown> | null
}

export interface SearchAnalytics {
  period: string
  from: string
  to: string
  totalSearches: number
  searchesOverTime: Array<{ date: string; count: number }>
  topQueries: Array<{ query: string; count: number }>
  topIps: Array<{ ip: string; count: number }>
  hitRate: {
    total: number
    with_results: number
    no_results: number
  }
}

export interface ApiKeyUsage {
  from: string
  to: string
  keys: Array<{
    apiKeyId: string
    apiKeyName: string
    totalRequests: number
    lastActiveAt: string
  }>
}

export interface ApiKeyUsageDetail {
  keyId: string
  totalRequests: number
  byAction: Array<{ action: string; count: number }>
  trend: Array<{ date: string; count: number }>
}

export interface AuditAnalytics {
  byAction: Array<{ action: string; count: number }>
  byStatus: Array<{ status: string; count: number }>
  topErrors: Array<{ errorMessage: string; action: string; count: number }>
  trend: Array<{ date: string; count: number }>
}

// ==================== Categories API Types ====================

export interface Category {
  id: string
  name: string
  created_at: string
  updated_at: string
}

export interface CategoryWithEntryCount {
  name: string
  entry_count: number
}

export interface CategoryListResponse {
  data: CategoryWithEntryCount[]
  total: number
}

export interface AdminCategoryListItem extends Category {
  entry_count: number
}

export type AdminCategoryListResponse = PaginatedResponse<AdminCategoryListItem>

export interface CreateCategoryRequest {
  name: string
}

export interface UpdateCategoryRequest {
  name: string
}

export interface CategoryStats {
  name: string
  total_entries: number
  by_language: Record<string, number>
  avg_quality_score: number
}

export interface AdminCategoryStats {
  id: string
  name: string
  total_entries: number
  by_language: Record<string, number>
  by_difficulty: Record<string, number>
  by_framework: Record<string, number>
  avg_quality_score: number
  recent_entries: number
}

export interface RequestAnalytics {
  period: string
  from: string
  to: string
  statusCodeDistribution: Array<{ code: number; count: number }>
  successRate: {
    total: number
    success2xx: number
    clientError4xx: number
    serverError5xx: number
  }
  requestVolumeTrend: Array<{ date: string; total: number; errors: number }>
  latencyStats: {
    avgMs: number
    p50Ms: number
    p95Ms: number
  }
  topEndpoints: Array<{
    method: string
    path: string
    count: number
    avgResponseTime: number
  }>
}

// ==================== Self-Service API Types ====================

export interface MyApiKey {
  id: string
  key?: string
  keyPrefix: string
  name: string
  permissions: ApiKeyPermission[]
  rateLimit: number
  lastUsedAt?: string
  expiresAt?: string
  createdAt: string
}

export type MyApiKeyListResponse = PaginatedResponse<MyApiKey>

export interface MyStats {
  apiKeys: {
    total: number
    active: number
  }
  requests: {
    today: number
    thisWeek: number
  }
}

export * from './roles'
