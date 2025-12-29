"use client";

import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BookOpen,
  Users,
  AlertTriangle,
  CheckCircle2,
  Database,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table/data-table";
import { connectedUsersColumns } from "@/components/data-table/connected-users-columns";
import { activeAlarmsColumns } from "@/components/data-table/active-alarms-columns";
import { acknowledgmentColumns } from "@/components/data-table/acknowledgment-columns";
import { systemLogsColumns } from "@/components/data-table/system-logs-columns";
import { backupColumns } from "@/components/data-table/backup-columns";
import {
  useConnectedUsers,
  useActiveAlarms,
  useAcknowledgments,
  useSystemLogs,
  useBackups,
} from "@/hooks/useAdminData";

function PaginationControls(props: {
  page: number;
  pages: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex items-center justify-between pt-4">
      <p className="text-sm text-muted-foreground">
        Page {props.page} sur {props.pages}
      </p>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={props.onPrev} disabled={props.page === 1}>
          Précédent
        </Button>
        <Button variant="outline" size="sm" onClick={props.onNext} disabled={props.page === props.pages}>
          Suivant
        </Button>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [ackPage, setAckPage] = useState(1);
  const [connectedUsersPage, setConnectedUsersPage] = useState(1);
  const [activeAlarmsPage, setActiveAlarmsPage] = useState(1);
  const [systemLogsPage, setSystemLogsPage] = useState(1);

  const connectedUsersQuery = useConnectedUsers(connectedUsersPage);
  const activeAlarmsQuery = useActiveAlarms(activeAlarmsPage);
  const acknowledgmentsQuery = useAcknowledgments(ackPage);
  const systemLogsQuery = useSystemLogs(systemLogsPage);
  const backupsQuery = useBackups();

  const isInitialLoading =
    connectedUsersQuery.isLoading &&
    activeAlarmsQuery.isLoading &&
    acknowledgmentsQuery.isLoading &&
    systemLogsQuery.isLoading &&
    backupsQuery.isLoading;

  if (isInitialLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
          <p className="mt-4 text-muted-foreground">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full">
      <PageHeader title="Tableau de bord admin" />

      <div className="space-y-6 p-6">
        <Card className="lg:min-h-96">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              Journal acquittements alarmes
            </CardTitle>
            <CardDescription className="flex items-center justify-between">
              <span>
                Historique des actions ({acknowledgmentsQuery.data?.pagination.total || 0}, max 50)
              </span>
              {acknowledgmentsQuery.isFetching && (
                <span className="text-xs text-blue-600">Mise à jour...</span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={acknowledgmentColumns}
              data={acknowledgmentsQuery.data?.data || []}
              emptyMessage="Aucun acquittement d'alarme enregistré"
              maxHeight="420px"
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
                <Users className="w-5 h-5" />
                Utilisateurs connectés
              </CardTitle>
              <CardDescription className="flex items-center justify-between">
                <span>
                  Sessions actives ({connectedUsersQuery.data?.pagination.total || 0}, max 50)
                </span>
                {connectedUsersQuery.isFetching && (
                  <span className="text-xs text-blue-600">Mise à jour...</span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={connectedUsersColumns}
                data={connectedUsersQuery.data?.data || []}
                emptyMessage="Aucun utilisateur connecté actuellement"
                maxHeight="320px"
              />
              <PaginationControls
                page={connectedUsersPage}
                pages={connectedUsersQuery.data?.pagination.pages || 1}
                onPrev={() => setConnectedUsersPage((p) => Math.max(1, p - 1))}
                onNext={() =>
                  setConnectedUsersPage((p) =>
                    Math.min(connectedUsersQuery.data?.pagination.pages || 1, p + 1)
                  )
                }
              />
            </CardContent>
          </Card>

          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Alarmes en cours
              </CardTitle>
              <CardDescription className="flex items-center justify-between">
                <span>État actuel ({activeAlarmsQuery.data?.pagination.total || 0}, max 50)</span>
                {activeAlarmsQuery.isFetching && (
                  <span className="text-xs text-blue-600">Mise à jour...</span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={activeAlarmsColumns}
                data={activeAlarmsQuery.data?.data || []}
                emptyMessage="Aucune alarme active en cours"
                maxHeight="320px"
              />
              <PaginationControls
                page={activeAlarmsPage}
                pages={activeAlarmsQuery.data?.pagination.pages || 1}
                onPrev={() => setActiveAlarmsPage((p) => Math.max(1, p - 1))}
                onNext={() =>
                  setActiveAlarmsPage((p) =>
                    Math.min(activeAlarmsQuery.data?.pagination.pages || 1, p + 1)
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
                <BookOpen className="w-5 h-5" />
                Journal système
              </CardTitle>
              <CardDescription className="flex items-center justify-between">
                <span>Évènements récents ({systemLogsQuery.data?.pagination.total || 0}, max 50)</span>
                {systemLogsQuery.isFetching && (
                  <span className="text-xs text-blue-600">Mise à jour...</span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <DataTable
                columns={systemLogsColumns}
                data={systemLogsQuery.data?.data || []}
                emptyMessage="Aucun évènement système enregistré"
                maxHeight="380px"
              />
              <PaginationControls
                page={systemLogsPage}
                pages={systemLogsQuery.data?.pagination.pages || 1}
                onPrev={() => setSystemLogsPage((p) => Math.max(1, p - 1))}
                onNext={() =>
                  setSystemLogsPage((p) =>
                    Math.min(systemLogsQuery.data?.pagination.pages || 1, p + 1)
                  )
                }
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Sauvegarde système
              </CardTitle>
              <CardDescription className="flex items-center justify-between">
                <span>État et historique</span>
                {backupsQuery.isFetching && (
                  <span className="text-xs text-blue-600">Mise à jour...</span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Dernière sauvegarde</p>
                <p className="text-sm font-medium flex items-center gap-2 mt-1">
                  <Clock className="w-4 h-4" />
                  {backupsQuery.data && backupsQuery.data.length > 0
                    ? new Date((backupsQuery.data as any)[0]?.dateHeure ?? Date.now()).toLocaleString()
                    : "N/A"}
                </p>
              </div>
              <Button className="w-full">Lancer sauvegarde</Button>
              <div className="mt-4">
                <DataTable
                  columns={backupColumns}
                  data={backupsQuery.data || []}
                  emptyMessage="Aucun historique de sauvegarde disponible"
                  maxHeight="240px"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
