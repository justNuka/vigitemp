"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SensorCard } from "@/components/sensor-card";
import { MiniChart } from "@/components/mini-chart";
import { Link } from "@/i18n/navigation";
import {
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Clock,
  MessageSquare,
  Thermometer,
  TrendingUp,
} from "lucide-react";
import { alarmsApi, type AlarmWithDetails, type SensorWithLocation } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { TanStackTable } from "@/components/data-table/tanstack-table";
import { ColumnDef } from "@tanstack/react-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface DashboardClientProps {
  criticalSensors: SensorWithLocation[];
  activeAlarms: AlarmWithDetails[];
  sensorOverview: SensorWithLocation[];
  totalActiveAlarms: number;
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

/**
 * Composant client pour les parties interactives du dashboard
 * Affiche alarmes actives, capteurs critiques, et aperçu des sondes
 */
export function DashboardClient({
  criticalSensors,
  activeAlarms,
  sensorOverview,
  totalActiveAlarms,
}: DashboardClientProps) {
  const [localAlarms, setLocalAlarms] = useState(activeAlarms);
  const [activeCount, setActiveCount] = useState(totalActiveAlarms);
  const [selectedAlarm, setSelectedAlarm] = useState<AlarmWithDetails | null>(null);
  const [comment, setComment] = useState("");
  const [isAcknowledging, setIsAcknowledging] = useState(false);

  useEffect(() => {
    setLocalAlarms(activeAlarms);
    setActiveCount(totalActiveAlarms);
  }, [activeAlarms, totalActiveAlarms]);

  const handleAcknowledge = async (alarmId: string, commentValue: string) => {
    try {
      await alarmsApi.acknowledge(alarmId, commentValue);
      setLocalAlarms((prev) => prev.filter((alarm) => alarm.id !== alarmId));
      setActiveCount((prev) => {
        const next = Math.max(prev - 1, 0);
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("vigitemp:active-alarms", {
              detail: { count: next },
            }),
          );
        }
        return next;
      });
      toast.success("Alarme acquittée avec succès");
    } catch (error) {
      console.error("Acknowledge alarm error:", error);
      toast.error("Erreur lors de l'acquittement de l'alarme");
    }
  };

  const displayedAlarms = localAlarms.slice(0, 5);

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
              isHigh ? "bg-destructive/12" : "bg-info/12"
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
      id: "lastValue",
      header: () => <div className="text-right">Dernière valeur</div>,
      cell: ({ row }) => {
        const alarm = row.original;
        const value = alarm.sensor.currentValue ?? alarm.value ?? null;
        return (
          <div className="text-right font-mono font-medium">
            {value !== null ? `${value.toFixed(1)} ${alarm.sensor.unit}` : "-"}
          </div>
        );
      },
    },
    {
      id: "consignes",
      header: () => <div className="text-right">Consignes sup/inf</div>,
      cell: ({ row }) => {
        const alarm = row.original;
        const sup = alarm.sensor.maxThreshold;
        const inf = alarm.sensor.minThreshold;
        return (
          <div className="text-right font-mono text-muted-foreground">
            <div>{sup !== null && sup !== undefined ? `Sup: ${sup} ${alarm.sensor.unit}` : "Sup: -"}</div>
            <div>{inf !== null && inf !== undefined ? `Inf: ${inf} ${alarm.sensor.unit}` : "Inf: -"}</div>
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
        <div className="flex justify-center">
          <AlarmStatusBadge status={row.getValue("status") as string} />
        </div>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const alarm = row.original;
        return (
          <div className="flex items-center justify-center gap-2">
            {alarm.comment && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                title={alarm.comment}
                aria-label="Commentaire"
                type="button"
              >
                <MessageSquare className="h-4 w-4" />
                <span className="sr-only">{alarm.comment}</span>
              </Button>
            )}
            {alarm.status === "active" && (
              <Button
                variant="outline"
                size="sm"
                className="border-amber-300 bg-amber-300 text-slate-900 hover:bg-amber-200 hover:text-slate-900 dark:border-warning dark:bg-warning/20 dark:text-warning-foreground dark:hover:bg-warning/30"
                onClick={() => {
                  const fullAlarm = displayedAlarms.find((item) => item.id === alarm.id);
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

  const tableData: AlarmRow[] = displayedAlarms.map((alarm) => ({
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

  const handleDialogAcknowledge = async () => {
    if (!selectedAlarm) return;
    setIsAcknowledging(true);
    try {
      await handleAcknowledge(selectedAlarm.id, comment);
      setSelectedAlarm(null);
      setComment("");
    } finally {
      setIsAcknowledging(false);
    }
  };

  return (
    <main className="flex-1 p-4 md:p-6 space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Section alarmes actives (2 colonnes) */}
        <section className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Alarmes actives
              {activeCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {activeCount}
                </Badge>
              )}
            </h2>
            <Link href="alarmes">
              <Button variant="ghost" size="sm" className="gap-1">
                Toutes les alarmes
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <Card className="bg-white/90 border-slate-200 shadow-md dark:bg-card dark:border-border">
            <CardContent className="p-0">
              <TanStackTable<AlarmRow>
                columns={columns}
                data={tableData}
                searchPlaceholder={undefined}
                pageSize={5}
                isLoading={false}
                emptyMessage="Aucune alarme active - Tout est sous contrôle"
                selectedRowId={selectedAlarm?.id}
                onRowClick={(row: AlarmRow) => {
                  const fullAlarm = displayedAlarms.find((item) => item.id === row.id);
                  if (fullAlarm) setSelectedAlarm(fullAlarm);
                }}
                showSearch={false}
                showPagination={false}
                containerClassName="border-slate-200"
                headerClassName="!bg-slate-800 text-white"
                headerCellClassName="!bg-slate-800 !text-white [&_svg]:!text-white !border-slate-700"
                bodyClassName="[&_tr:nth-child(odd)]:bg-white [&_tr:nth-child(even)]:bg-slate-50/70 dark:[&_tr:nth-child(odd)]:bg-muted/30 dark:[&_tr:nth-child(even)]:bg-background"
                tableClassName="text-slate-900 dark:text-card-foreground"
                toolbarClassName="rounded-lg border border-slate-200 bg-white/80 px-3 py-2 shadow-sm"
              />
            </CardContent>
          </Card>
        </section>

        {/* Section tendance récente (1 colonne) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Tendance récente
            </h2>
          </div>

          <Card className="bg-white/90 border-slate-200 shadow-md dark:bg-card dark:border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Dernières 24h
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MiniChart
                measurements={[]}
                height={120}
                className="rounded-lg overflow-hidden"
              />
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">0 mesures</span>
                <Link href="surveillance">
                  <Button variant="ghost" size="sm" className="gap-1 -mr-2">
                    Détails
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>

      {/* Sondes critiques (si présentes) */}
      {/*
{criticalSensors.length > 0 && (
        <section aria-label="Sondes critiques" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Thermometer className="h-5 w-5 text-destructive" />
              Sondes en état critique
              <Badge variant="destructive">{criticalSensors.length}</Badge>
            </h2>
            <Link href="surveillance">
              <Button variant="ghost" size="sm" className="gap-1">
                Toutes les sondes
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {criticalSensors.map((sensor) => (
              <SensorCard key={sensor.id} sensor={sensor} />
            ))}
          </div>
        </section>
      */}

      {/* Aperçu des sondes */}
      {/*
<section aria-label="Aperçu des sondes" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Aperçu des sondes</h2>
          <Link href="surveillance">
            <Button variant="ghost" size="sm" className="gap-1">
              Voir tout
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sensorOverview.map((sensor) => (
            <SensorCard key={sensor.id} sensor={sensor} />
          ))}
        </div>
      </section>
      */}

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
                <p className="text-sm text-muted-foreground">Derni?re valeur</p>
                <p className="text-xl font-bold font-mono">
                  {selectedAlarm?.sensor.currentValue ?? selectedAlarm?.value ?? "-"} {selectedAlarm?.sensor.unit}
                </p>
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Consignes sup/inf</p>
                <p className="text-sm font-mono text-muted-foreground">
                  Sup: {selectedAlarm?.sensor.maxThreshold ?? "-"} {selectedAlarm?.sensor.unit}
                </p>
                <p className="text-sm font-mono text-muted-foreground">
                  Inf: {selectedAlarm?.sensor.minThreshold ?? "-"} {selectedAlarm?.sensor.unit}
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
              onClick={handleDialogAcknowledge}
              disabled={isAcknowledging}
              data-testid="button-confirm-acknowledge"
            >
              {isAcknowledging ? "Acquittement..." : "Acquitter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}

function AlarmStatusBadge({ status }: { status: string }) {
  const configs: Record<
    string,
    { label: string; className: string }
  > = {
    active: {
      label: "Active",
      className:
        "bg-red-500/90 text-white border-transparent dark:bg-destructive/12 dark:text-destructive-foreground dark:border-destructive/30",
    },
    acknowledged: {
      label: "Acquittée",
      className:
        "bg-slate-200 text-slate-700 border-transparent dark:bg-muted dark:text-muted-foreground",
    },
    resolved: {
      label: "Résolue",
      className:
        "bg-slate-100 text-slate-600 border-slate-200 dark:bg-transparent dark:text-muted-foreground",
    },
  };

  const config = configs[status] || configs.active;

  return (
    <Badge className={cn("whitespace-nowrap", config.className)}>
      {config.label}
    </Badge>
  );
}
