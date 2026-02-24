"use client"

import { useEffect, useMemo, useState } from "react"
import type { ReactNode } from "react"
import { Link } from "@/i18n/navigation"
import { useLocale, useTranslations } from "next-intl"
import { Responsive, useContainerWidth } from "react-grid-layout"
import { getCompactor } from "react-grid-layout/core"
import type { Layout, LayoutItem } from "react-grid-layout"
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Clock,
  Cpu,
  Database,
  Grip,
  Plus,
  Ruler,
  Trash2,
  Users,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type WidgetId =
  | "alarms"
  | "acknowledgments"
  | "connectedUsers"
  | "systemLogs"
  | "backups"
  | "unassigned"
  | "etalons"

type Metrics = {
  alarmsInProgressTotal: number
  alarmsPendingAckTotal: number
  acknowledgmentsTotal: number
  connectedUsersTotal: number
  systemLogsTotal: number
  backupsTotal: number
  unassignedTotal: number
  latestAck: string
  latestAuditAction: string
  latestConnectedLabel: string
  lastBackupLabel: string
  hideStandards: boolean
}

type Props = { metrics: Metrics }
type GridLayouts = Partial<Record<BreakpointKey, Layout>>

type WidgetDefinition = {
  id: WidgetId
  w: number
  h: number
}

const STORAGE_KEY = "vigitemp:admin-expert-layout:v2"

const BREAKPOINTS = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 } as const
const COLS = { lg: 24, md: 20, sm: 12, xs: 8, xxs: 4 } as const

type BreakpointKey = keyof typeof COLS

const DEFAULT_WIDGETS: WidgetDefinition[] = [
  { id: "alarms", w: 12, h: 13 },
  { id: "acknowledgments", w: 12, h: 13 },
  { id: "connectedUsers", w: 12, h: 13 },
  { id: "systemLogs", w: 12, h: 13 },
  { id: "backups", w: 12, h: 13 },
  { id: "unassigned", w: 12, h: 13 },
  { id: "etalons", w: 12, h: 11 },
]

function getMinW(breakpoint: BreakpointKey): number {
  if (breakpoint === "lg") return 8
  if (breakpoint === "md") return 6
  if (breakpoint === "sm") return 6
  if (breakpoint === "xs") return 4
  return 2
}

function getMinH(): number {
  return 9
}

function scaleWidthForBreakpoint(baseW: number, breakpoint: BreakpointKey): number {
  const cols = COLS[breakpoint]
  const scaled = Math.round((baseW / COLS.lg) * cols)
  const minW = getMinW(breakpoint)
  return Math.max(minW, Math.min(cols, scaled))
}

