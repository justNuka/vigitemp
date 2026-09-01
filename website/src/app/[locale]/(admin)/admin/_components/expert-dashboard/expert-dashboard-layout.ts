import type { Layout, LayoutItem } from "react-grid-layout"

import type { BreakpointKey, GridLayouts, WidgetDefinition, WidgetId } from "./expert-dashboard-types"

export const STORAGE_KEY = "vigitemp:admin-expert-layout:v2"
export const BREAKPOINTS = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 } as const
export const COLS = { lg: 24, md: 20, sm: 12, xs: 8, xxs: 4 } as const

export const DEFAULT_WIDGETS: WidgetDefinition[] = [
  { id: "alarms", w: 12, h: 13 },
  { id: "acknowledgments", w: 12, h: 13 },
  { id: "connectedUsers", w: 12, h: 13 },
  { id: "systemLogs", w: 12, h: 13 },
  { id: "backups", w: 12, h: 13 },
  { id: "unassigned", w: 12, h: 13 },
  { id: "etalons", w: 12, h: 11 },
]

export function getMinW(breakpoint: BreakpointKey): number {
  if (breakpoint === "lg") return 8
  if (breakpoint === "md") return 6
  if (breakpoint === "sm") return 6
  if (breakpoint === "xs") return 4
  return 2
}

export function getMinH(): number {
  return 9
}

export function scaleWidthForBreakpoint(baseW: number, breakpoint: BreakpointKey): number {
  const cols = COLS[breakpoint]
  const scaled = Math.round((baseW / COLS.lg) * cols)
  const minW = getMinW(breakpoint)
  return Math.max(minW, Math.min(cols, scaled))
}

export function createBreakpointLayout(widgetIds: WidgetId[], breakpoint: BreakpointKey): Layout {
  const cols = COLS[breakpoint]
  return widgetIds.map((id, idx) => {
    const def = DEFAULT_WIDGETS.find((item) => item.id === id) || { id, w: 12, h: 13 }
    const w = scaleWidthForBreakpoint(def.w, breakpoint)
    const h = def.h
    const x = ((idx * w) % cols + cols) % cols
    const y = Math.floor((idx * w) / cols) * h

    return {
      i: id,
      x,
      y,
      w,
      h,
      minW: getMinW(breakpoint),
      minH: getMinH(),
      maxW: cols,
    }
  })
}

export function createDefaultLayouts(widgetIds: WidgetId[]): GridLayouts {
  return {
    lg: createBreakpointLayout(widgetIds, "lg"),
    md: createBreakpointLayout(widgetIds, "md"),
    sm: createBreakpointLayout(widgetIds, "sm"),
    xs: createBreakpointLayout(widgetIds, "xs"),
    xxs: createBreakpointLayout(widgetIds, "xxs"),
  }
}

export function sanitizeItem(item: LayoutItem, breakpoint: BreakpointKey): LayoutItem {
  const cols = COLS[breakpoint]
  const minW = getMinW(breakpoint)
  const minH = getMinH()
  const rawW = Number.isFinite(item.w) ? Math.floor(item.w) : minW
  const rawH = Number.isFinite(item.h) ? Math.floor(item.h) : minH
  const w = Math.max(minW, Math.min(cols, rawW))
  const h = Math.max(minH, rawH)
  const rawX = Number.isFinite(item.x) ? Math.floor(item.x) : 0
  const rawY = Number.isFinite(item.y) ? Math.floor(item.y) : 0
  const x = Math.max(0, Math.min(cols - w, rawX))
  const y = Math.max(0, rawY)

  return { ...item, x, y, w, h, minW, minH, maxW: cols }
}

export function normalizeLayouts(layouts: GridLayouts, widgetIds: WidgetId[]): GridLayouts {
  const defaults = createDefaultLayouts(widgetIds)
  const normalized: GridLayouts = {}

  for (const breakpoint of Object.keys(COLS) as BreakpointKey[]) {
    const current = layouts[breakpoint] || []
    const currentMap = new Map(current.map((item) => [item.i as WidgetId, sanitizeItem(item, breakpoint)]))
    const fallbackMap = new Map((defaults[breakpoint] || []).map((item) => [item.i as WidgetId, item]))

    normalized[breakpoint] = widgetIds.map((id) =>
      currentMap.get(id) ||
      fallbackMap.get(id) || {
        i: id,
        x: 0,
        y: 0,
        w: scaleWidthForBreakpoint(12, breakpoint),
        h: 13,
        minW: getMinW(breakpoint),
        minH: getMinH(),
        maxW: COLS[breakpoint],
      },
    )
  }

  return normalized
}
