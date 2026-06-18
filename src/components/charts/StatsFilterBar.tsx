import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export type StatsPeriod = 'day' | 'week' | 'month'

export interface StatsFilterState {
  period: StatsPeriod
  from?: string
  to?: string
}

interface StatsFilterBarProps {
  value: StatsFilterState
  onChange: (value: StatsFilterState) => void
}

function daysAgoISO(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return `${d.toISOString().slice(0, 10)}T00:00:00.000Z`
}

export function StatsFilterBar({ value, onChange }: StatsFilterBarProps) {
  const { t } = useTranslation()
  const [draftFrom, setDraftFrom] = useState('')
  const [draftTo, setDraftTo] = useState('')

  const setPeriod = (period: StatsPeriod) => {
    onChange({ ...value, period })
  }

  const applyPreset = (days: number) => {
    onChange({
      ...value,
      from: daysAgoISO(days),
      to: new Date().toISOString(),
    })
    setDraftFrom('')
    setDraftTo('')
  }

  const applyCustom = () => {
    if (!draftFrom || !draftTo) return
    onChange({
      ...value,
      from: new Date(`${draftFrom}T00:00:00.000Z`).toISOString(),
      to: new Date(`${draftTo}T23:59:59.999Z`).toISOString(),
    })
  }

  const periodBtn = (p: StatsPeriod) =>
    cn(
      'h-8 px-3 text-xs rounded-md border transition-colors',
      value.period === p
        ? 'bg-primary text-primary-foreground border-primary'
        : 'bg-background hover:bg-accent border-input'
    )

  const presetBtn = 'h-8 px-3 text-xs rounded-md border border-input bg-background hover:bg-accent transition-colors'
  const hasCustomDraft = Boolean(draftFrom && draftTo)

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-card p-3">
      <div className="flex items-center gap-1">
        <span className="text-xs text-muted-foreground mr-1">
          {t('filter.granularity')}
        </span>
        <button type="button" className={periodBtn('day')} onClick={() => setPeriod('day')}>
          {t('filter.day')}
        </button>
        <button type="button" className={periodBtn('week')} onClick={() => setPeriod('week')}>
          {t('filter.week')}
        </button>
        <button type="button" className={periodBtn('month')} onClick={() => setPeriod('month')}>
          {t('filter.month')}
        </button>
      </div>

      <div className="h-6 w-px bg-border" />

      <div className="flex items-center gap-1">
        <span className="text-xs text-muted-foreground mr-1">
          {t('filter.timeRange')}
        </span>
        <button
          type="button"
          className={presetBtn}
          onClick={() => applyPreset(7)}
        >
          {t('filter.preset7d')}
        </button>
        <button
          type="button"
          className={presetBtn}
          onClick={() => applyPreset(30)}
        >
          {t('filter.preset30d')}
        </button>
        <button
          type="button"
          className={presetBtn}
          onClick={() => applyPreset(90)}
        >
          {t('filter.preset90d')}
        </button>
      </div>

      <div className="h-6 w-px bg-border" />

      <div className="flex items-center gap-1.5">
        <Input
          type="date"
          value={draftFrom}
          onChange={(e) => setDraftFrom(e.target.value)}
          className="h-8 w-36 text-xs"
          aria-label={t('filter.from')}
        />
        <span className="text-xs text-muted-foreground">–</span>
        <Input
          type="date"
          value={draftTo}
          onChange={(e) => setDraftTo(e.target.value)}
          className="h-8 w-36 text-xs"
          aria-label={t('filter.to')}
        />
        <Button
          size="sm"
          variant="outline"
          className="h-8 text-xs"
          disabled={!hasCustomDraft}
          onClick={applyCustom}
        >
          {t('filter.apply')}
        </Button>
      </div>
    </div>
  )
}

export function toApiDateString(d: string | undefined): string | undefined {
  if (!d) return undefined
  if (d.endsWith('Z') || d.includes('T')) return d
  return new Date(`${d}T00:00:00.000Z`).toISOString()
}
