# 统计分析功能设计文档

**日期**: 2026-06-16  
**版本**: 1.0

## 1. 概述

基于OpenAPI文档中新增的统计接口，为知识库管理系统添加数据可视化功能，包括Dashboard概览页面和Analytics深度分析页面。

### 目标

- 提供系统核心指标的快速概览（Dashboard）
- 提供详细的统计分析和趋势展示（Analytics）
- 使用图表直观展示数据分布和趋势
- 保持良好的用户体验和响应式设计

### 新增API接口

1. `GET /admin/system/stats` - 系统统计概览
2. `GET /admin/knowledge/stats` - 知识库统计信息
3. `GET /knowledge/stats` - 业务端知识库统计（可选使用）

---

## 2. 页面结构

采用**Dashboard + Analytics双层架构**：

### 2.1 Dashboard（仪表盘）

- **定位**: 系统首页，快速概览核心KPI
- **路径**: `/dashboard`（现有页面增强）
- **受众**: 所有管理员用户
- **更新频率**: 页面加载时获取最新数据

### 2.2 Analytics（数据分析）

- **定位**: 深度统计分析页面
- **路径**: `/analytics`（新建页面）
- **受众**: 需要详细数据分析的管理员
- **更新频率**: 页面加载时获取最新数据

---

## 3. Dashboard页面设计

### 3.1 布局结构

采用**卡片行+内容区**布局：

```
┌────────────────────────────────────────────────────────────────┐
│  顶部卡片行（4个小卡片）                                         │
│  ┌──────────┬──────────┬──────────┬──────────┐                 │
│  │知识条目   │今日请求   │活跃API   │系统状态   │                 │
│  │  2,456   │  1,234   │   12     │   💚     │                 │
│  └──────────┴──────────┴──────────┴──────────┘                 │
├────────────────────────────────────────────────────────────────┤
│  内容区（2列布局）                                               │
│  ┌─────────────────────────┬─────────────────────────┐         │
│  │                         │                         │         │
│  │   请求统计趋势            │   最近操作记录           │         │
│  │   (折线图)               │   (列表)                │         │
│  │                         │                         │         │
│  └─────────────────────────┴─────────────────────────┘         │
└────────────────────────────────────────────────────────────────┘
```

### 3.2 顶部KPI卡片

| 卡片 | 数据来源 | 展示内容 |
|------|----------|----------|
| 知识条目总数 | `/admin/system/stats` → `knowledgeEntries.total` | 数字 + 环比变化 |
| 今日请求 | `/admin/system/stats` → `requests.today` | 数字 + 趋势图标 |
| 活跃API Key | `/admin/system/stats` → `apiKeys.active` | 数字 + 状态颜色 |
| 系统状态 | `/admin/system/health` → `status` | 状态图标 + 文字 |

### 3.3 内容区模块

#### 3.3.1 请求统计趋势（折线图）

- **图表类型**: 面积折线图（Area Chart）
- **数据来源**: `/admin/system/stats` → `requests`
- **展示数据**: 
  - 今日请求
  - 本周请求
  - 本月请求
- **交互**: 悬停显示具体数值

#### 3.3.2 最近操作记录（列表）

- **数据来源**: `/admin/audit-logs`（limit=10）
- **展示字段**:
  - 操作类型
  - 资源类型
  - 时间
  - 操作者
- **交互**: 点击跳转到审计日志详情

---

## 4. Analytics页面设计

### 4.1 页面导航

在侧边栏导航中添加"数据分析"菜单项：

```
仪表盘
知识条目
API密钥
用户管理
审计日志
数据分析 ← 新增
系统监控
```

### 4.2 布局结构

采用**分区块布局**，按业务逻辑分组：

```
┌────────────────────────────────────────────────────────────────┐
│  📚 知识库分析                                                   │
│  ┌─────────────────────────────┬─────────────────────────────┐ │
│  │  知识分类分布图（饼图）        │  质量分数分布（柱状图）       │ │
│  │                             │                             │ │
│  └─────────────────────────────┴─────────────────────────────┘ │
├────────────────────────────────────────────────────────────────┤
│  🔐 API & 访问                                                   │
│  ┌─────────────────────────────┬─────────────────────────────┐ │
│  │  API Key状态（饼图）          │  请求量趋势（折线图）         │ │
│  │                             │                             │ │
│  └─────────────────────────────┴─────────────────────────────┘ │
├────────────────────────────────────────────────────────────────┤
│  📋 操作审计                                                     │
│  ┌─────────────────────────────┬─────────────────────────────┐ │
│  │  操作类型统计（柱状图）        │  操作时间线（时间轴）         │ │
│  │                             │                             │ │
│  └─────────────────────────────┴─────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
```

