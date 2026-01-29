"use client"

import { useCallback, useState } from "react"
import { useLocale, useTranslations } from "next-intl"
import { AlertTriangle, BookOpen, CheckCircle2, Clock, Database, Users, Cpu } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"

import { PageHeader } from "@/components/page-header"
import { TanStackTable } from "@/components/data-table/tanstack-table"
import { getAcknowledgmentColumns } from "@/components/data-table/acknowledgment-columns"
import { getActiveAlarmsColumns } from "@/components/data-table/active-alarms-columns"
import { getBackupColumns } from "@/components/data-table/backup-columns"
import { getConnectedUsersColumns } from "@/components/data-table/connected-users-columns"
import { getSystemLogsColumns } from "@/components/data-table/system-logs-columns"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  useAcknowledgments,
  useActiveAlarms,
  useBackups,
  useConnectedUsers,
  useSystemLogs,
} from "@/hooks/useAdminData"
import { useUnassignedProbes, type Probe } from "@/hooks/useProbes"
import { usePrefetchNextPage } from "@/hooks/usePrefetchNextPage"
import { getJson } from "@/lib/http"

function PaginationControls(props: {
  page: number
  pages: number
  onPrev: () => void
  onNext: () => void
  pageSize?: number
  pageSizeOptions?: number[]
  onPageSizeChange?: (next: number) => void
}) {
  const t = useTranslations("adminDashboard")
  return (
    <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        {t("pagination.page", { page: props.page, pages: props.pages })}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {props.pageSize && props.pageSizeOptions && props.onPageSizeChange && (
          <Select
            value={String(props.pageSize)}
            onValueChange={(value) => props.onPageSizeChange?.(Number(value))}
          >
            <SelectTrigger className="w-32">
              <SelectValue aria-label={t("pagination.page_size_label")} />
            </SelectTrigger>
            <SelectContent>
              {props.pageSizeOptions.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {t("pagination.page_size_option", { size })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={props.onPrev}
          disabled={props.page === 1}
          className="border-primary/40 text-primary hover:bg-primary/10"
        >
          {t("pagination.previous")}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={props.onNext}
          disabled={props.page === props.pages}
          className="border-primary/40 text-primary hover:bg-primary/10"
        >
          {t("pagination.next")}
        </Button>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const t = useTranslations("adminDashboard")
  const locale = useLocale()
  const [ackPage, setAckPage] = useState(1)
  const [connectedUsersPage, setConnectedUsersPage] = useState(1)
  const [activeAlarmsPage, setActiveAlarmsPage] = useState(1)
  const [unassignedPage, setUnassignedPage] = useState(1)
  const [unassignedPageSize, setUnassignedPageSize] = useState(20)

  const connectedUsersQuery = useConnectedUsers(connectedUsersPage)
  const activeAlarmsQuery = useActiveAlarms(activeAlarmsPage)
  const acknowledgmentsQuery = useAcknowledgments(ackPage)
  const systemLogsQuery = useSystemLogs()
  const backupsQuery = useBackups()
  const unassignedProbesQuery = useUnassignedProbes({
    page: unassignedPage,
    limit: unassignedPageSize,
  })

  usePrefetchNextPage({
    enabled: Boolean(acknowledgmentsQuery.data),
    page: ackPage,
    pages: acknowledgmentsQuery.data?.pagination.pages || 1,
    queryKey: useCallback((page: number) => ["admin", "acquittements", page], []),
    queryFn: useCallback((page: number) => {
      return getJson(`/api/admin/acquittements?page=${page}&limit=10`)
    }, []),
    staleTime: 10 * 60_000,
  })

  usePrefetchNextPage({
    enabled: Boolean(connectedUsersQuery.data),
    page: connectedUsersPage,
    pages: connectedUsersQuery.data?.pagination.pages || 1,
    queryKey: useCallback((page: number) => ["admin", "utilisateurs-connectes", page], []),
    queryFn: useCallback((page: number) => {
      return getJson(`/api/admin/utilisateurs-connectes?page=${page}&limit=10`)
    }, []),
    staleTime: 5_000,
  })

  usePrefetchNextPage({
    enabled: Boolean(activeAlarmsQuery.data),
    page: activeAlarmsPage,
    pages: activeAlarmsQuery.data?.pagination.pages || 1,
    queryKey: useCallback((page: number) => ["admin", "alarmes-actives", page], []),
    queryFn: useCallback((page: number) => {
      return getJson(`/api/admin/alarmes-actives?page=${page}&limit=10`)
    }, []),
    staleTime: 10 * 60_000,
  })

  usePrefetchNextPage({
    enabled: Boolean(unassignedProbesQuery.data),
    page: unassignedPage,
    pages: unassignedProbesQuery.data?.pagination.pages || 1,
    queryKey: useCallback(
      (page: number) => ["probes", "unassigned", page, unassignedPageSize],
      [unassignedPageSize],
    ),
    queryFn: useCallback(
      (page: number) => {
        return getJson(`/api/sondes/unassigned?page=${page}&limit=${unassignedPageSize}`)
      },
      [unassignedPageSize],
    ),
    staleTime: 60_000,
  })

  const lastBackupDate = (backupsQuery.data as any)?.[0]?.dateHeure
  const lastBackupLabel = lastBackupDate
    ? new Date(lastBackupDate).toLocaleString(locale)
    : t("backup.last.none")

  const isInitialLoading =
    connectedUsersQuery.isLoading &&
    activeAlarmsQuery.isLoading &&
    acknowledgmentsQuery.isLoading &&
    systemLogsQuery.isLoading &&
    backupsQuery.isLoading

  const unassignedColumns: ColumnDef<Probe>[] = [
    { accessorKey: "Sonde_Numero_Serie", header: t("unassigned.columns.probe") },
    { accessorKey: "Sonde_Type", header: t("unassigned.columns.type"), cell: ({ row }) => row.original.Sonde_Type || "-" },
    { accessorKey: "Adresse_Sonde", header: t("unassigned.columns.address"), cell: ({ row }) => row.original.Adresse_Sonde || "-" },
    { accessorKey: "Id_Module", header: t("unassigned.columns.module"), cell: ({ row }) => row.original.Id_Module ?? "-" },
  ]

  if (isInitialLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
          <p className="mt-4 text-muted-foreground">{t("loading")}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-full flex-col">
      <PageHeader title={t("title")} />

      <div className="space-y-6 p-6">
        <Card className="lg:min-h-96">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              {t("acknowledgments.title")}
            </CardTitle>
            <CardDescription className="flex items-center justify-between">
              <span>
                {t("acknowledgments.description", {
                  total: acknowledgmentsQuery.data?.pagination.total || 0,
                  max: 50,
                })}
              </span>
              {acknowledgmentsQuery.isFetching && (
                <span className="text-xs text-blue-600">{t("updating")}</span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TanStackTable
              columns={getAcknowledgmentColumns(t)}
              data={acknowledgmentsQuery.data?.data || []}
              emptyMessage={t("acknowledgments.empty")}
              maxHeight="420px"
              showPagination={false}
              showSearch={false}
              enableExport={false}
              enablePrint={false}
              headerClassName="!bg-sidebar !text-sidebar-foreground"
              headerCellClassName="!bg-sidebar !text-sidebar-foreground !border-r !border-white/25 hover:!bg-sidebar-accent/80 !text-center"
              bodyClassName="[&_td]:text-center"
              tableClassName="border-separate border-spacing-0 [&_thead_th]:!border-r [&_thead_th]:!border-white/25 [&_thead_th:last-child]:!border-r-0"
            />
            <PaginationControls
              page={ackPage}
              pages={acknowledgmentsQuery.data?.pagination.pages || 1}
              onPrev={() => setAckPage((p) => Math.max(1, p - 1))}
              onNext={() =>
                setAckPage((p) => Math.min(acknowledgmentsQuery.data?.pagination.pages || 1, p + 1))
              }
            />
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                {t("connected_users.title")}
              </CardTitle>
              <CardDescription className="flex items-center justify-between">
                <span>
                  {t("connected_users.description", {
                    total: connectedUsersQuery.data?.pagination.total || 0,
                    max: 50,
                  })}
                </span>
                {connectedUsersQuery.isFetching && (
                  <span className="text-xs text-blue-600">{t("updating")}</span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TanStackTable
                columns={getConnectedUsersColumns(t)}
                data={connectedUsersQuery.data?.data || []}
                emptyMessage={t("connected_users.empty")}
                maxHeight="320px"
                showPagination={false}
                showSearch={false}
                enableExport={false}
                enablePrint={false}
                headerClassName="!bg-sidebar !text-sidebar-foreground"
                headerCellClassName="!bg-sidebar !text-sidebar-foreground !border-r !border-white/25 hover:!bg-sidebar-accent/80 !text-center"
                bodyClassName="[&_td]:text-center"
                tableClassName="border-separate border-spacing-0 [&_thead_th]:!border-r [&_thead_th]:!border-white/25 [&_thead_th:last-child]:!border-r-0"
              />
              <PaginationControls
                page={connectedUsersPage}
                pages={connectedUsersQuery.data?.pagination.pages || 1}
                onPrev={() => setConnectedUsersPage((p) => Math.max(1, p - 1))}
                onNext={() =>
                  setConnectedUsersPage((p) =>
                    Math.min(connectedUsersQuery.data?.pagination.pages || 1, p + 1),
                  )
                }
              />
            </CardContent>
          </Card>

          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                {t("active_alarms.title")}
              </CardTitle>
              <CardDescription className="flex items-center justify-between">
                <span>
                  {t("active_alarms.description", {
                    total: activeAlarmsQuery.data?.pagination.total || 0,
                    max: 50,
                  })}
                </span>
                {activeAlarmsQuery.isFetching && (
                  <span className="text-xs text-blue-600">{t("updating")}</span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TanStackTable
                columns={getActiveAlarmsColumns(t)}
                data={activeAlarmsQuery.data?.data || []}
                emptyMessage={t("active_alarms.empty")}
                maxHeight="320px"
                showPagination={false}
                showSearch={false}
                enableExport={false}
                enablePrint={false}
                headerClassName="!bg-sidebar !text-sidebar-foreground"
                headerCellClassName="!bg-sidebar !text-sidebar-foreground !border-r !border-white/25 hover:!bg-sidebar-accent/80 !text-center"
                bodyClassName="[&_td]:text-center"
                tableClassName="border-separate border-spacing-0 [&_thead_th]:!border-r [&_thead_th]:!border-white/25 [&_thead_th:last-child]:!border-r-0"
              />
              <PaginationControls
                page={activeAlarmsPage}
                pages={activeAlarmsQuery.data?.pagination.pages || 1}
                onPrev={() => setActiveAlarmsPage((p) => Math.max(1, p - 1))}
                onNext={() =>
                  setActiveAlarmsPage((p) =>
                    Math.min(activeAlarmsQuery.data?.pagination.pages || 1, p + 1),
                  )
                }
              />
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                {t("system_logs.title")}
              </CardTitle>
              <CardDescription className="flex items-center justify-between">
                <span>
                  {t("system_logs.description", {
                    total: systemLogsQuery.data?.pagination.total || 0,
                    count: 50,
                  })}
                </span>
                {systemLogsQuery.isFetching && (
                  <span className="text-xs text-blue-600">{t("updating")}</span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <TanStackTable
                columns={getSystemLogsColumns(t)}
                data={systemLogsQuery.data?.data || []}
                emptyMessage={t("system_logs.empty")}
                maxHeight="380px"
                showPagination={false}
                showSearch={false}
                enableExport={false}
                enablePrint={false}
                headerClassName="!bg-sidebar !text-sidebar-foreground"
                headerCellClassName="!bg-sidebar !text-sidebar-foreground !border-r !border-white/25 hover:!bg-sidebar-accent/80 !text-center"
                bodyClassName="[&_td]:text-center"
                tableClassName="border-separate border-spacing-0 [&_thead_th]:!border-r [&_thead_th]:!border-white/25 [&_thead_th:last-child]:!border-r-0"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                {t("backup.title")}
              </CardTitle>
              <CardDescription className="flex items-center justify-between">
                <span>{t("backup.description")}</span>
                {backupsQuery.isFetching && (
                  <span className="text-xs text-blue-600">{t("updating")}</span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">{t("backup.last.label")}</p>
                <p className="mt-1 flex items-center gap-2 text-sm font-medium">
                  <Clock className="h-4 w-4" />
                  {lastBackupLabel}
                </p>
              </div>
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                {t("backup.actions.run")}
              </Button>
              <div className="mt-4">
                <TanStackTable
                  columns={getBackupColumns(t)}
                  data={backupsQuery.data || []}
                  emptyMessage={t("backup.empty")}
                  maxHeight="240px"
                  showPagination={false}
                  showSearch={false}
                  enableExport={false}
                  enablePrint={false}
                  headerClassName="!bg-sidebar !text-sidebar-foreground"
                  headerCellClassName="!bg-sidebar !text-sidebar-foreground !border-r !border-white/25 hover:!bg-sidebar-accent/80"
                  tableClassName="border-separate border-spacing-0 [&_thead_th]:!border-r [&_thead_th]:!border-white/25 [&_thead_th:last-child]:!border-r-0"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="lg:max-w-3xl mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="h-5 w-5" />
              {t("unassigned.title")}
            </CardTitle>
            <CardDescription>
              {t("unassigned.description", {
                count: unassignedProbesQuery.data?.pagination.total || 0,
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TanStackTable
              columns={unassignedColumns}
              data={unassignedProbesQuery.data?.data || []}
              emptyMessage={t("unassigned.empty")}
              maxHeight="240px"
              isLoading={unassignedProbesQuery.isLoading}
              showPagination={false}
              showSearch={false}
              enableExport={false}
              enablePrint={false}
              headerClassName="!bg-sidebar !text-sidebar-foreground"
              headerCellClassName="!bg-sidebar !text-sidebar-foreground !border-r !border-white/25 hover:!bg-sidebar-accent/80 !text-center"
              bodyClassName="[&_td]:text-center"
              tableClassName="border-separate border-spacing-0 [&_thead_th]:!border-r [&_thead_th]:!border-white/25 [&_thead_th:last-child]:!border-r-0"
            />
            <PaginationControls
              page={unassignedPage}
              pages={unassignedProbesQuery.data?.pagination.pages || 1}
              pageSize={unassignedPageSize}
              pageSizeOptions={[10, 20, 50]}
              onPageSizeChange={(next) => {
                setUnassignedPage(1)
                setUnassignedPageSize(next)
              }}
              onPrev={() => setUnassignedPage((p) => Math.max(1, p - 1))}
              onNext={() =>
                setUnassignedPage((p) =>
                  Math.min(unassignedProbesQuery.data?.pagination.pages || 1, p + 1),
                )
              }
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
