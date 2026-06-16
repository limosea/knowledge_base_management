# 统计分析功能实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为知识库管理系统添加数据可视化功能，包括Dashboard概览增强和Analytics深度分析页面

**Architecture:** 使用Recharts图表库实现可视化组件，Dashboard展示核心KPI卡片+趋势图+操作列表，Analytics页面按业务逻辑分组展示6个统计图表

**Tech Stack:** React + TypeScript + Recharts + Tailwind CSS + react-i18next

---

## 文件结构

**新增文件:**
- `src/components/charts/StatCard.tsx` - KPI统计卡片组件
- `src/components/charts/RequestTrendChart.tsx` - 请求趋势折线图
- `src/components/charts/CategoryPieChart.tsx` - 知识分类饼图
- `src/components/charts/QualityBarChart.tsx` - 质量分数柱状图
- `src/components/charts/ApiKeyStatusChart.tsx` - API Key状态环形图
- `src/components/charts/ActionStatsChart.tsx` - 操作类型柱状图
- `src/components/charts/ActivityTimeline.tsx` - 操作时间轴
- `src/pages/AnalyticsPage.tsx` - 数据分析页面

**修改文件:**
- `src/index.css` - 添加图表CSS变量
- `src/i18n/index.ts` - 添加统计相关翻译
- `src/pages/DashboardPage.tsx` - 增强Dashboard布局
- `src/components/layout/MainLayout.tsx` - 添加Analytics导航
- `src/router.tsx` - 添加Analytics路由
- `src/pages/index.ts` - 导出AnalyticsPage
- `package.json` - 添加Recharts依赖

---

## Task 1: 安装Recharts依赖

**Files:**
- Modify: `package.json`

- [ ] **Step 1: 安装Recharts包**

```bash
npm install recharts
```

Expected: recharts added to dependencies

- [ ] **Step 2: 验证安装成功**

```bash
npm ls recharts
```

Expected: recharts@2.x.x

---

## Task 2: 添加图表CSS变量

**Files:**
- Modify: `src/index.css:5-72`

- [ ] **Step 1: 在:root中添加图表颜色变量**

在 `src/index.css` 的 `:root` 块末尾（第26行 `--radius: 0.5rem;` 之后）添加：

```css
    --chart-1: 221 83% 53%;
    --chart-2: 142 76% 36%;
    --chart-3: 38 92% 50%;
    --chart-4: 280 65% 60%;
    --chart-5: 340 82% 52%;
    --success: 142 76% 36%;
    --success-foreground: 0 0% 100%;
    --warning: 38 92% 50%;
    --warning-foreground: 0 0% 100%;
```

- [ ] **Step 2: 在.dark中添加图表颜色变量**

在 `src/index.css` 的 `.dark` 块末尾（第48行 `--ring: 224.3 76.3% 48%;` 之后）添加：

```css
    --chart-1: 217 91% 60%;
    --chart-2: 160 84% 39%;
    --chart-3: 48 96% 53%;
    --chart-4: 280 65% 70%;
    --chart-5: 346 77% 50%;
    --success: 160 84% 39%;
    --success-foreground: 0 0% 100%;
    --warning: 48 96% 53%;
    --warning-foreground: 0 0% 100%;
```

- [ ] **Step 3: 在.eye-comfort中添加图表颜色变量**

在 `src/index.css` 的 `.eye-comfort` 块末尾（第70行 `--ring: 30 30% 40%;` 之后）添加：

```css
    --chart-1: 220 50% 45%;
    --chart-2: 150 45% 40%;
    --chart-3: 35 55% 48%;
    --chart-4: 280 45% 55%;
    --chart-5: 340 50% 50%;
    --success: 150 45% 40%;
    --success-foreground: 0 0% 100%;
    --warning: 35 55% 48%;
    --warning-foreground: 0 0% 100%;
```

- [ ] **Step 4: 验证CSS编译**

```bash
npm run build
```

Expected: Build successful, no CSS errors

---

## Task 3: 添加统计相关翻译