function createBreakpointLayout(widgetIds: WidgetId[], breakpoint: BreakpointKey): Layout {
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

function createDefaultLayouts(widgetIds: WidgetId[]): GridLayouts {
  return {
    lg: createBreakpointLayout(widgetIds, "lg"),
    md: createBreakpointLayout(widgetIds, "md"),
    sm: createBreakpointLayout(widgetIds, "sm"),
    xs: createBreakpointLayout(widgetIds, "xs"),
    xxs: createBreakpointLayout(widgetIds, "xxs"),
  }
}

function sanitizeItem(item: LayoutItem, breakpoint: BreakpointKey): LayoutItem {
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

  return {
    ...item,
    x,
    y,
    w,
    h,
    minW,
    minH,
    maxW: cols,
  }
}

function normalizeLayouts(layouts: GridLayouts, widgetIds: WidgetId[]): GridLayouts {
  const defaults = createDefaultLayouts(widgetIds)
  const normalized: GridLayouts = {}

  for (const breakpoint of Object.keys(COLS) as BreakpointKey[]) {
    const current = layouts[breakpoint] || []
    const currentMap = new Map(current.map((item) => [item.i as WidgetId, sanitizeItem(item, breakpoint)]))
    const fallbackMap = new Map((defaults[breakpoint] || []).map((item) => [item.i as WidgetId, item]))

    normalized[breakpoint] = widgetIds.map((id) => currentMap.get(id) || fallbackMap.get(id) || {
      i: id,
      x: 0,
      y: 0,
      w: scaleWidthForBreakpoint(12, breakpoint),
      h: 13,
      minW: getMinW(breakpoint),
      minH: getMinH(),
      maxW: COLS[breakpoint],
    })
  }

  return normalized
}

function WidgetCard({
  title,
  description,
  value,
  helper,
  href,
  hrefLabel,
  icon,
  badge,
}: {
  title: string
  description: string
  value: string
  helper?: string
  href: string
  hrefLabel: string
  icon: ReactNode
  badge?: ReactNode
}) {
  return (
    <Card className="h-full overflow-hidden border-slate-200 bg-white/90 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="flex items-center gap-2 text-base">
              {icon}
              <span className="truncate">{title}</span>
            </CardTitle>
            <CardDescription className="mt-1 line-clamp-2">{description}</CardDescription>
          </div>
          {badge}
        </div>
      </CardHeader>
      <CardContent className="space-y-2 overflow-hidden">
        <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">{value}</div>
        {helper ? <p className="line-clamp-2 text-sm text-muted-foreground">{helper}</p> : null}
        <Link
          href={href as any}
          className="inline-flex items-center gap-1 text-sm font-medium text-sky-600 transition-colors hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300"
        >
          {hrefLabel}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </CardContent>
    </Card>
  )
}

export function ExpertAdminDashboard({ metrics }: Props) {
  const t = useTranslations("adminDashboard")
  const locale = useLocale()
  const accessLabel = locale === "fr" ? "Accéder à la page" : "Open page"

  const allWidgetDefs = useMemo(
    () => (metrics.hideStandards ? DEFAULT_WIDGETS.filter((widget) => widget.id !== "etalons") : DEFAULT_WIDGETS),
    [metrics.hideStandards],
  )

  const [mounted, setMounted] = useState(false)
  const { width, containerRef, mounted: widthReady } = useContainerWidth()
  const [isEditMode, setIsEditMode] = useState(false)
  const [widgetIds, setWidgetIds] = useState<WidgetId[]>(allWidgetDefs.map((widget) => widget.id))
  const [layouts, setLayouts] = useState<GridLayouts>(createDefaultLayouts(allWidgetDefs.map((widget) => widget.id)))

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) return

      const parsed = JSON.parse(raw) as { widgetIds?: WidgetId[]; layouts?: GridLayouts }
      const allowed = new Set(allWidgetDefs.map((widget) => widget.id))
      const nextWidgets = (parsed.widgetIds || []).filter((id) => allowed.has(id))
      const resolvedWidgets = nextWidgets.length > 0 ? nextWidgets : allWidgetDefs.map((widget) => widget.id)

      setWidgetIds(resolvedWidgets)
      setLayouts(normalizeLayouts(parsed.layouts || {}, resolvedWidgets))
    } catch {
      // Ignore invalid local storage values and keep default layout.
    }
  }, [allWidgetDefs, mounted])

  useEffect(() => {
    if (!mounted) return

    try {
      const nextLayouts = normalizeLayouts(layouts, widgetIds)
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ widgetIds, layouts: nextLayouts }))
    } catch {
      // Ignore local storage write errors.
    }
  }, [layouts, mounted, widgetIds])

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

  const renderWidget = (id: WidgetId) => {
    if (id === "alarms") {
      return (
        <WidgetCard
          title={locale === "fr" ? "Alarmes" : "Alarms"}
          description={
            locale === "fr"
              ? `En cours: ${metrics.alarmsInProgressTotal} • En attente d'acquittement: ${metrics.alarmsPendingAckTotal}`
              : `In progress: ${metrics.alarmsInProgressTotal} • Pending acknowledgement: ${metrics.alarmsPendingAckTotal}`
          }
          value={String(metrics.alarmsInProgressTotal)}
          helper={
            locale === "fr"
              ? `Alarmes en attente d'acquittement: ${metrics.alarmsPendingAckTotal}`
              : `Alarms pending acknowledgement: ${metrics.alarmsPendingAckTotal}`
          }
          href="/admin/alarmes"
          hrefLabel={accessLabel}
          icon={<AlertTriangle className="h-5 w-5 text-red-600" />}
          badge={
            metrics.alarmsPendingAckTotal > 0 ? (
              <Badge variant="destructive">{metrics.alarmsPendingAckTotal}</Badge>
            ) : undefined
          }
        />
      )
    }

    if (id === "acknowledgments") {
      return (
        <WidgetCard
          title={t("acknowledgments.title")}
          description={t("acknowledgments.description", { total: metrics.acknowledgmentsTotal, max: 50 })}
          value={String(metrics.acknowledgmentsTotal)}
          helper={`${t("acknowledgments.columns.date_time")}: ${metrics.latestAck}`}
          href="/admin/alarmes"
          hrefLabel={accessLabel}
          icon={<Clock className="h-5 w-5 text-amber-600" />}
        />
      )
    }

    if (id === "connectedUsers") {
      return (
        <WidgetCard
          title={t("connected_users.title")}
          description={t("connected_users.description", { total: metrics.connectedUsersTotal, max: 50 })}
          value={String(metrics.connectedUsersTotal)}
          helper={`${t("connected_users.columns.full_name")}: ${metrics.latestConnectedLabel}`}
          href="/admin/utilisateurs"
          hrefLabel={accessLabel}
          icon={<Users className="h-5 w-5 text-sky-600" />}
        />
      )
    }

    if (id === "systemLogs") {
      return (
        <WidgetCard
          title={t("system_logs.title")}
          description={t("system_logs.description", { count: 50, total: metrics.systemLogsTotal })}
          value={String(metrics.systemLogsTotal)}
          helper={`${t("system_logs.columns.action")}: ${metrics.latestAuditAction}`}
          href="/admin/audit"
          hrefLabel={accessLabel}
          icon={<BookOpen className="h-5 w-5 text-emerald-600" />}
        />
      )
    }

    if (id === "backups") {
      return (
        <WidgetCard
          title={t("backup.title")}
          description={t("backup.description")}
          value={String(metrics.backupsTotal)}
          helper={`${t("backup.last.label")}: ${metrics.lastBackupLabel}`}
          href="/admin/outils"
          hrefLabel={accessLabel}
          icon={<Database className="h-5 w-5 text-violet-600" />}
        />
      )
    }

    if (id === "unassigned") {
      return (
        <WidgetCard
          title={t("unassigned.title")}
          description={t("unassigned.description", { count: metrics.unassignedTotal })}
          value={String(metrics.unassignedTotal)}
          href="/admin/sondes"
          hrefLabel={accessLabel}
          icon={<Cpu className="h-5 w-5 text-slate-600" />}
        />
      )
    }

    return (
      <WidgetCard
        title={t("links.etalons.title")}
        description={t("links.etalons.description")}
        value="-"
        href="/admin/etalons"
        hrefLabel={accessLabel}
        icon={<Ruler className="h-5 w-5 text-cyan-600" />}
      />
    )
  }

  if (!mounted) return null

  return (
    <div className="space-y-4 overflow-x-hidden p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">{t("expert.description")}</p>
        <Button variant="outline" type="button" onClick={() => setIsEditMode((prev) => !prev)}>
          <Grip className="mr-2 h-4 w-4" />
          {isEditMode ? t("expert.done") : t("expert.edit")}
        </Button>
      </div>

      {isEditMode && availableWidgets.length > 0 ? (
        <Card className="border-dashed border-slate-300/80 bg-white/70 dark:border-slate-700 dark:bg-slate-900/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{t("expert.toolbox_title")}</CardTitle>
            <CardDescription>{t("expert.toolbox_description")}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {availableWidgets.map((widget) => (
              <button
                key={widget.id}
                type="button"
                draggable
                unselectable="on"
                className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-2 text-sm hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
                onClick={() => addWidget(widget.id)}
                onDragStart={(event) => {
                  event.dataTransfer.setData("text/plain", widget.id)
                  event.dataTransfer.effectAllowed = "copyMove"
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                {t(`expert.widgets.${widget.id}` as any)}
              </button>
            ))}
          </CardContent>
        </Card>
      ) : null}

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
                  {renderWidget(id)}
                </div>
              </div>
            ))}
          </Responsive>
        ) : null}
      </div>
    </div>
  )
}
