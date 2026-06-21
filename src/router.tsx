import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AuthLayout, MainLayout } from '@/components/layout'
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
} from '@/pages'

const isAuthenticated = () => {
  return !!localStorage.getItem('accessToken')
}

const getCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}')
  } catch {
    return {}
  }
}

const hasRole = (minRole: 'user' | 'admin' | 'super_admin') => {
  const user = getCurrentUser()
  const roleHierarchy: Record<string, number> = { user: 1, admin: 2, super_admin: 3 }
  return (roleHierarchy[user.role] || 0) >= (roleHierarchy[minRole] || 0)
}

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

const SuperAdminRoute = ({ children }: { children: React.ReactNode }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }
  if (!hasRole('super_admin')) {
    return <Navigate to="/dashboard" replace />
  }
  return <>{children}</>
}

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }
  if (!hasRole('admin')) {
    return <Navigate to="/dashboard" replace />
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
      // Dashboard section
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
        element: <KnowledgeAnalyticsPage />,
      },
      {
        path: '/analytics/search',
        element: <SearchAnalyticsPage />,
      },
      {
        path: '/analytics/api',
        element: <ApiAnalyticsPage />,
      },
      {
        path: '/analytics/performance',
        element: <PerformanceAnalyticsPage />,
      },
      // Knowledge Base section
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
      // Users section (admin+ only)
      {
        path: '/users',
        element: <SuperAdminRoute><UsersPage /></SuperAdminRoute>,
      },
      {
        path: '/api-keys',
        element: <ApiKeysPage />,
      },
      {
        path: '/me/api-keys',
        element: <MyApiKeysPage />,
      },
      // System section (admin only for audit-logs and system)
      {
        path: '/audit-logs',
        element: <AdminRoute><AuditLogsPage /></AdminRoute>,
      },
      {
        path: '/system',
        element: <AdminRoute><SystemPage /></AdminRoute>,
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
