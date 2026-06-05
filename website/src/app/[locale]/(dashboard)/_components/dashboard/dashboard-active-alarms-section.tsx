import { AlertTriangle, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { TanStackTable } from "@/components/data-table/tanstack-table"
import { Link } from "@/i18n/navigation"
import type { ColumnDef } from "@tanstack/react-table"
import type { AlarmRow } from "./types"

type Translate = (key: string, values?: Record<string, string | number>) => string

type DashboardActiveAlarmsSectionProps = {
  t: Translate
  activeCount: number
  data: AlarmRow[]
  columns: ColumnDef<AlarmRow>[]
  selectedAlarmId?: string
  canAcknowledgeAlarm: boolean
  onRowClick: (row: AlarmRow) => void
}

export function DashboardActiveAlarmsSection({
  t,
  activeCount,
  data,
  columns,
  selectedAlarmId,
  canAcknowledgeAlarm,
  onRowClick,
}: DashboardActiveAlarmsSectionProps) {
  return (
    <section className="lg:col-span-2 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          {t("active_alarms.title")}
          {activeCount > 0 ? (
            <>
              <span
                className="h-2 w-2 rounded-full bg-destructive animate-pulse"
                aria-hidden="true"
              />
              <Badge variant="destructive" className="ml-1">
                {activeCount}
              </Badge>
            </>
          ) : null}
        </h2>
        <Link href="/alarmes">
          <Button variant="ghost" size="sm" className="gap-1">
            {t("active_alarms.view_all")}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      <Card className="bg-card border-border shadow-md">
        <CardContent className="p-0">
          <TanStackTable<AlarmRow>
            columns={columns}
            data={data}
            searchPlaceholder={undefined}
            pageSize={200}
            isLoading={false}
            emptyMessage={t("active_alarms.empty")}
            selectedRowId={selectedAlarmId}
            onRowClick={(row) => {
              if (canAcknowledgeAlarm) onRowClick(row)
            }}
            showSearch={false}
            showPagination={false}
            containerClassName="border-border"
            headerClassName="!bg-foreground/90 text-white dark:!bg-muted"
            headerCellClassName="!bg-foreground/90 !text-white [&_svg]:!text-white !border-foreground/20 dark:!bg-muted dark:!border-border"
            bodyClassName="[&_tr:nth-child(odd)]:bg-card [&_tr:nth-child(even)]:bg-muted/40 dark:[&_tr:nth-child(odd)]:bg-muted/30 dark:[&_tr:nth-child(even)]:bg-background"
            tableClassName="text-foreground dark:text-card-foreground"
            toolbarClassName="rounded-lg border border-border bg-card px-3 py-2 shadow-sm"
          />
        </CardContent>
      </Card>
    </section>
  )
}
