"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlarmTable } from "@/components/alarm-table";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { alarmsApi, type AlarmWithDetails } from "@/lib/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { cn } from "@/lib/utils";

type AlarmStatus = "active" | "acknowledged" | "resolved";

interface Props {
  alarms: AlarmWithDetails[];
  statusFilter: AlarmStatus;
}

export function AlarmsClient({ alarms, statusFilter }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isRefreshing, startTransition] = useTransition();

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
      className="gap-2"
      disabled={isRefreshing}
      data-testid="button-refresh"
    >
      <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
      <span className="hidden sm:inline">
        {isRefreshing ? "Actualisation..." : "Actualiser"}
      </span>
    </Button>
  );

  return (
    <main className="flex-1 p-4 md:p-6 space-y-6 animate-fade-in">
      {alarms.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>
              {statusFilter === "active" && "Alarmes actives"}
              {statusFilter === "acknowledged" && "Alarmes acquittées"}
              {statusFilter === "resolved" && "Alarmes résolues"}
            </CardTitle>
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
                  : "Aucune alarme résolue"
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
          <CardHeader>
            <CardTitle>
              {statusFilter === "active" && "Alarmes actives"}
              {statusFilter === "acknowledged" && "Alarmes acquittées"}
              {statusFilter === "resolved" && "Alarmes résolues"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AlarmTable
              alarms={alarms}
              isLoading={isRefreshing}
              onAcknowledge={statusFilter === "active" ? handleAcknowledge : undefined}
              toolbarRight={refreshButton}
            />
          </CardContent>
        </Card>
      )}
    </main>
  );
}
