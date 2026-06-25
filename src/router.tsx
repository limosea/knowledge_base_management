import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AuthLayout, MainLayout, ElevatedLayout } from '@/components/layout'
import { PermissionRoute } from '@/components/auth/PermissionRoute'
import { ElevationRoute } from '@/components/auth/ElevationRoute'
import {
  LoginPage,
  ChangePasswordPage,
  MfaPage,
  DashboardPage,
  KnowledgePage,
  KnowledgeDetailPage,
  CategoriesPage,
  ApiKeysPage,
  UsersPage,
  AuditLogsPage,
  SystemPage,
  KnowledgeAnalyticsPage,
  SearchAnalyticsPage,
  ApiAnalyticsPage,
  PerformanceAnalyticsPage,
  SettingsPage,
  MyApiKeysPage,
  RolesPage,
  MessagesPage,
  MyAnalyticsPage,
} from '@/pages'

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const accessToken = localStorage.getItem('accessToken')
  if (!accessToken) {
    return <Navigate to="/login" replace />
  }
  const requirePasswordChange = localStorage.getItem('requirePasswordChange')
  if (requirePasswordChange === 'true') {
    return <Navigate to="/change-password" replace />
  }
  return <>{children}</>
}

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
      {
        path: '/change-password',
        element: <ChangePasswordPage />,
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
        path: '/knowledge',
        element: <KnowledgePage />,
      },
      {
        path: '/knowledge/:id',
        element: <KnowledgeDetailPage />,
      },
      {
        path: '/categories',
        element: <Navigate to="/elevated/categories" replace />,
      },
      {
        path: '/me/api-keys',
        element: <MyApiKeysPage />,
      },
      {
        path: '/settings',
        element: <SettingsPage />,
      },
      {
        path: '/messages',
        element: <MessagesPage />,
      },
      {
        path: '/me/analytics',
        element: <MyAnalyticsPage />,
      },
    ],
  },
  {
    element: (
      <ProtectedRoute>
        <ElevationRoute>
          <ElevatedLayout />
        </ElevationRoute>
      </ProtectedRoute>
    ),
    children: [
      {
        path: '/elevated/users',
        element: (
          <PermissionRoute permissions={['users:list']}>
            <UsersPage />
          </PermissionRoute>
        ),
      },
      {
        path: '/elevated/roles',
        element: <RolesPage />,
      },
      {
        path: '/elevated/api-keys',
        element: (
          <PermissionRoute permissions={['apikeys:list']}>
            <ApiKeysPage />
          </PermissionRoute>
        ),
      },
      {
        path: '/elevated/knowledge',
        element: <KnowledgePage elevated />,
      },
      {
        path: '/elevated/knowledge/:id',
        element: <KnowledgeDetailPage />,
      },
      {
        path: '/elevated/categories',
        element: <CategoriesPage />,
      },
      {
        path: '/elevated/audit-logs',
        element: (
          <PermissionRoute permissions={['audit:read']}>
            <AuditLogsPage />
          </PermissionRoute>
        ),
      },
      {
        path: '/elevated/system',
        element: (
          <PermissionRoute permissions={['system:read']}>
            <SystemPage />
          </PermissionRoute>
        ),
      },
      {
        path: '/elevated/analytics',
        element: <Navigate to="/elevated/analytics/knowledge" replace />,
      },
      {
        path: '/elevated/analytics/knowledge',
        element: (
          <PermissionRoute permissions={['analytics:read']}>
            <KnowledgeAnalyticsPage />
          </PermissionRoute>
        ),
      },
      {
        path: '/elevated/analytics/search',
        element: (
          <PermissionRoute permissions={['stats:read']}>
            <SearchAnalyticsPage />
          </PermissionRoute>
        ),
      },
      {
        path: '/elevated/analytics/api',
        element: (
          <PermissionRoute permissions={['stats:read']}>
            <ApiAnalyticsPage />
          </PermissionRoute>
        ),
      },
      {
        path: '/elevated/analytics/performance',
        element: (
          <PermissionRoute permissions={['audit:read']}>
            <PerformanceAnalyticsPage />
          </PermissionRoute>
        ),
      },
    ],
  },
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/users',
    element: <Navigate to="/elevated/users" replace />,
  },
  {
    path: '/roles',
    element: <Navigate to="/elevated/roles" replace />,
  },
  {
    path: '/api-keys',
    element: <Navigate to="/elevated/api-keys" replace />,
  },
  {
    path: '/audit-logs',
    element: <Navigate to="/elevated/audit-logs" replace />,
  },
  {
    path: '/system',
    element: <Navigate to="/elevated/system" replace />,
  },
  {
    path: '/analytics/*',
    element: <Navigate to="/elevated/analytics" replace />,
  },
])
