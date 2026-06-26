import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AuthLayout, MainLayout, ElevatedLayout } from '@/components/layout'
import { PermissionRoute } from '@/components/auth/PermissionRoute'
import { ElevationRoute } from '@/components/auth/ElevationRoute'
import {
  LoginPage,
  ChangePasswordPage,
  MfaPage,
  DashboardPage,
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
  LibrariesPage,
  LibraryEntriesPage,
  PlazaPage,
  PlazaLibraryPage,
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
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (user.isActive === false) {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      return <Navigate to="/login" replace />
    }
  } catch {
    // ignore malformed user data
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
        element: <LibrariesPage />,
      },
      {
        path: '/knowledge/:libraryId',
        element: <LibraryEntriesPage />,
      },
      {
        path: '/plaza',
        element: <PlazaPage />,
      },
      {
        path: '/plaza/:libraryId',
        element: <PlazaLibraryPage />,
      },
      {
        path: '/entry/:id',
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
      {
        path: '/libraries',
        element: <Navigate to="/knowledge" replace />,
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
        path: '/elevated/plaza',
        element: <PlazaPage elevated />,
      },
      {
        path: '/elevated/plaza/:libraryId',
        element: <PlazaLibraryPage elevated />,
      },
      {
        path: '/elevated/entry/:id',
        element: <KnowledgeDetailPage elevated />,
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
      {
        path: '/elevated/libraries',
        element: <Navigate to="/elevated/knowledge" replace />,
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
