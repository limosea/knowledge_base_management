import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { adminRolesApi } from '@/api'
import type { Role, CreateRoleRequest, UpdateRoleRequest } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { RoleList } from '@/components/roles/RoleList'
import { RoleForm } from '@/components/roles/RoleForm'
import { useToast } from '@/hooks/use-toast'
import { Plus } from 'lucide-react'

export function RolesPage() {
  const { t } = useTranslation()
  const { toast } = useToast()
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)

  const fetchRoles = async () => {
    try {
      setLoading(true)
      const data = await adminRolesApi.getRoles()
      setRoles(data)
    } catch (error) {
      toast({
        title: t('common.error'),
        description: error instanceof Error ? error.message : String(error),
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRoles()
  }, [])

  const handleCreate = () => {
    setSelectedRole(null)
    setFormOpen(true)
  }

  const handleEdit = (role: Role) => {
    setSelectedRole(role)
    setFormOpen(true)
  }

  const handleDelete = (role: Role) => {
    setSelectedRole(role)
    setDeleteDialogOpen(true)
  }

  const handleSubmit = async (data: CreateRoleRequest | UpdateRoleRequest) => {
    try {
      if (selectedRole) {
        await adminRolesApi.updateRole(selectedRole.id, data as UpdateRoleRequest)
        toast({
          title: t('common.success'),
          description: t('roles.updateSuccess'),
        })
      } else {
        await adminRolesApi.createRole(data as CreateRoleRequest)
        toast({
          title: t('common.success'),
          description: t('roles.createSuccess'),
        })
      }
      await fetchRoles()
    } catch (error) {
      toast({
        title: t('common.error'),
        description: error instanceof Error ? error.message : String(error),
        variant: 'destructive',
      })
      throw error
    }
  }

  const handleConfirmDelete = async () => {
    if (!selectedRole) return
    
    try {
      await adminRolesApi.deleteRole(selectedRole.id)
      toast({
        title: t('common.success'),
        description: t('roles.deleteSuccess'),
      })
      await fetchRoles()
    } catch (error) {
      toast({
        title: t('common.error'),
        description: error instanceof Error ? error.message : String(error),
        variant: 'destructive',
      })
    } finally {
      setDeleteDialogOpen(false)
      setSelectedRole(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('roles.title')}</h1>
          <p className="text-muted-foreground">{t('roles.subtitle')}</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          {t('roles.create')}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('roles.list')}</CardTitle>
        </CardHeader>
        <CardContent>
          <RoleList
            roles={roles}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>

      <RoleForm
        open={formOpen}
        onOpenChange={setFormOpen}
        role={selectedRole}
        onSubmit={handleSubmit}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('roles.deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('roles.deleteDescription', { name: selectedRole?.name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}