"use client";

import { useState } from "react";
import { useAlarms } from "@/hooks/useAlarms";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TanStackTable } from "@/components/data-table/tanstack-table";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface AlarmRow {
  Id_Alarme: number;
  Libelle_Lieu: string;
  Date_Heure_Debut: string;
  Est_Alarme_Vrai: boolean | null;
  Date_Heure_Fin: string | null;
  Est_Acquittee: boolean | null;
}

const getAlarmStatus = (estAlarmeVrai: boolean | null) => {
  if (estAlarmeVrai === null) return { label: "-", variant: "secondary" as const };
  return estAlarmeVrai
    ? { label: "Active", variant: "destructive" as const }
    : { label: "Résolvée", variant: "default" as const };
};

const getAcknowledgmentStatus = (estAcquittee: boolean | null) => {
  if (estAcquittee === null) return { label: "-", variant: "secondary" as const };
  return estAcquittee
    ? { label: "Acquittée", variant: "default" as const }
    : { label: "Non acquittée", variant: "outline" as const };
};

const formatDateTime = (date: string | null) => {
  if (!date) return "-";
  return format(new Date(date), "dd/MM/yyyy HH:mm:ss", { locale: fr });
};

// Définir les colonnes
const columns: ColumnDef<AlarmRow>[] = [
  {
    accessorKey: "Libelle_Lieu",
    header: "Lieu",
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue("Libelle_Lieu")}</span>
    ),
  },
  {
    accessorKey: "Date_Heure_Debut",
    header: "Début alarme",
    cell: ({ row }) => formatDateTime(row.getValue("Date_Heure_Debut")),
  },
  {
    accessorKey: "Est_Alarme_Vrai",
    header: "État",
    cell: ({ row }) => {
      const status = getAlarmStatus(row.getValue("Est_Alarme_Vrai"));
      return <Badge variant={status.variant}>{status.label}</Badge>;
    },
  },
  {
    accessorKey: "Date_Heure_Fin",
    header: "Fin alarme",
    cell: ({ row }) => formatDateTime(row.getValue("Date_Heure_Fin")),
  },
  {
    accessorKey: "Est_Acquittee",
    header: "Acquittée",
    cell: ({ row }) => {
      const status = getAcknowledgmentStatus(row.getValue("Est_Acquittee"));
      return <Badge variant={status.variant}>{status.label}</Badge>;
    },
  },
];

export function AlarmsClientTanStack() {
  const { data: alarms, isLoading, isFetching } = useAlarms();

  const tableData: AlarmRow[] = (alarms || []).map((alarm) => ({
    Id_Alarme: alarm.Id_Alarme,
    Libelle_Lieu: alarm.Libelle_Lieu || "Inconnu",
    Date_Heure_Debut: String(alarm.Date_Heure_Debut) || "",
    Est_Alarme_Vrai: alarm.Est_Alarme_Vrai,
    Date_Heure_Fin: alarm.Date_Heure_Fin ? String(alarm.Date_Heure_Fin) : null,
    Est_Acquittee: alarm.Est_Acquittee,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestion des alarmes</CardTitle>
      </CardHeader>
      <CardContent className="p-2 md:p-4 xl:p-4">
        <TanStackTable
          columns={columns}
          data={tableData}
          searchField="Libelle_Lieu"
          searchPlaceholder="Rechercher par lieu..."
          pageSize={15}
          maxHeight="60vh"
          isLoading={isLoading || isFetching}
          emptyMessage="Aucune alarme trouvée"
        />
      </CardContent>
    </Card>
  );
}
