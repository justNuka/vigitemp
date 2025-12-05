"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/page-header";
import { AlarmTable } from "@/components/alarm-table";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { alarmsApi } from "@/lib/api";
import { toast } from "sonner";

type StatusFilter = "active" | "acknowledged" | "resolved";

export default function AlarmsPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("active");
  const queryClient = useQueryClient();

  const { data: alarms, isLoading, refetch } = useQuery({
    queryKey: ["alarms", statusFilter],
    queryFn: () => alarmsApi.getAll({ status: statusFilter }),
    refetchInterval: 30000, // Refresh every 30 seconds for active alarms
  });

  const acknowledgeMutation = useMutation({
    mutationFn: ({ id, comment }: { id: string; comment?: string }) =>
      alarmsApi.acknowledge(id, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alarms"] });
      toast.success("Alarme acquittée avec succès");
    },
    onError: () => {
      toast.error("Erreur lors de l'acquittement de l'alarme");
    },
  });

  const resolveMutation = useMutation({
    mutationFn: (id: string) => alarmsApi.resolve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alarms"] });
      toast.success("Alarme résolue avec succès");
    },
    onError: () => {
      toast.error("Erreur lors de la résolution de l'alarme");
    },
  });

  const handleAcknowledge = (id: string, comment?: string) => {
    acknowledgeMutation.mutate({ id, comment });
  };

  const handleResolve = (id: string) => {
    resolveMutation.mutate(id);
  };

  const activeCount = alarms?.filter((a) => a.status === "active").length ?? 0;
  const acknowledgedCount = alarms?.filter((a) => a.status === "acknowledged").length ?? 0;
  const resolvedCount = alarms?.filter((a) => a.status === "resolved").length ?? 0;

  return (
    <div className="flex flex-col min-h-full">
      <PageHeader
        title="Gestion des alarmes"
        description="Suivi et traitement des alarmes"
        activeAlarms={activeCount}
      >
        <Tabs
          value={statusFilter}
          onValueChange={(v: string) => setStatusFilter(v as StatusFilter)}
          className="w-full sm:w-auto"
        >
          <TabsList className="grid grid-cols-3 w-full sm:w-auto">
            <TabsTrigger value="active" data-testid="tab-active">
              <span className="flex items-center gap-1">
                Actives
                {activeCount > 0 && (
                  <span className="text-destructive">({activeCount})</span>
                )}
              </span>
            </TabsTrigger>
            <TabsTrigger value="acknowledged" data-testid="tab-acknowledged">
              Acquittées ({acknowledgedCount})
            </TabsTrigger>
            <TabsTrigger value="resolved" data-testid="tab-resolved">
              Résolues ({resolvedCount})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </PageHeader>

      <main className="flex-1 p-4 md:p-6 space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">
              {statusFilter === "active" && "Alarmes actives"}
              {statusFilter === "acknowledged" && "Alarmes acquittées"}
              {statusFilter === "resolved" && "Alarmes résolues"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {alarms?.length || 0} alarme{(alarms?.length ?? 0) > 1 ? "s" : ""}
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="gap-2"
            data-testid="button-refresh"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Actualiser</span>
          </Button>
        </div>

        {!alarms || alarms.length === 0 ? (
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
                isLoading={isLoading}
                onAcknowledge={statusFilter === "active" ? handleAcknowledge : undefined}
              />
            </CardContent>
          </Card>
        )}

        <div className="flex items-center justify-between pt-4 border-t text-sm text-muted-foreground">
          <p>
            {alarms?.length || 0} alarme{(alarms?.length ?? 0) > 1 ? "s" : ""}
          </p>
          <p className="hidden sm:block">
            Dernière mise à jour : {new Date().toLocaleTimeString("fr-FR")}
          </p>
        </div>
      </main>
    </div>
  );
}
