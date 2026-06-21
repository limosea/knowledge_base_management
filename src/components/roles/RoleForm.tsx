import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { PermissionSelector } from './PermissionSelector'
import type { Role, CreateRoleRequest, UpdateRoleRequest, Permission } from '@/types'

interface RoleFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  role?: Role | null
  onSubmit: (data: CreateRoleRequest | UpdateRoleRequest) => Promise<void>
}

export function RoleForm({ open, onOpenChange, role, onSubmit }: RoleFormProps) {
  const { t } = useTranslation()
  const [name, setName] = useState(role?.name || '')
  const [description, setDescription] = useState(role?.description || '')
  const [permissions, setPermissions] = useState<Permission[]>(
    (role?.permissions as Permission[]) || []
  )
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setName(role?.name || '')
      setDescription(role?.description || '')
      setPermissions((role?.permissions as Permission[]) || [])
    }
  }, [open, role])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await onSubmit({ name, description, permissions })
      onOpenChange(false)
    } finally {
      setLoading(false)
    }
  }

  const isSystemRole = role?.isSystem || false

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {role ? t('roles.edit') : t('roles.create')}
          </DialogTitle>
          <DialogDescription>
            {role ? t('roles.editDescription') : t('roles.createDescription')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t('roles.name')}</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSystemRole}
              required
            />
            {isSystemRole && (
              <p className="text-sm text-muted-foreground">
                {t('roles.systemRoleNameProtected')}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t('roles.description')}</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>{t('roles.permissions')}</Label>
            <PermissionSelector
              selectedPermissions={permissions}
              onChange={setPermissions}
              disabled={isSystemRole}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? t('common.saving') : t('common.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
