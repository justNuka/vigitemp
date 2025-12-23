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
  Clock
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

export default function AdminDashboard() {
  const [systemLogsPage, setSystemLogsPage] = useState(1);

  // Use individual queries with independent refetch intervals
  const connectedUsersQuery = useConnectedUsers();
  const activeAlarmsQuery = useActiveAlarms();
  const acknowledgmentsQuery = useAcknowledgments();
  const systemLogsQuery = useSystemLogs(systemLogsPage);
  const backupsQuery = useBackups();

  // Show initial loading only for first load
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
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
          <p className="mt-4 text-muted-foreground">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full">
      <PageHeader title="Tableau de Bord Admin" />
      
      <div className="space-y-6 p-6">
      {/* Journal acquittements (full width, prioritaire) */}
      <Card className="lg:min-h-96">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            Journal Acquittements Alarmes
          </CardTitle>
          <CardDescription className="flex items-center justify-between">
            <span>Historique des actions ({acknowledgmentsQuery.data?.length || 0})</span>
            {acknowledgmentsQuery.isFetching && (
              <span className="text-xs text-blue-600">Mise à jour...</span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable 
            columns={acknowledgmentColumns} 
            data={acknowledgmentsQuery.data || []}
            emptyMessage="Aucun acquittement d'alarme enregistré"
          />
        </CardContent>
      </Card>

      {/* Section 1: Important items (2 columns) */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Utilisateurs Connectés */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Utilisateurs Connectés
            </CardTitle>
            <CardDescription className="flex items-center justify-between">
              <span>Sessions actives ({connectedUsersQuery.data?.length || 0})</span>
              {connectedUsersQuery.isFetching && (
                <span className="text-xs text-blue-600">Mise à jour...</span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable 
              columns={connectedUsersColumns} 
              data={connectedUsersQuery.data || []}
              emptyMessage="Aucun utilisateur connecté actuellement"
            />
          </CardContent>
        </Card>

        {/* Alarmes en Cours */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Alarmes en Cours
            </CardTitle>
            <CardDescription className="flex items-center justify-between">
              <span>État actuel ({activeAlarmsQuery.data?.length || 0})</span>
              {activeAlarmsQuery.isFetching && (
                <span className="text-xs text-blue-600">Mise à jour...</span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable 
              columns={activeAlarmsColumns} 
              data={activeAlarmsQuery.data || []}
              emptyMessage="Aucune alarme active en cours"
            />
          </CardContent>
        </Card>
      </div>

      {/* Section 2: Less important items (smaller, at bottom) */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Journal Système */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Journal Système
            </CardTitle>
            <CardDescription className="flex items-center justify-between">
              <span>Événements récents ({systemLogsQuery.data?.pagination.total || 0} total)</span>
              {systemLogsQuery.isFetching && (
                <span className="text-xs text-blue-600">Mise à jour...</span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <DataTable 
              columns={systemLogsColumns} 
              data={systemLogsQuery.data?.data || []}
              emptyMessage="Aucun événement système enregistré"
            />
            {/* Pagination Controls */}
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">
                Page {systemLogsPage} sur {systemLogsQuery.data?.pagination.pages || 1}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSystemLogsPage((p) => Math.max(1, p - 1))}
                  disabled={systemLogsPage === 1}
                >
                  Précédent
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSystemLogsPage((p) => Math.min(systemLogsQuery.data?.pagination.pages || 1, p + 1))}
                  disabled={systemLogsPage === systemLogsQuery.data?.pagination.pages}
                >
                  Suivant
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sauvegarde Système */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Sauvegarde Système
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
                  ? new Date(backupsQuery.data[0]?.dateHeure).toLocaleString() 
                  : "N/A"}
              </p>
            </div>
            <Button className="w-full">Lancer Sauvegarde</Button>
            <div className="mt-4">
              <DataTable 
                columns={backupColumns} 
                data={backupsQuery.data || []}
                emptyMessage="Aucun historique de sauvegarde disponible"
              />
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  );
}
