"use client"

import { useMemo, useState } from "react"
import { Loader2, Layers3 } from "lucide-react"
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
  const locale = useLocale()
  const localeTag = locale === "fr" ? "fr-FR" : locale

  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [dateRange, setDateRange] = useState<DateRangeValue | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [dataByLocation, setDataByLocation] = useState<Record<number, OverlayMeasurement[]>>({})

  const selectedLocations = useMemo(
    () => locations.filter((item) => selectedIds.includes(item.id)),
    [locations, selectedIds],
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

    for (const location of selectedLocations) {
      const points = dataByLocation[location.id] ?? []
      for (const point of points) {
        if (!point.DateHeureMesure) continue
        const iso = point.DateHeureMesureIso ?? point.DateHeureMesure
        labelIsoMap.set(point.DateHeureMesure, iso)
      }
    }

    const labels = Array.from(labelIsoMap.entries())
      .sort((a, b) => new Date(a[1]).getTime() - new Date(b[1]).getTime())
      .map(([label]) => label)

    const datasets = selectedLocations.map((location, index) => {
      const map = new Map<string, number | null>()
      for (const point of dataByLocation[location.id] ?? []) {
        map.set(point.DateHeureMesure, point.Valeur)
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
  }, [dataByLocation, selectedLocations])

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
      const startDateIso = effectiveRange.from.toISOString()
      const endDateIso = effectiveRange.to.toISOString()

      const entries = await Promise.all(
        selectedIds.map(async (idLieu) => {
          const points = await fetchAllMeasuresForLocation(idLieu, startDateIso, endDateIso)
          return [idLieu, points] as const
        }),
      )

      const next: Record<number, OverlayMeasurement[]> = {}
      for (const [idLieu, points] of entries) {
        next[idLieu] = points
      }
      setDataByLocation(next)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Layers3 className="h-4 w-4" />
            {t("overlay.title")}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
          <div className="rounded-md border p-3">
            <p className="text-sm font-medium mb-2">{t("overlay.locations")}</p>
            <ScrollArea className="h-[320px] pr-2">
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
          </div>

          <div className="rounded-md border p-3 min-h-[360px]">
            {chartPayload.datasets.length >= 2 && chartPayload.labels.length > 0 ? (
              <Line
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
                    y: {
                      ticks: {
                        callback: (value) => `${value}`,
                      },
                    },
                  },
                }}
                height={340}
              />
            ) : (
              <div className="h-[340px] flex items-center justify-center text-sm text-muted-foreground">
                {t("overlay.empty")}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
