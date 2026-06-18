# 知识条目详情浏览功能实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为知识库管理系统添加知识条目详情浏览功能，允许用户通过点击标题链接查看完整的条目详情。

**Architecture:** 创建独立的详情页面组件，通过React Router路由导航，显示知识条目的完整信息（content、summary、language、framework、difficultyLevel、structuredData、元数据）。

**Tech Stack:** React, TypeScript, React Router, Tailwind CSS, i18next

## Global Constraints

- 使用现有的UI组件库（Card、Badge、Skeleton、Button等）
- 遵循现有的代码风格和命名约定
- 支持中英文国际化
- 响应式设计，兼容移动端和桌面端

---

## 文件结构

| 文件 | 操作 | 职责 |
|------|------|------|
| `src/pages/KnowledgeDetailPage.tsx` | 新增 | 详情页面组件，显示知识条目的完整信息 |
| `src/pages/KnowledgePage.tsx` | 修改 | 标题改为可点击链接 |
| `src/pages/index.ts` | 修改 | 导出新组件 |
| `src/router.tsx` | 修改 | 添加详情页面路由 |
| `src/i18n/index.ts` | 修改 | 添加详情页面翻译键 |

---

### Task 1: 添加国际化翻译键

**Files:**
- Modify: `src/i18n/index.ts:90-112`

**Interfaces:**
- Consumes: 无
- Produces: 无

- [ ] **Step 1: 在英文翻译中添加详情页面翻译键**

在 `src/i18n/index.ts` 文件中，找到 `knowledge` 对象（约第90行），在 `allCategories` 和 `noCategory` 之间添加以下内容：

```typescript
detail: {
  back: 'Back to Knowledge List',
  content: 'Content',
  summary: 'Summary',
  metadata: 'Metadata',
  notFound: 'Entry not found',
  loadError: 'Failed to load entry',
  retry: 'Retry',
  version: 'Version',
  structuredData: 'Structured Data',
  createdBy: 'Created By',
},
```

- [ ] **Step 2: 在中文翻译中添加详情页面翻译键**

在 `src/i18n/index.ts` 文件中，找到中文翻译部分的 `knowledge` 对象（约第260行），在 `allCategories` 和 `noCategory` 之间添加以下内容：

```typescript
detail: {
  back: '返回知识库列表',
  content: '正文',
  summary: '摘要',
  metadata: '元数据',
  notFound: '条目不存在',
  loadError: '加载条目失败',
  retry: '重试',
  version: '版本',
  structuredData: '结构化数据',
  createdBy: '创建者',
},
```

- [ ] **Step 3: 运行TypeScript检查**

Run: `npx tsc --noEmit`
Expected: 无错误

- [ ] **Step 4: 提交更改**

```bash
git add src/i18n/index.ts
git commit -m "feat(i18n): add knowledge detail page translation keys"
```

---

### Task 2: 创建详情页面组件

**Files:**
- Create: `src/pages/KnowledgeDetailPage.tsx`

**Interfaces:**
- Consumes: `knowledgeApi.get(id)` (from `@/api`)
- Produces: `KnowledgeDetailPage` React component

- [ ] **Step 1: 创建详情页面组件基础结构**

```typescript
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams, useNavigate } from 'react-router-dom'
import { knowledgeApi } from '@/api'
import type { KnowledgeEntry } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, RotateCcw } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export function KnowledgeDetailPage() {
  const { t } = useTranslation()
  const { toast } = useToast()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [entry, setEntry] = useState<KnowledgeEntry | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEntry = async () => {
    if (!id) return
    
    setLoading(true)
    setError(null)
    try {
      const data = await knowledgeApi.get(id)
      setEntry(data)
    } catch (err) {
      setError(t('knowledge.detail.loadError'))
      toast({
        title: t('common.error'),
        description: t('knowledge.detail.loadError'),
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEntry()
  }, [id])

  // TODO: 继续添加页面渲染逻辑
  return <div>KnowledgeDetailPage</div>
}
```

- [ ] **Step 2: 运行TypeScript检查**

Run: `npx tsc --noEmit`
Expected: 无错误

- [ ] **Step 3: 提交基础结构**

```bash
git add src/pages/KnowledgeDetailPage.tsx
git commit -m "feat(pages): add KnowledgeDetailPage component skeleton"
```

---

### Task 3: 实现加载状态和错误处理

**Files:**
- Modify: `src/pages/KnowledgeDetailPage.tsx`

