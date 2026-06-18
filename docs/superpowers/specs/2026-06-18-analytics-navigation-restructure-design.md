# 数据分析导航重构设计

## 概述

将 AnalyticsPage 中的 4 个 section（知识库分析、搜索分析、API与访问、性能与审计）移动到侧边导航，作为"数据分析"的可折叠二级菜单项，实现三级导航结构。

## 需求说明

### 导航层级结构

- **一级导航**（不可折叠）：仪表盘、知识库、用户、系统
- **二级导航**：
  - 普通项（不可折叠）：如"概览"、"知识条目"、"分类管理"等
  - 可折叠组：如"数据分析"，内部包含三级菜单
- **三级导航**：仅出现在可折叠的二级导航下，如"知识库分析"、"搜索分析"等

### 具体结构

```
仪表盘
├── 概览
└── 数据分析 (可折叠)
    ├── 知识库分析
    ├── 搜索分析
    ├── API与访问
    └── 性能与审计

知识库
├── 知识条目
└── 分类管理

用户
├── 用户管理
└── API密钥

系统
├── 审计日志
├── 系统监控
└── 设置
```

### 功能要求

1. **独立路由页面**：每个三级菜单项对应独立的页面路由
2. **折叠状态持久化**：使用 localStorage 记住用户的折叠状态
3. **默认状态**：首次打开时，所有 section 默认展开

## 技术设计

### 1. 数据结构

使用嵌套对象结构表示导航层级关系：

```typescript
interface NavItem {
  path?: string  // 可折叠的二级菜单没有独立路径
  icon: React.ComponentType<{ className?: string }>
  labelKey: string
  collapsible?: boolean  // 是否可折叠
  children?: NavItem[]   // 子菜单项（三级）
}

interface NavSection {
  titleKey: string  // 一级导航标题
  items: NavItem[]  // 二级菜单项
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
    ]
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
```

### 2. 折叠状态管理

使用 React state 配合 localStorage 实现状态持久化：

```typescript
// 状态初始化
const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>(() => {
  const stored = localStorage.getItem('nav-collapsed-state')
  if (stored) {
    return JSON.parse(stored)
  }
  // 默认全部展开（空对象表示没有折叠的section）
  return {}
})

// 切换折叠状态
const toggleCollapse = (key: string) => {
  setCollapsedSections(prev => {
    const newState = { ...prev, [key]: !prev[key] }
    localStorage.setItem('nav-collapsed-state', JSON.stringify(newState))
    return newState
  })
}

// 检查是否折叠
const isCollapsed = (key: string) => {
  return collapsedSections[key] === true
}
```

### 3. 路由结构

#### 新增路由

将原来的 `/analytics` 拆分为 4 个独立路由：

| 路由 | 页面组件 | 说明 |
|------|---------|------|
| `/analytics/knowledge` | KnowledgeAnalyticsPage | 知识库分析 |
| `/analytics/search` | SearchAnalyticsPage | 搜索分析 |
| `/analytics/api` | ApiAnalyticsPage | API与访问 |
| `/analytics/performance` | PerformanceAnalyticsPage | 性能与审计 |

#### 重定向

- `/analytics` 重定向到 `/analytics/knowledge`（第一个子项）

### 4. 页面组件

#### 新增组件

每个分析页面都包含对应的 AnalyticsSection 组件：

```typescript
// KnowledgeAnalyticsPage.tsx
export function KnowledgeAnalyticsPage() {
  const { t } = useTranslation()
  
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">{t('analytics.knowledgeAnalysis')}</h1>
      <KnowledgeAnalysisSection />
    </div>
  )
}

// SearchAnalyticsPage.tsx
export function SearchAnalyticsPage() {
  const { t } = useTranslation()
  
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">{t('analytics.searchAnalysis')}</h1>
      <SearchAnalysisSection filter={...} />
    </div>
  )
}

// ApiAnalyticsPage.tsx
export function ApiAnalyticsPage() {
  const { t } = useTranslation()
  
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">{t('analytics.apiAnalysis')}</h1>
      <ApiAnalysisSection filter={...} />
    </div>
  )
}

// PerformanceAnalyticsPage.tsx
export function PerformanceAnalyticsPage() {
  const { t } = useTranslation()
  
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">{t('analytics.performanceAndAudit')}</h1>
      <PerformanceAuditSection filter={...} />
    </div>
  )
}
```

#### 删除组件

- 删除或重构 `AnalyticsPage.tsx`（原来的聚合页面）

### 5. 导航渲染逻辑

#### MainLayout 组件更新

需要更新 `MainLayout.tsx` 中的导航渲染逻辑：