**Files:**
- Modify: `src/i18n/index.ts`

- [ ] **Step 1: 在英文翻译中添加统计相关键**

在 `src/i18n/index.ts` 第62行 `thisMonth: 'This Month',` 之后添加：

```typescript
        systemStatus: 'System Status',
        requestTrend: 'Request Trend',
        recentActivity: 'Recent Activity',
        viewAll: 'View All',
        activeApiKeys: 'Active API Keys',
        todayRequests: "Today's Requests",
      analytics: {
        title: 'Analytics',
        knowledgeAnalysis: 'Knowledge Analysis',
        apiAnalysis: 'API & Access',
        auditAnalysis: 'Audit Analysis',
        categoryDistribution: 'Category Distribution',
        qualityDistribution: 'Quality Score Distribution',
        apiKeyStatus: 'API Key Status',
        requestTrend: 'Request Trend',
        actionStats: 'Action Statistics',
        activityTimeline: 'Activity Timeline',
        entries: 'entries',
        avgScore: 'Avg Score',
        noData: 'No data available',
      },
```

- [ ] **Step 2: 在中文翻译中添加统计相关键**

在 `src/i18n/index.ts` 第228行 `thisMonth: '本月',` 之后添加：

```typescript
        systemStatus: '系统状态',
        requestTrend: '请求趋势',
        recentActivity: '最近操作',
        viewAll: '查看全部',
        activeApiKeys: '活跃API密钥',
        todayRequests: '今日请求',
      analytics: {
        title: '数据分析',
        knowledgeAnalysis: '知识库分析',
        apiAnalysis: 'API与访问',
        auditAnalysis: '操作审计',
        categoryDistribution: '知识分类分布',
        qualityDistribution: '质量分数分布',
        apiKeyStatus: 'API密钥状态',
        requestTrend: '请求量趋势',
        actionStats: '操作类型统计',
        activityTimeline: '操作时间线',
        entries: '条目',
        avgScore: '平均分数',
        noData: '暂无数据',
      },
```

- [ ] **Step 3: 在导航翻译中添加Analytics**

在第45行 `system: 'System',` 之后添加：

```typescript
        analytics: 'Analytics',
```

在第211行 `system: '系统监控',` 之后添加：

```typescript
        analytics: '数据分析',
```

- [ ] **Step 4: 验证TypeScript编译**

```bash
npm run build
```

Expected: Build successful, no TypeScript errors

---

## Task 4: 创建StatCard组件

**Files:**
- Create: `src/components/charts/StatCard.tsx`

- [ ] **Step 1: 创建StatCard组件**

创建文件 `src/components/charts/StatCard.tsx`:

```tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: number | string
  icon: LucideIcon
  description?: string
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
}

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  className,
}: StatCardProps) {
  return (
    <Card className={cn('', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend && (
          <p
            className={cn(
              'text-xs mt-1',
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            )}
          >
            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
          </p>
        )}
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 2: 验证组件导入**

```bash
npm run build
```

Expected: Build successful

---

## Task 5: 创建RequestTrendChart组件

**Files:**
- Create: `src/components/charts/RequestTrendChart.tsx`

- [ ] **Step 1: 创建RequestTrendChart组件**

创建文件 `src/components/charts/RequestTrendChart.tsx`:

```tsx
import { useTranslation } from 'react-i18next'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface RequestTrendChartProps {
  data: {
    today: number
    thisWeek: number
    thisMonth: number
  }
  loading?: boolean
}

