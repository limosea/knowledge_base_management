import { useTranslation } from 'react-i18next'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Pencil, Trash2, Shield } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import type { Role } from '@/types'
import { PERMISSION_LABELS } from '@/types'

interface RoleListProps {
  roles: Role[]
  loading: boolean
  onEdit: (role: Role) => void
  onDelete: (role: Role) => void
}

export function RoleList({ roles, loading, onEdit, onDelete }: RoleListProps) {
  const { t } = useTranslation()

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('roles.name')}</TableHead>
            <TableHead>{t('roles.description')}</TableHead>
            <TableHead>{t('roles.permissions')}</TableHead>
            <TableHead>{t('roles.type')}</TableHead>
            <TableHead>{t('roles.createdAt')}</TableHead>
            <TableHead className="text-right">{t('common.actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {roles.map((role) => (
            <TableRow key={role.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  {role.isSuperAdmin && <Shield className="h-4 w-4 text-primary" />}
                  {role.name}
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {role.description || '-'}
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {role.isSuperAdmin ? (
                    <Badge variant="secondary">{t('roles.allPermissions')}</Badge>
                  ) : (
                    role.permissions.slice(0, 3).map((permission) => (
                      <Badge key={permission} variant="outline" className="text-xs">
                        {PERMISSION_LABELS[permission as keyof typeof PERMISSION_LABELS]}
                      </Badge>
                    ))
                  )}
                  {role.permissions.length > 3 && !role.isSuperAdmin && (
                    <Badge variant="outline" className="text-xs">
                      +{role.permissions.length - 3}
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={role.isSystem ? 'secondary' : 'default'}>
                  {role.isSystem ? t('roles.system') : t('roles.custom')}
                </Badge>
              </TableCell>
              <TableCell>{formatDate(role.createdAt)}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(role)}
                    disabled={role.isSystem}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(role)}
                    disabled={role.isSystem}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
