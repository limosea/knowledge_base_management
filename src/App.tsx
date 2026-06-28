import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { Toaster } from '@/components/ui/toaster'
import { PermissionProvider } from '@/contexts/PermissionContext'
import { DashboardPreferencesProvider } from '@/contexts/DashboardPreferencesContext'

function App() {
  return (
    <>
      <PermissionProvider>
        <DashboardPreferencesProvider>
          <RouterProvider router={router} />
        </DashboardPreferencesProvider>
      </PermissionProvider>
      <Toaster />
    </>
  )
}

export default App