export function RequestTrendChart({ data, loading }: RequestTrendChartProps) {
  const { t } = useTranslation()

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[200px] w-full" />
        </CardContent>
      </Card>
    )
  }

  const chartData = [
    { name: t('dashboard.today'), value: data.today },
    { name: t('dashboard.thisWeek'), value: data.thisWeek },
    { name: t('dashboard.thisMonth'), value: data.thisMonth },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t('dashboard.requestTrend')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="name"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickFormatter={(value) => value.toLocaleString()}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                formatter={(value: number) => [value.toLocaleString(), t('dashboard.requests')]}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
                fillOpacity={1}
                fill="url(#colorValue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 2: 验证组件编译**

```bash
npm run build
```

Expected: Build successful

---

## Task 6: 创建CategoryPieChart组件

**Files:**
- Create: `src/components/charts/CategoryPieChart.tsx`

- [ ] **Step 1: 创建CategoryPieChart组件**

创建文件 `src/components/charts/CategoryPieChart.tsx`:

```tsx
import { useTranslation } from 'react-i18next'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface CategoryPieChartProps {
  data: Record<string, number>
  loading?: boolean
}

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
]

export function CategoryPieChart({ data, loading }: CategoryPieChartProps) {
  const { t } = useTranslation()

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[250px] w-full" />
        </CardContent>
      </Card>
    )
  }

  const chartData = Object.entries(data || {}).map(([name, value]) => ({
    name,
    value,
  }))

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('analytics.categoryDistribution')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] flex items-center justify-center text-muted-foreground">
            {t('analytics.noData')}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t('analytics.categoryDistribution')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="hsl(var(--primary))"
                dataKey="value"
              >
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => [`${value} ${t('analytics.entries')}`, '']}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 2: 验证组件编译**

```bash
npm run build
```

Expected: Build successful

---

## Task 7: 创建QualityBarChart组件

**Files:**
- Create: `src/components/charts/QualityBarChart.tsx`

- [ ] **Step 1: 创建QualityBarChart组件**

创建文件 `src/components/charts/QualityBarChart.tsx`:

```tsx
import { useTranslation } from 'react-i18next'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface QualityBarChartProps {
  avgScore?: number
  loading?: boolean
}

export function QualityBarChart({ avgScore, loading }: QualityBarChartProps) {
  const { t } = useTranslation()

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[250px] w-full" />
        </CardContent>
      </Card>
    )
  }

  const chartData = [
    { name: t('analytics.avgScore'), value: avgScore ?? 0 },
  ]

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'hsl(var(--chart-2))'
    if (score >= 60) return 'hsl(var(--chart-3))'
    return 'hsl(var(--chart-5))'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t('analytics.qualityDistribution')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                type="number"
                domain={[0, 100]}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis
                type="category"
                dataKey="name"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => [value.toFixed(1), '']}
              />
              <Bar
                dataKey="value"
                fill={getScoreColor(avgScore ?? 0)}
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {avgScore !== undefined && (
          <div className="mt-4 text-center">
            <span className="text-3xl font-bold" style={{ color: getScoreColor(avgScore) }}>
              {avgScore.toFixed(1)}
            </span>
            <span className="text-muted-foreground ml-1">/ 100</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 2: 验证组件编译**

```bash
npm run build
```

Expected: Build successful

---

## Task 8: 创建ApiKeyStatusChart组件

**Files:**
- Create: `src/components/charts/ApiKeyStatusChart.tsx`

- [ ] **Step 1: 创建ApiKeyStatusChart组件**

创建文件 `src/components/charts/ApiKeyStatusChart.tsx`:

```tsx
import { useTranslation } from 'react-i18next'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface ApiKeyStatusChartProps {
  data: {
    total: number
    active: number
    expired: number
  }
  loading?: boolean
}

export function ApiKeyStatusChart({ data, loading }: ApiKeyStatusChartProps) {
  const { t } = useTranslation()

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[250px] w-full" />
        </CardContent>
      </Card>
    )
  }

  const inactive = data.total - data.active - data.expired

  const chartData = [
    { name: t('apiKeys.active'), value: data.active, color: 'hsl(var(--chart-2))' },
    { name: t('apiKeys.expired'), value: data.expired, color: 'hsl(var(--chart-5))' },
    { name: t('apiKeys.inactive'), value: inactive, color: 'hsl(var(--chart-3))' },
  ].filter(item => item.value > 0)

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('analytics.apiKeyStatus')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] flex items-center justify-center text-muted-foreground">
            {t('analytics.noData')}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t('analytics.apiKeyStatus')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => [value, '']}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 text-center">
          <span className="text-2xl font-bold">{data.total}</span>
          <span className="text-muted-foreground ml-1">{t('dashboard.apiKeys')}</span>
        </div>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 2: 验证组件编译**

```bash
npm run build
```

Expected: Build successful

---

## Task 9: 创建ActionStatsChart组件

**Files:**
- Create: `src/components/charts/ActionStatsChart.tsx`

- [ ] **Step 1: 创建ActionStatsChart组件**

创建文件 `src/components/charts/ActionStatsChart.tsx`:

```tsx
import { useTranslation } from 'react-i18next'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface ActionStatsChartProps {
  data: Record<string, number>
  loading?: boolean
}

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
]

const ACTION_LABELS: Record<string, string> = {
  LOGIN: 'Login',
  LOGOUT: 'Logout',
  CREATE: 'Create',
  UPDATE: 'Update',
  DELETE: 'Delete',
}

export function ActionStatsChart({ data, loading }: ActionStatsChartProps) {
  const { t } = useTranslation()

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[250px] w-full" />
        </CardContent>
      </Card>
    )
  }

  const chartData = Object.entries(data || {})
    .map(([action, count]) => ({
      name: ACTION_LABELS[action] || action,
      value: count,
    }))
    .sort((a, b) => b.value - a.value)

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('analytics.actionStats')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] flex items-center justify-center text-muted-foreground">
            {t('analytics.noData')}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t('analytics.actionStats')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="name"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => [value, '']}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 2: 验证组件编译**

