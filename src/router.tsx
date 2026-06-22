import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AuthLayout, MainLayout } from '@/components/layout'
import { PermissionRoute } from '@/components/auth/PermissionRoute'
import { ElevationRoute } from '@/components/auth/ElevationRoute'
import {
  LoginPage,
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
} from '@/pages'

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const accessToken = localStorage.getItem('accessToken')
  if (!accessToken) {
    return <Navigate to="/login" replace />
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
        path: '/analytics',
        element: <Navigate to="/analytics/knowledge" replace />,
      },
      {
        path: '/analytics/knowledge',
        element: (
          <PermissionRoute permissions={['analytics:read']}>
            <KnowledgeAnalyticsPage />
          </PermissionRoute>
        ),
      },
      {
        path: '/analytics/search',
        element: (
          <PermissionRoute permissions={['stats:read']}>
            <SearchAnalyticsPage />
          </PermissionRoute>
        ),
      },
      {
        path: '/analytics/api',
        element: (
          <PermissionRoute permissions={['stats:read']}>
            <ApiAnalyticsPage />
          </PermissionRoute>
        ),
      },
      {
        path: '/analytics/performance',
        element: (
          <PermissionRoute permissions={['audit:read']}>
            <PerformanceAnalyticsPage />
          </PermissionRoute>
        ),
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
        element: <CategoriesPage />,
      },
      {
        path: '/users',
        element: (
          <PermissionRoute permissions={['users:list']}>
            <UsersPage />
          </PermissionRoute>
        ),
      },
      {
        path: '/roles',
        element: (
          <ElevationRoute>
            <RolesPage />
          </ElevationRoute>
        ),
      },
      {
        path: '/api-keys',
        element: (
          <PermissionRoute permissions={['apikeys:list']}>
            <ApiKeysPage />
          </PermissionRoute>
        ),
      },
      {
        path: '/me/api-keys',
        element: <MyApiKeysPage />,
      },
      {
        path: '/audit-logs',
        element: (
          <PermissionRoute permissions={['audit:read']}>
            <AuditLogsPage />
          </PermissionRoute>
        ),
      },
      {
        path: '/system',
        element: (
          <PermissionRoute permissions={['system:read']}>
            <SystemPage />
          </PermissionRoute>
        ),
      },
      {
        path: '/settings',
        element: <SettingsPage />,
      },
    ],
  },
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
])
