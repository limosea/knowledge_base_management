import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { Toaster } from '@/components/ui/toaster'
import { PermissionProvider } from '@/contexts/PermissionContext'

function App() {
  return (
    <>
      <PermissionProvider>
        <RouterProvider router={router} />
      </PermissionProvider>
      <Toaster />
    </>
  )
}

export default App
