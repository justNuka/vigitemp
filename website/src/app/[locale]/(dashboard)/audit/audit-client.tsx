"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Activity,
  AlertCircle,
  Archive,
  Bell,
  FileText,
  LogIn,
  LogOut,
  Plug,
  RefreshCw,
  Search,
  Settings,
  UserCog,
  Wrench,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import type { AuditLog } from "@/lib/api";
import { getJson } from "@/lib/http";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TanStackTable } from "@/components/data-table/tanstack-table";
import { ColumnDef } from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Props {
  logs: AuditLog[];
}

interface AuditCode {
  Code_Journal: string;
  Commentaire: string | null;
}

interface AuditLogRow {
  id: string;
  timestamp: string | Date;
  action: string;
  userId: string | null;
  details: string | null;
  targetType: string | null;
  targetId: string | null;
}

type ActionConfig = {
  icon: typeof LogIn;
  label: string;
  color: string;
  badgeVariant: "default" | "secondary" | "destructive" | "outline";
};

const actionConfig: Record<string, ActionConfig> = {
  CONNEXION: { icon: LogIn, label: "Connexion", color: "text-success", badgeVariant: "outline" },
  DECONNEXION: { icon: LogOut, label: "Déconnexion", color: "text-muted-foreground", badgeVariant: "outline" },
  ACQ: { icon: Bell, label: "Acquittement alarme", color: "text-warning", badgeVariant: "secondary" },
  DES: { icon: AlertCircle, label: "Surveillance désactivée", color: "text-destructive", badgeVariant: "destructive" },
  ACT: { icon: AlertCircle, label: "Surveillance activée", color: "text-success", badgeVariant: "outline" },
  AS: { icon: AlertCircle, label: "Arrêt surveillance", color: "text-destructive", badgeVariant: "destructive" },
  DS: { icon: AlertCircle, label: "Démarrage surveillance", color: "text-success", badgeVariant: "outline" },
  CC: { icon: FileText, label: "Modification", color: "text-muted-foreground", badgeVariant: "outline" },
  CF: { icon: Settings, label: "Changement fréquence", color: "text-primary", badgeVariant: "secondary" },
  CR: { icon: Settings, label: "Changement retard alarme", color: "text-primary", badgeVariant: "secondary" },
  CS: { icon: Settings, label: "Changement sonde", color: "text-primary", badgeVariant: "secondary" },
  AJE: { icon: Activity, label: "Événement manuel", color: "text-primary", badgeVariant: "secondary" },
  CA: { icon: Wrench, label: "Calibrage", color: "text-primary", badgeVariant: "secondary" },
  ET: { icon: Wrench, label: "Étalonnage", color: "text-primary", badgeVariant: "secondary" },
  TC: { icon: Plug, label: "Test connexion sonde", color: "text-primary", badgeVariant: "secondary" },
  MDP: { icon: UserCog, label: "Mot de passe", color: "text-warning", badgeVariant: "outline" },
  ARC: { icon: Archive, label: "Archivage / export", color: "text-muted-foreground", badgeVariant: "outline" },
  ALARM_RESOLVED: { icon: Bell, label: "Alarme terminée", color: "text-muted-foreground", badgeVariant: "outline" },
  settings_changed: { icon: Settings, label: "Paramètres modifiés", color: "text-primary", badgeVariant: "secondary" },
  user_created: { icon: UserCog, label: "Utilisateur créé", color: "text-primary", badgeVariant: "default" },
  user_updated: { icon: UserCog, label: "Utilisateur modifié", color: "text-primary", badgeVariant: "secondary" },
};

type ParsedDetails = {
  title: string;
  subtitle?: string;
  raw?: string;
};

function formatDateSafe(value: string): string | null {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return format(date, "dd/MM/yyyy HH:mm:ss", { locale: fr });
}

function parseAuditDetails(details: string | null): ParsedDetails {
  if (!details) {
    return { title: "-" };
  }

  const normalizedDetails = details.replace(/::ffff:/g, "");
  const parts = normalizedDetails.split("|").map((part) => part.trim()).filter(Boolean);
  const resource = parts[0] || "";
  const idPart = parts.find((part) => part.startsWith("#")) || "";
  const ipPart = parts.find((part) => part.toLowerCase().startsWith("ip:"));
  let ip = ipPart ? ipPart.replace(/^IP:\s*/i, "").trim() : "";
  if (ip.startsWith("::ffff:")) {
    ip = ip.replace("::ffff:", "");
  }

  let changes: Record<string, any> | null = null;
  const jsonPart = parts.find((part) => part.startsWith("{") && part.endsWith("}"));
  if (jsonPart) {
    try {
      changes = JSON.parse(jsonPart);
    } catch {
      changes = null;
    }
  }

  const rawTitle = [resource, idPart].filter(Boolean).join(" ").trim();
  let title = rawTitle || normalizedDetails;
  const subtitleParts: string[] = [];

  if (changes) {
    if (changes.machineName || changes.address) {
      const machine = changes.machineName ? `Machine: ${changes.machineName}` : "";
      const address = changes.address ? `Adresse: ${changes.address}` : "";
      subtitleParts.push([machine, address].filter(Boolean).join(" · "));
    }
    if (changes.connectedAt) {
      const connectedAt = formatDateSafe(changes.connectedAt);
      if (connectedAt) {
        subtitleParts.push(`Connexion: ${connectedAt}`);
      }
    }
    if (changes.from !== undefined || changes.to !== undefined) {
      const from = changes.from !== undefined ? `De: ${changes.from}` : "";
      const to = changes.to !== undefined ? `Vers: ${changes.to}` : "";
      subtitleParts.push([from, to].filter(Boolean).join(" → "));
    }
    if (changes.action && subtitleParts.length === 0) {
      subtitleParts.push(`Action: ${changes.action}`);
    }
  }

  if (ip && !subtitleParts.some((part) => part.startsWith("IP:")) && !title.startsWith("IP:")) {
    subtitleParts.push(`IP: ${ip}`);
  }

  if (subtitleParts.length === 0 && normalizedDetails !== title) {
    if (!(normalizedDetails.startsWith("IP:") && (ip || title.startsWith("IP:")))) {
      subtitleParts.push(normalizedDetails);
    }
  }

  return {
    title,
    subtitle: subtitleParts.join(" · "),
    raw: normalizedDetails,
  };
}

