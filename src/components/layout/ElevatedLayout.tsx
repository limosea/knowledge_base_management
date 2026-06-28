import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom'
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
  BarChart3,
  BookOpen,
  Tag,
  Users,
  Key,
  FileText,
  Activity,
  LogOut,
  Menu,
  Sun,
  Moon,
  Eye,
  Languages,
  ChevronDown,
  Search,
  Gauge,
  KeyRound,
  Shield,
  ShieldOff,
  Clock,
  Globe,
  FlaskConical,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface NavItem {
  path?: string
  icon: React.ComponentType<{ className?: string }>
  labelKey: string
  collapsible?: boolean
  children?: NavItem[]
  permissions?: Permission[]
  requireAll?: boolean
  superAdminOnly?: boolean
}

interface NavSection {
  titleKey: string
  items: NavItem[]
}

const navSections: NavSection[] = [
  {
    titleKey: 'nav.elevatedConsole',
    items: [
      {
        path: '/elevated/users',
        icon: Users,
        labelKey: 'nav.userManagement',
        permissions: ['users:list'],
      },
      {
        // Super-admin-only sandbox for time-limited test accounts.
        // Kept out of the regular user list so test credentials never
        // leak into day-to-day user management views.
        path: '/elevated/test-accounts',
        icon: FlaskConical,
        labelKey: 'nav.testAccounts',
        superAdminOnly: true,
      },
      {
        path: '/elevated/roles',
        icon: Shield,
        labelKey: 'nav.roleManagement',
        superAdminOnly: true,
      },
      {
        path: '/elevated/api-keys',
        icon: Key,
        labelKey: 'nav.apiKeys',
        permissions: ['apikeys:list'],
      },
    ],
  },
  {
    titleKey: 'nav.knowledgeBase',
    items: [
      { path: '/elevated/plaza', icon: Globe, labelKey: 'nav.plaza' },
      { path: '/elevated/categories', icon: Tag, labelKey: 'nav.categories' },
    ],
  },
  {
    titleKey: 'nav.system',
    items: [
      {
        path: '/elevated/audit-logs',
        icon: FileText,
        labelKey: 'nav.auditLogs',
        permissions: ['audit:read'],
      },
      {
        path: '/elevated/system',
        icon: Activity,
        labelKey: 'nav.systemMonitor',
        permissions: ['system:read'],
      },
      {
        icon: BarChart3,
        labelKey: 'nav.analytics',
        collapsible: true,
        children: [
          { path: '/elevated/analytics/knowledge', icon: BookOpen, labelKey: 'analytics.knowledgeAnalysis', permissions: ['analytics:read'] },
          { path: '/elevated/analytics/search', icon: Search, labelKey: 'analytics.searchAnalysis', permissions: ['stats:read'] },
          { path: '/elevated/analytics/api', icon: KeyRound, labelKey: 'analytics.apiAnalysis', permissions: ['stats:read'] },
          { path: '/elevated/analytics/performance', icon: Gauge, labelKey: 'analytics.performanceAndAudit', permissions: ['audit:read'] },
        ],
      },
    ],
  },
]