**Interfaces:**
- Consumes: 无
- Produces: 完整的加载和错误处理UI

- [ ] **Step 1: 更新组件，添加加载状态和错误处理**

替换 `src/pages/KnowledgeDetailPage.tsx` 的返回部分：

```typescript
export function KnowledgeDetailPage() {
  const { t } = useTranslation()
  const { toast } = useToast()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [entry, setEntry] = useState<KnowledgeEntry | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEntry = async () => {
    if (!id) return
    
    setLoading(true)
    setError(null)
    try {
      const data = await knowledgeApi.get(id)
      setEntry(data)
    } catch (err) {
      setError(t('knowledge.detail.loadError'))
      toast({
        title: t('common.error'),
        description: t('knowledge.detail.loadError'),
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEntry()
  }, [id])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-24" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !entry) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate('/knowledge')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">{t('knowledge.detail.notFound')}</h1>
        </div>
        <Card>
          <CardContent className="py-8">
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">{error || t('knowledge.detail.notFound')}</p>
              <Button onClick={fetchEntry}>
                <RotateCcw className="h-4 w-4 mr-2" />
                {t('knowledge.detail.retry')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // TODO: 继续添加成功状态的渲染逻辑
  return <div>Success</div>
}
```

- [ ] **Step 2: 运行TypeScript检查**

Run: `npx tsc --noEmit`
Expected: 无错误

- [ ] **Step 3: 提交加载和错误处理**

```bash
git add src/pages/KnowledgeDetailPage.tsx
git commit -m "feat(pages): add loading and error states to KnowledgeDetailPage"
```

---

### Task 4: 实现详情页面主内容渲染

**Files:**
- Modify: `src/pages/KnowledgeDetailPage.tsx`

**Interfaces:**
- Consumes: `KnowledgeEntry` 类型
- Produces: 完整的详情页面UI

- [ ] **Step 1: 更新组件，添加主内容渲染**

替换 `src/pages/KnowledgeDetailPage.tsx` 中最后的 `return` 部分（在成功状态判断之后）：

```typescript
  const getDifficultyStars = (level: number | undefined) => {
    if (!level) return '-'
    return '★'.repeat(level) + '☆'.repeat(5 - level)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate('/knowledge')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">{entry.title}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('knowledge.detail.metadata')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">{t('knowledge.category')}</p>
              <p className="font-medium">
                {entry.category ? (
                  <Badge variant="outline">{entry.category}</Badge>
                ) : '-'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('knowledge.language')}</p>
              <p className="font-medium">{entry.language || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('knowledge.framework')}</p>
              <p className="font-medium">{entry.framework || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('knowledge.difficultyLevel')}</p>
              <p className="font-medium">{getDifficultyStars(entry.difficultyLevel)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('knowledge.qualityScore')}</p>
              <p className="font-medium">
                {entry.qualityScore !== undefined ? entry.qualityScore.toFixed(1) : '-'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('knowledge.detail.version')}</p>
              <p className="font-medium">v{entry.entryVersion}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('knowledge.detail.createdBy')}</p>
              <p className="font-medium">{entry.createdBy}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('common.createdAt')}</p>
              <p className="font-medium">{formatDate(entry.createdAt)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('common.updatedAt')}</p>
              <p className="font-medium">{formatDate(entry.updatedAt)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {entry.tags && entry.tags.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-2">
              {entry.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {entry.summary && (
        <Card>
          <CardHeader>
            <CardTitle>{t('knowledge.detail.summary')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{entry.summary}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t('knowledge.detail.content')}</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="whitespace-pre-wrap font-sans text-sm">{entry.content}</pre>
        </CardContent>
      </Card>

      {entry.structuredData && Object.keys(entry.structuredData).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('knowledge.detail.structuredData')}</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
              {JSON.stringify(entry.structuredData, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
```

- [ ] **Step 2: 运行TypeScript检查**

Run: `npx tsc --noEmit`
Expected: 无错误

- [ ] **Step 3: 提交主内容渲染**

```bash
git add src/pages/KnowledgeDetailPage.tsx
git commit -m "feat(pages): implement KnowledgeDetailPage full UI"
```

---

### Task 5: 导出新组件

**Files:**
- Modify: `src/pages/index.ts`

**Interfaces:**
- Consumes: `KnowledgeDetailPage` 组件
- Produces: 导出的 `KnowledgeDetailPage`

- [ ] **Step 1: 在 index.ts 中导出新组件**

