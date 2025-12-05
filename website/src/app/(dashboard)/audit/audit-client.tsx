"use client";

import { useState } from "react";
import { AuditLogTable } from "@/components/audit-log-table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RefreshCw, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { AuditLog } from "@/lib/api";

interface Props {
  logs: AuditLog[];
}

export function AuditClient({ logs }: Props) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  // Client-side filtering
  const filteredLogs = logs.filter((log) => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      log.action.toLowerCase().includes(query) ||
      log.details?.toLowerCase().includes(query) ||
      log.userId?.toLowerCase().includes(query)
    );
  });

  const handleRefresh = () => {
    router.refresh();
    toast.success("Données actualisées");
  };

  return (
    <main className="flex-1 p-4 md:p-6 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Dernières activités</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {filteredLogs.length} événement{filteredLogs.length > 1 ? "s" : ""}
            {filteredLogs.length !== logs.length && ` sur ${logs.length}`}
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-full sm:w-64"
            />
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
      </div>

      <Card>
        <CardContent className="p-0">
          <AuditLogTable
            logs={filteredLogs}
            isLoading={false}
          />
        </CardContent>
      </Card>

      <div className="flex items-center justify-between pt-4 border-t text-sm text-muted-foreground">
        <p>
          {filteredLogs.length} événement{filteredLogs.length > 1 ? "s" : ""}
        </p>
      </div>
    </main>
  );
}
