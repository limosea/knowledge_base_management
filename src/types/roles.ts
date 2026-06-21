// src/types/roles.ts
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

export type Permission = 
  | 'users:read'
  | 'users:write'
  | 'knowledge:read'
  | 'knowledge:read_all'
  | 'knowledge:delete'
  | 'apikeys:read'
  | 'apikeys:write'
  | 'audit:read'
  | 'analytics:read'
  | 'system:read'
  | 'stats:read'
  | 'libraries:read'
  | 'libraries:write';

export const PERMISSION_LABELS: Record<Permission, string> = {
  'users:read': '查看用户',
  'users:write': '管理用户',
  'knowledge:read': '查看知识条目',
  'knowledge:read_all': '查看所有知识条目',
  'knowledge:delete': '删除知识条目',
  'apikeys:read': '查看API Key',
  'apikeys:write': '管理API Key',
  'audit:read': '查看审计日志',
  'analytics:read': '查看分析数据',
  'system:read': '查看系统信息',
  'stats:read': '查看统计信息',
  'libraries:read': '查看库',
  'libraries:write': '管理库',
}
