import type { Permission } from './roles'

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

export type AdminRole = 'user' | 'admin' | 'super_admin'
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
  requireUsernameChange?: boolean
  usernameResetAvailable?: boolean
  user: {
    id: string
    username: string
    nickname?: string
    role: AdminRole
    email: string
    isSuperAdmin: boolean
    permissions: Permission[]
    isActive?: boolean
    banned?: boolean
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
  nickname?: string
  email: string
  role: AdminRole
  isSuperAdmin: boolean
  isActive: boolean
  permissions: Permission[]
  mfaEnabled: boolean
  createdAt: string
  usernameChangedAt?: string | null
  requireUsernameChange?: boolean
  usernameResetAvailable?: boolean
}

export interface UpdateProfileRequest {
  email?: string
  nickname?: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

/**
 * One-time self-service username reset.
 *
 * A user may reset their username at most once. After a successful
 * reset, all of the user's sessions are invalidated and they must log
 * in again with the new username. The response echoes the new username
 * and a flag indicating no further resets are available.
 */
export interface UpdateUsernameRequest {
  newUsername: string
}

export interface UpdateUsernameResponse {
  id: string
  username: string
  usernameChangedAt: string
  usernameResetAvailable: boolean
  message: string
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
  isUserDisabled?: boolean
  lastUsedAt?: string
  expiresAt?: string
  createdAt: string
  ownerId?: string
  ownerUsername?: string
  ownerNickname?: string
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
  difficultyLevel?: number
  qualityScore?: number
  structuredData?: Record<string, unknown>
  createdBy: string
  creatorNickname?: string
  entryVersion: number
  isLatest: boolean
  createdAt: string
  updatedAt: string
  visibility?: 'private' | 'public'
  shielded?: boolean
  shieldedAt?: string
  selfShielded?: boolean
  selfShieldedAt?: string
  library?: { id: string; name: string; icon?: string } | null
}

export type KnowledgeListResponse = PaginatedResponse<KnowledgeEntry>

export interface CreateEntryRequest {
  title: string
  content: string
  summary?: string
  tags?: string[]
  language?: string
  difficulty_level?: number
  structured_data?: Record<string, unknown>
  visibility?: 'private' | 'public'
  library_id?: string
}

export interface UpdateEntryRequest {
  title?: string
  content?: string
  summary?: string
  tags?: string[]
  language?: string
  difficulty_level?: number
  structured_data?: Record<string, unknown>
  change_summary?: string
  library_id?: string
}

export interface CreateEntryResponse {
  id: string
  entry_version: number
  visibility?: string
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
  visibility: 'private' | 'public'
  shielded: boolean
  shieldedAt?: string
  selfShielded: boolean
  selfShieldedAt?: string
  library?: { id: string; name: string; icon?: string } | null
  createdAt: string
  createdBy: string
  creatorNickname?: string
}

export type AdminKnowledgeListResponse = PaginatedResponse<AdminKnowledgeListItem>

export interface AdminKnowledgeSearchItem extends AdminKnowledgeListItem {
  searchScore: number
  semanticScore: number
  fieldScore: number
}

export interface AdminKnowledgeSearchResponse {
  data: AdminKnowledgeSearchItem[]
  total: number
  page: number
  limit: number
  totalPages: number
  queryTimeMs?: number
}

export interface HybridSearchRequest {
  query: string
  mode?: 'field' | 'semantic' | 'hybrid'
  page?: number
  limit?: number
  category?: string
  language?: string
  libraryId?: string
}

export interface AdminUserSummary {
  id: string
  username: string
  nickname?: string
  email: string
  role: AdminRole
  isActive: boolean
  banned: boolean
  mfaEnabled: boolean
  lastLoginAt?: string
  createdBy?: string
  rateLimit?: number
  deletionStatus?: string | null
  deletionRequestedAt?: string | null
  createdAt: string
  usernameChangedAt?: string | null
  requireUsernameChange?: boolean
}

export type AdminUserListResponse = PaginatedResponse<AdminUserSummary>

/**
 * Admin user creation request.
 *
 * Per the user-management refactor, the caller no longer supplies
 * `username`, `nickname`, or `password` — those are randomly generated
 * by the backend and returned exactly once in `CreateAdminUserResponse`.
 * The caller only picks `role` (super_admin only) and optional `email`.
 */
export interface CreateAdminUserRequest {
  email?: string
  role?: AdminRole
}

/**
 * Response from admin user creation. Carries the one-time plaintext
 * credentials (`username`, `nickname`, `initialPassword`) that the
 * creating admin must save and hand to the new user out-of-band.
 */
export interface CreateAdminUserResponse {
  id: string
  username: string
  nickname: string
  email?: string
  role: AdminRole
  createdAt: string
  initialPassword: string
  requirePasswordChange: boolean
  usernameResetAvailable: boolean
  message: string
}

export interface UpdateAdminUserRequest {
  role?: AdminRole
  isActive?: boolean
  rateLimit?: number
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
  // Who
  actorType: 'admin_user' | 'api_key' | 'system'
  actorId?: string | null
  actorName?: string | null
  // Stable snapshot of the actor's nickname at audit time — survives
  // subsequent nickname changes so historical logs stay readable.
  actorNickname?: string | null
  // 'standard' for real admin_users, 'test' for time-limited test
  // accounts. Surfaced in the audit UI so admins can tell at a glance
  // whether an action was performed by a real user or a throwaway
  // test account.
  actorAccountType?: 'standard' | 'test' | null
  actorRole?: 'user' | 'admin' | 'super_admin' | null
  // When
  createdAt: string
  // Where
  ipAddress?: string | null
  // What
  action: string
  resourceType?: string | null
  resourceId?: string | null
  details?: Record<string, unknown> | null
  // How
  source: 'admin_panel' | 'public_api' | 'mcp' | 'system'
  userAgent?: string | null
  clientInfo?: {
    mcpClient?: string
    clientVersion?: string
    apiKeyId?: string
    apiKeyName?: string
    requestId?: string
  } | null
  // Result
  httpStatusCode?: number | null
  status?: 'success' | 'failure' | 'error' | null
  errorMessage?: string | null
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

// ==================== System Settings Types ====================

export interface GlobalRateLimit {
  limit: number
  windowMs: number
}

export interface UpdateGlobalRateLimitRequest {
  limit: number
  windowMs?: number
}

// ==================== Stats API Types ====================

export interface DashboardStats {
  knowledgeEntries: {
    total: number
    avgQualityScore: number
    createdThisWeek: number
  }
  libraries: {
    total: number
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
  byDifficulty: Array<{ level: number; count: number }>
  byLanguage: Array<{ language: string; count: number }>
  byCategory?: Array<{ category: string; count: number }>
  byVisibility?: Array<{ visibility: string; count: number }>
  avgContentLength?: { avg: number; max: number; min: number }
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

export interface SearchAnalyticsSearchActivity {
  perspective: 'searchActivity'
  title: string
  description: string
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

export interface SearchAnalyticsContentInsights {
  perspective: 'contentInsights'
  title: string
  description: string
  period: string
  from: string
  to: string
  note?: string
  totalHitsOnMyContent: number
  hitsOverTime: Array<{ date: string; count: number }>
  topFoundEntries: Array<{ id: string; title: string; hitCount: number }>
  topReferralQueries: Array<{ query: string; count: number }>
}

export type SearchAnalytics = SearchAnalyticsSearchActivity | SearchAnalyticsContentInsights

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
  isActive: boolean
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

export interface MyDashboardStats {
  knowledgeEntries: {
    total: number
    avgQualityScore: number
    createdThisWeek: number
  }
  libraries: {
    total: number
  }
  apiKeys: {
    total: number
    active: number
  }
  requests: {
    today: number
  }
  embeddingCoverage: {
    totalEntries: number
    withEmbedding: number
    withoutEmbedding: number
    coveragePercent: number
  }
  topTags: Array<{ tag: string; count: number }>
}

export interface MyKnowledgeTrends {
  period: string
  from: string
  to: string
  created: Array<{ date: string; count: number }>
  updated: Array<{ date: string; count: number }>
  deleted: Array<{ date: string; count: number }>
}

export interface MyContentDistribution {
  topTags: Array<{ tag: string; count: number }>
  byDifficulty: Array<{ level: number; count: number }>
  byLanguage: Array<{ language: string; count: number }>
  byCategory?: Array<{ category: string; count: number }>
  byVisibility?: Array<{ visibility: string; count: number }>
  avgContentLength?: { avg: number; max: number; min: number }
  qualityScoreDistribution: Array<{ bucket: string; count: number }>
}

export interface MyEmbeddingCoverage {
  totalEntries: number
  withEmbedding: number
  withoutEmbedding: number
  coveragePercent: number
  batchStatusSummary: null
  latestBatch: null
}

export interface MySearchAnalyticsSearchActivity {
  perspective: 'searchActivity'
  title: string
  description: string
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

export interface MySearchAnalyticsContentInsights {
  perspective: 'contentInsights'
  title: string
  description: string
  period: string
  from: string
  to: string
  note?: string
  totalHitsOnMyContent: number
  hitsOverTime: Array<{ date: string; count: number }>
  topFoundEntries: Array<{ id: string; title: string; hitCount: number }>
  topReferralQueries: Array<{ query: string; count: number }>
}

export type MySearchAnalytics = MySearchAnalyticsSearchActivity | MySearchAnalyticsContentInsights

export interface MyApiKeyUsage {
  from: string
  to: string
  keys: Array<{
    apiKeyId: string
    apiKeyName: string
    totalRequests: number
    lastActiveAt: string
  }>
}

export interface MyApiKeyUsageDetail {
  keyId: string
  from: string
  to: string
  totalRequests: number
  byAction: Array<{ action: string; count: number }>
  trend: Array<{ date: string; count: number }>
}

// ==================== Messages API Types ====================

export type MessageType = 'announcement' | 'approval' | 'system'
export type TargetType = 'all' | 'users' | 'role' | 'permission'

export interface MessageListItem {
  id: string
  title: string
  content: string
  type: MessageType
  isRead: boolean
  isStarred: boolean
  createdAt: string
  readAt: string | null
}

export interface MessageDetail extends MessageListItem {
  sender?: {
    id: string
    name: string
  } | null
  metadata?: Record<string, unknown> | null
}

export interface MessageListResponse {
  items: MessageListItem[]
  total: number
  unreadCount: number
}

export interface SendMessageRequest {
  title: string
  content: string
  type: MessageType
  targetType: TargetType
  targetValue?: string[]
  metadata?: Record<string, unknown>
}

export interface SendMessageResponse {
  success: boolean
  messageId: string
  recipientCount: number
}

export interface UnreadCountResponse {
  count: number
}

// ==================== Deletion API Types ====================

export interface AuditData {
  userId?: string
  keyId?: string
  from: string
  to: string
  totalRequests: number
  byAction: Array<{ action: string; count: number }>
  byStatus: Array<{ status: string; count: number }>
  topIps?: Array<{ ip: string; count: number }>
  errors?: Array<{ message: string; action: string; count: number }>
  trend: Array<{ date: string; count: number }>
  recentLogs: Array<Record<string, unknown>>
}

export interface RequestDeletionRequest {
  mfaCode: string
}

export interface DeletionResponse {
  message: string
}

export interface BatchOperationResponse {
  success: boolean
  count: number
}

// ==================== Leaderboard Types ====================

export interface LeaderboardData {
  period: string
  days: number
  channel?: string
  scope?: 'global' | 'personal'
  topLibraries: Array<{ id: string; name: string; viewCount: number }>
  topEntries: Array<{ id: string; title: string; viewCount: number }>
  topTags: Array<{ tag: string; count: number }>
}

export * from './roles'
export * from './elevation'

// ==================== Test Accounts API Types ====================
//
// Test accounts are time-limited, manually-deactivatable accounts kept
// in a physically separate `test_accounts` table so they never leak
// into public-data queries (plaza / leaderboards / public library
// listings). Only super_admin can create / list / deactivate / delete
// them. The plaintext password is returned EXACTLY ONCE on creation.

export interface TestAccount {
  id: string
  username: string
  nickname: string
  permissions: string[]
  isActive: boolean
  expiresAt: string
  lastLoginAt?: string | null
  createdAt: string
  createdBy?: string | null
}

export type TestAccountListResponse = PaginatedResponse<TestAccount>

/**
 * Create-test-account request. The backend randomly generates
 * `username`, `nickname`, and the initial `password`; the plaintext
 * password is returned exactly once in `CreateTestAccountResponse`.
 *
 * `expiresInSeconds` controls the hard expiry — after this many
 * seconds the account is auto-deactivated by the scheduled sweep
 * (and lazily on the next login / JWT-validation attempt).
 */
export interface CreateTestAccountRequest {
  expiresInSeconds: number
  permissions?: string[]
  note?: string
}

export interface CreateTestAccountResponse {
  id: string
  username: string
  nickname: string
  permissions: string[]
  isActive: boolean
  expiresAt: string
  createdAt: string
  initialPassword: string
  message: string
}
