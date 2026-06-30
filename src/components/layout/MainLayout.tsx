import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useRef } from 'react'
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
  Library,
  Globe,
  AlertTriangle,
  ChevronDown,
  BookOpen,
  Search,
  KeyRound,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { ElevationDialog } from '@/components/auth/ElevationDialog'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface NavItem {
  path?: string
  icon: React.ComponentType<{ className?: string }>
  labelKey: string
  permissions?: Permission[]
  collapsible?: boolean
  children?: NavItem[]
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
        icon: BarChart3,
        labelKey: 'nav.myAnalytics',
        collapsible: true,
        children: [
          { path: '/me/analytics/knowledge', icon: BookOpen, labelKey: 'myAnalytics.knowledgeSection' },
          { path: '/me/analytics/search', icon: Search, labelKey: 'myAnalytics.searchSection' },
          { path: '/me/analytics/api', icon: KeyRound, labelKey: 'myAnalytics.apiUsageSection' },
        ],
      },
    ],
  },
  {
    titleKey: 'nav.knowledgeBase',
    items: [
      { path: '/knowledge', icon: Library, labelKey: 'nav.libraries' },
      { path: '/plaza', icon: Globe, labelKey: 'nav.plaza' },
    ],
  },
  {
    titleKey: 'nav.settings',
    items: [
      { path: '/settings', icon: Settings, labelKey: 'nav.settings' },
    ],
  },
]

function NavItem({ item, setSidebarOpen, sidebarCollapsed }: { item: NavItem; setSidebarOpen: (open: boolean) => void; sidebarCollapsed: boolean }) {
  const { t } = useTranslation()
  const location = useLocation()
  const Icon = item.icon
  const isActive = location.pathname === item.path ||
    (item.path !== '/dashboard' && item.path !== undefined && location.pathname.startsWith(item.path))

  const content = (
    <Link
      to={item.path!}
      onClick={() => setSidebarOpen(false)}
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm',
        isActive
          ? 'bg-primary text-primary-foreground'
          : 'hover:bg-muted text-muted-foreground hover:text-foreground',
        sidebarCollapsed && 'justify-center'
      )}
    >
      <Icon className="h-4 w-4 flex-shrink-0" />
      {!sidebarCollapsed && t(item.labelKey)}
    </Link>
  )

  if (sidebarCollapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          {content}
        </TooltipTrigger>
        <TooltipContent side="right">
          {t(item.labelKey)}
        </TooltipContent>
      </Tooltip>
    )
  }

  return content
}