### 4.3 图表详情

#### 4.3.1 知识分类分布图

- **图表类型**: 饼图（Pie Chart）或环形图（Donut Chart）
- **数据来源**: `/admin/knowledge/stats` → `byCategory`
- **展示内容**: 各分类的知识条目数量及占比
- **交互**: 悬停显示分类名称、数量、百分比

#### 4.3.2 质量分数分布

- **图表类型**: 柱状图（Bar Chart）
- **数据来源**: `/admin/knowledge/stats` → `avgQualityScore`
- **展示内容**: 平均质量分数（可扩展为分数区间分布）
- **配色**: 根据分数高低使用不同颜色

#### 4.3.3 API Key状态统计

- **图表类型**: 环形图（Donut Chart）
- **数据来源**: `/admin/system/stats` → `apiKeys`
- **展示内容**:
  - 活跃数量
  - 过期数量
  - 已禁用数量- 可从total - active - expired计算
- **交互**: 点击扇区跳转到API Key管理页面

#### 4.3.4 请求量趋势图

- **图表类型**: 折线图（Line Chart）
- **数据来源**: `/admin/system/stats` → `requests`
- **展示内容**: 
  - 今日请求
  - 本周请求
  - 本月请求
- **样式**: 使用渐变填充的面积图

#### 4.3.5 操作类型统计

- **图表类型**: 柱状图（Bar Chart）
- **数据来源**: `/admin/audit-logs`（前端聚合统计）
- **实现方式**: 
  1. 调用 `/admin/audit-logs?limit=1000` 获取最近1000条记录
  2. 前端按 `action` 字段分组统计
  3. 将统计数据传递给图表组件
- **展示内容**: 各类操作的发生次数
  - LOGIN（登录）
  - CREATE（创建）
  - UPDATE（更新）
  - DELETE（删除）
  - 其他操作
- **交互**: 点击柱状条跳转到对应操作类型的审计日志

#### 4.3.6 操作时间线

- **图表类型**: 时间轴列表（Timeline）
- **数据来源**: `/admin/audit-logs`
- **展示内容**: 最近的关键操作事件
- **样式**: 垂直时间轴，按时间倒序排列
- **交互**: 点击条目查看详情

---

## 5. 技术选型

### 5.1 图表库

**选择**: Recharts

**理由**:
- React生态最流行的图表库
- 声明式API，与React组件化思想一致
- TypeScript支持完善
- 文档清晰，社区活跃
- Bundle size相对较小
- 支持响应式设计

**安装依赖**:
```bash
npm install recharts
```

**核心组件**:
- `PieChart`, `Pie`, `Cell` - 饼图/环形图
- `BarChart`, `Bar`, `XAxis`, `YAxis` - 柱状图
- `LineChart`, `Line`, `Area`, `AreaChart` - 折线图/面积图
- `ResponsiveContainer` - 响应式容器
- `Tooltip`, `Legend` - 交互提示

### 5.2 图标库

使用现有的 **lucide-react** 图标库：
- `BarChart3` - 柱状图图标
- `PieChart` - 饼图图标
- `TrendingUp`, `TrendingDown` - 趋势图标
- `Activity` - 活动图标
- `Database` - 数据库图标
- `Key` - API Key图标
- `ShieldCheck` - 系统状态图标

### 5.3 数据获取

使用现有的API客户端（`src/api/client.ts`）新增统计API模块：

```typescript
// src/api/stats.ts
export const statsApi = {
  getSystemStats: () => client.get('/admin/system/stats'),
  getKnowledgeStats: () => client.get('/admin/knowledge/stats'),
}
```

---

## 6. 数据源映射

### 6.1 SystemStats 接口

```typescript
interface SystemStats {
  knowledgeEntries: {
    total: number
    byCategory: Record<string, number>
    avgQualityScore: number
  }
  apiKeys: {
    total: number
    active: number
    expired: number
  }
  requests: {
    today: number
    thisWeek: number
    thisMonth: number
  }
}
```

