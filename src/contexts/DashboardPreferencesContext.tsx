import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { meApi } from '@/api'

interface DashboardPreferencesState {
  pinnedCharts: string[]
  loading: boolean
}

interface DashboardPreferencesContextType extends DashboardPreferencesState {
  pin: (chartId: string) => void
  unpin: (chartId: string) => void
  toggle: (chartId: string) => void
  isPinned: (chartId: string) => boolean
  setPinnedCharts: (charts: string[]) => void
  refresh: () => Promise<void>
}

const DashboardPreferencesContext = createContext<DashboardPreferencesContextType | null>(null)

const SAVE_DEBOUNCE_MS = 800

export function DashboardPreferencesProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<DashboardPreferencesState>({
    pinnedCharts: [],
    loading: true,
  })
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingSaveRef = useRef<string[] | null>(null)

  const persistToServer = useCallback((charts: string[]) => {
    pendingSaveRef.current = charts
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      const toSave = pendingSaveRef.current
      if (toSave) {
        meApi.updateDashboardPreferences(toSave).catch(() => {
          // Silently fail — preferences will be re-synced on next load
        })
        pendingSaveRef.current = null
      }
    }, SAVE_DEBOUNCE_MS)
  }, [])

  const refresh = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true }))
      const data = await meApi.getDashboardPreferences()
      setState({ pinnedCharts: data.pinnedCharts ?? [], loading: false })
    } catch {
      setState((prev) => ({ ...prev, loading: false }))
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    }
  }, [])

  const pin = useCallback(
    (chartId: string) => {
      setState((prev) => {
        if (prev.pinnedCharts.includes(chartId)) return prev
        const next = [...prev.pinnedCharts, chartId]
        persistToServer(next)
        return { ...prev, pinnedCharts: next }
      })
    },
    [persistToServer],
  )

  const unpin = useCallback(
    (chartId: string) => {
      setState((prev) => {
        const next = prev.pinnedCharts.filter((id) => id !== chartId)
        if (next.length === prev.pinnedCharts.length) return prev
        persistToServer(next)
        return { ...prev, pinnedCharts: next }
      })
    },
    [persistToServer],
  )

  const toggle = useCallback(
    (chartId: string) => {
      setState((prev) => {
        const isPinned = prev.pinnedCharts.includes(chartId)
        const next = isPinned
          ? prev.pinnedCharts.filter((id) => id !== chartId)
          : [...prev.pinnedCharts, chartId]
        persistToServer(next)
        return { ...prev, pinnedCharts: next }
      })
    },
    [persistToServer],
  )

  const isPinned = useCallback(
    (chartId: string): boolean => state.pinnedCharts.includes(chartId),
    [state.pinnedCharts],
  )

  const setPinnedCharts = useCallback(
    (charts: string[]) => {
      setState((prev) => ({ ...prev, pinnedCharts: charts }))
      persistToServer(charts)
    },
    [persistToServer],
  )

  return (
    <DashboardPreferencesContext.Provider
      value={{
        ...state,
        pin,
        unpin,
        toggle,
        isPinned,
        setPinnedCharts,
        refresh,
      }}
    >
      {children}
    </DashboardPreferencesContext.Provider>
  )
}

export function useDashboardPreferences(): DashboardPreferencesContextType {
  const context = useContext(DashboardPreferencesContext)
  if (!context) {
    throw new Error('useDashboardPreferences must be used within a DashboardPreferencesProvider')
  }
  return context
}
