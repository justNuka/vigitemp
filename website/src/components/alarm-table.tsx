"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

interface AlarmTableProps {
  alarms: AlarmWithDetails[];
  onAcknowledge?: (alarmId: string, comment: string) => void;
  isLoading?: boolean;
  emptyMessage?: string;
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

  if (isLoading) {
    return <AlarmTableSkeleton />;
  }

  if (alarms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="p-4 rounded-full bg-success/10 mb-4">
          <CheckCircle2 className="h-8 w-8 text-success" />
        </div>
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-12">Type</TableHead>
                <TableHead>Lieu / Sonde</TableHead>
                <TableHead className="text-right">Valeur</TableHead>
                <TableHead className="text-right">Seuil</TableHead>
                <TableHead>Déclenchée</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {alarms.map((alarm) => (
                <AlarmRow
                  key={alarm.id}
                  alarm={alarm}
                  onAcknowledge={() => setSelectedAlarm(alarm)}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

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

interface AlarmRowProps {
  alarm: AlarmWithDetails;
  onAcknowledge: () => void;
}

function AlarmRow({ alarm, onAcknowledge }: AlarmRowProps) {
  const isHigh = alarm.type === "high";
  const triggeredDate = new Date(alarm.triggeredAt);

  return (
    <TableRow
      className={cn(
        "transition-colors",
        alarm.status === "active" && "bg-destructive/5"
      )}
      data-testid={`row-alarm-${alarm.id}`}
    >
      <TableCell>
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
      </TableCell>
      <TableCell>
        <div className="min-w-0">
          <p className="font-medium truncate">{alarm.location.name}</p>
          <p className="text-sm text-muted-foreground truncate">
            {alarm.sensor.name}
          </p>
        </div>
      </TableCell>
      <TableCell className="text-right font-mono font-medium">
        {alarm.value.toFixed(1)}{alarm.sensor.unit}
      </TableCell>
      <TableCell className="text-right font-mono text-muted-foreground">
        {isHigh ? ">" : "<"} {alarm.threshold}{alarm.sensor.unit}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1.5 text-sm">
          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
          <span title={format(triggeredDate, "dd/MM/yyyy HH:mm:ss", { locale: fr })}>
            {formatDistanceToNow(triggeredDate, { addSuffix: true, locale: fr })}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <AlarmStatusBadge status={alarm.status} />
      </TableCell>
      <TableCell className="text-right">
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
              onClick={onAcknowledge}
              data-testid={`button-acknowledge-${alarm.id}`}
            >
              Acquitter
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
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

function AlarmTableSkeleton() {
  return (
    <div className="rounded-lg border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-12">Type</TableHead>
            <TableHead>Lieu / Sonde</TableHead>
            <TableHead>Valeur</TableHead>
            <TableHead>Seuil</TableHead>
            <TableHead>Déclenchée</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[1, 2, 3].map((i) => (
            <TableRow key={i}>
              <TableCell>
                <div className="h-7 w-7 bg-muted rounded animate-pulse" />
              </TableCell>
              <TableCell>
                <div className="space-y-1.5">
                  <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                  <div className="h-3 w-16 bg-muted rounded animate-pulse" />
                </div>
              </TableCell>
              <TableCell>
                <div className="h-4 w-12 bg-muted rounded animate-pulse" />
              </TableCell>
              <TableCell>
                <div className="h-4 w-12 bg-muted rounded animate-pulse" />
              </TableCell>
              <TableCell>
                <div className="h-4 w-20 bg-muted rounded animate-pulse" />
              </TableCell>
              <TableCell>
                <div className="h-5 w-16 bg-muted rounded-full animate-pulse" />
              </TableCell>
              <TableCell>
                <div className="h-8 w-16 bg-muted rounded animate-pulse" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
