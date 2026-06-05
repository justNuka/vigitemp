"use client";

import { Fragment, useCallback, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { ChevronDown, ChevronRight, FileText, RefreshCw, Search, X } from "lucide-react";
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { parseDbDateTime } from "@/lib/date-display";

import { LazyMotion, domAnimation, m } from "motion/react";
import { fadeInUp } from "@/lib/motion-variants";

import { buildAuditActionConfig } from "./_components/audit-action-config";
import { filterAuditLogs, parseAuditDetails, renderChangesAsRows, toAuditTableData, type AuditCode, type AuditLogRow } from "./_components/audit-client-helpers";

interface Props {
  logs: AuditLog[];
}

interface ActiveFilters {
  dateFrom: string;
  dateTo: string;
  code: string;
}

function formatDateInput(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function hasActiveFilters(filters: ActiveFilters): boolean {
  return !!(filters.dateFrom || filters.dateTo || (filters.code && filters.code !== "all"));
}

export function AuditClient({ logs: initialLogs }: Props) {
  const t = useTranslations("audit");
  const locale = useLocale();
  const timezone = useAppTimezone();
  const localeTag = locale.toLowerCase().startsWith("fr") ? "fr-FR" : locale;
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [codeFilter, setCodeFilter] = useState<string>("all");
  const [codesOpen, setCodesOpen] = useState(false);
  const [dateFrom, setDateFrom] = useState(() => formatDateInput(new Date()));
  const [dateTo, setDateTo] = useState(() => formatDateInput(new Date()));
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  const activeFilters: ActiveFilters = useMemo(() => ({
    dateFrom,
    dateTo,
    code: codeFilter,
  }), [dateFrom, dateTo, codeFilter]);

  const filtersActive = hasActiveFilters(activeFilters);

  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    if (activeFilters.code && activeFilters.code !== "all") params.set("code", activeFilters.code);
    if (activeFilters.dateFrom) params.set("dateFrom", activeFilters.dateFrom);
    if (activeFilters.dateTo) params.set("dateTo", activeFilters.dateTo);
    return params.toString();
  }, [activeFilters]);

  const { data: filteredByServerLogs, isLoading: isServerFiltering } = useQuery({
    queryKey: ["audit-logs", queryParams],
    queryFn: () => getJson<AuditLog[]>(`/api/audit${queryParams ? `?${queryParams}` : ""}`),
    enabled: filtersActive,
    staleTime: 30 * 1000,
  });

  const actionConfig = useMemo(() => buildAuditActionConfig(t), [t]);

  const { data: auditCodes = [] } = useQuery({
    queryKey: ["audit-codes"],
    queryFn: () => getJson<AuditCode[]>("/api/audit/codes"),
    enabled: codesOpen,
    staleTime: 10 * 60 * 1000,
  });

  // Keep a stable reference for downstream hooks that depend on the source dataset.
  const sourceLogs: AuditLog[] = useMemo(
    () => (filtersActive ? (filteredByServerLogs ?? []) : initialLogs),
    [filtersActive, filteredByServerLogs, initialLogs],
  );

  const filteredLogs = useMemo(
    () => filtersActive ? sourceLogs : filterAuditLogs(sourceLogs, codeFilter, searchQuery),
    [sourceLogs, codeFilter, searchQuery, filtersActive]
  );

  const handleRefresh = () => {
    router.refresh();
    toast.success(t("toast.refreshed"));
  };

  const clearFilters = () => {
    setDateFrom("");
    setDateTo("");
    setCodeFilter("all");
    setSearchQuery("");
    setExpandedRowId(null);
  };

  const totalLogs = filtersActive ? sourceLogs.length : initialLogs.length;
  const summary =
    filteredLogs.length === totalLogs
      ? t("events_summary", { count: filteredLogs.length })
      : t("events_summary_filtered", { count: filteredLogs.length, total: totalLogs });

  // Extrait et traduit le contenu expandable d'une ligne (JSON changes + commentaire utilisateur)
  const getRowExpandableContent = useCallback((rowId: string) => {
    const originalLog = sourceLogs.find((l) => String(l.id) === rowId)
    if (!originalLog) return { rows: [], commentaire: null, hasContent: false }

    const details = originalLog.details
    let changesJson: Record<string, unknown> | null = null
    if (details) {
      const parts = details.split('|').map((p) => p.trim())
      const jsonPart = parts.find((p) => p.startsWith('{') && p.endsWith('}'))
      if (jsonPart) {
        try { changesJson = JSON.parse(jsonPart) } catch { /* ignore */ }
      }
    }

    const commentaire = originalLog.commentaireUtilisateur ?? null
    const rows = changesJson ? renderChangesAsRows(changesJson, localeTag, timezone) : []
    return { rows, commentaire, hasContent: rows.length > 0 || !!commentaire }
  }, [sourceLogs, localeTag, timezone])

  const columns: ColumnDef<AuditLogRow>[] = [
    {
      id: "expand",
      header: "",
      size: 32,
      cell: ({ row }) => {
        const isExpanded = expandedRowId === row.original.id;
        const { hasContent } = getRowExpandableContent(row.original.id);
        if (!hasContent) return null;
        return (
          <button
            onClick={() => setExpandedRowId(isExpanded ? null : row.original.id)}
            className="flex items-center justify-center text-muted-foreground hover:text-foreground"
            aria-label={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        );
      },
    },
    {
      accessorKey: "timestamp",
      header: t("table.columns.timestamp"),
      cell: ({ row }) => {
        const timestamp = parseDbDateTime(row.getValue("timestamp") as string);
        if (!timestamp || Number.isNaN(timestamp.getTime())) return t("table.empty_value");
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
      cell: ({ row }) => {
        const login = row.original.userId
        const displayName = row.original.userDisplayName
        if (!login && !displayName) {
          return <span className="text-sm">{t("table.empty_value")}</span>
        }

        return (
          <div className="flex flex-col">
            <span className="text-sm font-medium">{login || displayName}</span>
            {login && displayName && displayName !== login ? (
              <span className="text-xs text-muted-foreground">{displayName}</span>
            ) : null}
          </div>
        )
      },
    },
    {
      accessorKey: "details",
      header: t("table.columns.details"),
      cell: ({ row }) => {
        const isExpanded = expandedRowId === row.original.id;
        const details = row.getValue("details") as string | null;
        const parsed = parseAuditDetails(details, t, localeTag, timezone);
        const content = getRowExpandableContent(row.original.id);
        const locationName = row.original.locationName;

        // Le titre est "du bruit" quand c'est directement un blob JSON ou une IP
        const titleIsJunk = parsed.title.startsWith('{') || parsed.title.toLowerCase().startsWith('ip:')
        const mainText = titleIsJunk ? (parsed.subtitle || parsed.raw || t("table.empty_value")) : parsed.title
        const rawSubText = titleIsJunk ? null : (parsed.subtitle || parsed.raw || null)
        const normalizedLocationName = locationName?.trim().toLowerCase() || ""
        const hasLocationAlready =
          !!normalizedLocationName &&
          [parsed.title, parsed.subtitle, parsed.raw].some((value) => value?.toLowerCase().includes(normalizedLocationName))
        const contextLocation = locationName && !hasLocationAlready ? locationName : null
        const subText = [contextLocation, rawSubText].filter(Boolean).join(" • ") || null

        return (
          <div className="flex flex-col gap-1 max-w-90">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <p className="text-sm font-medium truncate cursor-help">{mainText}</p>
                </TooltipTrigger>
                <TooltipContent>{mainText}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            {subText && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p className="text-xs text-muted-foreground truncate cursor-help">{subText}</p>
                  </TooltipTrigger>
                  <TooltipContent>{subText}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {isExpanded && content.hasContent && (
              <div className="mt-2 rounded border bg-muted/50 p-2 space-y-2">
                {content.rows.length > 0 && (
                  <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
                    {content.rows.map(({ label, value }) => (
                      <Fragment key={label}>
                        <dt className="text-xs text-muted-foreground whitespace-nowrap">{label}</dt>
                        <dd className="text-xs font-medium">{value}</dd>
                      </Fragment>
                    ))}
                  </dl>
                )}
                {content.commentaire && (
                  <p className={cn("text-xs text-muted-foreground italic", content.rows.length > 0 && "pt-2 border-t")}>
                    {content.commentaire}
                  </p>
                )}
              </div>
            )}
          </div>
        );
      },
    },
  ];

  const tableData = useMemo(() => toAuditTableData(filteredLogs), [filteredLogs]);

  return (
    <LazyMotion features={domAnimation}>
      <m.main
        className="flex-1 p-4 md:p-4 space-y-4"
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
      >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 flex-wrap gap-2">
          <div>
            <CardTitle>{t("latest_activity")}</CardTitle>
            <div className="mt-1 space-y-1">
              <p className="text-sm text-muted-foreground">{summary}</p>
              <p className="text-xs text-muted-foreground">{t("filter.today_limit_hint")}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Select value={codeFilter} onValueChange={setCodeFilter} onOpenChange={setCodesOpen}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder={t("filter.action")} />
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

            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-36"
              aria-label={t("filter.dateFrom")}
            />
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-36"
              aria-label={t("filter.dateTo")}
            />

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input type="text" placeholder={t("search_placeholder")} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 w-48" />
            </div>

            {filtersActive && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
                <X className="h-4 w-4" />
                {t("filter.clearFilters")}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <TanStackTable<AuditLogRow>
            columns={columns}
            data={tableData}
            searchPlaceholder={t("search_placeholder")}
            pageSize={200}
            isLoading={isServerFiltering}
            emptyMessage={t("empty")}
            showSearch={false}
            maxHeight="60vh"
            headerClassName="!bg-sidebar !text-sidebar-foreground"
            headerCellClassName="!bg-sidebar !text-sidebar-foreground !border-r !border-white/25 hover:!bg-sidebar-accent/80"
            toolbarRight={
              <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-2" data-testid="button-refresh">
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
      </m.main>
    </LazyMotion>
  );
}
