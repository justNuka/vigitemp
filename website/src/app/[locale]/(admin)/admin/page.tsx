"use client"

import { useCallback, useState } from "react"
import { AlertTriangle, BookOpen, CheckCircle2, Clock, Database, Users, Cpu } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"

import { PageHeader } from "@/components/page-header"
import { TanStackTable } from "@/components/data-table/tanstack-table"
import { acknowledgmentColumns } from "@/components/data-table/acknowledgment-columns"
import { activeAlarmsColumns } from "@/components/data-table/active-alarms-columns"
import { backupColumns } from "@/components/data-table/backup-columns"
import { connectedUsersColumns } from "@/components/data-table/connected-users-columns"
import { systemLogsColumns } from "@/components/data-table/system-logs-columns"
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
  return (
    <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        Page {props.page} sur {props.pages}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {props.pageSize && props.pageSizeOptions && props.onPageSizeChange && (
          <Select
            value={String(props.pageSize)}
            onValueChange={(value) => props.onPageSizeChange?.(Number(value))}
          >
            <SelectTrigger className="w-32">
              <SelectValue aria-label="Taille de page" />
            </SelectTrigger>
            <SelectContent>
              {props.pageSizeOptions.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size} par page
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
          {"Pr\u00E9c\u00E9dent"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={props.onNext}
          disabled={props.page === props.pages}
          className="border-primary/40 text-primary hover:bg-primary/10"
        >
          Suivant
        </Button>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
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
  const lastBackupLabel = lastBackupDate ? new Date(lastBackupDate).toLocaleString() : "N/A"

  const isInitialLoading =
    connectedUsersQuery.isLoading &&
    activeAlarmsQuery.isLoading &&
    acknowledgmentsQuery.isLoading &&
    systemLogsQuery.isLoading &&
    backupsQuery.isLoading

  const unassignedColumns: ColumnDef<Probe>[] = [
    { accessorKey: "Sonde_Numero_Serie", header: "Sonde" },
    { accessorKey: "Sonde_Type", header: "Type", cell: ({ row }) => row.original.Sonde_Type || "-" },
    { accessorKey: "Adresse_Sonde", header: "Adresse", cell: ({ row }) => row.original.Adresse_Sonde || "-" },
    { accessorKey: "Id_Module", header: "Module", cell: ({ row }) => row.original.Id_Module ?? "-" },
  ]

  if (isInitialLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
          <p className="mt-4 text-muted-foreground">{"Chargement des donn\u00E9es..."}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-full flex-col">
      <PageHeader title="Tableau de bord admin" />

      <div className="space-y-6 p-6">
        <Card className="lg:min-h-96">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Journal acquittements alarmes
            </CardTitle>
            <CardDescription className="flex items-center justify-between">
              <span>
                Historique des actions ({acknowledgmentsQuery.data?.pagination.total || 0}, max 50)
              </span>
              {acknowledgmentsQuery.isFetching && (
                <span className="text-xs text-blue-600">{"Mise \u00E0 jour..."}</span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TanStackTable
              columns={acknowledgmentColumns}
              data={acknowledgmentsQuery.data?.data || []}
              emptyMessage={"Aucun acquittement d'alarme enregistr\u00E9"}
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
                {"Utilisateurs connect\u00E9s"}
              </CardTitle>
              <CardDescription className="flex items-center justify-between">
                <span>
                  Sessions actives ({connectedUsersQuery.data?.pagination.total || 0}, max 50)
                </span>
                {connectedUsersQuery.isFetching && (
                  <span className="text-xs text-blue-600">{"Mise \u00E0 jour..."}</span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TanStackTable
                columns={connectedUsersColumns}
                data={connectedUsersQuery.data?.data || []}
                emptyMessage={"Aucun utilisateur connect\u00E9 actuellement"}
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
                Alarmes en cours
              </CardTitle>
              <CardDescription className="flex items-center justify-between">
                <span>
                  {"\u00C9tat actuel"} ({activeAlarmsQuery.data?.pagination.total || 0}, max 50)
                </span>
                {activeAlarmsQuery.isFetching && (
                  <span className="text-xs text-blue-600">{"Mise \u00E0 jour..."}</span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TanStackTable
                columns={activeAlarmsColumns}
                data={activeAlarmsQuery.data?.data || []}
                emptyMessage="Aucune alarme active en cours"
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
                Journal d'audit
              </CardTitle>
              <CardDescription className="flex items-center justify-between">
                <span>
                  {"50 derni\u00E8res entr\u00E9es"} ({systemLogsQuery.data?.pagination.total || 0} au
                  total)
                </span>
                {systemLogsQuery.isFetching && (
                  <span className="text-xs text-blue-600">{"Mise \u00E0 jour..."}</span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <TanStackTable
                columns={systemLogsColumns}
                data={systemLogsQuery.data?.data || []}
                emptyMessage={"Aucune entr\u00E9e de journal d'audit"}
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
                {"Sauvegarde syst\u00E8me"}
              </CardTitle>
              <CardDescription className="flex items-center justify-between">
                <span>{"État et historique"}</span>
                {backupsQuery.isFetching && (
                  <span className="text-xs text-blue-600">{"Mise \u00E0 jour..."}</span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">{"Derni\u00E8re sauvegarde"}</p>
                <p className="mt-1 flex items-center gap-2 text-sm font-medium">
                  <Clock className="h-4 w-4" />
                  {lastBackupLabel}
                </p>
              </div>
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                Lancer sauvegarde
              </Button>
              <div className="mt-4">
                <TanStackTable
                  columns={backupColumns}
                  data={backupsQuery.data || []}
                  emptyMessage="Aucun historique de sauvegarde disponible"
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
              Sondes sans lieu
            </CardTitle>
            <CardDescription>
              {unassignedProbesQuery.data?.pagination.total || 0} sonde
              {(unassignedProbesQuery.data?.pagination.total || 0) > 1 ? "s" : ""} non affectée
              {(unassignedProbesQuery.data?.pagination.total || 0) > 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TanStackTable
              columns={unassignedColumns}
              data={unassignedProbesQuery.data?.data || []}
              emptyMessage="Aucune sonde sans lieu"
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
