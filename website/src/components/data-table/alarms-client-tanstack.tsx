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

const getAlarmStatus = (dateHeureFin: string | null) => {
  if (dateHeureFin) {
    return { label: "En attente d'acquittement", variant: "default" as const };
  }
  return { label: "Alarme en cours", variant: "destructive" as const };
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
    meta: {
      headerClassName: "!border-l border-white/25 !border-r border-white/25",
      cellClassName: "!border-l border-border !border-r border-border",
    },
    cell: ({ row }) => formatDateTime(row.getValue("Date_Heure_Debut")),
  },
  {
    accessorKey: "Est_Alarme_Vrai",
    header: "État",
    meta: {
      headerClassName: "!border-l border-white/25 !border-r border-white/25",
      cellClassName: "!border-l border-border !border-r border-border",
    },
    cell: ({ row }) => {
      const status = getAlarmStatus(row.getValue("Date_Heure_Fin"));
      return <Badge variant={status.variant}>{status.label}</Badge>;
    },
  },
  {
    accessorKey: "Date_Heure_Fin",
    header: "Fin alarme",
    meta: {
      headerClassName: "!border-l border-white/25",
      cellClassName: "!border-l border-border",
    },
    cell: ({ row }) => formatDateTime(row.getValue("Date_Heure_Fin")),
  },
  {
    accessorKey: "Est_Acquittee",
    header: "Acquittée",
    meta: {
      headerClassName: "!border-l border-white/25",
      cellClassName: "!border-l border-border",
    },
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
          headerClassName="!bg-sidebar !text-sidebar-foreground"
          headerCellClassName="!bg-sidebar !text-sidebar-foreground !border-r !border-white/25 hover:!bg-sidebar-accent/80"
          tableClassName="border-separate border-spacing-0 [&_thead_th]:!border-r [&_thead_th]:!border-white/25 [&_tbody_td]:!border-b [&_tbody_td]:!border-border"
        />
      </CardContent>
    </Card>
  );
}
