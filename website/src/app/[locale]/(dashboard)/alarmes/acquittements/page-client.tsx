"use client"

import { useEffect, useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import type { ColumnDef } from "@tanstack/react-table"
import { History, RefreshCw, RotateCcw, Search } from "lucide-react"
import { useTranslations } from "next-intl"

import { useAppAccess } from "@/components/access/app-access-provider"
import { PageHeader } from "@/components/page-header"
import { TanStackTable } from "@/components/data-table/tanstack-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getJson } from "@/lib/http"
import { formatDbDateTime } from "@/lib/date-display"
import { formatNumber } from "@/lib/number-display"
import { useRouter } from "@/i18n/navigation"
import { cn } from "@/lib/utils"

type AckHistoryItem = {
  id: string
  alarmId: number | null
  acknowledgedAt: string | null
  acknowledgedBy: string
  comment: string | null
  siteName: string | null
  locationName: string | null
  sensorSerial: string | null
  durationMs: number | null
  alarmType: string | null
  alarmValue: string | null
  triggeredAt: string | null
  endedAt: string | null
}

type Paginated<T> = {
  data: T[]
  filters?: {
    lieux: Array<{ id: number; name: string }>
  }
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

function formatAlarmValueForDisplay(value: string | null, locale: string) {
  if (!value) return "-"

  const trimmed = value.trim()
  const match = trimmed.match(/^(-?\d+(?:[.,]\d+)?)(?:\s+(.*))?$/)
  if (!match) return trimmed

  const numericValue = Number.parseFloat(match[1].replace(",", "."))
  if (!Number.isFinite(numericValue)) return trimmed

  const formatted = formatNumber(numericValue, {
    locale,
    minimumDecimals: 0,
    maximumDecimals: 2,
  })
  const unit = match[2]?.trim()
  return unit ? `${formatted} ${unit}` : formatted
}

function formatAlarmType(t: ReturnType<typeof useTranslations>, type: string | null) {
  switch (type) {
    case "HIGH":
      return t("table.type.high")
    case "LOW":
      return t("table.type.low")
    case "NO_RESPONSE":
      return t("table.type.no_response")
    case "SECTOR":
      return t("table.type.sector")
    case "MODULE":
      return t("table.type.module")
    default:
      return type || "-"
  }
}

export function AlarmAcknowledgmentHistoryClient() {
  const t = useTranslations("alarmAckHistoryPage")
  const locale = typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().locale : "fr-FR"
  const { hasPermission, loading } = useAppAccess()
  const router = useRouter()
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 500 })
  const [draftFilters, setDraftFilters] = useState({
    q: "",
    lieuId: "all",
    dateFrom: "",
    dateTo: "",
    type: "all",
  })
  const [appliedFilters, setAppliedFilters] = useState({
    q: "",
    lieuId: "all",
    dateFrom: "",
    dateTo: "",
    type: "all",
  })

  const canAccess = hasPermission("ALARM_ACK_ACCESS")
  const page = pagination.pageIndex + 1
  const limit = pagination.pageSize
  const queryParams = useMemo(() => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    })
    if (appliedFilters.q.trim()) params.set("q", appliedFilters.q.trim())
    if (appliedFilters.lieuId !== "all") params.set("lieuId", appliedFilters.lieuId)
    if (appliedFilters.dateFrom) params.set("dateFrom", appliedFilters.dateFrom)
    if (appliedFilters.dateTo) params.set("dateTo", appliedFilters.dateTo)
    if (appliedFilters.type !== "all") params.set("type", appliedFilters.type)
    return params.toString()
  }, [appliedFilters, limit, page])

  const exportQueryParams = useMemo(() => {
    const params = new URLSearchParams({
      page: "1",
      limit: "1000",
    })
    if (appliedFilters.q.trim()) params.set("q", appliedFilters.q.trim())
    if (appliedFilters.lieuId !== "all") params.set("lieuId", appliedFilters.lieuId)
    if (appliedFilters.dateFrom) params.set("dateFrom", appliedFilters.dateFrom)
    if (appliedFilters.dateTo) params.set("dateTo", appliedFilters.dateTo)
    if (appliedFilters.type !== "all") params.set("type", appliedFilters.type)
    return params.toString()
  }, [appliedFilters])

  useEffect(() => {
    if (loading) return
    if (!canAccess) {
      router.replace("/403")
    }
  }, [canAccess, loading, router])

  const query = useQuery({
    queryKey: ["alarm-ack-history", queryParams],
    queryFn: () =>
      getJson<Paginated<AckHistoryItem>>(
        `/api/alarmes/acquittements?${queryParams}`,
      ),
    enabled: !loading && canAccess,
    staleTime: 60_000,
  })

  const exportQuery = useQuery({
    queryKey: ["alarm-ack-history-export", exportQueryParams],
    queryFn: async () => {
      const firstPage = await getJson<Paginated<AckHistoryItem>>(
        `/api/alarmes/acquittements?${exportQueryParams}`,
      )
      if (firstPage.pagination.pages <= 1) return firstPage

      const pages = await Promise.all(
        Array.from({ length: firstPage.pagination.pages - 1 }, (_, index) => {
          const params = new URLSearchParams(exportQueryParams)
          params.set("page", String(index + 2))
          return getJson<Paginated<AckHistoryItem>>(
            `/api/alarmes/acquittements?${params.toString()}`,
          )
        }),
      )

      return {
        ...firstPage,
        data: [firstPage.data, ...pages.map((result) => result.data)].flat(),
      }
    },
    enabled: !loading && canAccess,
    staleTime: 60_000,
  })

  const columns = useMemo<ColumnDef<AckHistoryItem>[]>(
    () => [
      {
        accessorKey: "acknowledgedAt",
        header: t("table.columns.acknowledgedAt"),
        meta: {
          exportLabel: t("table.columns.acknowledgedAt"),
          exportValue: (row: AckHistoryItem) => row.acknowledgedAt ? formatDbDateTime(row.acknowledgedAt, { format: "dateTimeSeconds" }) : "-",
        },
        cell: ({ row }) => row.original.acknowledgedAt ? formatDbDateTime(row.original.acknowledgedAt, { format: "dateTimeSeconds" }) : "-",
      },
      {
        accessorKey: "acknowledgedBy",
        header: t("table.columns.acknowledgedBy"),
        meta: { exportLabel: t("table.columns.acknowledgedBy") },
      },
      {
        id: "siteLocation",
        accessorFn: (row) => `${row.siteName || ""} ${row.locationName || ""}`.trim(),
        header: t("table.columns.location"),
        meta: { exportLabel: t("table.columns.location") },
        cell: ({ row }) => (
          <div className="min-w-0">
            <div className="font-medium">{row.original.locationName || "-"}</div>
            <div className="text-xs text-muted-foreground">{row.original.siteName || "-"}</div>
          </div>
        ),
      },
      {
        id: "duration",
        accessorFn: (row) => row.durationMs ?? -1,
        header: t("table.columns.duration"),
        meta: {
          exportLabel: t("table.columns.duration"),
          exportValue: (row: AckHistoryItem) => {
            if (row.durationMs === null || row.durationMs < 0) return "-";
            const totalMinutes = Math.max(Math.floor(row.durationMs / 60000), 0);
            const hours = Math.floor(totalMinutes / 60);
            const minutes = totalMinutes % 60;
            return hours > 0 ? `${hours}h ${minutes}min` : `${minutes}min`;
          },
        },
        cell: ({ row }) => {
          const durationMs = row.original.durationMs;
          if (durationMs === null || durationMs < 0) return "-";
          const totalMinutes = Math.max(Math.floor(durationMs / 60000), 0);
          const hours = Math.floor(totalMinutes / 60);
          const minutes = totalMinutes % 60;
          return hours > 0 ? `${hours}h ${minutes}min` : `${minutes}min`;
        },
      },
      {
        accessorKey: "alarmType",
        header: t("table.columns.type"),
        meta: {
          exportLabel: t("table.columns.type"),
          exportValue: (row: AckHistoryItem) => formatAlarmType(t, row.alarmType),
        },
        cell: ({ row }) => formatAlarmType(t, row.original.alarmType),
      },
      {
        id: "alarmValue",
        accessorFn: (row) => formatAlarmValueForDisplay(row.alarmValue, locale),
        header: t("table.columns.value"),
        meta: { exportLabel: t("table.columns.value") },
        cell: ({ row }) => formatAlarmValueForDisplay(row.original.alarmValue, locale),
      },
      {
        id: "period",
        accessorFn: (row) => `${row.triggeredAt || ""} ${row.endedAt || ""}`.trim(),
        header: t("table.columns.period"),
        meta: {
          exportLabel: t("table.columns.period"),
          exportValue: (row: AckHistoryItem) => [
            `${t("table.period.start")} ${row.triggeredAt ? formatDbDateTime(row.triggeredAt, { format: "dateTimeSeconds" }) : "-"}`,
            `${t("table.period.end")} ${row.endedAt ? formatDbDateTime(row.endedAt, { format: "dateTimeSeconds" }) : "-"}`,
          ].join(" / "),
        },
        cell: ({ row }) => (
          <div className="space-y-1 text-xs">
            <div>
              <span className="text-muted-foreground">{t("table.period.start")} </span>
              <span>{row.original.triggeredAt ? formatDbDateTime(row.original.triggeredAt, { format: "dateTimeSeconds" }) : "-"}</span>
            </div>
            <div>
              <span className="text-muted-foreground">{t("table.period.end")} </span>
              <span>{row.original.endedAt ? formatDbDateTime(row.original.endedAt, { format: "dateTimeSeconds" }) : "-"}</span>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "comment",
        header: t("table.columns.comment"),
        meta: { exportLabel: t("table.columns.comment") },
        cell: ({ row }) => (
          <div className="max-w-88 whitespace-pre-wrap wrap-break-word text-sm">
            {row.original.comment || "-"}
          </div>
        ),
      },
    ],
    [locale, t],
  )

  if (loading || (!canAccess && !loading)) {
    return null
  }

  const data = query.data?.data ?? []
  const paginationMeta = query.data?.pagination
  const lieuOptions = query.data?.filters?.lieux ?? []

  const resetFilters = () => {
    const cleared = {
      q: "",
      lieuId: "all",
      dateFrom: "",
      dateTo: "",
      type: "all",
    }
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
    setDraftFilters(cleared)
    setAppliedFilters({
      q: "",
      lieuId: "all",
      dateFrom: "",
      dateTo: "",
      type: "all",
    })
  }

  return (
    <div className="flex min-h-full flex-col">
      <PageHeader
        title={t("title")}
        description={t("description")}
      >
      </PageHeader>

      <div className="p-4 md:p-6">
        <Card>
          <CardContent className="p-3 md:p-4">
            <TanStackTable
              columns={columns}
              data={data}
              showSearch={false}
              emptyMessage={t("empty")}
              isLoading={query.isLoading || query.isFetching}
              enablePrint={false}
              exportFormats={["csv", "xlsx", "pdf"]}
              toolbarRight={
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative min-w-[16rem]">
                    <Input
                      value={draftFilters.q}
                      onChange={(event) => {
                        const value = event.target.value;
                        setPagination((prev) => ({ ...prev, pageIndex: 0 }));
                        setDraftFilters((prev) => ({ ...prev, q: value }));
                        setAppliedFilters((prev) => ({ ...prev, q: value }));
                      }}
                      placeholder={t("table.search")}
                      className="pl-10"
                    />
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  </div>

                  <Select
                    value={draftFilters.lieuId}
                    onValueChange={(value) => {
                      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
                      setDraftFilters((prev) => ({ ...prev, lieuId: value }));
                      setAppliedFilters((prev) => ({ ...prev, lieuId: value }));
                    }}
                  >
                    <SelectTrigger className="w-56">
                      <SelectValue placeholder={t("filters.location")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("filters.allLocations")}</SelectItem>
                      {lieuOptions.map((lieu) => (
                        <SelectItem key={lieu.id} value={String(lieu.id)}>
                          {lieu.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={draftFilters.type}
                    onValueChange={(value) => {
                      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
                      setDraftFilters((prev) => ({ ...prev, type: value }));
                      setAppliedFilters((prev) => ({ ...prev, type: value }));
                    }}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder={t("filters.type")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("filters.allTypes")}</SelectItem>
                      <SelectItem value="HIGH">{t("table.type.high")}</SelectItem>
                      <SelectItem value="LOW">{t("table.type.low")}</SelectItem>
                      <SelectItem value="NO_RESPONSE">{t("table.type.no_response")}</SelectItem>
                      <SelectItem value="SECTOR">{t("table.type.sector")}</SelectItem>
                      <SelectItem value="MODULE">{t("table.type.module")}</SelectItem>
                    </SelectContent>
                  </Select>

                  <Input
                    type="date"
                    value={draftFilters.dateFrom}
                    onChange={(event) => {
                      const value = event.target.value;
                      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
                      setDraftFilters((prev) => ({ ...prev, dateFrom: value }));
                      setAppliedFilters((prev) => ({ ...prev, dateFrom: value }));
                    }}
                    className="w-44"
                    aria-label={t("filters.dateFrom")}
                  />

                  <Input
                    type="date"
                    value={draftFilters.dateTo}
                    onChange={(event) => {
                      const value = event.target.value;
                      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
                      setDraftFilters((prev) => ({ ...prev, dateTo: value }));
                      setAppliedFilters((prev) => ({ ...prev, dateTo: value }));
                    }}
                    className="w-44"
                    aria-label={t("filters.dateTo")}
                  />

                  <Button variant="outline" size="sm" onClick={() => query.refetch()} disabled={query.isFetching} className="gap-2">
                    <RefreshCw className={cn("h-4 w-4", query.isFetching && "animate-spin")} />
                    {t("actions.refresh")}
                  </Button>

                  <Button variant="ghost" size="sm" onClick={resetFilters} className="gap-2">
                    <RotateCcw className="h-4 w-4" />
                    {t("actions.reset")}
                  </Button>
                </div>
              }
              manualPagination
              pageCount={paginationMeta?.pages ?? 1}
              totalRows={paginationMeta?.total ?? 0}
              paginationState={pagination}
              onPaginationChange={(updater) => {
                setPagination((prev) => {
                  const next = typeof updater === "function" ? updater(prev) : updater
                  if (next.pageSize !== prev.pageSize) {
                    return { pageIndex: 0, pageSize: next.pageSize }
                  }
                  return next
                })
              }}
              maxHeight="70vh"
              exportFileName={`historique-acquittements-alarmes-${new Date().toISOString().slice(0, 10)}`}
              exportData={exportQuery.data?.data ?? data}
              exportTitle={t("title")}
              exportFilters={[
                { label: t("filters.location"), value: draftFilters.lieuId === "all" ? t("filters.allLocations") : (lieuOptions.find((lieu) => String(lieu.id) === draftFilters.lieuId)?.name ?? draftFilters.lieuId) },
                { label: t("filters.type"), value: draftFilters.type === "all" ? t("filters.allTypes") : formatAlarmType(t, draftFilters.type) },
                { label: t("filters.dateFrom"), value: draftFilters.dateFrom || "-" },
                { label: t("filters.dateTo"), value: draftFilters.dateTo || "-" },
                { label: t("table.search"), value: draftFilters.q.trim() || "-" },
              ]}
              headerClassName="!bg-sidebar !text-sidebar-foreground"
              headerCellClassName="!bg-sidebar !text-sidebar-foreground !border-r !border-white/25 hover:!bg-sidebar-accent/80"
              tableClassName="border-separate border-spacing-0 [&_thead_th]:!border-r [&_thead_th]:!border-white/25 [&_tbody_td]:!border-b [&_tbody_td]:!border-border"
            />
          </CardContent>
        </Card>

        <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <History className="h-4 w-4" />
          <span>{t("helper")}</span>
        </div>
      </div>
    </div>
  )
}