```bash
npm run build
```

Expected: Build successful

---

## Task 10: 创建ActivityTimeline组件

**Files:**
- Create: `src/components/charts/ActivityTimeline.tsx`

- [ ] **Step 1: 创建ActivityTimeline组件**

创建文件 `src/components/charts/ActivityTimeline.tsx`:

```tsx
import { useTranslation } from 'react-i18next'
import { formatDistanceToNow } from 'date-fns'
import { zhCN, enUS } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import type { AuditLog } from '@/types'

interface ActivityTimelineProps {
  data: AuditLog[]
  loading?: boolean
}

const ACTION_COLORS: Record<string, string> = {
  LOGIN: 'bg-blue-500',
  LOGOUT: 'bg-gray-500',
  CREATE: 'bg-green-500',
  UPDATE: 'bg-yellow-500',
  DELETE: 'bg-red-500',
}

export function ActivityTimeline({ data, loading }: ActivityTimelineProps) {
  const { t, i18n } = useTranslation()

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('analytics.activityTimeline')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            {t('analytics.noData')}
          </div>
        </CardContent>
      </Card>
    )
  }

  const formatDate = (date: string) => {
    const locale = i18n.language === 'zh' ? zhCN : enUS
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t('analytics.activityTimeline')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-[300px] overflow-y-auto">
          {data.slice(0, 10).map((log) => (
            <div
              key={log.id}
              className="flex items-start gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <div
                className={`w-2 h-2 rounded-full mt-2 ${
                  ACTION_COLORS[log.action] || 'bg-gray-400'
                }`}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="text-xs">
                    {log.action}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {log.resourceType}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDate(log.createdAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 2: 验证组件编译**

```bash
npm run build
```

Expected: Build successful

---

## Task 11: 创建RecentActivityList组件

**Files:**
- Create: `src/components/charts/RecentActivityList.tsx`

- [ ] **Step 1: 创建RecentActivityList组件**

创建文件 `src/components/charts/RecentActivityList.tsx`:

```tsx
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { formatDistanceToNow } from 'date-fns'
import { zhCN, enUS } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import type { AuditLog } from '@/types'

interface RecentActivityListProps {
  data: AuditLog[]
  loading?: boolean
}

