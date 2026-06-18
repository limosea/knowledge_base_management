import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { StatsFilterBar, type StatsFilterState } from './StatsFilterBar'

interface AnalyticsSectionProps {
  title: string
  icon: LucideIcon
  defaultExpanded?: boolean
  children: (filter: StatsFilterState) => React.ReactNode
  defaultFilter?: StatsFilterState
  storageKey?: string
}

export function AnalyticsSection({
  title,
  icon: Icon,
  defaultExpanded = false,
  children,
  defaultFilter = { period: 'day' },
  storageKey,
}: AnalyticsSectionProps) {
  const [expanded, setExpanded] = useState(() => {
    if (!storageKey || typeof window === 'undefined') return defaultExpanded
    try {
      const saved = window.localStorage.getItem(storageKey)
      if (saved !== null) return saved === '1'
    } catch {
      // ignore storage errors
    }
    return defaultExpanded
  })

  const [filter, setFilter] = useState<StatsFilterState>(defaultFilter)

  const toggle = () => {
    const next = !expanded
    setExpanded(next)
    if (storageKey && typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(storageKey, next ? '1' : '0')
      } catch {
        // ignore storage errors
      }
    }
  }

  return (
    <section className="rounded-lg border bg-card">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={expanded}
        className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-accent/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>
        <ChevronDown
          className={cn(
            'h-5 w-5 text-muted-foreground transition-transform duration-200',
            expanded && 'rotate-180'
          )}
        />
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-4">
          <StatsFilterBar value={filter} onChange={setFilter} />
          {children(filter)}
        </div>
      )}
    </section>
  )
}
