"use client"

import { useMemo, useRef, useState } from "react"
import { Loader2, Layers3, Download, Printer } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { getJson } from "@/lib/http"
import { toApiUtcDateTime } from "@/lib/date-range-api"
import { formatTimeAxisLabel } from "@/lib/measurements"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend)

type OverlayLocation = {
  id: number
  name: string
  site?: string | null
}

type OverlayMeasurement = {
  DateHeureMesure: string
  DateHeureMesureIso?: string
  Valeur: number | null
}

type DateRangeValue = {
  from: Date
  to?: Date
}

type PagedMeasurementsResponse = {
  measurements?: OverlayMeasurement[]
  total?: number
  page?: number
  pageSize?: number
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  locations: OverlayLocation[]
}

const COLORS = ["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#06b6d4", "#f97316", "#e11d48"]

export function CurvesOverlayModal({ open, onOpenChange, locations }: Props) {
  const t = useTranslations("surveillance")
  const tCommon = useTranslations("common")
  const tButtons = useTranslations("buttons")
  const locale = useLocale()
  const localeTag = locale === "fr" ? "fr-FR" : locale

  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [appliedIds, setAppliedIds] = useState<number[]>([])
  const [dateRange, setDateRange] = useState<DateRangeValue | null>(null)
  const [appliedRange, setAppliedRange] = useState<DateRangeValue | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [dataByLocation, setDataByLocation] = useState<Record<number, OverlayMeasurement[]>>({})
  const chartRef = useRef<ChartJS<"line"> | null>(null)

  const selectedLocations = useMemo(
    () => locations.filter((item) => selectedIds.includes(item.id)),
    [locations, selectedIds],
  )

  const appliedLocations = useMemo(
    () => locations.filter((item) => appliedIds.includes(item.id)),
    [locations, appliedIds],
  )

  const effectiveRange = useMemo(() => {
    if (!dateRange?.from) return null
    const from = new Date(dateRange.from)
    from.setHours(0, 0, 0, 0)
    const to = dateRange.to ? new Date(dateRange.to) : new Date(dateRange.from)
    to.setHours(23, 59, 59, 999)
    return { from, to }
  }, [dateRange])

  const chartPayload = useMemo(() => {
    const labelIsoMap = new Map<string, string>()

    for (const location of appliedLocations) {
      const points = dataByLocation[location.id] ?? []
      for (const point of points) {
        if (!point.DateHeureMesure) continue
        const iso = point.DateHeureMesureIso ?? point.DateHeureMesure
        labelIsoMap.set(point.DateHeureMesure, iso)
      }
    }

    const labels = Array.from(labelIsoMap.entries())
      .sort((a, b) => new Date(a[1]).getTime() - new Date(b[1]).getTime())
      .map(([, iso]) => iso)

    const datasets = appliedLocations.map((location, index) => {
      const map = new Map<string, number | null>()
      for (const point of dataByLocation[location.id] ?? []) {
        map.set(point.DateHeureMesureIso ?? point.DateHeureMesure, point.Valeur)
      }

      return {
        label: location.site ? `${location.site} - ${location.name}` : location.name,
        data: labels.map((label) => map.get(label) ?? null),
        borderColor: COLORS[index % COLORS.length],
        backgroundColor: COLORS[index % COLORS.length],
        pointRadius: 0,
        pointHoverRadius: 3,
        borderWidth: 2,
        tension: 0.25,
        spanGaps: true,
      }
    })

    return { labels, datasets }
  }, [appliedLocations, dataByLocation])

  const toggleLocation = (locationId: number) => {
    setSelectedIds((current) =>
      current.includes(locationId)
        ? current.filter((id) => id !== locationId)
        : [...current, locationId],
    )
  }

  const fetchAllMeasuresForLocation = async (idLieu: number, startDateIso: string, endDateIso: string) => {
    const all: OverlayMeasurement[] = []
    const pageSize = 200
    let page = 1
    let totalPages = 1

    do {
      const params = new URLSearchParams({
        source: "mesures",
        page: String(page),
        pageSize: String(pageSize),
        startDate: startDateIso,
        endDate: endDateIso,
        fresh: "true",
      })

      const payload = await getJson<PagedMeasurementsResponse>(`/api/mesures/${idLieu}?${params}`)
      const pageData = Array.isArray(payload?.measurements) ? payload.measurements : []
      all.push(...pageData)

      const total = typeof payload?.total === "number" ? payload.total : pageData.length
      const receivedPageSize = typeof payload?.pageSize === "number" && payload.pageSize > 0 ? payload.pageSize : pageSize
      totalPages = Math.max(1, Math.ceil(total / receivedPageSize))
      page += 1
    } while (page <= totalPages)

    return all
  }

  const loadData = async () => {
    if (selectedIds.length < 2 || !effectiveRange) return

    setIsLoading(true)
    try {
      const startDateIso = toApiUtcDateTime(effectiveRange.from)
      const endDateIso = toApiUtcDateTime(effectiveRange.to)
      const requestedIds = [...selectedIds]

      const entries = await Promise.all(
        requestedIds.map(async (idLieu) => {
          const points = await fetchAllMeasuresForLocation(idLieu, startDateIso, endDateIso)
          return [idLieu, points] as const
        }),
      )

      const next: Record<number, OverlayMeasurement[]> = {}
      for (const [idLieu, points] of entries) {
        next[idLieu] = points
      }
      setDataByLocation(next)
      setAppliedIds(requestedIds)
      setAppliedRange(dateRange)
    } finally {
      setIsLoading(false)
    }
  }

  const canExport = chartPayload.datasets.length >= 2 && chartPayload.labels.length > 0

  const chartSpanMs = useMemo(() => {
    if (chartPayload.labels.length <= 1) return 0
    const first = new Date(chartPayload.labels[0]).getTime()
    const last = new Date(chartPayload.labels[chartPayload.labels.length - 1]).getTime()
    if (!Number.isFinite(first) || !Number.isFinite(last)) return 0
    return Math.max(0, last - first)
  }, [chartPayload.labels])

  const downloadBlob = (content: string, mimeType: string, filename: string) => {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = filename
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const handleExportCsv = () => {
    if (!canExport) return

    const headers = ["Date", ...chartPayload.datasets.map((dataset) => dataset.label)]
    const rows = chartPayload.labels.map((label, rowIndex) => {
      const values = chartPayload.datasets.map((dataset) => {
        const value = dataset.data[rowIndex]
        return value === null || value === undefined ? "" : String(value)
      })
      return [new Date(label).toLocaleString(localeTag), ...values]
    })

    const escapeCell = (value: string) => {
      const normalized = value.replace(/"/g, '""')
      return /[";\n]/.test(normalized) ? `"${normalized}"` : normalized
    }

    const csv = [headers, ...rows]
      .map((line) => line.map((cell) => escapeCell(String(cell))).join(";"))
      .join("\n")

    downloadBlob(csv, "text/csv;charset=utf-8", "superposition-courbes.csv")
  }

  const handlePrintChart = () => {
    if (!canExport) return
    const chart = chartRef.current
    if (!chart) return

    const imageDataUrl = chart.toBase64Image("image/png", 1)
    const popup = window.open("", "_blank", "width=1100,height=760")
    if (!popup) return

    popup.document.write(`
      <html>
        <head>
          <title>${t("overlay.title")}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 16px; }
            .meta { margin-bottom: 12px; color: #475569; font-size: 12px; }
            img { width: 100%; height: auto; border: 1px solid #e2e8f0; border-radius: 8px; }
          </style>
        </head>
        <body>
          <h2>${t("overlay.title")}</h2>
          <div class="meta">${new Date().toLocaleString(localeTag)}</div>
          <img src="${imageDataUrl}" alt="overlay" />
        </body>
      </html>
    `)
    popup.document.close()
    popup.focus()
    popup.print()
  }


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Layers3 className="h-4 w-4" />
            {t("overlay.title")}
          </DialogTitle>
        </DialogHeader>

        <div className="grid h-[calc(90vh-84px)] gap-4 lg:grid-cols-[280px_1fr] overflow-hidden">
          <div className="rounded-md border p-3 overflow-hidden">
            <p className="text-sm font-medium mb-2">{t("overlay.locations")}</p>
            <ScrollArea className="h-80 pr-2">
              <div className="space-y-2">
                {locations.map((location) => {
                  const checked = selectedIds.includes(location.id)
                  return (
                    <label key={location.id} className="flex items-start gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        className="mt-0.5"
                        checked={checked}
                        onChange={() => toggleLocation(location.id)}
                      />
                      <span>
                        <span className="font-medium">{location.name}</span>
                        {location.site ? (
                          <span className="block text-xs text-muted-foreground">{location.site}</span>
                        ) : null}
                      </span>
                    </label>
                  )
                })}
              </div>
            </ScrollArea>

            <div className="mt-3 space-y-2">
              <p className="text-sm font-medium">{t("overlay.range")}</p>
              <DateRangePicker
                allowEmpty
                showCompare={false}
                align="start"
                locale={localeTag}
                matchTriggerWidth={false}
                popoverClassName="w-[min(760px,calc(100vw-2rem))]"
                onUpdate={({ range }) => {
                  if (!range.from) {
                    setDateRange(null)
                    return
                  }
                  setDateRange({ from: range.from, to: range.to ?? range.from })
                }}
              />
            </div>

            <Button
              className="w-full mt-3"
              onClick={loadData}
              disabled={selectedIds.length < 2 || !effectiveRange || isLoading}
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {t("overlay.load")}
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              {!effectiveRange ? t("overlay.hint_range") : t("overlay.hint")}
            </p>
            {appliedIds.length >= 2 ? (
              <p className="mt-1 text-xs text-muted-foreground">
                {appliedRange?.from
                  ? `${locale === "fr" ? "Superposition affich?e" : "Displayed overlay"} : ${appliedLocations.length} ${locale === "fr" ? "lieux" : "locations"}`
                  : `${locale === "fr" ? "Superposition affich?e" : "Displayed overlay"} : ${appliedLocations.length} ${locale === "fr" ? "lieux" : "locations"}`}
              </p>
            ) : null}
          </div>

          <div className="rounded-md border p-3 h-full overflow-hidden flex flex-col">
            <div className="mb-3 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={handleExportCsv} disabled={!canExport}>
                <Download className="mr-2 h-4 w-4" />
                {tCommon("export")}
              </Button>
              <Button variant="outline" size="sm" onClick={handlePrintChart} disabled={!canExport}>
                <Printer className="mr-2 h-4 w-4" />
                {tButtons("print")}
              </Button>
            </div>
            {chartPayload.datasets.length >= 2 && chartPayload.labels.length > 0 ? (
              <div className="min-h-0 flex-1">
                <Line
                ref={chartRef}
                data={chartPayload}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "bottom",
                    },
                  },
                  scales: {
                    x: {
                      ticks: {
                        autoSkip: true,
                        maxTicksLimit: chartSpanMs >= 24 * 60 * 60 * 1000 ? 10 : 8,
                        maxRotation: 0,
                        minRotation: 0,
                        callback: (_value, index) => {
                          const rawValue = chartPayload.labels[index]
                          return rawValue ? formatTimeAxisLabel(rawValue, localeTag, chartSpanMs) : ""
                        },
                      },
                    },
                    y: {
                      ticks: {
                        callback: (value) => `${value}`,
                      },
                    },
                  },
                }}
                height={340}
              />
              </div>
            ) : (
              <div className="min-h-0 flex-1 flex items-center justify-center text-sm text-muted-foreground">
                {t("overlay.empty")}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