**使用位置**:
- Dashboard顶部卡片（total, active, today）
- Dashboard请求趋势图
- Analytics的API Key状态图

### 6.2 KnowledgeStats 接口

```typescript
interface KnowledgeStats {
  total: number
  byCategory: Record<string, number>
  avgQualityScore: number
}
```

**使用位置**:
- Analytics的知识分类分布图
- Analytics的质量分数分布

### 6.3 审计日志统计

需要从 `/admin/audit-logs` 接口获取数据进行聚合：
- 按action分组统计（操作类型统计）
- 最近N条记录（时间线展示）

---

## 7. 组件设计

### 7.1 新增组件

#### 7.1.1 Dashboard组件

**路径**: `src/pages/Dashboard.tsx`（现有文件增强）

**新增内容**:
- 顶部KPI卡片行组件 `<StatsCards />`
- 请求趋势图表组件 `<RequestTrendChart />`
- 最近操作列表组件 `<RecentActivityList />`

#### 7.1.2 Analytics页面

**路径**: `src/pages/Analytics.tsx`（新建）

**结构**:
```
Analytics
├── KnowledgeSection
│   ├── CategoryPieChart
│   └── QualityBarChart
├── ApiSection
│   ├── ApiKeyStatusChart
│   └── RequestTrendChart
└── AuditSection
    ├── ActionStatsChart
    └── ActivityTimeline
```

#### 7.1.3 图表组件

**路径**: `src/components/charts/`

```
charts/
├── PieChartCard.tsx      # 饼图卡片（带标题和图例）
├── BarChartCard.tsx      # 柱状图卡片
├── LineChartCard.tsx     # 折线图卡片
├── StatCard.tsx          # KPI统计卡片
└── Timeline.tsx          # 时间轴组件
```

### 7.2 通用设计原则

1. **卡片封装**: 每个图表封装在Card组件中，包含标题、描述、图例
2. **响应式**: 使用 `ResponsiveContainer` 确保图表自适应容器大小
3. **加载状态**: 显示骨架屏（Skeleton）
4. **错误处理**: API失败时显示错误提示，提供重试按钮
5. **空状态**: 数据为空时显示友好提示

---

## 8. 国际化支持

### 8.1 新增翻译键

**中文**（`src/i18n/locales/zh.json`）:

```json
{
  "dashboard": {
    "title": "仪表盘",
    "totalKnowledge": "知识条目总数",
    "todayRequests": "今日请求",
    "activeApiKeys": "活跃API Key",
    "systemStatus": "系统状态",
    "requestTrend": "请求统计趋势",
    "recentActivity": "最近操作记录",
    "viewAll": "查看全部"
  },
  "analytics": {
    "title": "数据分析",
    "knowledgeAnalysis": "知识库分析",
    "apiAnalysis": "API & 访问",
    "auditAnalysis": "操作审计",
    "categoryDistribution": "知识分类分布",
    "qualityDistribution": "质量分数分布",
    "apiKeyStatus": "API Key状态",
    "requestTrend": "请求量趋势",
    "actionStats": "操作类型统计",
    "activityTimeline": "操作时间线"
  }
}
```

**英文**（`src/i18n/locales/en.json`）:

```json
{
  "dashboard": {
    "title": "Dashboard",
    "totalKnowledge": "Total Knowledge Entries",
    "todayRequests": "Today's Requests",
    "activeApiKeys": "Active API Keys",
    "systemStatus": "System Status",
    "requestTrend": "Request Trend",
    "recentActivity": "Recent Activity",
    "viewAll": "View All"
  },
  "analytics": {
    "title": "Analytics",
    "knowledgeAnalysis": "Knowledge Analysis",
    "apiAnalysis": "API & Access",
    "auditAnalysis": "Audit Analysis",
    "categoryDistribution": "Category Distribution",
    "qualityDistribution": "Quality Score Distribution",
    "apiKeyStatus": "API Key Status",
    "requestTrend": "Request Trend",
    "actionStats": "Action Statistics",
    "activityTimeline": "Activity Timeline"
  }
}
```

---

## 9. 主题适配

图表颜色需要适配三套主题（light、dark、eye-comfort）：