```typescript
<nav className="p-4 space-y-6 overflow-y-auto h-[calc(100vh-4rem)]">
  {navSections.map((section) => (
    <div key={section.titleKey}>
      <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
        {t(section.titleKey)}
      </h3>
      <div className="space-y-1">
        {section.items.map((item) => {
          if (item.collapsible && item.children) {
            // 渲染可折叠的二级菜单
            return (
              <CollapsibleNavItem
                key={item.labelKey}
                item={item}
                isCollapsed={isCollapsed(item.labelKey)}
                onToggle={() => toggleCollapse(item.labelKey)}
              />
            )
          } else {
            // 渲染普通的二级菜单
            return <NavItem key={item.path} item={item} />
          }
        })}
      </div>
    </div>
  ))}
</nav>
```

#### 新增组件

**CollapsibleNavItem** - 可折叠的导航项组件：

```typescript
interface CollapsibleNavItemProps {
  item: NavItem
  isCollapsed: boolean
  onToggle: () => void
}

function CollapsibleNavItem({ item, isCollapsed, onToggle }: CollapsibleNavItemProps) {
  const { t } = useTranslation()
  const location = useLocation()
  const Icon = item.icon
  
  // 检查是否有子项被激活
  const hasActiveChild = item.children?.some(child => 
    location.pathname === child.path || location.pathname.startsWith(child.path + '/')
  )
  
  // 如果有子项被激活，自动展开
  useEffect(() => {
    if (hasActiveChild && isCollapsed) {
      onToggle()
    }
  }, [hasActiveChild, isCollapsed, onToggle])
  
  return (
    <div>
      <button
        onClick={onToggle}
        className={cn(
          'w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg transition-colors text-sm',
          'hover:bg-muted text-muted-foreground hover:text-foreground'
        )}
      >
        <div className="flex items-center gap-3">
          <Icon className="h-4 w-4" />
          {t(item.labelKey)}
        </div>
        <ChevronDown className={cn(
          'h-4 w-4 transition-transform',
          isCollapsed && '-rotate-90'
        )} />
      </button>
      
      {!isCollapsed && item.children && (
        <div className="ml-4 mt-1 space-y-1">
          {item.children.map((child) => {
            const ChildIcon = child.icon
            const isActive = location.pathname === child.path
            
            return (
              <Link
                key={child.path}
                to={child.path!}
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
  )
}
```

**NavItem** - 普通导航项组件：

```typescript
function NavItem({ item }: { item: NavItem }) {
  const { t } = useTranslation()
  const location = useLocation()
  const Icon = item.icon
  const isActive = location.pathname === item.path || 
    (item.path !== '/dashboard' && location.pathname.startsWith(item.path!))
  
  return (
    <Link
      to={item.path!}
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
```

## 实现步骤

1. **更新类型定义**
   - 在 `MainLayout.tsx` 中更新 `NavItem` 和 `NavSection` 接口

2. **更新导航数据**
   - 修改 `navSections` 数组，添加"数据分析"的可折叠结构

3. **创建页面组件**
   - 创建 4 个新的分析页面组件
   - 更新 `src/pages/index.ts` 导出

4. **更新路由配置**
   - 在 `router.tsx` 中添加 4 个新路由
   - 添加 `/analytics` 重定向

5. **更新导航渲染**
   - 实现 `CollapsibleNavItem` 组件
   - 实现 `NavItem` 组件
   - 更新 `MainLayout` 中的导航渲染逻辑
   - 添加折叠状态管理

6. **更新国际化**
   - 确认 `i18n/index.ts` 中已有相关的翻译键

7. **清理旧代码**
   - 删除或重构 `AnalyticsPage.tsx`

## 测试计划

### 功能测试

1. **导航展示**
   - 验证一级导航正确显示（仪表盘、知识库、用户、系统）
   - 验证二级导航正确显示（普通项和可折叠项）
   - 验证三级导航在展开状态下正确显示

2. **折叠功能**
   - 点击"数据分析"可以展开/折叠
   - 刷新页面后折叠状态保持
   - 首次访问时所有 section 默认展开

3. **路由导航**
   - 点击三级菜单项可以正确跳转到对应页面
   - 当前激活的菜单项有正确的样式
   - 访问 `/analytics` 自动重定向到 `/analytics/knowledge`

4. **自动展开**
   - 当访问某个三级菜单页面时，如果父级"数据分析"是折叠状态，应自动展开

### 视觉测试

1. 验证缩进和间距正确
2. 验证图标和文字对齐
3. 验证折叠/展开动画流畅
4. 验证激活状态的样式正确
5. 验证移动端响应式布局

### 兼容性测试

1. Chrome、Firefox、Safari 浏览器测试
2. 移动端测试
3. 暗色模式测试
