"use client";

import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/page-header";
import { AuditLogTable } from "@/components/audit-log-table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { auditApi, alarmsApi } from "@/lib/api";

export default function AuditPage() {
  const { data: auditLogs, isLoading, refetch } = useQuery({
    queryKey: ["audit"],
    queryFn: () => auditApi.getAll({ limit: 100 }),
  });

  const { data: alarms } = useQuery({
    queryKey: ["alarms", "active"],
    queryFn: () => alarmsApi.getActive(),
  });

  const activeAlarms = alarms?.filter((a) => a.status === "active") || [];

  return (
    <div className="flex flex-col min-h-full">
      <PageHeader
        title="Journal d'audit"
        description="Historique des actions et événements"
        activeAlarms={activeAlarms.length}
      />

      <main className="flex-1 p-4 md:p-6 space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Dernières activités</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {auditLogs?.length || 0} événement{(auditLogs?.length ?? 0) > 1 ? "s" : ""}
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

        <Card>
          <CardContent className="p-0">
            <AuditLogTable
              logs={auditLogs || []}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
