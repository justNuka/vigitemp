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
import { getJson } from "@/lib/http";
import type { AuditLog } from "@/lib/api";
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
import { useAppTimezone } from "@/components/timezone-provider";
import { formatDbDateTime, parseDbDateTime } from "@/lib/date-display";

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

function formatDateSafe(value: string, localeTag: string, timezone?: string): string | null {
  const date = parseDbDateTime(value);
  if (!date) {
    return null;
  }
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return formatDbDateTime(date, { locale: localeTag, timeZone: timezone });
}

function parseAuditDetails(
  details: string | null,
  t: (key: string, values?: Record<string, string | number>) => string,
  localeTag: string,
  timezone?: string,
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
      const connectedAt = formatDateSafe(changes.connectedAt, localeTag, timezone);
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
  const timezone = useAppTimezone();
  const localeTag = locale.toLowerCase().startsWith("fr") ? "fr-FR" : locale;
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [codeFilter, setCodeFilter] = useState<string>("all");
  const [codesOpen, setCodesOpen] = useState(false);

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
    staleTime: 0,
    refetchOnMount: "always",
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
      className="gap-2"
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
        const timestamp = parseDbDateTime(row.getValue("timestamp") as string);
        if (!timestamp || Number.isNaN(timestamp.getTime())) return t("table.empty_value");
        return (
          <span className="font-mono text-sm whitespace-nowrap">
            {formatDbDateTime(timestamp, { locale: localeTag, timeZone: timezone })}
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
            <span className="font-medium">{config.label}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "details",
      header: t("table.columns.details"),
      cell: ({ row }) => {
        const details = parseAuditDetails(row.getValue("details") as string | null, t, localeTag, timezone);
        return (
          <div className="flex flex-col">
            <span className="text-sm">{details.title}</span>
            {details.subtitle && (
              <span className="text-sm text-muted-foreground">{details.raw}</span>
            )}
            {details.raw && details.raw !== details.title && details.raw !== details.subtitle && (
              <span className="text-xs text-muted-foreground font-mono">{details.subtitle}</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "userId",
      header: t("table.columns.user"),
      cell: ({ row }) => {
        const userId = row.getValue("userId") as string | null;
        return <span className="text-sm">{userId || t("table.empty_value")}</span>;
      },
    },
  ];

  const rows: AuditLogRow[] = filteredLogs.map((log) => ({
    id: log.id,
    timestamp: log.timestamp,
    action: log.action,
    userId: log.userId ?? null,
    details: log.details ?? null,
    targetType: log.targetType ?? null,
    targetId: log.targetId ?? null,
  }));

  return (
    <Card className="overflow-hidden">
      <CardHeader className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle>{t("title")}</CardTitle>
            <p className="text-sm text-muted-foreground">{summary}</p>
          </div>
          <div className="flex items-center gap-2">
            {refreshButton}
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-55">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={t("search")}
              className="pl-9"
            />
          </div>

          <div className="min-w-45">
            <Select
              value={codeFilter}
              onValueChange={setCodeFilter}
              open={codesOpen}
              onOpenChange={setCodesOpen}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("filters.code_placeholder")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("filters.code_all")}</SelectItem>
                {auditCodes.map((code) => (
                  <SelectItem key={code.Code_Journal} value={code.Code_Journal}>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{code.Code_Journal}</Badge>
                      <span className="text-sm">{code.Commentaire || code.Code_Journal}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <TanStackTable
          data={rows}
          columns={columns}
          searchField={["action", "details", "userId"]}
          showSearch={false}
          showPagination
          pageSize={200}
          toolbarRight={undefined}
          containerClassName="rounded-none border-x-0 border-b-0"
        />
      </CardContent>
    </Card>
  );
}


