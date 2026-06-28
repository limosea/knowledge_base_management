/**
 * Chart Registry — central catalogue of all pinnable charts.
 *
 * Each entry describes a chart's metadata so the dashboard can render it
 * dynamically when pinned, and the analytics pages can show a pin button.
 */

export type ChartCategory = 'knowledge' | 'search' | 'api' | 'leaderboard'
export type ChartScope = 'personal' | 'global' | 'both'
export type ChartSize = 'md' | 'lg' | 'full'

export interface ChartDefinition {
  /** Unique identifier stored in user preferences */
  id: string
  /** i18n key for chart title */
  titleKey: string
  /** i18n key for short description shown as tooltip */
  descriptionKey: string
  /** Which analytics section this chart belongs to */
  category: ChartCategory
  /** Whether this chart is for personal/global/both scopes */
  scope: ChartScope
  /** Layout size: md=half, lg=two-thirds, full=full-width */
  size: ChartSize
}

export const CHART_REGISTRY: ChartDefinition[] = [
  // ── Knowledge Analysis ─────────────────────────────────────
  {
    id: 'knowledge-trends',
    titleKey: 'charts.knowledgeTrends',
    descriptionKey: 'charts.descriptions.knowledgeTrends',
    category: 'knowledge',
    scope: 'global',
    size: 'md',
  },
  {
    id: 'quality-distribution',
    titleKey: 'charts.qualityDistribution',
    descriptionKey: 'charts.descriptions.qualityDistribution',
    category: 'knowledge',
    scope: 'both',
    size: 'md',
  },
  {
    id: 'embedding-coverage',
    titleKey: 'charts.embeddingCoverage',
    descriptionKey: 'charts.descriptions.embeddingCoverage',
    category: 'knowledge',
    scope: 'both',
    size: 'md',
  },
  {
    id: 'top-tags',
    titleKey: 'charts.topTags',
    descriptionKey: 'charts.descriptions.topTags',
    category: 'knowledge',
    scope: 'both',
    size: 'md',
  },
  {
    id: 'category-distribution',
    titleKey: 'charts.categoryDistribution',
    descriptionKey: 'charts.descriptions.categoryDistribution',
    category: 'knowledge',
    scope: 'both',
    size: 'md',
  },
  {
    id: 'language-distribution',
    titleKey: 'charts.languageDistribution',
    descriptionKey: 'charts.descriptions.languageDistribution',
    category: 'knowledge',
    scope: 'both',
    size: 'md',
  },
  {
    id: 'personal-knowledge-trends',
    titleKey: 'charts.knowledgeTrends',
    descriptionKey: 'charts.descriptions.personalKnowledgeTrends',
    category: 'knowledge',
    scope: 'personal',
    size: 'full',
  },

  // ── Search Analysis ────────────────────────────────────────
  {
    id: 'search-volume-trend',
    titleKey: 'charts.searchVolumeTrend',
    descriptionKey: 'charts.descriptions.searchVolumeTrend',
    category: 'search',
    scope: 'both',
    size: 'md',
  },
  {
    id: 'search-analytics',
    titleKey: 'charts.searchAnalytics',
    descriptionKey: 'charts.descriptions.searchAnalytics',
    category: 'search',
    scope: 'global',
    size: 'md',
  },
  {
    id: 'top-search-ips',
    titleKey: 'charts.topSearchIps',
    descriptionKey: 'charts.descriptions.topSearchIps',
    category: 'search',
    scope: 'both',
    size: 'md',
  },

  // ── API Analysis ───────────────────────────────────────────
  {
    id: 'request-trend',
    titleKey: 'charts.requestTrend',
    descriptionKey: 'charts.descriptions.requestTrend',
    category: 'api',
    scope: 'global',
    size: 'md',
  },
  {
    id: 'status-code-distribution',
    titleKey: 'charts.statusCodeDistribution',
    descriptionKey: 'charts.descriptions.statusCodeDistribution',
    category: 'api',
    scope: 'global',
    size: 'md',
  },
  {
    id: 'api-key-status',
    titleKey: 'charts.apiKeyUsage',
    descriptionKey: 'charts.descriptions.apiKeyStatus',
    category: 'api',
    scope: 'global',
    size: 'md',
  },
  {
    id: 'top-endpoints',
    titleKey: 'charts.topEndpoints',
    descriptionKey: 'charts.descriptions.topEndpoints',
    category: 'api',
    scope: 'global',
    size: 'full',
  },
  {
    id: 'top-api-keys',
    titleKey: 'charts.topApiKeysToday',
    descriptionKey: 'charts.descriptions.topApiKeys',
    category: 'api',
    scope: 'global',
    size: 'full',
  },

  // ── Leaderboard ────────────────────────────────────────────
  {
    id: 'personal-leaderboard',
    titleKey: 'charts.personalLeaderboard',
    descriptionKey: 'charts.descriptions.personalLeaderboard',
    category: 'leaderboard',
    scope: 'personal',
    size: 'full',
  },
  {
    id: 'global-leaderboard',
    titleKey: 'charts.globalLeaderboard',
    descriptionKey: 'charts.descriptions.globalLeaderboard',
    category: 'leaderboard',
    scope: 'global',
    size: 'full',
  },
]

/** Helper: look up a chart definition by ID */
export function getChartDef(id: string): ChartDefinition | undefined {
  return CHART_REGISTRY.find((c) => c.id === id)
}

/** Helper: get charts filtered by scope */
export function getChartsByScope(scope: ChartScope): ChartDefinition[] {
  return CHART_REGISTRY.filter((c) => c.scope === scope || c.scope === 'both')
}

/** Helper: get charts filtered by category */
export function getChartsByCategory(category: ChartCategory): ChartDefinition[] {
  return CHART_REGISTRY.filter((c) => c.category === category)
}

/** CSS class for a chart's grid column span based on its size */
export function chartSizeClass(size: ChartSize): string {
  switch (size) {
    case 'md':
      return 'col-span-12 md:col-span-6'
    case 'lg':
      return 'col-span-12 md:col-span-8'
    case 'full':
      return 'col-span-12'
  }
}
