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
} from '@/pages'

const isAuthenticated = () => {
  return !!localStorage.getItem('accessToken')
}

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  if (!isAuthenticated()) {
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
      // Users section
      {
        path: '/users',
        element: <UsersPage />,
      },
      {
        path: '/api-keys',
        element: <ApiKeysPage />,
      },
      // System section
      {
        path: '/audit-logs',
        element: <AuditLogsPage />,
      },
      {
        path: '/system',
        element: <SystemPage />,
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
