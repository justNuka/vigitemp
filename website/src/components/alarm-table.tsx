"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { 
  AlertTriangle, 
  ArrowDown, 
  ArrowUp, 
  CheckCircle2, 
  Clock,
  MessageSquare
} from "lucide-react";
import type { AlarmWithDetails } from "@/lib/api";
import { formatDistanceToNow, format } from "date-fns";
import { fr } from "date-fns/locale";
import { TanStackTable } from "@/components/data-table/tanstack-table";
import { ColumnDef } from "@tanstack/react-table";

interface AlarmTableProps {
  alarms: AlarmWithDetails[];
  onAcknowledge?: (alarmId: string, comment: string) => void;
  isLoading?: boolean;
  emptyMessage?: string;
}

interface AlarmRow {
  id: string;
  type: "high" | "low";
  location: AlarmWithDetails["location"];
  sensor: AlarmWithDetails["sensor"];
  value: number;
  threshold: number;
  triggeredAt: string | Date;
  status: string;
  comment: string | null;
}

export function AlarmTable({
  alarms,
  onAcknowledge,
  isLoading,
  emptyMessage = "Aucune alarme",
}: AlarmTableProps) {
  const [selectedAlarm, setSelectedAlarm] = useState<AlarmWithDetails | null>(null);
  const [comment, setComment] = useState("");
  const [isAcknowledging, setIsAcknowledging] = useState(false);

  const handleAcknowledge = async () => {
    if (!selectedAlarm || !onAcknowledge) return;
    setIsAcknowledging(true);
    try {
      await onAcknowledge(selectedAlarm.id, comment);
      setSelectedAlarm(null);
      setComment("");
    } finally {
      setIsAcknowledging(false);
    }
  };

  const columns: ColumnDef<AlarmRow>[] = [
    {
      accessorKey: "type",
      header: "Type",
      size: 60,
      cell: ({ row }) => {
        const isHigh = row.getValue("type") === "high";
        return (
          <div
            className={cn(
              "p-1.5 rounded-md w-fit",
              isHigh ? "bg-destructive/10" : "bg-info/10"
            )}
          >
            {isHigh ? (
              <ArrowUp className="h-4 w-4 text-destructive" />
            ) : (
              <ArrowDown className="h-4 w-4 text-info" />
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "location",
      header: "Lieu / Sonde",
      cell: ({ row }) => {
        const alarm = row.original;
        return (
          <div className="min-w-0">
            <p className="font-medium truncate">{alarm.location.name}</p>
            <p className="text-sm text-muted-foreground truncate">
              {alarm.sensor.name}
            </p>
          </div>
        );
      },
    },
    {
      accessorKey: "value",
      header: () => <div className="text-right">Valeur</div>,
      cell: ({ row }) => {
        const alarm = row.original;
        return (
          <div className="text-right font-mono font-medium">
            {alarm.value.toFixed(1)}{alarm.sensor.unit}
          </div>
        );
      },
    },
    {
      accessorKey: "threshold",
      header: () => <div className="text-right">Seuil</div>,
      cell: ({ row }) => {
        const alarm = row.original;
        const isHigh = alarm.type === "high";
        return (
          <div className="text-right font-mono text-muted-foreground">
            {isHigh ? ">" : "<"} {alarm.threshold}{alarm.sensor.unit}
          </div>
        );
      },
    },
    {
      accessorKey: "triggeredAt",
      header: "Déclenchée",
      cell: ({ row }) => {
        const triggeredDate = new Date(row.getValue("triggeredAt") as string);
        return (
          <div className="flex items-center gap-1.5 text-sm">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            <span title={format(triggeredDate, "dd/MM/yyyy HH:mm:ss", { locale: fr })}>
              {formatDistanceToNow(triggeredDate, { addSuffix: true, locale: fr })}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Statut",
      cell: ({ row }) => (
        <AlarmStatusBadge status={row.getValue("status") as string} />
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const alarm = row.original;
        return (
          <div className="flex items-center justify-end gap-1">
            {alarm.comment && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                title={alarm.comment}
              >
                <MessageSquare className="h-4 w-4" />
              </Button>
            )}
            {alarm.status === "active" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const fullAlarm = alarms.find(a => a.id === alarm.id);
                  if (fullAlarm) setSelectedAlarm(fullAlarm);
                }}
                data-testid={`button-acknowledge-${alarm.id}`}
              >
                Acquitter
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  const tableData: AlarmRow[] = alarms.map((alarm) => ({
    id: alarm.id,
    type: alarm.type,
    location: alarm.location,
    sensor: alarm.sensor,
    value: alarm.value,
    threshold: alarm.threshold,
    triggeredAt: alarm.triggeredAt,
    status: alarm.status,
    comment: alarm.comment,
  }));

  return (
    <>
      <TanStackTable<AlarmRow>
        columns={columns}
        data={tableData}
        searchPlaceholder="Rechercher les alarmes..."
        pageSize={20}
        isLoading={isLoading}
        emptyMessage={emptyMessage}
        selectedRowId={selectedAlarm?.id}
        onRowClick={(row: AlarmRow) => {
          const fullAlarm = allAlarms.find(a => a.id === row.id);
          if (fullAlarm) setSelectedAlarm(fullAlarm);
        }}
      />

      <Dialog open={!!selectedAlarm} onOpenChange={() => setSelectedAlarm(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Acquitter l'alarme
            </DialogTitle>
            <DialogDescription>
              {selectedAlarm && (
                <>
                  Alarme sur <strong>{selectedAlarm.sensor.name}</strong> dans{" "}
                  <strong>{selectedAlarm.location.name}</strong>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Valeur mesurée</p>
                <p className="text-xl font-bold font-mono">
                  {selectedAlarm?.value}{selectedAlarm?.sensor.unit}
                </p>
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Seuil dépassé</p>
                <p className="text-xl font-bold font-mono">
                  {selectedAlarm?.threshold}{selectedAlarm?.sensor.unit}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="comment" className="text-sm font-medium">
                Commentaire (optionnel)
              </label>
              <Textarea
                id="comment"
                placeholder="Ajouter un commentaire sur cette alarme..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={200}
                rows={3}
                data-testid="input-alarm-comment"
              />
              <p className="text-xs text-muted-foreground text-right">
                {comment.length}/200 caractères
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setSelectedAlarm(null)}
              data-testid="button-cancel-acknowledge"
            >
              Annuler
            </Button>
            <Button
              onClick={handleAcknowledge}
              disabled={isAcknowledging}
              data-testid="button-confirm-acknowledge"
            >
              {isAcknowledging ? "Acquittement..." : "Acquitter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function AlarmStatusBadge({ status }: { status: string }) {
  const configs: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    active: { label: "Active", variant: "destructive" },
    acknowledged: { label: "Acquittée", variant: "secondary" },
    resolved: { label: "Résolue", variant: "outline" },
  };

  const config = configs[status] || configs.active;

  return (
    <Badge variant={config.variant} className="whitespace-nowrap">
      {config.label}
    </Badge>
  );
}
