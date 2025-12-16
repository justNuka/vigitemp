"use client";

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
import { connectedUsersColumns, type ConnectedUser } from "@/components/data-table/connected-users-columns";
import { activeAlarmsColumns, type ActiveAlarm } from "@/components/data-table/active-alarms-columns";
import { acknowledgmentColumns, type AcknowledgmentRecord } from "@/components/data-table/acknowledgment-columns";
import { systemLogsColumns, type SystemLog } from "@/components/data-table/system-logs-columns";
import { backupColumns, type BackupRecord } from "@/components/data-table/backup-columns";

// Mock data
const mockConnectedUsers: ConnectedUser[] = [
  { id: "1", login: "jdupont", nom: "Dupont", prenom: "Jean", poste: "Superviseur", ip: "192.168.1.10" },
  { id: "2", login: "mmartinez", nom: "Martinez", prenom: "Marie", poste: "Technicien", ip: "192.168.1.20" },
];

const mockActiveAlarms: ActiveAlarm[] = [
  { id: "1", sonde: "SONDE-001", lieu: "Chambre froide A", valeur: "2.5°C", seuil: "< 0°C", duree: "2h 15min", statut: "Active" },
  { id: "2", sonde: "SONDE-005", lieu: "Zone 2", valeur: "-15°C", seuil: "> -20°C", duree: "45min", statut: "Active" },
];

const mockAcknowledgments: AcknowledgmentRecord[] = [
  { id: "1", dateHeure: "2025-12-16 14:30", utilisateur: "jdupont", action: "Acquittement", sonde: "SONDE-001", alarme: "Température basse" },
  { id: "2", dateHeure: "2025-12-16 13:15", utilisateur: "mmartinez", action: "Escalade", sonde: "SONDE-005", alarme: "Alerte critique" },
];

const mockSystemLogs: SystemLog[] = [
  { id: "1", dateHeure: "2025-12-16 15:00", utilisateur: "admin", action: "Modification paramètres", details: "CFR21 activé" },
  { id: "2", dateHeure: "2025-12-16 14:45", utilisateur: "jdupont", action: "Connexion", details: "Login successful" },
];

const mockBackups: BackupRecord[] = [
  { id: "1", etat: "Réussi", dateHeure: "2025-12-16 03:00", details: "Sauvegarde complète - 2.5 GB" },
  { id: "2", etat: "Réussi", dateHeure: "2025-12-15 03:00", details: "Sauvegarde complète - 2.4 GB" },
];

export default function AdminDashboardPage() {
  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tableau de Bord Administrateur</h1>
        <p className="text-muted-foreground mt-2">Gestion centralisée du système</p>
      </div>

      {/* Section 1: Important items (2 columns) */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Utilisateurs Connectés */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Utilisateurs Connectés
            </CardTitle>
            <CardDescription>Sessions actives</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable columns={connectedUsersColumns} data={mockConnectedUsers} />
          </CardContent>
        </Card>

        {/* Alarmes en Cours */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Alarmes en Cours
            </CardTitle>
            <CardDescription>État actuel</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable columns={activeAlarmsColumns} data={mockActiveAlarms} />
          </CardContent>
        </Card>
      </div>

      {/* Section 2: Journal acquittements (full width, important) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            Journal Acquittements Alarmes
          </CardTitle>
          <CardDescription>Historique des actions</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={acknowledgmentColumns} data={mockAcknowledgments} />
        </CardContent>
      </Card>

      {/* Section 3: Less important items (smaller, at bottom) */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Journal Système */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Journal Système
            </CardTitle>
            <CardDescription>Événements récents</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable columns={systemLogsColumns} data={mockSystemLogs} />
          </CardContent>
        </Card>

        {/* Sauvegarde Système */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Sauvegarde Système
            </CardTitle>
            <CardDescription>État et historique</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Dernière sauvegarde</p>
              <p className="text-sm font-medium flex items-center gap-2 mt-1">
                <Clock className="w-4 h-4" />
                N/A
              </p>
            </div>
            <Button className="w-full">Lancer Sauvegarde</Button>
            <div className="mt-4">
              <DataTable columns={backupColumns} data={mockBackups} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
