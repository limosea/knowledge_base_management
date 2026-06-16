import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AuthLayout, MainLayout } from '@/components/layout'
import {
  LoginPage,
  DashboardPage,
  KnowledgePage,
  ApiKeysPage,
  UsersPage,
  AuditLogsPage,
  SystemPage,
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
        path: '/api-keys',
        element: <ApiKeysPage />,
      },
      {
        path: '/users',
        element: <UsersPage />,
      },
      {
        path: '/audit-logs',
        element: <AuditLogsPage />,
      },
      {
        path: '/system',
        element: <SystemPage />,
      },
    ],
  },
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
])
