# MyAnalyticsPage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a personal analytics page for users to view their own knowledge, search, and API usage analytics.

**Architecture:** Add a new page component `MyAnalyticsPage` that composes three existing analytics section components, wire it into the router and navigation, and add i18n translations for both English and Chinese.

**Tech Stack:** React, TypeScript, react-i18next, react-router-dom, lucide-react (BarChart3 icon)

## Global Constraints

- Use existing component patterns (see `src/pages/DashboardPage.tsx` for reference)
- Follow existing i18n structure (en/zh translation objects)
- Navigation items use `labelKey` referencing `nav.*` translations
- Route path: `/me/analytics`
- All translations must be in both `en` and `zh` locales

---

### Task 7: Create MyAnalyticsPage

**Files:**
- Create: `src/pages/MyAnalyticsPage.tsx`
- Modify: `src/pages/index.ts` (add export)

**Interfaces:**
- Consumes: `MyKnowledgeSection`, `MySearchSection`, `MyApiUsageSection` from `@/components/analytics`
- Produces: `MyAnalyticsPage` component exported from `@/pages`

- [ ] **Step 1: Create the page component**

```typescript
// src/pages/MyAnalyticsPage.tsx
import { useTranslation } from 'react-i18next'
import { MyKnowledgeSection } from '@/components/analytics/MyKnowledgeSection'
import { MySearchSection } from '@/components/analytics/MySearchSection'
import { MyApiUsageSection } from '@/components/analytics/MyApiUsageSection'

export function MyAnalyticsPage() {
  const { t } = useTranslation()

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">{t('myAnalytics.title')}</h1>

      <section>
        <h2 className="text-xl font-semibold mb-4">{t('myAnalytics.knowledgeSection')}</h2>
        <MyKnowledgeSection />
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">{t('myAnalytics.searchSection')}</h2>
        <MySearchSection />
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">{t('myAnalytics.apiUsageSection')}</h2>
        <MyApiUsageSection />
      </section>
    </div>
  )
}
```

- [ ] **Step 2: Add export to index.ts**

Append to end of `src/pages/index.ts`:
```typescript
export { MyAnalyticsPage } from './MyAnalyticsPage'
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors related to MyAnalyticsPage

---

### Task 8: Add Route and Navigation

**Files:**
- Modify: `src/router.tsx` (add import + route)
- Modify: `src/components/layout/MainLayout.tsx` (add icon import + nav item)

**Interfaces:**
- Consumes: `MyAnalyticsPage` from `@/pages`
- Produces: Route at `/me/analytics`, nav item in personal console section

- [ ] **Step 1: Add import to router.tsx**

Add `MyAnalyticsPage` to the import from `@/pages` (line 6-25):
```typescript
import {
  LoginPage,
  ChangePasswordPage,
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
  MyApiKeysPage,
  RolesPage,
  MessagesPage,
  MyAnalyticsPage,
} from '@/pages'
```

- [ ] **Step 2: Add route entry**

Add after the `/messages` route (after line 91) inside MainLayout children:
```typescript
{
  path: '/me/analytics',
  element: <MyAnalyticsPage />,
},
```

- [ ] **Step 3: Add BarChart3 import to MainLayout.tsx**

Add `BarChart3` to the lucide-react import (line 18-32):
```typescript
import {
  LayoutDashboard,
  BookOpen,
  Tag,
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
```

- [ ] **Step 4: Add nav item to personal console section**

Add after the messages item (after line 67) in `navSections`:
```typescript
{
  path: '/me/analytics',
  icon: BarChart3,
  labelKey: 'nav.myAnalytics',
},
```

- [ ] **Step 5: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors (i18n keys will be resolved after Task 9)

---

### Task 9: Add i18n Translations

**Files:**
- Modify: `src/i18n/index.ts` (add en + zh translations)

**Interfaces:**
- Consumes: None
- Produces: `myAnalytics.*` and `nav.myAnalytics` translation keys in both locales

- [ ] **Step 1: Add English nav.myAnalytics**

In the `en` translation object, `nav` section, add after `messages: 'Messages'` (line 71):
```typescript
myAnalytics: 'My Analytics',
```

- [ ] **Step 2: Add English myAnalytics section**

In the `en` translation object, add a new `myAnalytics` section after the `elevation` section (after line 521):
```typescript
myAnalytics: {
  title: 'My Analytics',
  knowledgeSection: 'Knowledge Analysis',
  searchSection: 'Search Analysis',
  apiUsageSection: 'API Usage',
},
```

- [ ] **Step 3: Add Chinese nav.myAnalytics**

In the `zh` translation object, `nav` section, add after `messages: '站内信'` (line 589):
```typescript
myAnalytics: '我的分析',
```

- [ ] **Step 4: Add Chinese myAnalytics section**

In the `zh` translation object, add a new `myAnalytics` section after the `elevation` section (after line 1039):
```typescript
myAnalytics: {
  title: '我的分析',
  knowledgeSection: '知识库分析',
  searchSection: '搜索分析',
  apiUsageSection: 'API 使用',
},
```

- [ ] **Step 5: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 6: Commit**

```bash
git add src/pages/MyAnalyticsPage.tsx src/pages/index.ts src/router.tsx src/components/layout/MainLayout.tsx src/i18n/index.ts
git commit -m "feat: add MyAnalyticsPage with route, navigation, and i18n"
```

---

### Verification

- [ ] **Run type check**

```bash
npx tsc --noEmit
```

Expected: Exit code 0, no errors

- [ ] **Write report**

Write report to `/root/knowledge_base_management/.git/sdd/task-7-report.md` with:
- Status
- Commit SHA + subject
- Test summary
