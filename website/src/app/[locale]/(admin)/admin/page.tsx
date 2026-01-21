"use client"

import { useState } from "react"
import { AlertTriangle, BookOpen, CheckCircle2, Clock, Database, Users } from "lucide-react"

import { PageHeader } from "@/components/page-header"
import { TanStackTable } from "@/components/data-table/tanstack-table"
import { acknowledgmentColumns } from "@/components/data-table/acknowledgment-columns"
import { activeAlarmsColumns } from "@/components/data-table/active-alarms-columns"
import { backupColumns } from "@/components/data-table/backup-columns"
import { connectedUsersColumns } from "@/components/data-table/connected-users-columns"
import { systemLogsColumns } from "@/components/data-table/system-logs-columns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  useAcknowledgments,
  useActiveAlarms,
  useBackups,
  useConnectedUsers,
  useSystemLogs,
} from "@/hooks/useAdminData"

function PaginationControls(props: {
  page: number
  pages: number
  onPrev: () => void
  onNext: () => void
}) {
  return (
    <div className="flex items-center justify-between pt-4">
      <p className="text-sm text-muted-foreground">
        Page {props.page} sur {props.pages}
      </p>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={props.onPrev} disabled={props.page === 1}>
          {"Pr\u00E9c\u00E9dent"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={props.onNext}
          disabled={props.page === props.pages}
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

  const connectedUsersQuery = useConnectedUsers(connectedUsersPage)
  const activeAlarmsQuery = useActiveAlarms(activeAlarmsPage)
  const acknowledgmentsQuery = useAcknowledgments(ackPage)
  const systemLogsQuery = useSystemLogs()
  const backupsQuery = useBackups()

  const lastBackupDate = (backupsQuery.data as any)?.[0]?.dateHeure
  const lastBackupLabel = lastBackupDate ? new Date(lastBackupDate).toLocaleString() : "N/A"

  const isInitialLoading =
    connectedUsersQuery.isLoading &&
    activeAlarmsQuery.isLoading &&
    acknowledgmentsQuery.isLoading &&
    systemLogsQuery.isLoading &&
    backupsQuery.isLoading

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
                <span>{"\u00C9tat et historique"}</span>
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
              <Button className="w-full">Lancer sauvegarde</Button>
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
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
