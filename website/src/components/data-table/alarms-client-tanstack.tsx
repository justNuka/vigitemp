"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAppAccess } from "@/components/access/app-access-provider";
import { fetchAlarmsPage, useAlarms } from "@/hooks/useAlarms";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TanStackTable } from "@/components/data-table/tanstack-table";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTranslations } from "next-intl";
import { ArrowDown, ArrowUp, Clock, PowerOff, RefreshCw, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDbDateTime, parseDbDateTime } from "@/lib/date-display";
import { alarmsApi } from "@/lib/api";
import { useAlarmMutations } from "@/components/data-table/alarms-mutations";
import { AlarmsFilters } from "@/components/data-table/alarms-filters";
import { AlarmDetailsDialog } from "@/app/[locale]/(dashboard)/alarmes/_components/alarm-details-dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { formatMeasureValue } from "@/lib/measurements";
import { markAlarmAcknowledgedInPaginatedSensorsCache } from "@/lib/surveillance-cache";

type SelectedAlarm = {
  id: string;
  locationId: string;
  type: "high" | "low" | "no-response" | "sector" | "module" | "ended" | undefined;
  value: number | null;
  threshold: number | null;
  status: "active" | "acknowledged" | "resolved";
  triggeredAt: string;
  acknowledgedAt: string | null;
  resolvedAt: string | null;
  acknowledgedBy: string | null;
  comment: string | null;
  sensor: { name: string; unit: string; currentValue: number | null; maxThreshold: number | null; minThreshold: number | null; hasThresholds?: boolean };
  location: { name: string };
};

interface AlarmRow {
  Id_Alarme: number;
  Type: "high" | "low" | "no-response" | "sector" | "module" | "temperature";
  Libelle_Lieu: string;
  Date_Heure_Debut: string;
  Date_Heure_Fin: string | null;
  Est_Acquittee: boolean | null;
  Min_Threshold: number | null;
  Max_Threshold: number | null;
  Unite: string | null;
  Derniere_Valeur: number | null;
  Status: "active" | "acknowledged" | "resolved";
  Count_30_Days: number | null;
  Sensor_Serial?: string | null;
}

const getAlarmStatus = (
  t: ReturnType<typeof useTranslations>,
  status: AlarmRow["Status"],
  dateHeureFin: string | null,
  estAcquittee: boolean | null
) => {
  if (status === "acknowledged" || estAcquittee) {
    return { label: t("status.acknowledged"), variant: "secondary" as const };
  }
  if (dateHeureFin || status === "resolved") {
    return { label: t("status.awaiting_ack"), variant: "default" as const };
  }
  return { label: t("status.active"), variant: "destructive" as const };
};

