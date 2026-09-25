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
    <Card className="rounded-[10px] border-dashed border-primary/30 bg-[hsl(var(--primary-soft)/0.45)] shadow-none">
      <CardHeader className="pb-2.5">
        <CardTitle className="text-sm font-semibold">{t("expert.toolbox_title")}</CardTitle>
        <CardDescription>{t("expert.toolbox_description")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        {widgets.map((widget) => (
          <button
            key={widget.id}
            type="button"
            draggable
            unselectable="on"
            className="inline-flex items-center rounded-md border border-border bg-card px-3 py-2 text-xs font-medium text-foreground shadow-sm transition-[border-color,background-color,color] duration-150 hover:border-primary/35 hover:bg-[hsl(var(--primary-soft))] hover:text-[hsl(var(--primary-strong))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
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