export function RecentActivityList({ data, loading }: RecentActivityListProps) {
  const { t, i18n } = useTranslation()

  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const formatDate = (date: string) => {
    const locale = i18n.language === 'zh' ? zhCN : enUS
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale })
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">{t('dashboard.recentActivity')}</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/audit-logs">{t('dashboard.viewAll')}</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {!data || data.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            {t('common.noData')}
          </div>
        ) : (
          <div className="space-y-3">
            {data.slice(0, 5).map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Badge variant="outline">{log.action}</Badge>
                  <span className="text-sm">{log.resourceType}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatDate(log.createdAt)}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 2: 验证组件编译**

```bash
npm run build
```

Expected: Build successful

---

## Task 12: 创建SystemStatusCard组件

**Files:**
- Create: `src/components/charts/SystemStatusCard.tsx`

- [ ] **Step 1: 创建SystemStatusCard组件**

创建文件 `src/components/charts/SystemStatusCard.tsx`:

```tsx
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react'

interface SystemStatusCardProps {
  status: 'ok' | 'degraded' | 'unhealthy'
  loading?: boolean
}

export function SystemStatusCard({ status, loading }: SystemStatusCardProps) {
  const { t } = useTranslation()

  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-24" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-20" />
        </CardContent>
      </Card>
    )
  }

  const statusConfig = {
    ok: {
      icon: ShieldCheck,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      label: t('system.ok'),
    },
    degraded: {
      icon: ShieldAlert,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
      label: t('system.degraded'),
    },
    unhealthy: {
      icon: ShieldX,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
      label: t('system.unhealthy'),
    },
  }

  const config = statusConfig[status] || statusConfig.unhealthy
  const Icon = config.icon

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{t('dashboard.systemStatus')}</CardTitle>
        <Icon className={`h-4 w-4 ${config.color}`} />
      </CardHeader>
      <CardContent>
        <Badge className={`${config.bgColor} ${config.color} hover:${config.bgColor}`}>
          {config.label}
        </Badge>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 2: 验证组件编译**

```bash
npm run build
```

Expected: Build successful

---

## Task 13: 更新DashboardPage

**Files:**
- Modify: `src/pages/DashboardPage.tsx`

- [ ] **Step 1: 重写DashboardPage组件**

完全替换 `src/pages/DashboardPage.tsx` 内容：

```tsx
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { systemApi, knowledgeApi, auditLogsApi } from '@/api'
import type { SystemStats, KnowledgeStats, AuditLog, SystemHealth } from '@/types'
import { Skeleton } from '@/components/ui/skeleton'
import { BookOpen, Activity, Key, ArrowRight } from 'lucide-react'
import { StatCard } from '@/components/charts/StatCard'
import { SystemStatusCard } from '@/components/charts/SystemStatusCard'
import { RequestTrendChart } from '@/components/charts/RequestTrendChart'
import { RecentActivityList } from '@/components/charts/RecentActivityList'

export function DashboardPage() {
  const { t } = useTranslation()
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null)
  const [knowledgeStats, setKnowledgeStats] = useState<KnowledgeStats | null>(null)
  const [recentLogs, setRecentLogs] = useState<AuditLog[]>([])
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sys, kn, logs, health] = await Promise.all([
          systemApi.getStats(),
          knowledgeApi.getStats(),
          auditLogsApi.list({ limit: 10 }),
          systemApi.getHealth(),
        ])
        setSystemStats(sys)
        setKnowledgeStats(kn)
        setRecentLogs(logs.data)
        setSystemHealth(health)
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-[300px]" />
          <Skeleton className="h-[300px]" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t('dashboard.title')}</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t('dashboard.knowledgeEntries')}
          value={knowledgeStats?.total ?? 0}
          icon={BookOpen}
        />
        <StatCard
          title={t('dashboard.todayRequests')}
          value={systemStats?.requests?.today ?? 0}
          icon={Activity}
        />
        <StatCard
          title={t('dashboard.activeApiKeys')}
          value={systemStats?.apiKeys?.active ?? 0}
          icon={Key}
        />
        <SystemStatusCard
          status={systemHealth?.status ?? 'unhealthy'}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <RequestTrendChart
          data={{
            today: systemStats?.requests?.today ?? 0,
            thisWeek: systemStats?.requests?.thisWeek ?? 0,
            thisMonth: systemStats?.requests?.thisMonth ?? 0,
          }}
        />
        <RecentActivityList data={recentLogs} />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: 验证Dashboard编译**