function CollapsibleNavItem({
  item,
  isCollapsed,
  onToggle,
  setSidebarOpen,
  sidebarCollapsed,
}: {
  item: NavItem
  isCollapsed: boolean
  onToggle: () => void
  setSidebarOpen: (open: boolean) => void
  sidebarCollapsed: boolean
}) {
  const { t } = useTranslation()
  const location = useLocation()
  const Icon = item.icon

  const hasActiveChild = item.children?.some(
    child => location.pathname === child.path || location.pathname.startsWith(child.path! + '/')
  )

  if (sidebarCollapsed) {
    const content = (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <button
            onClick={onToggle}
            className={cn(
              'w-full flex items-center justify-center px-3 py-2 rounded-lg transition-colors text-sm',
              hasActiveChild ? 'bg-muted text-foreground' : 'hover:bg-muted text-muted-foreground hover:text-foreground'
            )}
          >
            <Icon className="h-4 w-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right">
          {t(item.labelKey)}
        </TooltipContent>
      </Tooltip>
    )

    if (!isCollapsed) {
      return (
        <div className="relative">
          {content}
          <div className="absolute left-full ml-2 top-0 bg-card border rounded-lg shadow-lg p-2 min-w-[180px] z-50">
            {item.children?.map((child) => {
              const ChildIcon = child.icon
              const isActive = location.pathname === child.path
              return (
                <Link
                  key={child.path}
                  to={child.path!}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm whitespace-nowrap',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                  )}
                >
                  <ChildIcon className="h-4 w-4" />
                  {t(child.labelKey)}
                </Link>
              )
            })}
          </div>
        </div>
      )
    }

    return content
  }

  return (
    <div>
      <button
        onClick={onToggle}
        className={cn(
          'w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg transition-colors text-sm',
          hasActiveChild ? 'bg-muted text-foreground' : 'hover:bg-muted text-muted-foreground hover:text-foreground'
        )}
      >
        <div className="flex items-center gap-3">
          <Icon className="h-4 w-4" />
          {t(item.labelKey)}
        </div>
        <ChevronDown
          className={cn(
            'h-4 w-4 transition-transform duration-200',
            isCollapsed && '-rotate-90'
          )}
        />
      </button>

      <div className={cn('collapsible-nav-content', isCollapsed && 'collapsed')}>
        <div className="collapsible-nav-inner ml-4 mt-1 space-y-1">
          {item.children?.map((child) => {
            const ChildIcon = child.icon
            const isActive = location.pathname === child.path
            return (
              <Link
                key={child.path}
                to={child.path!}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                )}
              >
                <ChildIcon className="h-4 w-4" />
                {t(child.labelKey)}
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export function MainLayout() {
  const { t } = useTranslation()
  const { theme, setTheme } = useTheme()
  const { i18n } = useTranslation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const stored = localStorage.getItem('sidebar-collapsed')
    return stored ? JSON.parse(stored) : false
  })
  const { canAccessElevated, loading, isElevated, revokeElevation } = usePermission()
  const [showElevationDialog, setShowElevationDialog] = useState(false)
  const wasElevatedRef = useRef(false)

  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>(() => {
    const stored = localStorage.getItem('nav-collapsed-state')
    return stored ? JSON.parse(stored) : {}
  })

  const toggleCollapse = (key: string) => {
    setCollapsedSections(prev => {
      const newState = { ...prev, [key]: !prev[key] }
      localStorage.setItem('nav-collapsed-state', JSON.stringify(newState))
      return newState
    })
  }

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed((prev: boolean) => {
      const newState = !prev
      localStorage.setItem('sidebar-collapsed', JSON.stringify(newState))
      return newState
    })
  }

  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const displayName = user.nickname || user.username
  const userActive = user.isActive !== false

  // Auto-revoke elevation when entering personal console. This enforces
  // hard isolation: the user must explicitly re-elevate (TOTP) each time
  // they want to access the advanced console. Prevents cross-contamination
  // between personal and elevated modes.
  useEffect(() => {
    if (isElevated()) {
      wasElevatedRef.current = true
      revokeElevation()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
    <TooltipProvider>
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
                  <AvatarFallback>{(user.nickname || user.username)?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{displayName}</DropdownMenuLabel>
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
            'fixed top-0 left-0 z-40 h-screen border-r bg-card transition-all duration-300',
            'w-64',
            sidebarCollapsed && 'w-16',
            'lg:translate-x-0',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <div className="h-16 flex items-center justify-between px-4 border-b">
            {!sidebarCollapsed && (
              <h1 className="font-bold text-xl">{t('auth.loginTitle')}</h1>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebarCollapse}
              className={cn('hidden lg:flex', sidebarCollapsed && 'mx-auto')}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>
          <nav className="p-2 space-y-6 overflow-y-auto h-[calc(100vh-4rem)]">
            {navSections.map((section) => (
              <div key={section.titleKey}>
                {!sidebarCollapsed && (
                  <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    {t(section.titleKey)}
                  </h3>
                )}
                <div className="space-y-1">
                  {section.items.map((item) => {
                    if (item.collapsible && item.children) {
                      return (
                        <CollapsibleNavItem
                          key={item.labelKey}
                          item={item}
                          isCollapsed={collapsedSections[item.labelKey] === true}
                          onToggle={() => toggleCollapse(item.labelKey)}
                          setSidebarOpen={setSidebarOpen}
                          sidebarCollapsed={sidebarCollapsed}
                        />
                      )
                    }
                    return <NavItem key={item.path} item={item} setSidebarOpen={setSidebarOpen} sidebarCollapsed={sidebarCollapsed} />
                  })}
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
        <main className={cn(
          'pt-16 lg:pt-0 transition-all duration-300',
          sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'
        )}>
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
              {userActive && canAccessElevated() && (
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
                      <AvatarFallback>{(user.nickname || user.username)?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                    </Avatar>
                    <span>{displayName}</span>
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
          {!userActive && (
            <div className="mx-6 mt-4 rounded-md border border-destructive/50 bg-destructive/10 p-4 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
              <div>
                <p className="font-medium text-destructive">{t('myApiKeys.accountDisabled')}</p>
                <p className="text-sm text-destructive/80">{t('myApiKeys.accountDisabledDesc')}</p>
              </div>
            </div>
          )}
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
    </TooltipProvider>
  )
}
