"use client"

import { useEffect, useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import type { ColumnDef } from "@tanstack/react-table"
import { Filter, History, RefreshCw, RotateCcw } from "lucide-react"
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
  alarmType: string | null
  alarmValue: string | null
  triggeredAt: string | null
  endedAt: string | null
}

type Paginated<T> = {
  data: T[]
  filters?: {
    sites: Array<{ id: number; name: string }>
  }
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

function formatAlarmType(t: ReturnType<typeof useTranslations>, type: string | null) {
  switch (type) {
    case "HIGH":
      return t("table.type.high")
    case "LOW":
      return t("table.type.low")
    case "NO_RESPONSE":
      return t("table.type.no_response")
    default:
      return type || "-"
  }
}

export function AlarmAcknowledgmentHistoryClient() {
  const t = useTranslations("alarmAckHistoryPage")
  const { hasPermission, loading } = useAppAccess()
  const router = useRouter()
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 })
  const [draftFilters, setDraftFilters] = useState({
    q: "",
    siteId: "all",
    dateFrom: "",
    dateTo: "",
    type: "all",
  })
  const [appliedFilters, setAppliedFilters] = useState({
    q: "",
    siteId: "all",
    dateFrom: "",
    dateTo: "",
    type: "all",
  })

  const canAccess = hasPermission("METROLOGY_WORK_ACCESS")
  const page = pagination.pageIndex + 1
  const limit = pagination.pageSize
  const queryParams = useMemo(() => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    })
    if (appliedFilters.q.trim()) params.set("q", appliedFilters.q.trim())
    if (appliedFilters.siteId !== "all") params.set("siteId", appliedFilters.siteId)
    if (appliedFilters.dateFrom) params.set("dateFrom", appliedFilters.dateFrom)
    if (appliedFilters.dateTo) params.set("dateTo", appliedFilters.dateTo)
    if (appliedFilters.type !== "all") params.set("type", appliedFilters.type)
    return params.toString()
  }, [appliedFilters, limit, page])

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

  const columns = useMemo<ColumnDef<AckHistoryItem>[]>(
    () => [
      {
        accessorKey: "acknowledgedAt",
        header: t("table.columns.acknowledgedAt"),
        meta: { exportLabel: t("table.columns.acknowledgedAt") },
        cell: ({ row }) => row.original.acknowledgedAt ? formatDbDateTime(row.original.acknowledgedAt) : "-",
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
        accessorKey: "sensorSerial",
        header: t("table.columns.sensor"),
        meta: { exportLabel: t("table.columns.sensor") },
        cell: ({ row }) => row.original.sensorSerial || "-",
      },
      {
        accessorKey: "alarmType",
        header: t("table.columns.type"),
        meta: { exportLabel: t("table.columns.type") },
        cell: ({ row }) => formatAlarmType(t, row.original.alarmType),
      },
      {
        accessorKey: "alarmValue",
        header: t("table.columns.value"),
        meta: { exportLabel: t("table.columns.value") },
        cell: ({ row }) => row.original.alarmValue || "-",
      },
      {
        id: "period",
        accessorFn: (row) => `${row.triggeredAt || ""} ${row.endedAt || ""}`.trim(),
        header: t("table.columns.period"),
        meta: { exportLabel: t("table.columns.period") },
        cell: ({ row }) => (
          <div className="space-y-1 text-xs">
            <div>
              <span className="text-muted-foreground">{t("table.period.start")} </span>
              <span>{row.original.triggeredAt ? formatDbDateTime(row.original.triggeredAt) : "-"}</span>
            </div>
            <div>
              <span className="text-muted-foreground">{t("table.period.end")} </span>
              <span>{row.original.endedAt ? formatDbDateTime(row.original.endedAt) : "-"}</span>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "comment",
        header: t("table.columns.comment"),
        meta: { exportLabel: t("table.columns.comment") },
        cell: ({ row }) => (
          <div className="max-w-[22rem] whitespace-pre-wrap break-words text-sm">
            {row.original.comment || "-"}
          </div>
        ),
      },
    ],
    [t],
  )

  if (loading || (!canAccess && !loading)) {
    return null
  }

  const data = query.data?.data ?? []
  const paginationMeta = query.data?.pagination
  const siteOptions = query.data?.filters?.sites ?? []

  const applyFilters = () => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
    setAppliedFilters({
      q: draftFilters.q,
      siteId: draftFilters.siteId,
      dateFrom: draftFilters.dateFrom,
      dateTo: draftFilters.dateTo,
      type: draftFilters.type,
    })
  }

  const resetFilters = () => {
    const cleared = {
      q: "",
      siteId: "all",
      dateFrom: "",
      dateTo: "",
      type: "all",
    }
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
    setDraftFilters(cleared)
    setAppliedFilters({
      q: "",
      siteId: "all",
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
        <Button
          variant="outline"
          size="sm"
          onClick={() => query.refetch()}
          disabled={query.isFetching}
          className="gap-2"
        >
          <RefreshCw className={cn("h-4 w-4", query.isFetching && "animate-spin")} />
          {t("actions.refresh")}
        </Button>
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
              exportFormats={["csv", "pdf"]}
              toolbarRight={
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative min-w-[14rem]">
                    <Input
                      value={draftFilters.q}
                      onChange={(event) =>
                        setDraftFilters((prev) => ({ ...prev, q: event.target.value }))
                      }
                      placeholder={t("table.search")}
                      className="pr-10"
                    />
                    <Filter className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  </div>

                  <Select
                    value={draftFilters.siteId}
                    onValueChange={(value) =>
                      setDraftFilters((prev) => ({ ...prev, siteId: value }))
                    }
                  >
                    <SelectTrigger className="w-[14rem]">
                      <SelectValue placeholder={t("filters.site")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("filters.allSites")}</SelectItem>
                      {siteOptions.map((site) => (
                        <SelectItem key={site.id} value={String(site.id)}>
                          {site.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={draftFilters.type}
                    onValueChange={(value) =>
                      setDraftFilters((prev) => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger className="w-[12rem]">
                      <SelectValue placeholder={t("filters.type")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("filters.allTypes")}</SelectItem>
                      <SelectItem value="HIGH">{t("table.type.high")}</SelectItem>
                      <SelectItem value="LOW">{t("table.type.low")}</SelectItem>
                      <SelectItem value="NO_RESPONSE">{t("table.type.no_response")}</SelectItem>
                    </SelectContent>
                  </Select>

                  <Input
                    type="date"
                    value={draftFilters.dateFrom}
                    onChange={(event) =>
                      setDraftFilters((prev) => ({ ...prev, dateFrom: event.target.value }))
                    }
                    className="w-[11rem]"
                    aria-label={t("filters.dateFrom")}
                  />

                  <Input
                    type="date"
                    value={draftFilters.dateTo}
                    onChange={(event) =>
                      setDraftFilters((prev) => ({ ...prev, dateTo: event.target.value }))
                    }
                    className="w-[11rem]"
                    aria-label={t("filters.dateTo")}
                  />

                  <Button variant="outline" size="sm" onClick={applyFilters} className="gap-2">
                    <Filter className="h-4 w-4" />
                    {t("actions.apply")}
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
