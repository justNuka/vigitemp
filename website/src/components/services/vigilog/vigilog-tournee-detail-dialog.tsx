"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useLocale, useTranslations } from "next-intl"
import { Line } from "react-chartjs-2"
import type { ColumnDef } from "@tanstack/react-table"
import {
  Chart as ChartJS,
  CategoryScale,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js"

import type { VigilogTourneeDetail } from "./types"
import { TanStackTable } from "@/components/data-table/tanstack-table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AlertTriangle } from "lucide-react"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler)

function formatDateTime(value: string | null, locale: string) {
  if (!value) return "-"
  return new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-GB", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value))
}

function formatDate(value: string | null, locale: string) {
  if (!value) return "-"
  return new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-GB", {
    dateStyle: "short",
  }).format(new Date(value))
}

function formatNumber(value: number | null) {
  if (value == null) return "-"
  return value.toFixed(2)
}

function escapeCsv(value: string | number | null | undefined) {
  const normalized = value == null ? "" : String(value)
  if (/[",;\n\r]/.test(normalized)) {
    return `"${normalized.replace(/"/g, '""')}"`
  }
  return normalized
}

function formatDuration(totalSeconds: number) {
  if (!totalSeconds || totalSeconds <= 0) return "-"
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`
  if (hours > 0) return `${hours}h`
  return `${minutes}m`
}

function trafficLightClass(result: string | null) {
  switch (result) {
    case "VERT":
      return "bg-emerald-500"
    case "ORANGE":
      return "bg-amber-500"
    case "ROUGE":
      return "bg-rose-500"
    default:
      return "bg-zinc-300"
  }
}

function statusBadgeClass(status: string) {
  switch (status) {
    case "EN_ATTENTE_RECEPTION":
      return "border-amber-300 bg-amber-100/80 text-amber-950"
    case "RECUE":
      return "border-sky-300 bg-sky-100/80 text-sky-950"
    case "ANALYSEE":
      return "border-indigo-300 bg-indigo-100/80 text-indigo-950"
    case "ACQUITTEE":
      return "border-emerald-300 bg-emerald-100/80 text-emerald-950"
    case "ANNULEE":
      return "border-zinc-300 bg-zinc-100/90 text-zinc-800"
    default:
      return "border-zinc-300 bg-zinc-100/90 text-zinc-800"
  }
}

type Props = {
  open: boolean
  pending?: boolean
  detail: VigilogTourneeDetail | null
  onOpenChange: (open: boolean) => void
}

type GuidePositions = {
  low: number | null
  high: number | null
  target: number | null
}

export function VigilogTourneeDetailDialog({ open, pending = false, detail, onOpenChange }: Props) {
  const t = useTranslations("servicesVigilog")
  const locale = useLocale()
  const chartRef = useRef<ChartJS<"line"> | null>(null)
  const [guidePositions, setGuidePositions] = useState<GuidePositions>({
    low: null,
    high: null,
    target: null,
  })

  const tournee = detail?.tournee ?? null
  const measures = detail?.measures ?? []
  const measuresColumns = useMemo<ColumnDef<(typeof measures)[number]>[]>(
    () => [
      {
        accessorKey: "order",
        header: "#",
        cell: ({ row }) => row.original.order ?? "-",
      },
      {
        accessorKey: "measuredAt",
        header: t("detail.columns.measuredAt"),
        cell: ({ row }) => formatDateTime(row.original.measuredAt, locale),
      },
      {
        accessorKey: "value",
        header: t("detail.columns.value"),
        cell: ({ row }) => formatNumber(row.original.value),
      },
      {
        accessorKey: "outOfLimit",
        header: t("detail.columns.outOfLimit"),
        cell: ({ row }) => (
          <Badge
            variant="outline"
            className={
              row.original.outOfLimit
                ? "border-amber-300 bg-amber-50 text-amber-950"
                : "border-zinc-300 bg-zinc-50 text-zinc-700"
            }
          >
            {row.original.outOfLimit ? t("detail.yes") : t("detail.no")}
          </Badge>
        ),
      },
      {
        accessorKey: "inAlarm",
        header: t("detail.columns.alarm"),
        cell: ({ row }) => (
          <Badge
            variant="outline"
            className={
              row.original.inAlarm
                ? "border-rose-300 bg-rose-50 text-rose-950"
                : "border-zinc-300 bg-zinc-50 text-zinc-700"
            }
          >
            {row.original.inAlarm ? t("detail.yes") : t("detail.no")}
          </Badge>
        ),
      },
      {
        accessorKey: "marker",
        header: t("detail.columns.marker"),
        cell: ({ row }) => (
          <Badge
            variant="outline"
            className={
              row.original.marker
                ? "border-sky-300 bg-sky-50 text-sky-950"
                : "border-zinc-300 bg-zinc-50 text-zinc-700"
            }
          >
            {row.original.marker ? t("detail.yes") : t("detail.no")}
          </Badge>
        ),
      },
      {
        accessorKey: "details",
        header: t("detail.columns.details"),
        cell: ({ row }) => row.original.details || "-",
      },
    ],
    [locale, measures, t],
  )

  const chartData = useMemo(() => {
    if (!tournee || measures.length === 0) return null

    return {
      labels: measures.map((measure) =>
        new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-GB", {
          hour: "2-digit",
          minute: "2-digit",
        }).format(new Date(measure.measuredAt)),
      ),
      datasets: [
        ...(tournee.lowLimitActive
          ? [
              {
                label: t("detail.chart.lowLimit"),
                data: measures.map(() => tournee.lowLimit),
                borderColor: "transparent",
                borderWidth: 0,
                pointRadius: 0,
                pointHoverRadius: 0,
                pointHitRadius: 0,
                hoverBorderWidth: 0,
                fill: "start" as const,
                backgroundColor: "rgba(30, 64, 175, 0.12)",
                order: 0,
              },
              {
                label: `${t("detail.chart.lowLimit")}-line`,
                data: measures.map(() => tournee.lowLimit),
                borderColor: "rgba(245, 158, 11, 0.95)",
                borderWidth: 1.5,
                borderDash: [6, 4],
                pointRadius: 0,
                tension: 0,
                fill: false,
                order: 1,
              },
            ]
          : []),
        ...(tournee.highLimitActive
          ? [
              {
                label: t("detail.chart.highLimit"),
                data: measures.map(() => tournee.highLimit),
                borderColor: "transparent",
                borderWidth: 0,
                pointRadius: 0,
                pointHoverRadius: 0,
                pointHitRadius: 0,
                hoverBorderWidth: 0,
                fill: "end" as const,
                backgroundColor: "rgba(220, 38, 38, 0.12)",
                order: 0,
              },
              {
                label: `${t("detail.chart.highLimit")}-line`,
                data: measures.map(() => tournee.highLimit),
                borderColor: "rgba(239, 68, 68, 0.95)",
                borderWidth: 1.5,
                borderDash: [6, 4],
                pointRadius: 0,
                tension: 0,
                fill: false,
                order: 1,
              },
            ]
          : []),
        {
          label: t("detail.chart.target"),
          data: measures.map(() => tournee.target),
          borderColor: "rgba(17, 24, 39, 0.85)",
          borderWidth: 1.5,
          pointRadius: 0,
          tension: 0,
          fill: false,
          order: 1,
        },
        {
          label: t("detail.chart.temperature"),
          data: measures.map((measure) => measure.value),
          borderColor: "rgba(14, 165, 233, 1)",
          backgroundColor: "rgba(14, 165, 233, 0.15)",
          borderWidth: 2,
          fill: true,
          tension: 0.3,
          pointRadius: 2,
          pointHoverRadius: 5,
          pointBackgroundColor: measures.map((measure) =>
            measure.inAlarm
              ? "rgba(225, 29, 72, 1)"
              : measure.outOfLimit
                ? "rgba(245, 158, 11, 1)"
                : "rgba(14, 165, 233, 1)",
          ),
          pointBorderColor: "#ffffff",
          pointBorderWidth: 1.5,
          order: 2,
        },
        {
          label: t("detail.chart.alarm"),
          data: measures.map((measure) => (measure.inAlarm ? measure.value : null)),
          borderColor: "rgba(225, 29, 72, 0)",
          backgroundColor: "rgba(225, 29, 72, 1)",
          showLine: false,
          pointRadius: 4,
          pointHoverRadius: 5,
          order: 3,
        },
      ],
    }
  }, [locale, measures, t, tournee])

  useEffect(() => {
    const chart = chartRef.current
    const yScale = chart?.scales?.y
    const chartArea = chart?.chartArea
    if (!chart || !yScale || !chartArea || !tournee) {
      setGuidePositions({ low: null, high: null, target: null })
      return
    }

    const clamp = (value: number) => Math.max(chartArea.top, Math.min(chartArea.bottom, value))
    const toPosition = (value: number | null) => (value == null ? null : clamp(yScale.getPixelForValue(value)))

    setGuidePositions({
      low: tournee.lowLimitActive ? toPosition(tournee.lowLimit) : null,
      high: tournee.highLimitActive ? toPosition(tournee.highLimit) : null,
      target: toPosition(tournee.target),
    })
  }, [chartData, tournee])

  const exportMeasuresAsCsv = () => {
    if (!tournee || measures.length === 0) return

    const headers = ["Ordre", "DateHeure", "Valeur", "HorsLimites", "EnAlarme", "Marqueur", "Details"]
    const rows = measures.map((measure) => [
      measure.order ?? "",
      measure.measuredAt,
      measure.value ?? "",
      measure.outOfLimit ? "1" : "0",
      measure.inAlarm ? "1" : "0",
      measure.marker ? "1" : "0",
      measure.details ?? "",
    ])

    const csv = [headers, ...rows]
      .map((row) => row.map((value) => escapeCsv(value)).join(";"))
      .join("\r\n")

    const blob = new Blob([`\ufeff${csv}`], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = `vigilog-${tournee.reference}-mesures.csv`
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
    URL.revokeObjectURL(url)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-[78rem] overflow-hidden border-border/60 bg-white px-6 shadow-sm dark:bg-popover dark:text-popover-foreground">
        <DialogHeader>
          <DialogTitle>{t("detail.title")}</DialogTitle>
          <DialogDescription>
            {tournee ? `${tournee.reference} - ${tournee.loggerSerial}` : t("detail.loading")}
          </DialogDescription>
        </DialogHeader>

        {pending || !tournee ? (
          <div className="py-8 text-sm text-muted-foreground">{t("detail.loading")}</div>
        ) : (
          <div className="max-h-[calc(90vh-7rem)] space-y-6 overflow-y-auto pr-2">
            {tournee.measurementCount === 0 ? (
              <Alert className="border-amber-300/80 bg-amber-100/55 text-amber-950 shadow-[0_10px_24px_rgba(245,158,11,0.08)]">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>{t("detail.noMeasurementsAlert.title")}</AlertTitle>
                <AlertDescription>{t("detail.noMeasurementsAlert.description")}</AlertDescription>
              </Alert>
            ) : null}

            <div className="grid gap-4 md:grid-cols-4">
              <div className="rounded-xl border border-sky-300/80 bg-sky-100/55 p-4 shadow-[0_10px_24px_rgba(14,165,233,0.08)]">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  {t("detail.cards.status")}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={statusBadgeClass(tournee.status)}
                  >
                    {t(`history.status.${tournee.status.toLowerCase()}` as never)}
                  </Badge>
                  <span className={`h-3 w-3 rounded-full ${trafficLightClass(tournee.trafficLight)}`} />
                </div>
              </div>
              <div className="rounded-xl border border-violet-300/80 bg-violet-100/55 p-4 shadow-[0_10px_24px_rgba(139,92,246,0.08)]">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  {t("detail.cards.route")}
                </p>
                <p className="mt-2 text-sm font-medium text-violet-950">{tournee.departureSite.name || "-"}</p>
                <p className="text-sm text-muted-foreground">{tournee.arrivalSite.name || "-"}</p>
              </div>
              <div className="rounded-xl border border-cyan-300/80 bg-cyan-100/55 p-4 shadow-[0_10px_24px_rgba(8,145,178,0.08)]">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  {t("detail.cards.temperature")}
                </p>
                <p className="mt-2 text-sm font-medium text-cyan-950">
                  {formatNumber(tournee.temperatureMin)} / {formatNumber(tournee.temperatureAverage)} / {formatNumber(tournee.temperatureMax)}
                </p>
              </div>
              <div className="rounded-xl border border-amber-300/80 bg-amber-100/55 p-4 shadow-[0_10px_24px_rgba(245,158,11,0.08)]">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  {t("detail.cards.durations")}
                </p>
                <p className="mt-2 text-sm font-medium text-amber-950">
                  {t("detail.excursion")}: {formatDuration(tournee.outOfLimitDurationSeconds)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("detail.alarm")}: {formatDuration(tournee.alarmDurationSeconds)}
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-sky-300/80 bg-sky-100/45 p-4 shadow-[0_10px_24px_rgba(14,165,233,0.06)]">
                <h3 className="mb-3 font-medium text-foreground">{t("detail.snapshotTitle")}</h3>
                <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                  <p>{t("detail.snapshot.configuration")}: {tournee.configurationName}</p>
                  <p>{t("detail.snapshot.logger")}: {tournee.loggerSerial}</p>
                  <p>{t("detail.snapshot.target")}: {formatNumber(tournee.target)}</p>
                  <p>{t("detail.snapshot.frequency")}: {tournee.frequencyMinutes}</p>
                  <p>{t("detail.snapshot.lowLimit")}: {tournee.lowLimitActive ? formatNumber(tournee.lowLimit) : "-"}</p>
                  <p>{t("detail.snapshot.highLimit")}: {tournee.highLimitActive ? formatNumber(tournee.highLimit) : "-"}</p>
                  <p>{t("detail.snapshot.departureAt")}: {formatDateTime(tournee.departureAt, locale)}</p>
                  <p>{t("detail.snapshot.arrivalAt")}: {formatDateTime(tournee.arrivalAt, locale)}</p>
                </div>
              </div>

              <div className="rounded-xl border border-violet-300/80 bg-violet-100/45 p-4 shadow-[0_10px_24px_rgba(139,92,246,0.06)]">
                <h3 className="mb-3 font-medium text-foreground">{t("detail.commentsTitle")}</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-medium text-foreground">{t("detail.comment")}</p>
                    <p className="text-muted-foreground">{tournee.comment || "-"}</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{t("detail.ackComment")}</p>
                    <p className="text-muted-foreground">{tournee.acknowledgeComment || "-"}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-cyan-300/80 bg-cyan-100/40 p-4 shadow-[0_10px_24px_rgba(8,145,178,0.06)]">
              <h3 className="mb-3 font-medium text-foreground">{t("detail.chart.title")}</h3>
              {chartData ? (
                <div className="relative h-[320px]">
                  <Line
                    ref={chartRef}
                    data={chartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      interaction: {
                        mode: "nearest",
                        intersect: false,
                      },
                      plugins: {
                        legend: {
                          position: "top",
                          labels: {
                            usePointStyle: true,
                            filter: (legendItem) =>
                              ![
                                t("detail.chart.lowLimit"),
                                t("detail.chart.highLimit"),
                                `${t("detail.chart.lowLimit")}-line`,
                                `${t("detail.chart.highLimit")}-line`,
                              ].includes(legendItem.text ?? ""),
                          },
                        },
                      },
                      scales: {
                        x: {
                          grid: { color: "rgba(148, 163, 184, 0.18)" },
                        },
                        y: {
                          grid: { color: "rgba(148, 163, 184, 0.22)" },
                        },
                      },
                    }}
                  />
                  <div className="pointer-events-none absolute inset-0">
                    {guidePositions.high !== null ? (
                      <>
                        <div
                          className="absolute right-4 rounded bg-white/95 dark:bg-popover/95 px-2 py-1 text-xs font-medium text-red-600 shadow-md"
                          style={{ top: `${guidePositions.high}px`, transform: "translateY(-50%)" }}
                        >
                          {t("detail.chart.highGuide", { value: formatNumber(tournee.highLimit) })}
                        </div>
                      </>
                    ) : null}
                    {guidePositions.target !== null ? (
                      <div
                        className="absolute right-4 rounded bg-white/95 dark:bg-popover/95 px-2 py-1 text-xs font-medium text-gray-900 shadow-md"
                        style={{ top: `${guidePositions.target}px`, transform: "translateY(-50%)" }}
                      >
                        {t("detail.chart.targetGuide", { value: formatNumber(tournee.target) })}
                      </div>
                    ) : null}
                    {guidePositions.low !== null ? (
                      <div
                        className="absolute right-4 rounded bg-white/95 dark:bg-popover/95 px-2 py-1 text-xs font-medium text-amber-600 shadow-md"
                        style={{ top: `${guidePositions.low}px`, transform: "translateY(-50%)" }}
                      >
                        {t("detail.chart.lowGuide", { value: formatNumber(tournee.lowLimit) })}
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : (
                <div className="py-8 text-sm text-muted-foreground">{t("detail.emptyMeasures")}</div>
              )}
            </div>

            <div className="rounded-xl border border-slate-200/80 bg-white/75 dark:bg-muted/15 p-4 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="font-medium text-foreground">{t("detail.measuresTitle")}</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={exportMeasuresAsCsv}
                  disabled={measures.length === 0}
                >
                  {t("detail.export")}
                </Button>
              </div>
              <TanStackTable
                columns={measuresColumns}
                data={measures}
                showSearch={false}
                enableExport={false}
                enablePrint={false}
                showPagination={measures.length > 10}
                pageSize={10}
                maxHeight="420px"
                emptyMessage={t("detail.emptyMeasures")}
                containerClassName="border-border/60 bg-white/60 dark:bg-card/80"
                headerClassName="!bg-sidebar !text-sidebar-foreground"
                headerCellClassName="!bg-sidebar !text-sidebar-foreground !border-r !border-white/25 hover:!bg-sidebar-accent/80"
                tableClassName="border-separate border-spacing-0 bg-transparent [&_thead_th]:!border-r [&_thead_th]:!border-white/25 [&_thead_th:last-child]:!border-r-0 [&_tbody_tr]:transition-colors [&_tbody_tr]:duration-150"
              />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