function NavItem({ item, setSidebarOpen }: { item: NavItem; setSidebarOpen: (open: boolean) => void }) {
  const { t } = useTranslation()
  const location = useLocation()
  const Icon = item.icon
  const isActive = location.pathname === item.path ||
    (item.path !== '/dashboard' && item.path !== undefined && location.pathname.startsWith(item.path))

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

function CollapsibleNavItem({
  item,
  isCollapsed,
  onToggle,
  setSidebarOpen,
}: {
  item: NavItem
  isCollapsed: boolean
  onToggle: () => void
  setSidebarOpen: (open: boolean) => void
}) {
  const { t } = useTranslation()
  const location = useLocation()
  const Icon = item.icon

  const hasActiveChild = item.children?.some(
    child => location.pathname === child.path || location.pathname.startsWith(child.path! + '/')
  )

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

export function ElevatedLayout() {
  const { t } = useTranslation()
  const { theme, setTheme } = useTheme()
  const { i18n } = useTranslation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { hasAnyPermission, user: permUser, elevation, revokeElevation } = usePermission()
  const [remainingTime, setRemainingTime] = useState<string>('')

  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>(() => {
    const stored = localStorage.getItem('nav-collapsed-state')
    return stored ? JSON.parse(stored) : {}
  })

  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const displayName = user.nickname || user.username

  const toggleCollapse = (key: string) => {
    setCollapsedSections(prev => {
      const newState = { ...prev, [key]: !prev[key] }
      localStorage.setItem('nav-collapsed-state', JSON.stringify(newState))
      return newState
    })
  }

  const filterItems = (items: NavItem[]): NavItem[] => {
    return items.filter(item => {
      if (item.superAdminOnly && !permUser?.isSuperAdmin) return false
      if (item.permissions && !hasAnyPermission(item.permissions)) return false
      if (item.children) {
        item.children = filterItems(item.children)
      }
      return true
    })
  }

  const handleLogout = async () => {
    try {
      await apiClient.post('/admin/auth/logout')
    } finally {
      apiClient.clearTokens()
      navigate('/login')
    }
  }

  const handleExitElevated = async () => {
    await revokeElevation()
    navigate('/dashboard')
  }

  useEffect(() => {
    if (!elevation.elevated || !elevation.remainingSeconds) {
      setRemainingTime('')
      return
    }

    const updateTime = () => {
      const seconds = elevation.remainingSeconds ?? 0
      if (seconds <= 0) {
        setRemainingTime('')
        return
      }
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      setRemainingTime(`${mins}:${secs.toString().padStart(2, '0')}`)
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [elevation.elevated, elevation.remainingSeconds])

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'zh' : 'en'
    i18n.changeLanguage(newLang)
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
        <div className="flex items-center gap-2">
          <Badge className="bg-orange-500">{t('nav.elevatedConsole')}</Badge>
          <span className="text-sm text-muted-foreground">{remainingTime}</span>
        </div>
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
            <DropdownMenuItem onClick={handleExitElevated}>
              <ShieldOff className="mr-2 h-4 w-4" />
              {t('elevation.exit')}
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
        <div className="h-16 flex items-center justify-between px-6 border-b">
          <h1 className="font-bold text-xl">{t('auth.loginTitle')}</h1>
          <Badge className="bg-orange-500">{t('nav.elevatedConsole')}</Badge>
        </div>
        <div className="p-4 border-b bg-orange-50 dark:bg-orange-950/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-orange-800 dark:text-orange-200">
              <Clock className="h-4 w-4" />
              <span>{t('elevation.remaining')}: {remainingTime}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExitElevated}
              className="text-orange-700 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-900"
            >
              <ShieldOff className="h-4 w-4 mr-1" />
              {t('elevation.exit')}
            </Button>
          </div>
        </div>
        <nav className="p-4 space-y-6 overflow-y-auto h-[calc(100vh-10rem)]">
          {navSections.map((section) => {
            const filteredItems = filterItems(section.items)
            if (filteredItems.length === 0) return null
            return (
              <div key={section.titleKey}>
                <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  {t(section.titleKey)}
                </h3>
                <div className="space-y-1">
                  {filteredItems.map((item) => {
                  if (item.collapsible && item.children) {
                    return (
                      <CollapsibleNavItem
                        key={item.labelKey}
                        item={item}
                        isCollapsed={collapsedSections[item.labelKey] === true}
                        onToggle={() => toggleCollapse(item.labelKey)}
                        setSidebarOpen={setSidebarOpen}
                      />
                    )
                  } else {
                    return <NavItem key={item.path} item={item} setSidebarOpen={setSidebarOpen} />
                  }
                })}
              </div>
            </div>
            )
          })}
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
            <Badge className="bg-orange-500">
              {t('nav.elevatedConsole')}
            </Badge>
            <Badge variant="outline">
              {user.role === 'super_admin' ? t('users.superAdmin') : user.role === 'admin' ? t('users.admin') : t('users.user')}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
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
                <DropdownMenuItem onClick={handleExitElevated}>
                  <ShieldOff className="mr-2 h-4 w-4" />
                  {t('elevation.exit')}
                </DropdownMenuItem>
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
    </div>
  )
}