在 `src/pages/index.ts` 文件中，在 `KnowledgePage` 导出之后添加：

```typescript
export { KnowledgeDetailPage } from './KnowledgeDetailPage'
```

- [ ] **Step 2: 运行TypeScript检查**

Run: `npx tsc --noEmit`
Expected: 无错误

- [ ] **Step 3: 提交导出更改**

```bash
git add src/pages/index.ts
git commit -m "feat(pages): export KnowledgeDetailPage component"
```

---

### Task 6: 添加路由配置

**Files:**
- Modify: `src/router.tsx`

**Interfaces:**
- Consumes: `KnowledgeDetailPage` 组件
- Produces: `/knowledge/:id` 路由

- [ ] **Step 1: 导入新组件**

在 `src/router.tsx` 文件顶部的导入语句中，在 `KnowledgePage` 之后添加 `KnowledgeDetailPage`：

```typescript
import {
  LoginPage,
  DashboardPage,
  KnowledgePage,
  KnowledgeDetailPage,
  CategoriesPage,
  ApiKeysPage,
  UsersPage,
  AuditLogsPage,
  SystemPage,
  AnalyticsPage,
} from '@/pages'
```

- [ ] **Step 2: 添加路由配置**

在 `src/router.tsx` 文件中，在 `/knowledge` 路由之后添加详情页面路由：

```typescript
{
  path: '/knowledge',
  element: <KnowledgePage />,
},
{
  path: '/knowledge/:id',
  element: <KnowledgeDetailPage />,
},
```

- [ ] **Step 3: 运行TypeScript检查**

Run: `npx tsc --noEmit`
Expected: 无错误

- [ ] **Step 4: 提交路由配置**

```bash
git add src/router.tsx
git commit -m "feat(router): add route for knowledge detail page"
```

---

### Task 7: 修改知识列表页面标题为可点击链接

**Files:**
- Modify: `src/pages/KnowledgePage.tsx:301`

**Interfaces:**
- Consumes: `useNavigate` hook
- Produces: 可点击的标题链接

- [ ] **Step 1: 导入 useNavigate**

在 `src/pages/KnowledgePage.tsx` 文件顶部，在 `import { useTranslation } from 'react-i18next'` 之后添加：

```typescript
import { useNavigate } from 'react-router-dom'
```

- [ ] **Step 2: 在组件中使用 useNavigate**

在 `KnowledgePage` 组件内部，在 `const { toast } = useToast()` 之后添加：

```typescript
const navigate = useNavigate()
```

- [ ] **Step 3: 修改标题单元格为可点击链接**

在 `src/pages/KnowledgePage.tsx` 文件中，找到表格中的标题单元格（约第301行）：

将：
```typescript
<TableCell className="font-medium">{entry.title}</TableCell>
```

改为：
```typescript
<TableCell className="font-medium">
  <button
    onClick={() => navigate(`/knowledge/${entry.id}`)}
    className="text-primary hover:underline text-left"
  >
    {entry.title}
  </button>
</TableCell>
```

- [ ] **Step 4: 运行TypeScript检查**

Run: `npx tsc --noEmit`
Expected: 无错误

- [ ] **Step 5: 提交标题链接更改**

```bash
git add src/pages/KnowledgePage.tsx
git commit -m "feat(pages): make knowledge entry title clickable link"
```

---

### Task 8: 验证和最终测试

**Files:**
- None (verification only)

**Interfaces:**
- Consumes: 所有之前任务的实现
- Produces: 验证通过的功能

- [ ] **Step 1: 运行TypeScript检查**

Run: `npx tsc --noEmit`
Expected: 无错误

- [ ] **Step 2: 运行构建**

Run: `npm run build`
Expected: 构建成功，无错误

- [ ] **Step 3: 启动开发服务器进行手动测试**

Run: `npm run dev`
Expected: 开发服务器启动成功

- [ ] **Step 4: 手动测试清单**

1. 访问 `/knowledge` 页面，确认标题显示为可点击链接
2. 点击任意标题，确认导航到 `/knowledge/:id` 详情页面
3. 确认详情页面显示：标题、元数据、标签、摘要、正文、结构化数据
4. 点击"返回"按钮，确认返回到 `/knowledge` 列表页
5. 测试加载状态（Skeleton显示）
6. 测试错误状态（访问不存在的ID，显示错误提示和重试按钮）

- [ ] **Step 5: 最终提交**

```bash
git add -A
git commit -m "feat: complete knowledge detail page feature"
```