### 9.1 颜色方案

**主色调**（使用Tailwind CSS变量）:
- 主色: `hsl(var(--primary))`
- 次色: `hsl(var(--secondary))`
- 成功: `hsl(var(--success))` - 新增
- 警告: `hsl(var(--warning))` - 新增
- 错误: `hsl(var(--destructive))`

**图表配色**（5-6色）:
```typescript
const CHART_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
]
```

### 9.2 CSS变量定义

在 `src/index.css` 中新增图表颜色变量和状态颜色变量：

```css
:root {
  /* 图表颜色 */
  --chart-1: 221 83% 53%;
  --chart-2: 142 76% 36%;
  --chart-3: 38 92% 50%;
  --chart-4: 280 65% 60%;
  --chart-5: 340 82% 52%;
  
  /* 状态颜色 */
  --success: 142 76% 36%;
  --success-foreground: 0 0% 100%;
  --warning: 38 92% 50%;
  --warning-foreground: 0 0% 100%;
}

.dark {
  /* 图表颜色 - 暗色模式提亮 */
  --chart-1: 217 91% 60%;
  --chart-2: 160 84% 39%;
  --chart-3: 48 96% 53%;
  --chart-4: 280 65% 70%;
  --chart-5: 346 77% 50%;
  
  /* 状态颜色 */
  --success: 160 84% 39%;
  --success-foreground: 0 0% 100%;
  --warning: 48 96% 53%;
  --warning-foreground: 0 0% 100%;
}

.eye-comfort {
  /* 图表颜色 - 护眼模式柔化 */
  --chart-1: 220 50% 45%;
  --chart-2: 150 45% 40%;
  --chart-3: 35 55% 48%;
  --chart-4: 280 45% 55%;
  --chart-5: 340 50% 50%;
  
  /* 状态颜色 */
  --success: 150 45% 40%;
  --success-foreground: 0 0% 100%;
  --warning: 35 55% 48%;
  --warning-foreground: 0 0% 100%;
}
```

**配色说明**:
- chart-1: 蓝色（主色调，与primary一致）
- chart-2: 绿色（成功/活跃）
- chart-3: 黄色（警告/注意）
- chart-4: 紫色（次要数据）
- chart-5: 红色（错误/重要）

---

## 10. 实现步骤

### Phase 1: 基础设施（估计1-2小时）

1. 安装 Recharts 依赖
2. 更新 TypeScript 类型定义（`src/types/index.ts`）
3. 新增统计 API 模块（`src/api/stats.ts`）
4. 更新国际化翻译文件

### Phase 2: Dashboard增强（估计2-3小时）

1. 创建 StatCard 组件
2. 创建 RequestTrendChart 组件
3. 创建 RecentActivityList 组件
4. 增强 Dashboard 页面
5. 测试 Dashboard 功能

### Phase 3: Analytics页面（估计3-4小时）

1. 创建图表卡片组件（PieChartCard, BarChartCard, LineChartCard）
2. 创建 Timeline 组件
3. 创建 Analytics 页面
4. 添加路由和导航
5. 测试 Analytics 功能

### Phase 4: 优化和测试（估计1-2小时）

1. 主题适配测试
2. 响应式测试
3. 国际化测试
4. 性能优化
5. 代码审查

**总计估计**: 7-11小时

---

## 11. 风险和缓解

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| 后端统计接口数据不完整 | 图表展示异常 | 添加空状态处理，显示"暂无数据" |
| 图表库性能问题 | 页面加载慢 | 使用懒加载，限制数据量 |
| 响应式布局问题 | 移动端显示异常 | 使用ResponsiveContainer，测试多种屏幕尺寸 |
| 主题切换图表颜色不同步 | 视觉不一致 | 使用CSS变量，图表监听主题变化 |

---

## 12. 后续扩展

### 12.1 数据刷新

- 添加手动刷新按钮
- 可选：添加自动刷新（定时轮询）

### 12.2 数据导出

- 支持图表导出为图片
- 支持数据导出为CSV/Excel

### 12.3 更多图表类型

- 知识条目创建趋势（按日期分组）
- API Key使用频率排行
- 用户活跃度分析

### 12.4 数据筛选

- 日期范围选择器
- 分类筛选器
- 自定义时间范围
