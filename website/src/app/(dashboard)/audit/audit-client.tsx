"use client";

import { useState, useEffect } from "react";
import { AuditLogTable } from "@/components/audit-log-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RefreshCw, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { AuditLog } from "@/lib/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  logs: AuditLog[];
}

interface AuditCode {
  CodeJournal: string;
  Commentaire: string | null;
}

export function AuditClient({ logs }: Props) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [codeFilter, setCodeFilter] = useState<string>("all");
  const [auditCodes, setAuditCodes] = useState<AuditCode[]>([]);

  // Fetch audit codes on mount
  useEffect(() => {
    const fetchCodes = async () => {
      try {
        const response = await fetch("/api/audit/codes");
        if (response.ok) {
          const data = await response.json();
          setAuditCodes(data);
        }
      } catch (error) {
        console.error("Failed to fetch audit codes:", error);
      }
    };
    fetchCodes();
  }, []);

  // Client-side filtering
  const filteredLogs = logs.filter((log) => {
    // Filter by code
    if (codeFilter !== "all" && log.action !== codeFilter) {
      return false;
    }
    
    // Filter by search query
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
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Dernières activités</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {filteredLogs.length} événement{filteredLogs.length > 1 ? "s" : ""}
              {filteredLogs.length !== logs.length && ` sur ${logs.length}`}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Select value={codeFilter} onValueChange={setCodeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Tous les codes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les codes</SelectItem>
                {auditCodes.map((code) => (
                  <SelectItem key={code.CodeJournal} value={code.CodeJournal}>
                    {code.CodeJournal}
                    {code.Commentaire && ` - ${code.Commentaire}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64"
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
              Actualiser
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <AuditLogTable
            logs={filteredLogs}
            isLoading={false}
          />
        </CardContent>
      </Card>
    </main>
  );
}
