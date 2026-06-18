# 知识条目详情浏览功能设计

## 概述

为知识库管理系统的知识条目添加详情浏览功能，允许用户通过点击标题链接查看完整的条目详情。

## 背景

当前 `KnowledgePage.tsx` 中的表格只显示有限字段（title、category、tags、qualityScore、createdAt），无法查看条目的完整内容（content、summary、language、framework、difficultyLevel、structuredData 等）。

## 需求

- **使用场景**：快速预览知识条目的完整内容
- **触发方式**：点击表格中的标题链接
- **展示形式**：独立页面
- **显示字段**：content、summary、language、framework、difficultyLevel、structuredData、元数据信息

## 设计方案

### 方案选择

采用**独立详情页面**方案：

- 创建 `/knowledge/:id` 路由
- 点击标题时导航到详情页面
- 页面顶部包含"返回"按钮

### 路由设计

- 新增路由：`/knowledge/:id`
- 路由文件：`src/router.tsx`

### 页面布局

```
┌─────────────────────────────────────┐
│ ← 返回知识库列表                     │
├─────────────────────────────────────┤
│ 标题：JavaScript 异步编程指南         │
├─────────────────────────────────────┤
│ [元数据卡片]                         │
│ 分类: 前端开发  |  语言: JavaScript  │
│ 框架: -  |  难度: ★★★☆☆            │
│ 质量评分: 8.5  |  版本: v3          │
│ 创建者: admin  |  创建: 2025-01-15  │
│ 更新: 2025-01-20                    │
├─────────────────────────────────────┤
│ 标签: [异步] [Promise] [async/await] │
├─────────────────────────────────────┤
│ 摘要 (Summary)                      │
│ 本文介绍了JavaScript异步编程的核心... │
├─────────────────────────────────────┤
│ 正文 (Content)                      │
│ 支持Markdown渲染，显示完整内容...    │
├─────────────────────────────────────┤
│ 结构化数据 (Structured Data)         │
│ 以JSON格式显示，支持语法高亮...      │
└─────────────────────────────────────┘
```

### 数据获取

- 使用 `useParams` 获取路由中的 `id` 参数
- 调用 `knowledgeApi.get(id)` 获取完整条目数据
- 内容显示：直接显示纯文本，不使用Markdown渲染库（避免额外依赖）
- 结构化数据：使用 `JSON.stringify(data, null, 2)` 格式化显示，不使用语法高亮库

### 错误处理

- 加载状态：使用 Skeleton 组件显示占位
- 404：显示"条目不存在"提示
- 网络错误：显示错误提示并提供重试按钮
- 空字段：显示 `-` 或隐藏该行

## 文件变更

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/router.tsx` | 修改 | 添加 `/knowledge/:id` 路由 |
| `src/pages/KnowledgeDetailPage.tsx` | 新增 | 详情页面组件 |
| `src/pages/KnowledgePage.tsx` | 修改 | 标题改为可点击链接 |
| `src/pages/index.ts` | 修改 | 导出新组件 |
| `src/locales/zh.json` | 修改 | 添加中文翻译 |
| `src/locales/en.json` | 修改 | 添加英文翻译 |

## 国际化

新增翻译键：

- `knowledge.detail.back` - 返回按钮
- `knowledge.detail.content` - 正文标题
- `knowledge.detail.summary` - 摘要标题
- `knowledge.detail.metadata` - 元数据标题
- `knowledge.detail.notFound` - 404提示
- `knowledge.detail.loadError` - 加载失败提示
- `knowledge.detail.retry` - 重试按钮
- `knowledge.detail.version` - 版本号
- `knowledge.detail.structuredData` - 结构化数据标题

## 样式

- 使用 Tailwind CSS，与现有页面保持一致
- 响应式设计：移动端和桌面端都能正常显示
