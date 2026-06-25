import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/contexts/ThemeContext'
import { usePermission } from '@/contexts/PermissionContext'
import type { Permission } from '@/types'
import { apiClient } from '@/api'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  LayoutDashboard,
  BookOpen,
  LogOut,
  Menu,
  Sun,
  Moon,
  Eye,
  Languages,
  Shield,
  User,
  Settings,
  Mail,
  BarChart3,
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { ElevationDialog } from '@/components/auth/ElevationDialog'

interface NavItem {
  path?: string
  icon: React.ComponentType<{ className?: string }>
  labelKey: string
  permissions?: Permission[]
}

interface NavSection {
  titleKey: string
  items: NavItem[]
}

const navSections: NavSection[] = [
  {
    titleKey: 'nav.personalConsole',
    items: [
      {
        path: '/dashboard',
        icon: LayoutDashboard,
        labelKey: 'nav.overview',
      },
      {
        path: '/me/api-keys',
        icon: User,
        labelKey: 'nav.myApiKeys',
      },
      {
        path: '/messages',
        icon: Mail,
        labelKey: 'nav.messages',
      },
      {
        path: '/me/analytics',
        icon: BarChart3,
        labelKey: 'nav.myAnalytics',
      },
    ],
  },
  {
    titleKey: 'nav.knowledgeBase',
    items: [
      { path: '/knowledge', icon: BookOpen, labelKey: 'nav.knowledge' },
    ],
  },
  {
    titleKey: 'nav.settings',
    items: [
      { path: '/settings', icon: Settings, labelKey: 'nav.settings' },
    ],
  },
]

function NavItem({ item, setSidebarOpen }: { item: NavItem; setSidebarOpen: (open: boolean) => void }) {
  const { t } = useTranslation()
  const location = useLocation()
  const Icon = item.icon
  const isActive = location.pathname === item.path

  return (
    <Link
      to={item.path!}
      onClick={() => setSidebarOpen(false)}
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm',
        isActive
          ? 'bg-primary text-primary-foreground'
          : 'hover:bg-muted text-muted-foreground hover:text-foreground'
      )}
    >
      <Icon className="h-4 w-4" />
      {t(item.labelKey)}
    </Link>
  )
}

export function MainLayout() {
  const { t } = useTranslation()
  const { theme, setTheme } = useTheme()
  const { i18n } = useTranslation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { canAccessElevated, loading } = usePermission()
  const [showElevationDialog, setShowElevationDialog] = useState(false)

  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const handleLogout = async () => {
    try {
      await apiClient.post('/admin/auth/logout')
    } finally {
      apiClient.clearTokens()
      navigate('/login')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'zh' : 'en'
    i18n.changeLanguage(newLang)
  }

  const handleEnterElevated = () => {
    setShowElevationDialog(true)
  }

  const handleElevationSuccess = () => {
    setShowElevationDialog(false)
    navigate('/elevated/users')
  }

  const themeIcons = {
    light: Sun,
    dark: Moon,
    'eye-comfort': Eye,
  }
  const ThemeIcon = themeIcons[theme]

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 border-b bg-card z-50 flex items-center justify-between px-4">
        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="font-semibold">{t('dashboard.title')}</h1>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{user.username?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{user.username}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={toggleLanguage}>
              <Languages className="mr-2 h-4 w-4" />
              {i18n.language === 'en' ? '中文' : 'English'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              {t('auth.logout')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-40 h-screen w-64 border-r bg-card transition-transform lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="h-16 flex items-center px-6 border-b">
          <h1 className="font-bold text-xl">{t('auth.loginTitle')}</h1>
        </div>
        <nav className="p-4 space-y-6 overflow-y-auto h-[calc(100vh-4rem)]">
          {navSections.map((section) => (
            <div key={section.titleKey}>
              <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                {t(section.titleKey)}
              </h3>
              <div className="space-y-1">
                {section.items.map((item) => (
                  <NavItem key={item.path} item={item} setSidebarOpen={setSidebarOpen} />
                ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:pl-64 pt-16 lg:pt-0">
        {/* Desktop Header */}
        <header className="hidden lg:flex h-16 items-center justify-between px-6 border-b bg-card">
          <div className="flex items-center gap-4">
            <Badge variant="outline">
              {t('nav.personalConsole')}
            </Badge>
            <Badge variant="outline">
              {user.role === 'super_admin' ? t('users.superAdmin') : user.role === 'admin' ? t('users.admin') : t('users.user')}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            {canAccessElevated() && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleEnterElevated}
                className="text-primary"
              >
                <Shield className="h-4 w-4 mr-1" />
                {t('elevation.enter')}
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={toggleLanguage}>
              <Languages className="h-5 w-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <ThemeIcon className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme('light')}>
                  <Sun className="mr-2 h-4 w-4" />
                  {t('theme.light')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('dark')}>
                  <Moon className="mr-2 h-4 w-4" />
                  {t('theme.dark')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('eye-comfort')}>
                  <Eye className="mr-2 h-4 w-4" />
                  {t('theme.eyeComfort')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{user.username?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                  </Avatar>
                  <span>{user.username}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  {t('auth.logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <div className="p-6">
          <Outlet />
        </div>
      </main>

      <ElevationDialog
        open={showElevationDialog}
        onOpenChange={setShowElevationDialog}
        onSuccess={handleElevationSuccess}
      />
    </div>
  )
}
