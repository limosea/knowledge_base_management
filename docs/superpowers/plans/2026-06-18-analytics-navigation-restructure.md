# 数据分析导航重构实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将数据分析的4个section移到侧边导航，实现三级可折叠导航结构

**Architecture:** 使用嵌套对象数据结构表示导航层级，通过 localStorage 持久化折叠状态，将原 AnalyticsPage 拆分为4个独立页面

**Tech Stack:** React, TypeScript, React Router, localStorage, Lucide Icons

---

## 文件结构

### 新增文件
- `src/pages/KnowledgeAnalyticsPage.tsx` - 知识库分析页面
- `src/pages/SearchAnalyticsPage.tsx` - 搜索分析页面
- `src/pages/ApiAnalyticsPage.tsx` - API与访问分析页面
- `src/pages/PerformanceAnalyticsPage.tsx` - 性能与审计分析页面

### 修改文件
- `src/components/layout/MainLayout.tsx` - 更新导航结构和渲染逻辑
- `src/router.tsx` - 添加新路由
- `src/pages/index.ts` - 导出新页面组件

### 删除文件
- `src/pages/AnalyticsPage.tsx` - 原聚合页面（或保留为重定向页面）

---

## Task 1: 更新 MainLayout 类型定义和导航数据

**Files:**
- Modify: `src/components/layout/MainLayout.tsx:36-77`

- [ ] **Step 1: 更新 NavItem 接口定义**

在 `MainLayout.tsx` 中更新 `NavItem` 接口：

```typescript
interface NavItem {
  path?: string
  icon: React.ComponentType<{ className?: string }>
  labelKey: string
  collapsible?: boolean
  children?: NavItem[]
}
```

- [ ] **Step 2: 更新导航数据结构**

替换 `navSections` 数组（第47-77行）：

```typescript
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
```

- [ ] **Step 3: 添加必要的图标导入**

在文件顶部添加缺失的图标导入：

```typescript
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
```

- [ ] **Step 4: 提交类型和数据结构更新**

```bash
git add src/components/layout/MainLayout.tsx
git commit -m "feat(nav): update nav data structure for collapsible analytics section"
```

---

## Task 2: 创建 KnowledgeAnalyticsPage 组件

**Files:**
- Create: `src/pages/KnowledgeAnalyticsPage.tsx`

- [ ] **Step 1: 创建 KnowledgeAnalyticsPage 组件**

```typescript
import { useTranslation } from 'react-i18next'
import { KnowledgeAnalysisSection } from '@/components/analytics/KnowledgeAnalysisSection'

export function KnowledgeAnalyticsPage() {
  const { t } = useTranslation()
  
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">{t('analytics.knowledgeAnalysis')}</h1>
      <KnowledgeAnalysisSection />
    </div>
  )
}
```

- [ ] **Step 2: 提交新页面**

```bash
git add src/pages/KnowledgeAnalyticsPage.tsx
git commit -m "feat(pages): add KnowledgeAnalyticsPage component"
```

---

## Task 3: 创建 SearchAnalyticsPage 组件

**Files:**
- Create: `src/pages/SearchAnalyticsPage.tsx`

- [ ] **Step 1: 创建 SearchAnalyticsPage 组件**

```typescript
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { SearchAnalysisSection } from '@/components/analytics/SearchAnalysisSection'
import { StatsFilterBar } from '@/components/charts/StatsFilterBar'
import type { FilterState } from '@/components/charts/StatsFilterBar'

export function SearchAnalyticsPage() {
  const { t } = useTranslation()
  const [filter, setFilter] = useState<FilterState | null>(null)
  
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">{t('analytics.searchAnalysis')}</h1>
      <StatsFilterBar onFilterChange={setFilter} />
      {filter && <SearchAnalysisSection filter={filter} />}
    </div>
  )
}
```

- [ ] **Step 2: 提交新页面**

```bash
git add src/pages/SearchAnalyticsPage.tsx
git commit -m "feat(pages): add SearchAnalyticsPage component"
```

---

## Task 4: 创建 ApiAnalyticsPage 组件

**Files:**
- Create: `src/pages/ApiAnalyticsPage.tsx`

- [ ] **Step 1: 创建 ApiAnalyticsPage 组件**

```typescript
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { ApiAnalysisSection } from '@/components/analytics/ApiAnalysisSection'
import { StatsFilterBar } from '@/components/charts/StatsFilterBar'
import type { FilterState } from '@/components/charts/StatsFilterBar'

export function ApiAnalyticsPage() {
  const { t } = useTranslation()
  const [filter, setFilter] = useState<FilterState | null>(null)
  
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">{t('analytics.apiAnalysis')}</h1>
      <StatsFilterBar onFilterChange={setFilter} />
      {filter && <ApiAnalysisSection filter={filter} />}
    </div>
  )
}
```

- [ ] **Step 2: 提交新页面**

```bash
git add src/pages/ApiAnalyticsPage.tsx
git commit -m "feat(pages): add ApiAnalyticsPage component"
```

---

## Task 5: 创建 PerformanceAnalyticsPage 组件

**Files:**
- Create: `src/pages/PerformanceAnalyticsPage.tsx`

- [ ] **Step 1: 创建 PerformanceAnalyticsPage 组件**