```bash
npm run build
```

Expected: Build successful

---

## Task 14: 创建AnalyticsPage

**Files:**
- Create: `src/pages/AnalyticsPage.tsx`

- [ ] **Step 1: 创建AnalyticsPage组件**

创建文件 `src/pages/AnalyticsPage.tsx`:

```tsx
import { useEffect, useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { systemApi, knowledgeApi, auditLogsApi } from '@/api'
import type { SystemStats, KnowledgeStats, AuditLog } from '@/types'
import { Skeleton } from '@/components/ui/skeleton'
import { CategoryPieChart } from '@/components/charts/CategoryPieChart'
import { QualityBarChart } from '@/components/charts/QualityBarChart'
import { ApiKeyStatusChart } from '@/components/charts/ApiKeyStatusChart'
import { RequestTrendChart } from '@/components/charts/RequestTrendChart'
import { ActionStatsChart } from '@/components/charts/ActionStatsChart'
import { ActivityTimeline } from '@/components/charts/ActivityTimeline'

export function AnalyticsPage() {
  const { t } = useTranslation()
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null)
  const [knowledgeStats, setKnowledgeStats] = useState<KnowledgeStats | null>(null)
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sys, kn, logs] = await Promise.all([
          systemApi.getStats(),
          knowledgeApi.getStats(),
          auditLogsApi.list({ limit: 500 }),
        ])
        setSystemStats(sys)
        setKnowledgeStats(kn)
        setAuditLogs(logs.data)
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const actionStats = useMemo(() => {
    const stats: Record<string, number> = {}
    auditLogs.forEach((log) => {
      stats[log.action] = (stats[log.action] || 0) + 1
    })
    return stats
  }, [auditLogs])

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="space-y-8">
          <div>
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="grid gap-4 lg:grid-cols-2">
              <Skeleton className="h-[350px]" />
              <Skeleton className="h-[350px]" />
            </div>
          </div>
          <div>
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="grid gap-4 lg:grid-cols-2">
              <Skeleton className="h-[350px]" />
              <Skeleton className="h-[350px]" />
            </div>
          </div>
          <div>
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="grid gap-4 lg:grid-cols-2">
              <Skeleton className="h-[350px]" />
              <Skeleton className="h-[350px]" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t('analytics.title')}</h1>

      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            📚 {t('analytics.knowledgeAnalysis')}
          </h2>
          <div className="grid gap-4 lg:grid-cols-2">
            <CategoryPieChart
              data={knowledgeStats?.byCategory ?? {}}
            />
            <QualityBarChart
              avgScore={knowledgeStats?.avgQualityScore}
            />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            🔐 {t('analytics.apiAnalysis')}
          </h2>
          <div className="grid gap-4 lg:grid-cols-2">
            <ApiKeyStatusChart
              data={systemStats?.apiKeys ?? { total: 0, active: 0, expired: 0 }}
            />
            <RequestTrendChart
              data={{
                today: systemStats?.requests?.today ?? 0,
                thisWeek: systemStats?.requests?.thisWeek ?? 0,
                thisMonth: systemStats?.requests?.thisMonth ?? 0,
              }}
            />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            📋 {t('analytics.auditAnalysis')}
          </h2>
          <div className="grid gap-4 lg:grid-cols-2">
            <ActionStatsChart data={actionStats} />
            <ActivityTimeline data={auditLogs} />
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: 验证Analytics编译**

```bash
npm run build
```

Expected: Build successful

---

## Task 15: 更新页面导出

**Files:**
- Modify: `src/pages/index.ts`

- [ ] **Step 1: 添加AnalyticsPage导出**

检查是否存在 `src/pages/index.ts`，如果不存在则创建：

```tsx
export { LoginPage } from './LoginPage'
export { DashboardPage } from './DashboardPage'
export { KnowledgePage } from './KnowledgePage'
export { ApiKeysPage } from './ApiKeysPage'
export { UsersPage } from './UsersPage'
export { AuditLogsPage } from './AuditLogsPage'
export { SystemPage } from './SystemPage'
export { AnalyticsPage } from './AnalyticsPage'
```

- [ ] **Step 2: 验证导出正确**

```bash
npm run build
```

Expected: Build successful

---

## Task 16: 添加Analytics路由

**Files:**
- Modify: `src/router.tsx`

- [ ] **Step 1: 导入AnalyticsPage**

在 `src/router.tsx` 第11行 `SystemPage,` 后添加：

```tsx
  AnalyticsPage,
