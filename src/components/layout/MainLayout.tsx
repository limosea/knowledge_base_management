import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/contexts/ThemeContext'
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
  BarChart3,
  BookOpen,
  Tag,
  Users,
  Key,
  FileText,
  Activity,
  Settings,
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
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface NavItem {
  path?: string
  icon: React.ComponentType<{ className?: string }>
  labelKey: string
  collapsible?: boolean
  children?: NavItem[]
}

interface NavSection {
  titleKey: string
  items: NavItem[]
}

const navSections: NavSection[] = [
  {
    titleKey: 'nav.dashboard',
    items: [
      { 
        path: '/dashboard', 
        icon: LayoutDashboard, 
        labelKey: 'nav.overview' 
      },
      {
        icon: BarChart3,
        labelKey: 'nav.analytics',
        collapsible: true,
        children: [
          { path: '/analytics/knowledge', icon: BookOpen, labelKey: 'analytics.knowledgeAnalysis' },
          { path: '/analytics/search', icon: Search, labelKey: 'analytics.searchAnalysis' },
          { path: '/analytics/api', icon: KeyRound, labelKey: 'analytics.apiAnalysis' },
          { path: '/analytics/performance', icon: Gauge, labelKey: 'analytics.performanceAndAudit' },
        ]
      }
    ],
  },
  {
    titleKey: 'nav.knowledgeBase',
    items: [
      { path: '/knowledge', icon: BookOpen, labelKey: 'nav.knowledge' },
      { path: '/categories', icon: Tag, labelKey: 'nav.categories' },
    ],
  },
  {
    titleKey: 'nav.users',
    items: [
      { path: '/users', icon: Users, labelKey: 'nav.userManagement' },
      { path: '/api-keys', icon: Key, labelKey: 'nav.apiKeys' },
    ],
  },
  {
    titleKey: 'nav.system',
    items: [
      { path: '/audit-logs', icon: FileText, labelKey: 'nav.auditLogs' },
      { path: '/system', icon: Activity, labelKey: 'nav.systemMonitor' },
      { path: '/settings', icon: Settings, labelKey: 'nav.settings' },
    ],
  },
]

export function MainLayout() {
  const { t } = useTranslation()
  const { theme, setTheme } = useTheme()
  const { i18n } = useTranslation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
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
    setSidebarOpen 
  }: { 
    item: NavItem
    isCollapsed: boolean
    onToggle: () => void
    setSidebarOpen: (open: boolean) => void
  }) {
    const { t } = useTranslation()
    const location = useLocation()
    const Icon = item.icon
    
    const hasActiveChild = item.children?.some(child => 
      location.pathname === child.path || location.pathname.startsWith(child.path! + '/')
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
          <ChevronDown className={cn(
            'h-4 w-4 transition-transform duration-200',
            isCollapsed && '-rotate-90'
          )} />
        </button>
        
        <div className={cn(
          'overflow-hidden transition-all duration-200 ease-in-out',
          isCollapsed ? 'max-h-0 opacity-0' : 'max-h-96 opacity-100'
        )}>
          {item.children && (
            <div className="ml-4 mt-1 space-y-1">
              {item.children.map((child) => {
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
          )}
        </div>
      </div>
    )
  }

  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const handleLogout = async () => {
    try {
      await apiClient.post('/admin/auth/logout')
    } finally {
      apiClient.clearTokens()
      navigate('/login')
    }
  }

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
        <nav className="p-4 space-y-6 overflow-y-scroll h-[calc(100vh-4rem)]">
          {navSections.map((section) => (
            <div key={section.titleKey}>
              <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                {t(section.titleKey)}
              </h3>
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
                      />
                    )
                  } else {
                    return <NavItem key={item.path} item={item} setSidebarOpen={setSidebarOpen} />
                  }
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
      <main className="lg:pl-64 pt-16 lg:pt-0">
        {/* Desktop Header */}
        <header className="hidden lg:flex h-16 items-center justify-between px-6 border-b bg-card">
          <div className="flex items-center gap-4">
            <Badge variant="outline">{user.role === 'super_admin' ? t('users.superAdmin') : t('users.admin')}</Badge>
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
    </div>
  )
}
