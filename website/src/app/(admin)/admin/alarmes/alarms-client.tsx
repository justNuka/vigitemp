"use client";

import { useState } from "react";
import { useAlarms } from "@/hooks/useAlarms";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";

export function AlarmsClient() {
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterAcknowledged, setFilterAcknowledged] = useState<string>("all");

  const { data: alarms, isLoading, isFetching } = useAlarms();

  const filteredAlarms = (alarms || []).filter((alarm) => {
    if (filterStatus !== "all") {
      const isActive = filterStatus === "active";
      if (alarm.Est_Alarme_Vrai !== isActive) return false;
    }
    if (filterAcknowledged !== "all") {
      const isAcknowledged = filterAcknowledged === "acknowledged";
      if (alarm.Est_Acquittee !== isAcknowledged) return false;
    }
    return true;
  });

  const formatDateTime = (date: Date | null) => {
    if (!date) return "-";
    return format(new Date(date), "dd/MM/yyyy HH:mm:ss", { locale: fr });
  };

  const getAlarmStatus = (estAlarmeVrai: boolean | null) => {
    if (estAlarmeVrai === null) return { label: "-", variant: "secondary" };
    return estAlarmeVrai
      ? { label: "Active", variant: "destructive" }
      : { label: "Résolvée", variant: "default" };
  };

  const getAcknowledgmentStatus = (estAcquittee: boolean | null) => {
    if (estAcquittee === null) return { label: "-", variant: "secondary" };
    return estAcquittee
      ? { label: "Acquittée", variant: "default" }
      : { label: "Non acquittée", variant: "outline" };
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="w-48">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrer par état" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les états</SelectItem>
              <SelectItem value="active">Actives</SelectItem>
              <SelectItem value="resolved">Résolues</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-48">
          <Select value={filterAcknowledged} onValueChange={setFilterAcknowledged}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrer par acquittement" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="acknowledged">Acquittées</SelectItem>
              <SelectItem value="pending">Non acquittées</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {isFetching && (
          <div className="flex items-center gap-2 text-sm text-blue-600">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            Mise à jour...
          </div>
        )}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Alarmes ({filteredAlarms.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredAlarms.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {alarms?.length === 0 ? "Aucune alarme" : "Aucune alarme correspondant aux filtres"}
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lieu</TableHead>
                    <TableHead>Début alarme</TableHead>
                    <TableHead>État</TableHead>
                    <TableHead>Fin alarme</TableHead>
                    <TableHead>Acquittée</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAlarms.map((alarm) => {
                    const status = getAlarmStatus(alarm.Est_Alarme_Vrai);
                    const ackStatus = getAcknowledgmentStatus(alarm.Est_Acquittee);
                    return (
                      <TableRow key={alarm.Id_Alarme}>
                        <TableCell className="font-medium">{alarm.Libelle_Lieu || "-"}</TableCell>
                        <TableCell className="text-sm">{formatDateTime(alarm.Date_Heure_Debut)}</TableCell>
                        <TableCell>
                          <Badge variant={status.variant as any}>
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{formatDateTime(alarm.Date_Heure_Fin)}</TableCell>
                        <TableCell>
                          <Badge variant={ackStatus.variant as any}>
                            {ackStatus.label}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