```

- [ ] **Step 2: 添加路由配置**

在 `src/router.tsx` 第64行 `element: <SystemPage />,` 后添加：

```tsx
      },
      {
        path: '/analytics',
        element: <AnalyticsPage />,
```

- [ ] **Step 3: 验证路由编译**

```bash
npm run build
```

Expected: Build successful

---

## Task 17: 添加Analytics导航项

**Files:**
- Modify: `src/components/layout/MainLayout.tsx`

- [ ] **Step 1: 导入BarChart3图标**

在 `src/components/layout/MainLayout.tsx` 第28行 `Languages,` 后添加：

```tsx
  BarChart3,
```

- [ ] **Step 2: 添加Analytics导航项**

在 `src/components/layout/MainLayout.tsx` 第39行 `{ path: '/system', icon: Activity, labelKey: 'nav.system' },` 后添加：

```tsx
  { path: '/analytics', icon: BarChart3, labelKey: 'nav.analytics' },
```

- [ ] **Step 3: 验证导航编译**

```bash
npm run build
```

Expected: Build successful

---

## Task 18: 最终构建验证

**Files:**
- None

- [ ] **Step 1: 运行完整构建**

```bash
npm run build
```

Expected: Build successful, no errors

- [ ] **Step 2: 启动开发服务器测试**

```bash
npm run dev
```

Expected: Server starts on http://localhost:5173

- [ ] **Step 3: 提交所有更改**

```bash
git add -A
git commit -m "feat: add analytics dashboard with charts

- Add Recharts for data visualization
- Enhance Dashboard with KPI cards, request trend chart, and recent activity
- Create Analytics page with 6 charts:
  - Knowledge category distribution
  - Quality score distribution
  - API Key status
  - Request trend
  - Action statistics
  - Activity timeline
- Add chart color CSS variables for all themes
- Add i18n translations for analytics
- Update navigation with Analytics menu item"
```

Expected: Commit successful

---

## 自我审查检查清单

**1. Spec覆盖率检查:**
- [x] Dashboard顶部4个KPI卡片 - Task 13
- [x] Dashboard请求趋势图 - Task 5, 13
- [x] Dashboard最近操作记录 - Task 11, 13
- [x] Dashboard系统状态 - Task 12, 13
- [x] Analytics知识分类分布 - Task 6, 14
- [x] Analytics质量分数分布 - Task 7, 14
- [x] Analytics API Key状态 - Task 8, 14
- [x] Analytics请求趋势 - Task 5, 14
- [x] Analytics操作类型统计 - Task 9, 14
- [x] Analytics操作时间线 - Task 10, 14
- [x] Recharts安装 - Task 1
- [x] CSS变量 - Task 2
- [x] 国际化翻译 - Task 3
- [x] 路由配置 - Task 16
- [x] 导航菜单 - Task 17

**2. 占位符扫描:**
- [x] 无TBD/TODO
- [x] 所有代码步骤包含完整代码
- [x] 所有命令包含预期输出

**3. 类型一致性检查:**
- [x] SystemStats类型已存在于types/index.ts
- [x] KnowledgeStats类型已存在于types/index.ts
- [x] AuditLog类型已存在于types/index.ts
- [x] 所有组件props类型定义一致