```typescript
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { PerformanceAuditSection } from '@/components/analytics/PerformanceAuditSection'
import { StatsFilterBar } from '@/components/charts/StatsFilterBar'
import type { FilterState } from '@/components/charts/StatsFilterBar'

export function PerformanceAnalyticsPage() {
  const { t } = useTranslation()
  const [filter, setFilter] = useState<FilterState | null>(null)
  
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">{t('analytics.performanceAndAudit')}</h1>
      <StatsFilterBar onFilterChange={setFilter} />
      {filter && <PerformanceAuditSection filter={filter} />}
    </div>
  )
}
```

- [ ] **Step 2: 提交新页面**

```bash
git add src/pages/PerformanceAnalyticsPage.tsx
git commit -m "feat(pages): add PerformanceAnalyticsPage component"
```

---

## Task 6: 更新页面导出

**Files:**
- Modify: `src/pages/index.ts`

- [ ] **Step 1: 添加新页面导出**

```typescript
export { KnowledgeAnalyticsPage } from './KnowledgeAnalyticsPage'
export { SearchAnalyticsPage } from './SearchAnalyticsPage'
export { ApiAnalyticsPage } from './ApiAnalyticsPage'
export { PerformanceAnalyticsPage } from './PerformanceAnalyticsPage'
```

- [ ] **Step 2: 移除或注释旧的 AnalyticsPage 导出**

如果文件中有：
```typescript
export { AnalyticsPage } from './AnalyticsPage'
```
删除或注释这一行。

- [ ] **Step 3: 提交导出更新**

```bash
git add src/pages/index.ts
git commit -m "feat(pages): export new analytics pages"
```

---

## Task 7: 更新路由配置

**Files:**
- Modify: `src/router.tsx`

- [ ] **Step 1: 导入新页面组件**

在 `router.tsx` 顶部的导入部分添加：

```typescript
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
```

移除 `AnalyticsPage` 的导入（如果存在）。

- [ ] **Step 2: 添加新路由**

在路由配置中，将原来的 `/analytics` 路由替换为：

```typescript
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
```

- [ ] **Step 3: 确保导入 Navigate**

确保文件顶部有：
```typescript
import { createBrowserRouter, Navigate } from 'react-router-dom'
```

- [ ] **Step 4: 提交路由更新**

```bash
git add src/router.tsx
git commit -m "feat(router): add analytics sub-routes"
```

---

## Task 8: 实现 NavItem 组件

**Files:**
- Modify: `src/components/layout/MainLayout.tsx`

- [ ] **Step 1: 在 MainLayout 组件内部添加 NavItem 组件**

在 `MainLayout` 组件内部，`return` 语句之前添加：

```typescript
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
```

- [ ] **Step 2: 提交 NavItem 组件**

```bash
git add src/components/layout/MainLayout.tsx
git commit -m "feat(nav): add NavItem component for regular nav items"
```

---

## Task 9: 实现 CollapsibleNavItem 组件

**Files:**
- Modify: `src/components/layout/MainLayout.tsx`

- [ ] **Step 1: 添加折叠状态管理**

在 `MainLayout` 组件内部，`sidebarOpen` 状态之后添加：

```typescript
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
```

- [ ] **Step 2: 实现 CollapsibleNavItem 组件**

在 `NavItem` 组件之后添加：

```typescript
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
  )
}
```

- [ ] **Step 3: 提交 CollapsibleNavItem 组件**

```bash
git add src/components/layout/MainLayout.tsx
git commit -m "feat(nav): add CollapsibleNavItem component with state persistence"
```

---

## Task 10: 更新导航渲染逻辑

**Files:**
- Modify: `src/components/layout/MainLayout.tsx`

- [ ] **Step 1: 更新导航渲染逻辑**

替换 `nav` 元素内的内容（第151-182行）：

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
```

- [ ] **Step 2: 添加 useEffect 导入**

确保文件顶部有：
```typescript
import { useState, useEffect } from 'react'
```

- [ ] **Step 3: 提交导航渲染更新**

```bash
git add src/components/layout/MainLayout.tsx
git commit -m "feat(nav): integrate CollapsibleNavItem into navigation rendering"
```

---

## Task 11: 清理旧的 AnalyticsPage

**Files:**
- Delete: `src/pages/AnalyticsPage.tsx`

- [ ] **Step 1: 删除旧的 AnalyticsPage 文件**

```bash
rm src/pages/AnalyticsPage.tsx
```

- [ ] **Step 2: 提交删除**

```bash
git add -A
git commit -m "refactor: remove old AnalyticsPage component"
```

---

## Task 12: 验证和测试

**Files:**
- None

- [ ] **Step 1: 运行开发服务器**

```bash
npm run dev
```

Expected: 开发服务器成功启动

- [ ] **Step 2: 测试导航功能**

在浏览器中测试：
1. 打开应用，验证侧边导航正确显示
2. 点击"数据分析"，验证折叠/展开功能
3. 点击子菜单项（知识库分析、搜索分析等），验证页面跳转正确
4. 刷新页面，验证折叠状态保持
5. 验证当前激活菜单项有正确的样式
6. 在移动端测试响应式布局

- [ ] **Step 3: 运行类型检查**

```bash
npm run typecheck
```

Expected: 无类型错误

- [ ] **Step 4: 运行 lint**

```bash
npm run lint
```

Expected: 无 lint 错误

- [ ] **Step 5: 构建项目**

```bash
npm run build
```

Expected: 构建成功

---

## 执行完成

完成所有任务后，应该实现：
1. 三级导航结构（仪表盘 > 数据分析 > 4个子项）
2. 可折叠的"数据分析"二级菜单
3. 4个独立的分析页面
4. 折叠状态的持久化（localStorage）
5. 清理了旧的聚合页面
