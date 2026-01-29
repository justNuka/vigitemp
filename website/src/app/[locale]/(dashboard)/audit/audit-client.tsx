"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { useLocale, useTranslations } from "next-intl";
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
import type { Locale } from "date-fns";
import { enUS, fr } from "date-fns/locale";

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

type ParsedDetails = {
  title: string;
  subtitle?: string;
  raw?: string;
};

function formatDateSafe(value: string, locale: Locale): string | null {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return format(date, "dd/MM/yyyy HH:mm:ss", { locale });
}

function parseAuditDetails(
  details: string | null,
  t: (key: string, values?: Record<string, string | number>) => string,
  locale: Locale,
): ParsedDetails {
  if (!details) {
    return { title: t("table.empty_value") };
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
      const machine = changes.machineName ? t("details.machine", { name: changes.machineName }) : "";
      const address = changes.address ? t("details.address", { address: changes.address }) : "";
      subtitleParts.push([machine, address].filter(Boolean).join(" • "));
    }
    if (changes.connectedAt) {
      const connectedAt = formatDateSafe(changes.connectedAt, locale);
      if (connectedAt) {
        subtitleParts.push(t("details.connection", { date: connectedAt }));
      }
    }
    if (changes.from !== undefined || changes.to !== undefined) {
      const from = changes.from !== undefined ? t("details.from", { value: String(changes.from) }) : "";
      const to = changes.to !== undefined ? t("details.to", { value: String(changes.to) }) : "";
      subtitleParts.push([from, to].filter(Boolean).join(" → "));
    }
    if (changes.action && subtitleParts.length === 0) {
      subtitleParts.push(t("details.action", { action: String(changes.action) }));
    }
  }

  if (ip && !subtitleParts.some((part) => part.startsWith("IP:")) && !title.startsWith("IP:")) {
    subtitleParts.push(t("details.ip", { ip }));
  }

  if (subtitleParts.length === 0 && normalizedDetails !== title) {
    if (!(normalizedDetails.startsWith("IP:") && (ip || title.startsWith("IP:")))) {
      subtitleParts.push(normalizedDetails);
    }
  }

  return {
    title,
    subtitle: subtitleParts.join(" • "),
    raw: normalizedDetails,
  };
}

