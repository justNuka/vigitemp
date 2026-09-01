"use client"

import { useEffect, useMemo, useState } from "react"
import { Responsive, useContainerWidth } from "react-grid-layout"
import { getCompactor } from "react-grid-layout/core"
import type { Layout, LayoutItem } from "react-grid-layout"
import { Grip, Trash2 } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { renderExpertWidget } from "./expert-dashboard/expert-widget-renderer"
import { ExpertWidgetToolbox } from "./expert-dashboard/expert-widget-toolbox"
import { BREAKPOINTS, COLS, DEFAULT_WIDGETS, STORAGE_KEY, createDefaultLayouts, normalizeLayouts, sanitizeItem } from "./expert-dashboard/expert-dashboard-layout"
import type { BreakpointKey, GridLayouts, Props, WidgetId } from "./expert-dashboard/expert-dashboard-types"

export function ExpertAdminDashboard({ metrics }: Props) {
  const t = useTranslations("adminDashboard")
  const locale = useLocale()
  const [isEditMode, setIsEditMode] = useState(false)

  const allWidgetDefs = useMemo(
    () => DEFAULT_WIDGETS.filter((widget) => widget.id !== "etalons"),
    [],
  )
  const defaultWidgetIds = useMemo(() => allWidgetDefs.map((widget) => widget.id), [allWidgetDefs])
  const [widgetIds, setWidgetIds] = useState<WidgetId[]>(defaultWidgetIds)
  const [layouts, setLayouts] = useState<GridLayouts>(() => createDefaultLayouts(defaultWidgetIds))
  const accessLabel = t("links.access")

  const { containerRef, width } = useContainerWidth()
  const widthReady = width > 0

  useEffect(() => {
    const resolvedWidgets = defaultWidgetIds
    let syncTimer: number | null = null

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) {
        syncTimer = window.setTimeout(() => {
          setWidgetIds(resolvedWidgets)
          setLayouts(createDefaultLayouts(resolvedWidgets))
        }, 0)
        return
      }

      const parsed = JSON.parse(raw) as { widgetIds?: WidgetId[]; layouts?: GridLayouts }
      const storedWidgets = (parsed.widgetIds || []).filter((id) => resolvedWidgets.includes(id))
      const missingWidgets = resolvedWidgets.filter((id) => !storedWidgets.includes(id))
      const nextWidgetIds = [...storedWidgets, ...missingWidgets]

      syncTimer = window.setTimeout(() => {
        setWidgetIds(nextWidgetIds)
        setLayouts(normalizeLayouts(parsed.layouts || {}, resolvedWidgets))
      }, 0)
    } catch {
      // Ignore invalid local storage values and keep default layout.
    }

    return () => {
      if (syncTimer !== null) {
        window.clearTimeout(syncTimer)
      }
    }
  }, [defaultWidgetIds])

  useEffect(() => {
    try {
      const nextLayouts = normalizeLayouts(layouts, widgetIds)
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ widgetIds, layouts: nextLayouts }))
    } catch {
      // Ignore local storage write errors.
    }
  }, [layouts, widgetIds])

  const availableWidgets = allWidgetDefs.filter((widget) => !widgetIds.includes(widget.id))

  const addWidget = (id: WidgetId, position?: Pick<LayoutItem, "x" | "y">) => {
    if (widgetIds.includes(id)) return

    const nextWidgetIds = [...widgetIds, id]
    setWidgetIds(nextWidgetIds)

    setLayouts((prev) => {
      const next = normalizeLayouts(prev, widgetIds)
      const defaults = createDefaultLayouts([id])

      for (const breakpoint of Object.keys(COLS) as BreakpointKey[]) {
        const template = (defaults[breakpoint] || [])[0]
        if (!template) continue

        const placed = sanitizeItem(
          {
            ...template,
            x: position?.x ?? template.x,
            y: position?.y ?? template.y,
          },
          breakpoint,
        )

        next[breakpoint] = [...(next[breakpoint] || []), placed]
      }

      return normalizeLayouts(next, nextWidgetIds)
    })
  }

  const removeWidget = (id: WidgetId) => {
    const nextWidgetIds = widgetIds.filter((widgetId) => widgetId !== id)
    setWidgetIds(nextWidgetIds)

    setLayouts((prev) => {
      const next: GridLayouts = {}
      for (const breakpoint of Object.keys(COLS) as BreakpointKey[]) {
        next[breakpoint] = (prev[breakpoint] || []).filter((layout) => layout.i !== id)
      }
      return normalizeLayouts(next, nextWidgetIds)
    })
  }

  return (
    <div className="space-y-4 overflow-x-hidden p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">{t("expert.description")}</p>
        <Button variant="outline" type="button" onClick={() => setIsEditMode((prev) => !prev)}>
          <Grip className="mr-2 h-4 w-4" />
          {isEditMode ? t("expert.done") : t("expert.edit")}
        </Button>
      </div>

      {isEditMode ? <ExpertWidgetToolbox widgets={availableWidgets} t={t} onAddWidget={addWidget} /> : null}

      <div ref={containerRef} className="overflow-x-hidden">
        {widthReady ? (
          <Responsive
            className="layout"
            layouts={normalizeLayouts(layouts, widgetIds)}
            cols={COLS}
            breakpoints={BREAKPOINTS}
            width={width}
            rowHeight={18}
            margin={[12, 12]}
            containerPadding={[0, 0]}
            dragConfig={{ enabled: isEditMode }}
            resizeConfig={{ enabled: isEditMode }}
            dropConfig={{ enabled: isEditMode, defaultItem: { w: 12, h: 13 } }}
            compactor={getCompactor("vertical", false, false)}
            onLayoutChange={(_currentLayout: Layout, allLayouts: Partial<Record<BreakpointKey, Layout>>) =>
              setLayouts(normalizeLayouts(allLayouts, widgetIds))
            }
            onDrop={(_layout: Layout, item: LayoutItem | undefined, event: Event) => {
              if (!item) return
              const dragEvent = event as DragEvent
              const widgetId = dragEvent.dataTransfer?.getData("text/plain") as WidgetId
              if (widgetId) addWidget(widgetId, { x: item.x, y: item.y })
            }}
            droppingItem={{ i: "__dropping__", x: 0, y: 0, w: 12, h: 13 }}
          >
            {widgetIds.map((id) => (
              <div key={id} className="min-h-0">
                <div className="relative h-full overflow-hidden">
                  {isEditMode ? (
                    <button
                      type="button"
                      aria-label={t("expert.remove")}
                      className="absolute right-2 top-2 z-10 rounded-md bg-white/90 p-1 text-slate-600 shadow hover:text-red-600 dark:bg-slate-900/90"
                      onClick={() => removeWidget(id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  ) : null}
                  {renderExpertWidget({ id, locale, metrics, accessLabel, t })}
                </div>
              </div>
            ))}
          </Responsive>
        ) : null}
      </div>
    </div>
  )
}
