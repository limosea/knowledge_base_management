import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AuthLayout, MainLayout } from '@/components/layout'
import { LoginPage, DashboardPage } from '@/pages'

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
        element: <div className="text-2xl font-bold">Knowledge Page (TODO)</div>,
      },
      {
        path: '/api-keys',
        element: <div className="text-2xl font-bold">API Keys Page (TODO)</div>,
      },
      {
        path: '/users',
        element: <div className="text-2xl font-bold">Users Page (TODO)</div>,
      },
      {
        path: '/audit-logs',
        element: <div className="text-2xl font-bold">Audit Logs Page (TODO)</div>,
      },
      {
        path: '/system',
        element: <div className="text-2xl font-bold">System Page (TODO)</div>,
      },
    ],
  },
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
])