export function AlarmsClientTanStack() {
  const t = useTranslations("alarmsTanstack");
  const tDialog = useTranslations("alarmsPage");
  const tButtons = useTranslations("buttons");
  const { hasPermission } = useAppAccess();
  const canAcknowledgeAlarm = hasPermission("ALARM_ACK_ACCESS");
  const queryClient = useQueryClient();
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 500 });
  const [statusFilter, setStatusFilter] = useState<"active" | "resolved">("active");
  const [isRefreshing, startRefresh] = useTransition();
  const [typeFilters, setTypeFilters] = useState<AlarmRow["Type"][]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState("all");
  const [selectedLocationId, setSelectedLocationId] = useState("all");
  const [selectedAlarmId, setSelectedAlarmId] = useState<number | null>(null);
  const [selectedAlarmIds, setSelectedAlarmIds] = useState<number[]>([]);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [bulkComment, setBulkComment] = useState("");
  const [isBulkSubmitting, setIsBulkSubmitting] = useState(false);
  const [showGraph, setShowGraph] = useState(false);
  const [commentOptions, setCommentOptions] = useState<{ id: number; type: string | null; text: string }[]>([]);
  const [isCommentsLoading, setIsCommentsLoading] = useState(false);
  const [selectedCommentId, setSelectedCommentId] = useState<string>("" );
  const [alarmCount30, setAlarmCount30] = useState<number | null>(null);
  const [isStatsLoading, setIsStatsLoading] = useState(false);
  const [filteredRowCount, setFilteredRowCount] = useState(0);
  const normalizeCommentOptions = useCallback((raw: unknown): { id: number; type: string | null; text: string }[] => {
    if (!Array.isArray(raw)) return [];
    return raw
      .map((item) => {
        if (!item || typeof item !== "object") return null;
        const candidate = item as Record<string, unknown>;
        const idValue = candidate.id ?? candidate.Id_Commentaire;
        const id = typeof idValue === "number" ? idValue : Number(idValue);
        if (!Number.isFinite(id)) return null;
        const textValue = candidate.text ?? candidate.Texte ?? "";
        const text = typeof textValue === "string" ? textValue : String(textValue ?? "");
        const typeValue = candidate.type ?? candidate.Type_Commentaire ?? null;
        const type = typeof typeValue === "string" ? typeValue : null;
        return { id, type, text };
      })
      .filter((item): item is { id: number; type: string | null; text: string } => item !== null);
  }, []);
  const page = pagination.pageIndex + 1;
  const limit = pagination.pageSize;

  const { acknowledgeMutation } = useAlarmMutations();

  const { data, isLoading, isFetching } = useAlarms({
    page,
    limit,
    status: statusFilter,
    siteId: selectedSiteId,
    locationId: selectedLocationId,
  });
  const alarms = useMemo(() => data?.data ?? [], [data?.data]);
  const total = data?.pagination.total ?? alarms.length;
  const pageCount = data?.pagination.pages ?? 1;
  const counts = data?.counts ?? { active: 0, acknowledged: 0, resolved: 0 };
  const siteOptions = data?.filters?.sites ?? [];
  const locationOptions = useMemo(() => data?.filters?.lieux ?? [], [data?.filters?.lieux]);

  const commentSchema = z.object({
    comment: z.string().max(200, tDialog("validation.comment_max", { max: 200 })).optional(),
  });
  type CommentFormValues = z.infer<typeof commentSchema>;
  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm<CommentFormValues>({
    resolver: zodResolver(commentSchema),
    defaultValues: { comment: "" },
  });
  const comment = watch("comment") ?? "";

  const { data: selectedAlarmDetail, isFetching: isDetailLoading } = useQuery({
    queryKey: ["alarm-detail-admin", selectedAlarmId],
    queryFn: async () => {
      const response = await fetch(`/api/alarmes/${selectedAlarmId}`);
      const payload = await response.json();
      return payload?.data ?? null;
    },
    enabled: selectedAlarmId !== null,
    staleTime: 30_000,
  });

  const selectedAlarm: SelectedAlarm | null = useMemo(() => {
    if (!selectedAlarmDetail || !selectedAlarmId) return null;
    const rawAlarm = alarms.find((item) => item.Id_Alarme === selectedAlarmId);
    const row = rawAlarm ? {
      Id_Alarme: rawAlarm.Id_Alarme,
      Type: rawAlarm.Type,
      Libelle_Lieu: rawAlarm.Libelle_Lieu || t("unknown_location"),
      Date_Heure_Debut: String(rawAlarm.Date_Heure_Debut) || "",
      Date_Heure_Fin: rawAlarm.Date_Heure_Fin ? String(rawAlarm.Date_Heure_Fin) : null,
      Est_Acquittee: rawAlarm.Est_Acquittee,
      Min_Threshold: rawAlarm.Min_Threshold ?? null,
      Max_Threshold: rawAlarm.Max_Threshold ?? null,
      Unite: rawAlarm.Unite ?? null,
      Derniere_Valeur: rawAlarm.Derniere_Valeur ?? null,
      Status: rawAlarm.Status,
      Count_30_Days: rawAlarm.Count_30_Days ?? null,
    } : null;
    const status = row?.Status ?? "active";
    return {
      id: String(selectedAlarmDetail.id ?? selectedAlarmId),
      locationId: String(selectedAlarmDetail.locationId ?? ""),
      type: selectedAlarmDetail.type,
      value: selectedAlarmDetail.value ?? null,
      threshold: null,
      status,
      triggeredAt: selectedAlarmDetail.triggeredAt ?? row?.Date_Heure_Debut ?? new Date().toISOString(),
      acknowledgedAt: status === "acknowledged" ? (row?.Date_Heure_Fin ?? null) : null,
      resolvedAt: selectedAlarmDetail.endedAt ?? row?.Date_Heure_Fin ?? null,
      acknowledgedBy: null,
      comment: null,
      sensor: {
        name: selectedAlarmDetail.sensorName ?? row?.Libelle_Lieu ?? "-",
        unit: selectedAlarmDetail.unit ?? row?.Unite ?? "",
        currentValue: selectedAlarmDetail.currentValue ?? row?.Derniere_Valeur ?? null,
        maxThreshold: selectedAlarmDetail.maxThreshold ?? row?.Max_Threshold ?? null,
        minThreshold: selectedAlarmDetail.minThreshold ?? row?.Min_Threshold ?? null,
        hasThresholds: selectedAlarmDetail.maxThreshold != null || selectedAlarmDetail.minThreshold != null,
      },
      location: {
        name: selectedAlarmDetail.locationName ?? row?.Libelle_Lieu ?? "-",
      },
    };
  }, [alarms, selectedAlarmDetail, selectedAlarmId, t]);

  useEffect(() => {
    if (selectedAlarmId === null) return;
    setSelectedCommentId("");
    setAlarmCount30(null);
    setShowGraph(false);
    let active = true;
    setIsCommentsLoading(true);
    fetch('/api/alarmes/commentaires-acquittement')
      .then((res) => (res.ok ? res.json() : null))
      .then((payload) => { if (active) setCommentOptions(normalizeCommentOptions(payload?.data)); })
      .catch(() => { if (active) setCommentOptions([]); })
      .finally(() => { if (active) setIsCommentsLoading(false); });
    fetch(`/api/alarmes/${selectedAlarmId}/stats`)
      .then((res) => (res.ok ? res.json() : null))
      .then((payload) => { if (active) setAlarmCount30(typeof payload?.data?.count === 'number' ? payload.data.count : null); })
      .catch(() => { if (active) setAlarmCount30(null); })
      .finally(() => { if (active) setIsStatsLoading(false); });
    setIsStatsLoading(true);
    return () => { active = false; };
  }, [normalizeCommentOptions, selectedAlarmId]);

  const formatDateTime = useCallback((date: string | null) => {
    if (!date) return t("date.na");
    return formatDbDateTime(date);
  }, [t]);

  const tableData: AlarmRow[] = alarms
    .filter((alarm) => typeFilters.length === 0 || typeFilters.includes(alarm.Type))
    .map((alarm) => ({
      Id_Alarme: alarm.Id_Alarme,
      Type: alarm.Type,
      Libelle_Lieu: alarm.Libelle_Lieu || t("unknown_location"),
      Date_Heure_Debut: String(alarm.Date_Heure_Debut) || "",
      Date_Heure_Fin: alarm.Date_Heure_Fin ? String(alarm.Date_Heure_Fin) : null,
      Est_Acquittee: alarm.Est_Acquittee,
      Min_Threshold: alarm.Min_Threshold ?? null,
      Max_Threshold: alarm.Max_Threshold ?? null,
      Unite: alarm.Unite ?? null,
      Derniere_Valeur: alarm.Derniere_Valeur ?? null,
      Status: alarm.Status,
      Count_30_Days: alarm.Count_30_Days ?? null,
    }));

  const hasLocalTypeFilter = typeFilters.length > 0;
  const hasLocalFilteredDisplay = filteredRowCount !== tableData.length;

  const activeTabLabel = `${tDialog("tabs.active")} (${counts.active})`;
  const resolvedTabLabel = `${tDialog("tabs.resolved")} (${counts.resolved})`;

  const resultsLabel =
    hasLocalTypeFilter || hasLocalFilteredDisplay
      ? `${filteredRowCount} / ${total} ${t("filters.filtered_results_suffix")}`
      : t("results", { count: total });

  const selectableAlarmIds = useMemo(
    () => tableData.filter((alarm) => !alarm.Est_Acquittee).map((alarm) => alarm.Id_Alarme),
    [tableData],
  );
  const allVisibleSelected =
    selectableAlarmIds.length > 0 && selectableAlarmIds.every((id) => selectedAlarmIds.includes(id));
  const someVisibleSelected = selectableAlarmIds.some((id) => selectedAlarmIds.includes(id));

  const toggleAlarmSelection = useCallback((alarmId: number, checked: boolean) => {
    setSelectedAlarmIds((prev) =>
      checked ? (prev.includes(alarmId) ? prev : [...prev, alarmId]) : prev.filter((id) => id !== alarmId),
    );
  }, []);

  const toggleAllVisibleSelections = useCallback((checked: boolean) => {
    setSelectedAlarmIds((prev) => {
      if (checked) return Array.from(new Set([...prev, ...selectableAlarmIds]));
      return prev.filter((id) => !selectableAlarmIds.includes(id));
    });
  }, [selectableAlarmIds]);

  useEffect(() => {
    setSelectedAlarmIds((prev) => prev.filter((id) => tableData.some((alarm) => alarm.Id_Alarme === id)));
  }, [tableData]);

  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    setSelectedAlarmIds([]);
  }, [selectedSiteId, selectedLocationId, statusFilter]);

  useEffect(() => {
    if (selectedLocationId === "all") return;
    if (!locationOptions.some((option) => String(option.id) == selectedLocationId)) {
      setSelectedLocationId("all");
    }
  }, [locationOptions, selectedLocationId]);

  const columns = useMemo<ColumnDef<AlarmRow>[]>(
    () => [
      {
        id: "select",
        enableSorting: false,
        header: () => (
          <div className="flex justify-center">
            <Checkbox
              checked={allVisibleSelected ? true : someVisibleSelected ? "indeterminate" : false}
              onCheckedChange={(checked) => toggleAllVisibleSelections(checked === true)}
              aria-label={t("bulk.select_visible")}
            />
          </div>
        ),
        cell: ({ row }) => {
          const alarm = row.original;
          if (alarm.Est_Acquittee) return null;

          return (
            <div className="flex justify-center">
              <Checkbox
                checked={selectedAlarmIds.includes(alarm.Id_Alarme)}
                onCheckedChange={(checked) => toggleAlarmSelection(alarm.Id_Alarme, checked === true)}
                onClick={(event) => event.stopPropagation()}
                aria-label={t("bulk.select_one")}
              />
            </div>
          );
        },
      },
      {
        accessorKey: "Type",
        header: t("columns.type"),
        cell: ({ row }) => {
          const type = row.getValue("Type") as AlarmRow["Type"];
          if (type === "no-response" || type === "module") {
            return (
              <div className="p-1.5 rounded-md w-fit bg-black/10">
                <WifiOff className="h-4 w-4 text-black" />
              </div>
            );
          }

          if (type === "high") {
            return (
              <div className="p-1.5 rounded-md w-fit bg-destructive/10">
                <ArrowUp className="h-4 w-4 text-destructive" />
              </div>
            );
          }

          if (type === "low") {
            return (
              <div className="p-1.5 rounded-md w-fit bg-[#26A5DA]/10">
                <ArrowDown className="h-4 w-4 text-[#26A5DA]" />
              </div>
            );
          }

          if (type === "sector") {
            return (
              <div className="p-1.5 rounded-md w-fit bg-amber-100">
                <PowerOff className="h-4 w-4 text-amber-700" />
              </div>
            );
          }

          return <span className="text-xs text-muted-foreground">-</span>;
        },
      },
      {
        accessorKey: "Libelle_Lieu",
        header: t("columns.location"),
        cell: ({ row }) => (
          <span className="font-medium">{row.getValue("Libelle_Lieu")}</span>
        ),
      },
      {
        accessorKey: "Derniere_Valeur",
        header: () => <div className="text-right">{t("columns.triggered_value")}</div>,
        cell: ({ row }) => {
          const value = row.original.Derniere_Valeur;
          const unit = row.original.Unite;
          return (
            <div className="text-right font-mono font-medium">
              {value !== null && value !== undefined
                ? `${formatMeasureValue(value)} ${unit ?? ""}`.trim()
                : "-"}
            </div>
          );
        },
      },
      {
        accessorKey: "Min_Threshold",
        header: () => <div className="text-right">{t("columns.thresholds")}</div>,
        cell: ({ row }) => {
          const sup = row.original.Max_Threshold;
          const inf = row.original.Min_Threshold;
          const unit = row.original.Unite;
          const hasSup = sup !== null && sup !== undefined;
          const hasInf = inf !== null && inf !== undefined;

          if (!hasSup && !hasInf) {
            return <div className="text-right font-mono text-muted-foreground">-</div>;
          }

          return (
            <div className="text-right font-mono text-muted-foreground">
              <div>{hasSup ? t("thresholds.sup", { value: formatMeasureValue(sup), unit: unit ?? "" }) : t("thresholds.sup_empty")}</div>
              <div>{hasInf ? t("thresholds.inf", { value: formatMeasureValue(inf), unit: unit ?? "" }) : t("thresholds.inf_empty")}</div>
            </div>
          );
        },
      },
      {
        id: "period",
        header: t("columns.period"),
        meta: {
          headerClassName: "!border-l border-white/25 !border-r border-white/25",
          cellClassName: "!border-l border-border !border-r border-border",
        },
        cell: ({ row }) => (
          <div className="space-y-1 text-xs">
            <div><span className="text-muted-foreground">{t("columns.start")}:</span> <span>{formatDateTime(row.original.Date_Heure_Debut)}</span></div>
            <div><span className="text-muted-foreground">{t("columns.end")}:</span> <span>{formatDateTime(row.original.Date_Heure_Fin)}</span></div>
          </div>
        ),
      },
      {
        accessorKey: "Status",
        header: t("columns.status"),
        meta: {
          headerClassName: "!border-l border-white/25 !border-r border-white/25",
          cellClassName: "!border-l border-border !border-r border-border",
        },
        cell: ({ row }) => {
          const status = getAlarmStatus(
            t,
            row.getValue("Status"),
            row.getValue("Date_Heure_Fin"),
            row.getValue("Est_Acquittee")
          );
          return <Badge variant={status.variant}>{status.label}</Badge>;
        },
      },
      {
        id: "duration",
        header: t("columns.duration"),
        meta: {
          headerClassName: "!border-l border-white/25 !border-r border-white/25",
          cellClassName: "!border-l border-border !border-r border-border",
        },
        cell: ({ row }) => {
          const start = row.original.Date_Heure_Debut ? parseDbDateTime(row.original.Date_Heure_Debut) : null;
          const end = row.original.Date_Heure_Fin ? parseDbDateTime(row.original.Date_Heure_Fin) : new Date();
          if (!start || Number.isNaN(start.getTime())) return t("date.na");
          if (!end || Number.isNaN(end.getTime())) return t("date.na");
          const diff = end.getTime() - start.getTime();
          const totalMinutes = Math.max(Math.floor(diff / 60000), 0);
          const hours = Math.floor(totalMinutes / 60);
          const minutes = totalMinutes % 60;
          return <span className="font-mono text-sm">{hours > 0 ? `${hours}h ${minutes}min` : `${minutes}min`}</span>;
        },
      },
      {
        id: "actions",
        header: () => <div className="text-center">{tButtons("acknowledge")}</div>,
        meta: {
          headerClassName: "!border-l border-white/25",
          cellClassName: "!border-l border-border",
        },
        cell: ({ row }) => {
          const alarm = row.original;
          if (alarm.Est_Acquittee) return null;
          return (
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={(event) => { event.stopPropagation(); setSelectedAlarmId(alarm.Id_Alarme); }}
                disabled={acknowledgeMutation.isPending}
              >
                {tButtons("acknowledge")}
              </Button>
            </div>
          );
        },
      },
    ],
    [
      acknowledgeMutation,
      allVisibleSelected,
      formatDateTime,
      selectedAlarmIds,
      someVisibleSelected,
      t,
      tButtons,
      toggleAlarmSelection,
      toggleAllVisibleSelections,
    ]
  );

  useEffect(() => {
    if (!data?.pagination) return;
    if (data.pagination.page >= data.pagination.pages) return;
    const nextPage = data.pagination.page + 1;
    queryClient.prefetchQuery({
      queryKey: ["alarms", statusFilter, nextPage, limit, selectedSiteId, selectedLocationId],
      queryFn: () => fetchAlarmsPage(nextPage, limit, statusFilter, selectedSiteId, selectedLocationId),
      staleTime: 30_000,
    });
  }, [data?.pagination, limit, queryClient, selectedLocationId, selectedSiteId, statusFilter]);

  const handleRefresh = () => {
    startRefresh(() => {
      queryClient.invalidateQueries({ queryKey: ["alarms"] });
    });
  };

  const handleBulkAcknowledge = async () => {
    const ids = [...selectedAlarmIds];
    if (ids.length === 0) return;

    setIsBulkSubmitting(true);
    try {
      const results = await Promise.allSettled(
        ids.map((id) => alarmsApi.acknowledge(String(id), bulkComment.trim() || "")),
      );
      const successCount = results.filter((result) => result.status === "fulfilled").length;

      if (successCount === ids.length) {
        toast.success(t("bulk.success", { count: successCount }));
      } else if (successCount > 0) {
        toast.warning(t("bulk.partial_success", { success: successCount, total: ids.length }));
      } else {
        throw new Error("bulk_ack_failed");
      }

      ids.forEach((id) => markAlarmAcknowledgedInPaginatedSensorsCache(queryClient, id));
      queryClient.invalidateQueries({ queryKey: ["capteurs", "paginated"] });
      queryClient.invalidateQueries({ queryKey: ["alarms"] });
      setSelectedAlarmIds([]);
      setBulkComment("");
      setBulkDialogOpen(false);
    } catch {
      toast.error(t("bulk.error"));
    } finally {
      setIsBulkSubmitting(false);
    }
  };

  const toggleTypeFilter = (type: AlarmRow["Type"], checked: boolean) => {
    setTypeFilters((prev) => {
      if (checked) {
        return prev.includes(type) ? prev : [...prev, type];
      }
      return prev.filter((item) => item !== type);
    });
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
        {isRefreshing ? t("refresh.loading") : t("refresh.label")}
      </span>
    </Button>
  );

  return (
    <>
      <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent className="p-2 md:p-4 xl:p-4">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant={statusFilter === "active" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("active")}
          >
            {activeTabLabel}
          </Button>
          <Button
            type="button"
            variant={statusFilter === "resolved" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("resolved")}
          >
            {resolvedTabLabel}
          </Button>
        </div>
        <TanStackTable
          columns={columns}
          data={tableData}
          searchField="Libelle_Lieu"
          searchPlaceholder={t("search_placeholder")}
          pageSize={500}
          maxHeight="60vh"
          isLoading={isLoading || isFetching}
          emptyMessage={t("empty")}
          toolbarRight={
            <div className="flex flex-wrap items-center gap-2">
              <Select value={selectedSiteId} onValueChange={setSelectedSiteId}>
                <SelectTrigger className="w-45" data-testid="filter-site">
                  <SelectValue placeholder={t("filters.site_placeholder")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("filters.all_sites")}</SelectItem>
                  {siteOptions.map((site) => (
                    <SelectItem key={site.id} value={String(site.id)}>{site.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedLocationId} onValueChange={setSelectedLocationId}>
                <SelectTrigger className="w-55" data-testid="filter-location">
                  <SelectValue placeholder={t("filters.location_placeholder")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("filters.all_locations")}</SelectItem>
                  {locationOptions.map((location) => (
                    <SelectItem key={location.id} value={String(location.id)}>{location.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <AlarmsFilters
                typeFilters={typeFilters}
                onToggleTypeFilter={toggleTypeFilter}
                onClearTypeFilters={() => setTypeFilters([])}
              />
              {canAcknowledgeAlarm && selectedAlarmIds.length > 0 ? (
                <Button variant="default" size="sm" onClick={() => setBulkDialogOpen(true)}>
                  {t("bulk.acknowledge_selected", { count: selectedAlarmIds.length })}
                </Button>
              ) : null}
              {refreshButton}
            </div>
          }
          manualPagination
          pageCount={pageCount}
          totalRows={total}
          paginationState={pagination}
          onPaginationChange={(updater) => {
            setPagination((prev) => {
              const next = typeof updater === "function" ? updater(prev) : updater;
              if (next.pageSize !== prev.pageSize) {
                return { pageIndex: 0, pageSize: next.pageSize };
              }
              if (next.pageIndex === prev.pageIndex && next.pageSize === prev.pageSize) {
                return prev;
              }
              return next;
            });
          }}
          onFilteredRowCountChange={setFilteredRowCount}
          onRowClick={(row) => {
            setSelectedAlarmId(row.Id_Alarme);
          }}
          resultsLabel={resultsLabel}
          headerClassName="!bg-sidebar !text-sidebar-foreground"
          headerCellClassName="!bg-sidebar !text-sidebar-foreground !border-r !border-white/25 hover:!bg-sidebar-accent/80"
          tableClassName="border-separate border-spacing-0 [&_thead_th]:!border-r [&_thead_th]:!border-white/25 [&_tbody_td]:!border-b [&_tbody_td]:!border-border"
        />
      </CardContent>
    </Card>

      <AlarmDetailsDialog
        selectedAlarm={selectedAlarm}
        open={selectedAlarmId !== null}
        showGraph={showGraph}
        setShowGraph={setShowGraph}
        commentOptions={commentOptions}
        isCommentsLoading={isCommentsLoading}
        selectedCommentId={selectedCommentId}
        setSelectedCommentId={setSelectedCommentId}
        setValue={setValue}
        register={register}
        errors={errors}
        comment={comment}
        handleSubmit={handleSubmit}
        handleDialogAcknowledge={async (values: CommentFormValues) => {
          if (!selectedAlarm) return;
          const acknowledgedAlarmId = Number(selectedAlarm.id);
          setSelectedAlarmId(null);
          setSelectedCommentId("");
          reset({ comment: "" });
          await alarmsApi.acknowledge(selectedAlarm.id, values.comment || "");
          markAlarmAcknowledgedInPaginatedSensorsCache(queryClient, acknowledgedAlarmId);
          queryClient.invalidateQueries({ queryKey: ["capteurs", "paginated"] });
          queryClient.invalidateQueries({ queryKey: ["alarms"] });
        }}
        canAcknowledgeAlarm={canAcknowledgeAlarm}
        acknowledgePending={acknowledgeMutation.isPending || isDetailLoading}
        isSubmitting={isSubmitting}
        t={tDialog}
        alarmTypeLabel={selectedAlarm?.type === "high" ? tDialog("dialog.type_high") : selectedAlarm?.type === "low" ? tDialog("dialog.type_low") : selectedAlarm?.type === "no-response" ? tDialog("dialog.type_no_response") : selectedAlarm?.type === "sector" ? tDialog("dialog.type_sector") : selectedAlarm?.type === "module" ? tDialog("dialog.type_module") : tDialog("dialog.type_other")}
        formattedStart={selectedAlarm?.triggeredAt ? formatDbDateTime(selectedAlarm.triggeredAt) : tDialog("dialog.na")}
        formattedEnd={selectedAlarm?.resolvedAt ? formatDbDateTime(selectedAlarm.resolvedAt) : tDialog("dialog.end_in_progress")}
        formattedDuration={selectedAlarm?.triggeredAt ? (() => { const s = parseDbDateTime(selectedAlarm.triggeredAt); const e = selectedAlarm.resolvedAt ? parseDbDateTime(selectedAlarm.resolvedAt) : new Date(); if (!s || !e) return tDialog("dialog.na"); const m = Math.max(Math.floor((e.getTime()-s.getTime())/60000),0); const h = Math.floor(m/60); const mm=m%60; return h>0 ? `${h}h ${mm}min` : `${mm}min`; })() : tDialog("dialog.na")}
        isStatsLoading={isStatsLoading}
        alarmCount30={alarmCount30}
        focusRange={selectedAlarm?.triggeredAt ? (() => { const start = parseDbDateTime(selectedAlarm.triggeredAt); const end = selectedAlarm.resolvedAt ? parseDbDateTime(selectedAlarm.resolvedAt) : new Date(); if (!start || !end) return null; return { from: new Date(start.getTime() - 3600000), to: new Date(end.getTime() + 3600000) }; })() : null}
        onClose={() => { setSelectedAlarmId(null); setSelectedCommentId(""); reset({ comment: "" }); }}
      />

      <Dialog open={bulkDialogOpen} onOpenChange={(open) => !isBulkSubmitting && setBulkDialogOpen(open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("bulk.dialog_title")}</DialogTitle>
            <DialogDescription>{t("bulk.dialog_description", { count: selectedAlarmIds.length })}</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="bulk-acknowledge-comment">{t("bulk.comment_label")}</Label>
            <Textarea
              id="bulk-acknowledge-comment"
              value={bulkComment}
              onChange={(event) => setBulkComment(event.target.value)}
              maxLength={200}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkDialogOpen(false)} disabled={isBulkSubmitting}>
              {tDialog("dialog.cancel")}
            </Button>
            <Button onClick={handleBulkAcknowledge} disabled={isBulkSubmitting || selectedAlarmIds.length === 0}>
              {isBulkSubmitting ? t("bulk.confirming") : t("bulk.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
