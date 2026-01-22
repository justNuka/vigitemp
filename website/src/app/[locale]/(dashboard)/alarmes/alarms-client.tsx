"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Clock,
  MessageSquare,
  RefreshCw,
} from "lucide-react";
import { alarmsApi, type AlarmWithDetails } from "@/lib/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { TanStackTable } from "@/components/data-table/tanstack-table";
import { ColumnDef } from "@tanstack/react-table";
import { format, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

type AlarmStatus = "active" | "acknowledged" | "resolved";

interface Props {
  alarms: AlarmWithDetails[];
  statusFilter: AlarmStatus;
  stats: {
    active: number;
    acknowledged: number;
    resolved: number;
  };
  onStatusChange: (status: AlarmStatus) => void;
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

export function AlarmsClient({ alarms, statusFilter, stats, onStatusChange }: Props) {
  const t = useTranslations("alarmsPage");
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isRefreshing, startTransition] = useTransition();
  const [selectedAlarm, setSelectedAlarm] = useState<AlarmWithDetails | null>(null);
  const [comment, setComment] = useState("");

  const acknowledgeMutation = useMutation({
    mutationFn: ({ id, commentValue }: { id: string; commentValue?: string }) =>
      alarmsApi.acknowledge(id, commentValue),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alarms"] });
      toast.success("Alarme acquittée avec succès");
      router.refresh();
    },
    onError: () => {
      toast.error("Erreur lors de l'acquittement de l'alarme");
    },
  });

  const handleAcknowledge = async (id: string, commentValue?: string) => {
    await acknowledgeMutation.mutateAsync({ id, commentValue });
  };

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh();
    });
    toast.success("Données actualisées");
  };

  const refreshButton = (
    <Button
      variant="outline"
      size="sm"
      onClick={handleRefresh}
      className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 border-primary/40"
      disabled={isRefreshing}
      data-testid="button-refresh"
    >
      <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
      <span className="hidden sm:inline">
        {isRefreshing ? "Actualisation..." : "Actualiser"}
      </span>
    </Button>
  );

  const statusTabs = (
    <Tabs
      value={statusFilter}
      onValueChange={(v: string) => onStatusChange(v as AlarmStatus)}
      className="w-full sm:w-auto"
    >
      <TabsList className="grid grid-cols-3 w-full sm:w-auto bg-primary/10 text-primary">
        <TabsTrigger
          value="active"
          data-testid="tab-active"
          className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
        >
          <span className="flex items-center gap-1">
            {t("tabs.active")}
            {stats.active > 0 && (
              <span className="text-destructive">({stats.active})</span>
            )}
          </span>
        </TabsTrigger>
        <TabsTrigger
          value="resolved"
          data-testid="tab-resolved"
          className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
        >
          {t("tabs.resolved")} ({stats.resolved})
        </TabsTrigger>
        <TabsTrigger
          value="acknowledged"
          data-testid="tab-acknowledged"
          className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
        >
          {t("tabs.acknowledged")} ({stats.acknowledged})
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );

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
      id: "lastValue",
      header: () => <div className="text-right">Derni?re valeur</div>,
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
                onClick={() => {
                  const fullAlarm = alarms.find((item) => item.id === alarm.id);
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

  const handleDialogAcknowledge = async () => {
    if (!selectedAlarm) return;
    try {
      await handleAcknowledge(selectedAlarm.id, comment);
      setSelectedAlarm(null);
      setComment("");
    } catch {
      // toast already handled
    }
  };

  return (
    <main className="flex-1 p-4 md:p-6 space-y-6 animate-fade-in">
      {alarms.length === 0 ? (
        <Card>
          <CardHeader className="space-y-4">
            <CardTitle>
              {statusFilter === "active" && "Alarmes actives"}
              {statusFilter === "acknowledged" && "Alarmes acquittées"}
              {statusFilter === "resolved" && "Alarmes à acquitter"}
            </CardTitle>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {statusTabs}
              <div className="flex justify-end">{refreshButton}</div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex justify-end">{refreshButton}</div>
            <EmptyState
              icon={AlertTriangle}
              title={
                statusFilter === "active"
                  ? "Aucune alarme active"
                  : statusFilter === "acknowledged"
                  ? "Aucune alarme acquittée"
                  : "Aucune alarme à acquitter"
              }
              description={
                statusFilter === "active"
                  ? "Tout est sous contrôle - Aucune alarme en cours"
                  : "Aucune alarme dans cette catégorie pour le moment"
              }
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="space-y-4">
            <CardTitle>
              {statusFilter === "active" && "Alarmes actives"}
              {statusFilter === "acknowledged" && "Alarmes acquittées"}
              {statusFilter === "resolved" && "Alarmes à acquitter"}
            </CardTitle>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {statusTabs}
              <div className="flex justify-end">{refreshButton}</div>
            </div>
          </CardHeader>
          <CardContent>
            <TanStackTable<AlarmRow>
              columns={columns}
              data={tableData}
              searchPlaceholder="Rechercher les alarmes..."
              pageSize={20}
              isLoading={isRefreshing}
              emptyMessage="Aucune alarme"
              selectedRowId={selectedAlarm?.id}
              onRowClick={(row: AlarmRow) => {
                const fullAlarm = alarms.find((item) => item.id === row.id);
                if (fullAlarm) setSelectedAlarm(fullAlarm);
              }}
              toolbarRight={refreshButton}
              maxHeight="calc(100dvh - 25rem)"
              headerClassName="!bg-sidebar !text-sidebar-foreground"
              headerCellClassName="!bg-sidebar !text-sidebar-foreground !border-r !border-white/25 hover:!bg-sidebar-accent/80"
              tableClassName="border-separate border-spacing-0 [&_thead_th]:!border-r [&_thead_th]:!border-white/25 [&_thead_th:last-child]:!border-r-0"
            />
          </CardContent>
        </Card>
      )}

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
/}
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
              disabled={acknowledgeMutation.isPending}
              data-testid="button-confirm-acknowledge"
            >
              {acknowledgeMutation.isPending ? "Acquittement..." : "Acquitter"}
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
    { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
  > = {
    active: { label: "Active", variant: "destructive" },
    acknowledged: { label: "Acquittée", variant: "secondary" },
    resolved: { label: "À acquitter", variant: "outline" },
  };

  const config = configs[status] || configs.active;

  return (
    <Badge variant={config.variant} className="whitespace-nowrap">
      {config.label}
    </Badge>
  );
}
