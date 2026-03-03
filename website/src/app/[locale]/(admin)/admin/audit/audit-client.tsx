"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { FileText, RefreshCw, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useLocale, useTranslations } from "next-intl";

import { useAppTimezone } from "@/components/timezone-provider";
import { TanStackTable } from "@/components/data-table/tanstack-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getJson } from "@/lib/http";
import { cn } from "@/lib/utils";
import type { AuditLog } from "@/lib/api";

import { buildAuditActionConfig } from "./_components/audit-action-config";
import { filterAuditLogs, parseAuditDetails, toAuditTableData, type AuditCode, type AuditLogRow } from "./_components/audit-client-helpers";

interface Props {
  logs: AuditLog[];
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

  const actionConfig = useMemo(() => buildAuditActionConfig(t), [t]);

  const { data: auditCodes = [] } = useQuery({
    queryKey: ["audit-codes"],
    queryFn: () => getJson<AuditCode[]>("/api/audit/codes"),
    enabled: codesOpen,
    staleTime: 10 * 60 * 1000,
  });

  const filteredLogs = useMemo(() => filterAuditLogs(logs, codeFilter, searchQuery), [logs, codeFilter, searchQuery]);

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
      header: t("table.columns.timestamp"),
      cell: ({ row }) => {
        const timestamp = new Date(row.getValue("timestamp") as string);
        return (
          <span className="font-mono text-sm whitespace-nowrap">
            {timestamp.toLocaleString(localeTag, {
              timeZone: timezone,
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
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
            <Badge variant={config.badgeVariant} className="whitespace-nowrap">{config.label}</Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "userId",
      header: t("table.columns.user"),
      cell: ({ row }) => <span className="text-sm">{(row.getValue("userId") as string | null) || t("table.empty_value")}</span>,
    },
    {
      accessorKey: "details",
      header: t("table.columns.details"),
      cell: ({ row }) => {
        const parsed = parseAuditDetails(row.getValue("details") as string | null, t, localeTag, timezone);
        return (
          <div className="flex flex-col gap-1 max-w-90">
            <p className="text-sm font-medium truncate" title={parsed.title}>{parsed.title}</p>
            <p className="text-xs text-muted-foreground truncate" title={parsed.subtitle || parsed.raw}>{parsed.subtitle || parsed.raw || t("table.empty_value")}</p>
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
              <span className="font-mono text-xs">{targetId}</span>
            </span>
          );
        }
        return <span className="text-muted-foreground">{t("table.empty_value")}</span>;
      },
    },
  ];

  const tableData = useMemo(() => toAuditTableData(filteredLogs), [filteredLogs]);

  return (
    <main className="flex-1 p-4 md:p-4 space-y-4 animate-fade-in">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>{t("latest_activity")}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{summary}</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Select value={codeFilter} onValueChange={setCodeFilter} onOpenChange={setCodesOpen}>
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
              <Input type="text" placeholder={t("search_placeholder")} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 w-64" />
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
            toolbarRight={
              <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 border-primary/40" data-testid="button-refresh">
                <RefreshCw className="h-4 w-4" />
                {t("refresh")}
              </Button>
            }
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