export function AuditClient({ logs }: Props) {
  const t = useTranslations("audit");
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [codeFilter, setCodeFilter] = useState<string>("all");
  const [auditCodes, setAuditCodes] = useState<AuditCode[]>([]);

  useEffect(() => {
    const fetchCodes = async () => {
      try {
        const data = await getJson<AuditCode[]>("/api/audit/codes");
        setAuditCodes(data);
      } catch (error) {
        console.error("Failed to fetch audit codes:", error);
      }
    };
    fetchCodes();
  }, []);

  const filteredLogs = logs.filter((log) => {
    if (codeFilter !== "all" && log.action !== codeFilter) {
      return false;
    }

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
    toast.success(t("toast.refreshed"));
  };

  const summary =
    filteredLogs.length === logs.length
      ? t("events_summary", { count: filteredLogs.length })
      : t("events_summary_filtered", { count: filteredLogs.length, total: logs.length });

  const columns: ColumnDef<AuditLogRow>[] = [
    {
      accessorKey: "timestamp",
      header: "Date / Heure",
      cell: ({ row }) => {
        const timestamp = new Date(row.getValue("timestamp") as string);
        return (
          <span className="font-mono text-sm whitespace-nowrap">
            {format(timestamp, "dd/MM/yyyy HH:mm:ss", { locale: fr })}
          </span>
        );
      },
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => {
        const action = (row.getValue("action") as string) || "unknown";
        const config = actionConfig[action] || actionConfig[action.toUpperCase()] || {
          icon: FileText,
          label: action,
          color: "text-muted-foreground",
          badgeVariant: "outline" as const,
        };
        const Icon = config.icon;
        return (
          <div className="flex items-center gap-2">
            <Icon className={cn("h-4 w-4", config.color)} />
            <Badge variant={config.badgeVariant} className="whitespace-nowrap">
              {config.label}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "userId",
      header: "Utilisateur",
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue("userId") || "Système"}</span>
      ),
    },
    {
      accessorKey: "details",
      header: "Détails",
      cell: ({ row }) => {
        const details = row.getValue("details") as string | null;
        const parsed = parseAuditDetails(details);
        return (
          <div className="flex flex-col gap-1 max-w-[360px]">
            <p className="text-sm font-medium truncate" title={parsed.raw}>
              {parsed.title}
            </p>
            {parsed.subtitle ? (
              <p className="text-xs text-muted-foreground truncate" title={parsed.subtitle}>
                {parsed.subtitle}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">-</p>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "targetId",
      header: "Cible",
      cell: ({ row }) => {
        const targetType = row.original.targetType;
        const targetId = row.getValue("targetId") as string | null;
        if (targetType && targetId) {
          return (
            <span className="text-sm">
              <span className="text-muted-foreground capitalize">{targetType}:</span>{" "}
              <span className="font-mono text-xs">{targetId.slice(0, 8)}...</span>
            </span>
          );
        }
        return <span className="text-muted-foreground">-</span>;
      },
    },
  ];

  const tableData: AuditLogRow[] = filteredLogs.map((log) => ({
    id: log.id,
    timestamp: log.timestamp,
    action: log.action,
    userId: log.userId,
    details: log.details,
    targetType: log.targetType,
    targetId: log.targetId,
  }));

  return (
    <main className="flex-1 p-4 md:p-4 space-y-4 animate-fade-in">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>{t("latest_activity")}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{summary}</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Select value={codeFilter} onValueChange={setCodeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder={t("all_codes")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("all_codes")}</SelectItem>
                {auditCodes.map((code) => (
                  <SelectItem key={code.Code_Journal} value={code.Code_Journal}>
                    {code.Code_Journal}
                    {code.Commentaire && ` - ${code.Commentaire}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder={t("search_placeholder")}
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
              {t("refresh")}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <TanStackTable<AuditLogRow>
            columns={columns}
            data={tableData}
            searchPlaceholder="Rechercher dans le journal d'audit..."
            pageSize={20}
            isLoading={false}
            emptyMessage="Aucun log d'audit trouvé"
            showSearch={false}
            maxHeight="60vh"
          />
        </CardContent>
      </Card>
    </main>
  );
}
