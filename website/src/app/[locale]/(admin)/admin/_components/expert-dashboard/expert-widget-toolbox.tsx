import { Plus } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { WidgetDefinition, WidgetId } from "./expert-dashboard-types"

type Translate = (key: string, values?: Record<string, string | number>) => string

export function ExpertWidgetToolbox({
  widgets,
  t,
  onAddWidget,
}: {
  widgets: WidgetDefinition[]
  t: Translate
  onAddWidget: (id: WidgetId) => void
}) {
  if (widgets.length === 0) return null

  return (
    <Card className="border-dashed border-slate-300/80 bg-white/70 dark:border-slate-700 dark:bg-slate-900/60">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{t("expert.toolbox_title")}</CardTitle>
        <CardDescription>{t("expert.toolbox_description")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        {widgets.map((widget) => (
          <button
            key={widget.id}
            type="button"
            draggable
            unselectable="on"
            className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-2 text-sm hover:bg-slate-100 dark:border-border dark:bg-popover dark:hover:bg-accent"
            onClick={() => onAddWidget(widget.id)}
            onDragStart={(event) => {
              event.dataTransfer.setData("text/plain", widget.id)
              event.dataTransfer.effectAllowed = "copyMove"
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            {t(`expert.widgets.${widget.id}` as never)}
          </button>
        ))}
      </CardContent>
    </Card>
  )
}
