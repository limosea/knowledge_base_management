import { useTranslation } from 'react-i18next'
import { useDashboardPreferences } from '@/contexts/DashboardPreferencesContext'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/components/ui/tooltip'
import { Pin, PinOff, Info } from 'lucide-react'

interface PinnableChartCardProps {
  /** Chart ID from the registry */
  chartId: string
  /** i18n description key for tooltip */
  descriptionKey: string
  /** Whether this is rendered on the dashboard (shows unpin) or analytics (shows pin) */
  mode?: 'analytics' | 'dashboard'
  /** The chart component to wrap */
  children: React.ReactNode
}

/**
 * Lightweight wrapper that overlays a pin/unpin button + description tooltip
 * on top of an existing chart component (which already has its own Card).
 *
 * Use `mode="analytics"` on analysis pages (shows pin button).
 * Use `mode="dashboard"` on the overview page (shows unpin button).
 */
export function PinnableChartCard({
  chartId,
  descriptionKey,
  mode = 'analytics',
  children,
}: PinnableChartCardProps) {
  const { t } = useTranslation()
  const { isPinned, pin, unpin } = useDashboardPreferences()
  const pinned = isPinned(chartId)

  const handleToggle = () => {
    if (pinned) {
      unpin(chartId)
    } else {
      pin(chartId)
    }
  }

  return (
    <div className="relative group">
      {children}
      {/* Overlay buttons — visible on hover or when pinned */}
      <div
        className={`absolute top-2 right-2 flex items-center gap-1 transition-opacity ${
          pinned ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}
      >
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex">
                <Info className="h-3.5 w-3.5 text-muted-foreground/70 cursor-help" />
              </span>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-xs">
              <p className="text-xs">{t(descriptionKey)}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {mode === 'analytics' && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={pinned ? 'default' : 'secondary'}
                  size="icon"
                  className="h-7 w-7 shadow-sm"
                  onClick={handleToggle}
                >
                  <Pin className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {pinned ? t('dashboard.chartPinned') : t('dashboard.pinChart')}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {mode === 'dashboard' && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-7 w-7 shadow-sm"
                  onClick={handleToggle}
                >
                  <PinOff className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {t('dashboard.unpinChart')}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  )
}
