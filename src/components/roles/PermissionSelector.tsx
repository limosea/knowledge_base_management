import { useTranslation } from 'react-i18next'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Permission } from '@/types'
import { PERMISSION_LABELS, PERMISSION_DESCRIPTIONS } from '@/types'

interface PermissionSelectorProps {
  selectedPermissions: Permission[]
  onChange: (permissions: Permission[]) => void
  disabled?: boolean
}

export function PermissionSelector({
  selectedPermissions,
  onChange,
  disabled = false,
}: PermissionSelectorProps) {
  const { t } = useTranslation()

  const handlePermissionToggle = (permission: Permission) => {
    if (disabled) return

    const newPermissions = selectedPermissions.includes(permission)
      ? selectedPermissions.filter(p => p !== permission)
      : [...selectedPermissions, permission]

    onChange(newPermissions)
  }

  const permissionGroups = [
    {
      title: t('roles.permissionGroups.userManagement'),
      permissions: ['users:list', 'users:manage'] as Permission[],
    },
    {
      title: t('roles.permissionGroups.contentManagement'),
      permissions: ['content:view_shielded', 'content:shield', 'content:unshield'] as Permission[],
    },
    {
      title: t('roles.permissionGroups.apiKey'),
      permissions: ['apikeys:list', 'apikeys:manage'] as Permission[],
    },
    {
      title: t('roles.permissionGroups.systemManagement'),
      permissions: ['audit:read', 'analytics:read', 'system:read', 'stats:read'] as Permission[],
    },
  ]

  return (
    <div className="space-y-4">
      {permissionGroups.map((group) => (
        <Card key={group.title}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{group.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {group.permissions.map((permission) => (
                <div key={permission} className="flex items-center space-x-2">
                  <Checkbox
                    id={permission}
                    checked={selectedPermissions.includes(permission)}
                    onCheckedChange={() => handlePermissionToggle(permission)}
                    disabled={disabled}
                  />
                  <Label
                    htmlFor={permission}
                    className="text-sm cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                    title={PERMISSION_DESCRIPTIONS[permission]}
                  >
                    {PERMISSION_LABELS[permission]}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