export function AuditClient({ logs }: Props) {
  const t = useTranslations("audit");
  const locale = useLocale();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [codeFilter, setCodeFilter] = useState<string>("all");
  const [codesOpen, setCodesOpen] = useState(false);
  const dateLocale = locale === "fr" ? fr : enUS;

  const actionConfig: Record<string, ActionConfig> = {
    CONNEXION: { icon: LogIn, label: t("actions.CONNEXION"), color: "text-success", badgeVariant: "outline" },
    DECONNEXION: { icon: LogOut, label: t("actions.DECONNEXION"), color: "text-muted-foreground", badgeVariant: "outline" },
    ACQ: { icon: Bell, label: t("actions.ACQ"), color: "text-warning", badgeVariant: "secondary" },
    DES: { icon: AlertCircle, label: t("actions.DES"), color: "text-destructive", badgeVariant: "destructive" },
    ACT: { icon: AlertCircle, label: t("actions.ACT"), color: "text-success", badgeVariant: "outline" },
    AS: { icon: AlertCircle, label: t("actions.AS"), color: "text-destructive", badgeVariant: "destructive" },
    DS: { icon: AlertCircle, label: t("actions.DS"), color: "text-success", badgeVariant: "outline" },
    CC: { icon: FileText, label: t("actions.CC"), color: "text-muted-foreground", badgeVariant: "outline" },
    CF: { icon: Settings, label: t("actions.CF"), color: "text-primary", badgeVariant: "secondary" },
    CR: { icon: Settings, label: t("actions.CR"), color: "text-primary", badgeVariant: "secondary" },
    CS: { icon: Settings, label: t("actions.CS"), color: "text-primary", badgeVariant: "secondary" },
    AJE: { icon: Activity, label: t("actions.AJE"), color: "text-primary", badgeVariant: "secondary" },
    CA: { icon: Wrench, label: t("actions.CA"), color: "text-primary", badgeVariant: "secondary" },
    ET: { icon: Wrench, label: t("actions.ET"), color: "text-primary", badgeVariant: "secondary" },
    TC: { icon: Plug, label: t("actions.TC"), color: "text-primary", badgeVariant: "secondary" },
    MDP: { icon: UserCog, label: t("actions.MDP"), color: "text-warning", badgeVariant: "outline" },
    ARC: { icon: Archive, label: t("actions.ARC"), color: "text-muted-foreground", badgeVariant: "outline" },
    ALARM_RESOLVED: { icon: Bell, label: t("actions.ALARM_RESOLVED"), color: "text-muted-foreground", badgeVariant: "outline" },
    settings_changed: { icon: Settings, label: t("actions.settings_changed"), color: "text-primary", badgeVariant: "secondary" },
    user_created: { icon: UserCog, label: t("actions.user_created"), color: "text-primary", badgeVariant: "default" },
    user_updated: { icon: UserCog, label: t("actions.user_updated"), color: "text-primary", badgeVariant: "secondary" },
  };

  const { data: auditCodes = [] } = useQuery({
    queryKey: ["audit-codes"],
    queryFn: () => getJson<AuditCode[]>("/api/audit/codes"),
    enabled: codesOpen,
    staleTime: 10 * 60 * 1000,
  });

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

  const refreshButton = (
    <Button
      variant="outline"
      size="sm"
      onClick={handleRefresh}
      className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 border-primary/40"
      data-testid="button-refresh"
    >
      <RefreshCw className="h-4 w-4" />
      {t("refresh")}
    </Button>
  );

  const summary =
    filteredLogs.length === logs.length
      ? t("events_summary", { count: filteredLogs.length })
      : t("events_summary_filtered", { count: filteredLogs.length, total: logs.length });

  const columns: ColumnDef<AuditLogRow>[] = [
    {
      accessorKey: "timestamp",
      header: t("table.columns.timestamp"),
      cell: ({ row }) => {
        const timestamp = new Date(row.getValue("timestamp") as string);
        return (
          <span className="font-mono text-sm whitespace-nowrap">
            {format(timestamp, "dd/MM/yyyy HH:mm:ss", { locale: dateLocale })}
          </span>
        );
      },
    },
    {
      accessorKey: "action",
      header: t("table.columns.action"),
      cell: ({ row }) => {
        const action = (row.getValue("action") as string) || "unknown";
        const config = actionConfig[action] || actionConfig[action.toUpperCase()] || {
          icon: FileText,
          label: t("actions.unknown", { code: action }),
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
      header: t("table.columns.user"),
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue("userId") || t("table.system")}</span>
      ),
    },
    {
      accessorKey: "details",
      header: t("table.columns.details"),
      cell: ({ row }) => {
        const details = row.getValue("details") as string | null;
        const parsed = parseAuditDetails(details, t, dateLocale);
        return (
          <div className="flex flex-col gap-1 max-w-90">
            <p className="text-sm font-medium truncate" title={parsed.raw}>
              {parsed.title}
            </p>
            {parsed.subtitle ? (
              <p className="text-xs text-muted-foreground truncate" title={parsed.subtitle}>
                {parsed.subtitle}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">{t("table.empty_value")}</p>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "targetId",
      header: t("table.columns.target"),
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
        return <span className="text-muted-foreground">{t("table.empty_value")}</span>;
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
            <Select
              value={codeFilter}
              onValueChange={setCodeFilter}
              onOpenChange={setCodesOpen}
            >
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
          </div>
        </CardHeader>
        <CardContent>
          <TanStackTable<AuditLogRow>
            columns={columns}
            data={tableData}
            searchPlaceholder={t("search_placeholder")}
            pageSize={20}
            isLoading={false}
            emptyMessage={t("empty")}
            showSearch={false}
            maxHeight="60vh"
            headerClassName="!bg-sidebar !text-sidebar-foreground"
            headerCellClassName="!bg-sidebar !text-sidebar-foreground !border-r !border-white/25 hover:!bg-sidebar-accent/80"
            toolbarRight={refreshButton}
            showPagination
            enableExport
            enablePrint
            containerClassName="border border-sidebar-border/40"
            tableClassName="border-separate border-spacing-0 [&_thead_th]:text-sidebar-foreground [&_thead_th]:!border-r [&_thead_th]:!border-white/25 [&_thead_th:last-child]:!border-r-0"
          />
        </CardContent>
      </Card>
    </main>
  );
}
