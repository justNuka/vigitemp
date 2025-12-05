"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlarmTable } from "@/components/alarm-table";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { alarmsApi, type AlarmWithDetails } from "@/lib/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type AlarmStatus = "active" | "acknowledged" | "resolved";

interface Props {
  alarms: AlarmWithDetails[];
  statusFilter: AlarmStatus;
}

export function AlarmsClient({ alarms, statusFilter }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const acknowledgeMutation = useMutation({
    mutationFn: ({ id, comment }: { id: string; comment?: string }) =>
      alarmsApi.acknowledge(id, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alarms"] });
      toast.success("Alarme acquittée avec succès");
      router.refresh(); // Refresh server components
    },
    onError: () => {
      toast.error("Erreur lors de l'acquittement de l'alarme");
    },
  });

  const handleAcknowledge = (id: string, comment?: string) => {
    acknowledgeMutation.mutate({ id, comment });
  };

  const handleRefresh = () => {
    router.refresh();
    toast.success("Données actualisées");
  };

  return (
    <main className="flex-1 p-4 md:p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">
            {statusFilter === "active" && "Alarmes actives"}
            {statusFilter === "acknowledged" && "Alarmes acquittées"}
            {statusFilter === "resolved" && "Alarmes résolues"}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {alarms.length} alarme{alarms.length > 1 ? "s" : ""}
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          className="gap-2"
          data-testid="button-refresh"
        >
          <RefreshCw className="h-4 w-4" />
          <span className="hidden sm:inline">Actualiser</span>
        </Button>
      </div>

      {alarms.length === 0 ? (
        <EmptyState
          icon={AlertTriangle}
          title={
            statusFilter === "active"
              ? "Aucune alarme active"
              : statusFilter === "acknowledged"
              ? "Aucune alarme acquittée"
              : "Aucune alarme résolue"
          }
          description={
            statusFilter === "active"
              ? "Tout est sous contrôle - Aucune alarme en cours"
              : "Aucune alarme dans cette catégorie pour le moment"
          }
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <AlarmTable
              alarms={alarms}
              isLoading={false}
              onAcknowledge={statusFilter === "active" ? handleAcknowledge : undefined}
            />
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between pt-4 border-t text-sm text-muted-foreground">
        <p>
          {alarms.length} alarme{alarms.length > 1 ? "s" : ""}
        </p>
      </div>
    </main>
  );
}
