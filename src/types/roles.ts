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

export interface Role {
  id: string
  name: string
  description?: string
  isSystem: boolean
  isSuperAdmin: boolean
  permissions: Permission[]
  createdAt: string
  updatedAt: string
}

export interface CreateRoleRequest {
  name: string
  description?: string
  permissions?: Permission[]
}

export interface UpdateRoleRequest {
  name?: string
  description?: string
  permissions?: Permission[]
}
