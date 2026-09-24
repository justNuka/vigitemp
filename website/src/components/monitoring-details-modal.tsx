'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { SortingState, Updater } from "@tanstack/react-table";
import {
  Chart as ChartJS,
  CategoryScale,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip as ChartTooltip,
} from "chart.js";
import { Maximize2, Minimize2 } from "lucide-react";

import { MonitoringAuditTab } from "@/components/monitoring-details/monitoring-audit-tab";
import { MonitoringGraphTab } from "@/components/monitoring-details/monitoring-graph-tab";
import { MonitoringTableTab } from "@/components/monitoring-details/monitoring-table-tab";
import { BatteryIndicator } from "@/components/monitoring-card/battery-indicator";
import { RssiBars } from "@/components/monitoring-card/rssi-bars";
import type { DateRangeValue, ZoomBounds } from "@/components/monitoring-details/types";
import { useMonitoringAuditLogs } from "@/components/monitoring-details/use-monitoring-audit-logs";
import { useMonitoringRangeMeasurements } from "@/components/monitoring-details/use-monitoring-range-measurements";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLieuMeasurementsPaged } from "@/hooks/useLieuMeasurementsPaged";
import { calculateYDomain, getMeasureSummary, sortMeasuresChronologically } from "@/lib/measurements";
import { MONITORING_DETAIL_GRAPH_MAX_POINTS } from "@/lib/measurement-downsampling";
import { formatNumber } from "@/lib/number-display";
import { cn } from "@/lib/utils";
import type { SensorStatus } from "@/lib/surveillance-status";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, ChartTooltip, Legend, Filler);

let isChartZoomPluginRegistered = false;

interface MonitoringDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  idLieu: number;
  nomLieu: string;
  siteName?: string;
  groupName?: string;
  sondeNumeroSerie: string;
  currentValue?: number | null;
  lastMeasurement?: Date | string | null;
  status?: SensorStatus;
  alarmType?: 'H' | 'B' | 'N' | 'S' | 'A' | 'M' | 'T' | null;
  canAcknowledge?: boolean;
  onAcknowledge?: () => void;
  isGso?: boolean | null;
  gsoRssi?: string | null;
  batteryPercent?: number | null;
  gsoTension?: string | null;
  consigneSup: number | null;
  consigneInf: number | null;
  consigne: number | null;
  consigneSupPreAlarme?: number | null;
  estConsigneSupPreAlarmeActive?: boolean | null;
  consigneInfPreAlarme?: number | null;
  estConsigneInfPreAlarmeActive?: boolean | null;
  unite: string;
  isSurveillanceActive: boolean;
  initialRange?: DateRangeValue;
  showNullNonResponse?: boolean;
}

type GuidePositions = {
  sup: number | null;
  inf: number | null;
  consigne: number | null;
  preSup: number | null;
  preInf: number | null;
};

const ROLLING_GRAPH_HOURS = 24;

function getRollingGraphRange(now = new Date()): DateRangeValue {
  return {
    from: new Date(now.getTime() - ROLLING_GRAPH_HOURS * 60 * 60 * 1000),
    to: now,
  };
}

export default function MonitoringDetailsModal({
  isOpen,
  onClose,
  idLieu,
  nomLieu,
  siteName = "",
  groupName = "",
  sondeNumeroSerie,
  currentValue = null,
  lastMeasurement = null,
  status = "ok",
  alarmType = null,
  canAcknowledge = false,
  onAcknowledge,
  gsoRssi,
  batteryPercent,
  gsoTension,
  consigneSup: initialConsigneSup,
  consigneInf: initialConsigneInf,
  consigne: initialConsigne,
  consigneSupPreAlarme: initialConsigneSupPreAlarme,
  estConsigneSupPreAlarmeActive,
  consigneInfPreAlarme: initialConsigneInfPreAlarme,
  estConsigneInfPreAlarmeActive,
  unite: initialUnite,
  isSurveillanceActive,
  initialRange,
  showNullNonResponse: controlledShowNullNonResponse,
}: MonitoringDetailsModalProps) {
  const locale = useLocale();
  const localeTag = locale === "fr" ? "fr-FR" : locale;
  const t = useTranslations("monitoringDetailsModal");
  const tCard = useTranslations("monitoringCard");
  const tStatus = useTranslations("surveillanceStatus");

  useEffect(() => {
    if (isChartZoomPluginRegistered) return;

    let cancelled = false;
    import("chartjs-plugin-zoom")
      .then((mod) => {
        if (cancelled || isChartZoomPluginRegistered) return;
        ChartJS.register(mod.default);
        isChartZoomPluginRegistered = true;
      })
      .catch((error) => {
        console.error("Failed to load chartjs-plugin-zoom", error);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const [dateRange, setDateRange] = useState<DateRangeValue | null>(() => initialRange ?? null);
  const [rollingGraphRange, setRollingGraphRange] = useState<DateRangeValue>(() => getRollingGraphRange());
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 200 });
  const [guidePositions, setGuidePositions] = useState<GuidePositions>({
    sup: null,
    inf: null,
    consigne: null,
    preSup: null,
    preInf: null,
  });
  const [activeTab, setActiveTab] = useState<"graph" | "table" | "audit">("graph");
  const [zoomBounds, setZoomBounds] = useState<ZoomBounds | null>(null);
  const [showGraphAudits, setShowGraphAudits] = useState(false);
  const [tableSorting, setTableSorting] = useState<SortingState>([]);
  const chartRef = useRef<ChartJS<"line"> | null>(null);
  const graphAuditKeyRef = useRef<string | null>(null);
  const showNullNonResponse = Boolean(controlledShowNullNonResponse);

  useEffect(() => {
    if (!isOpen || typeof window === "undefined") return;
    const hasSelectedRange = Boolean(initialRange?.from || dateRange?.from);
    window.dispatchEvent(
      new CustomEvent("vigitemp:surveillance-range-lock", {
        detail: { active: hasSelectedRange },
      }),
    );

    return () => {
      window.dispatchEvent(
        new CustomEvent("vigitemp:surveillance-range-lock", {
          detail: { active: false },
        }),
      );
    };
  }, [dateRange, initialRange, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    setDateRange(initialRange ?? null);
    setRollingGraphRange(getRollingGraphRange());
  }, [idLieu, initialRange, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      graphAuditKeyRef.current = null;
      return;
    }

    const auditKey = `${idLieu}`;
    if (graphAuditKeyRef.current === auditKey) return;
    graphAuditKeyRef.current = auditKey;

    void fetch(`/api/lieux/${idLieu}/graph-open`, {
      method: "POST",
      credentials: "include",
      cache: "no-store",
    }).catch(() => {
      // Best effort: the modal must keep opening even if audit fails.
    });
  }, [idLieu, isOpen]);

  const effectiveRange = useMemo(() => {
    if (!dateRange?.from) return null;
    return { from: dateRange.from, to: dateRange.to ?? dateRange.from };
  }, [dateRange]);

  const explicitRangeStart = useMemo(() => {
    if (!effectiveRange?.from) return null;
    const start = new Date(effectiveRange.from);
    start.setHours(0, 0, 0, 0);
    return start;
  }, [effectiveRange]);

  const explicitRangeEnd = useMemo(() => {
    if (!effectiveRange?.to) return null;
    const end = new Date(effectiveRange.to);
    end.setHours(23, 59, 59, 999);
    return end;
  }, [effectiveRange]);

  const hasExplicitRange = Boolean(explicitRangeStart && explicitRangeEnd);
  const graphRangeStart = explicitRangeStart ?? rollingGraphRange.from;
  const graphRangeEnd = explicitRangeEnd ?? rollingGraphRange.to ?? rollingGraphRange.from;

  const selectedRangeLabel = useMemo(() => {
    if (!effectiveRange?.from) return t("filters.last_24_hours");
    const formatter = new Intl.DateTimeFormat(localeTag, { dateStyle: "medium" });
    const fromLabel = formatter.format(effectiveRange.from);
    const toLabel = formatter.format(effectiveRange.to ?? effectiveRange.from);
    if (fromLabel === toLabel) return fromLabel;
    return `${fromLabel} -> ${toLabel}`;
  }, [effectiveRange, localeTag, t]);

  const exportFileName = useMemo(() => {
    const baseName = nomLieu.trim().length > 0 ? nomLieu.trim() : `lieu-${idLieu}`;
    const suffix = selectedRangeLabel ?? new Intl.DateTimeFormat(localeTag, { dateStyle: "short" }).format(new Date());
    return `${baseName}-${suffix}`
      .replace(/[\/:*?"<>|]+/g, "-")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }, [idLieu, localeTag, nomLieu, selectedRangeLabel]);

  const {
    data: rangeGraphData,
    isLoading: rangeGraphLoading,
    sourceCount: graphSourceCount,
    isSampled: isGraphSampled,
  } = useMonitoringRangeMeasurements(idLieu, {
    enabled: isOpen,
    rangeStart: graphRangeStart,
    rangeEnd: graphRangeEnd,
    includeNullNonResponse: showNullNonResponse,
    limitTodayRange: false,
    maxGraphPoints: MONITORING_DETAIL_GRAPH_MAX_POINTS,
  });

  const data = rangeGraphData;
  const historyRangeStart = graphRangeStart;
  const historyRangeEnd = graphRangeEnd;

  const measurementSortBy = tableSorting[0]?.id === "value" ? "value" : tableSorting[0]?.id === "date" ? "date" : null;
  const measurementSortDirection =
    tableSorting[0]?.desc === true ? "desc" : tableSorting[0] ? "asc" : null;

  const { data: historyData, isLoading: isHistoryLoading, totalRows, pageCount } = useLieuMeasurementsPaged(idLieu, {
    enabled: isOpen,
    pageIndex: pagination.pageIndex,
    pageSize: pagination.pageSize,
    startDate: historyRangeStart,
    endDate: historyRangeEnd,
    includeNullNonResponse: showNullNonResponse,
    sortBy: measurementSortBy,
    sortDirection: measurementSortDirection,
  });

  const orderedData = useMemo(() => sortMeasuresChronologically(data), [data]);
  const orderedHistoryData = useMemo(() => {
    if (measurementSortBy) {
      return historyData;
    }
    return sortMeasuresChronologically(historyData);
  }, [historyData, measurementSortBy]);

  const summary = useMemo(
    () =>
      getMeasureSummary(orderedData, {
        consigneSup: initialConsigneSup,
        consigneInf: initialConsigneInf,
        consigne: initialConsigne,
        unite: initialUnite,
      }),
    [initialConsigne, initialConsigneInf, initialConsigneSup, initialUnite, orderedData],
  );

  const { consigneSup, consigneInf, consigne, unite } = summary;
  const preAlarmSup =
    estConsigneSupPreAlarmeActive && initialConsigneSupPreAlarme !== null && initialConsigneSupPreAlarme !== undefined
      ? Number(initialConsigneSupPreAlarme)
      : null;
  const preAlarmInf =
    estConsigneInfPreAlarmeActive && initialConsigneInfPreAlarme !== null && initialConsigneInfPreAlarme !== undefined
      ? Number(initialConsigneInfPreAlarme)
      : null;

  const presentationRows = useMemo(() => {
    const notAvailable = t("export.defaults.not_available");
    const formatThreshold = (value: number | null) => (value === null ? notAvailable : `${value}${unite}`);
    const measurementsCount = Math.max(totalRows, orderedHistoryData.length);

    return [
      { label: t("export.presentation.location"), value: nomLieu },
      { label: t("export.presentation.sensor_serial"), value: sondeNumeroSerie },
      { label: t("export.presentation.selected_range"), value: selectedRangeLabel ?? t("export.defaults.no_range") },
      {
        label: t("export.presentation.surveillance"),
        value: isSurveillanceActive ? t("export.state.active") : t("export.state.inactive"),
      },
      { label: t("export.presentation.unit"), value: unite || notAvailable },
      { label: t("export.presentation.upper_threshold"), value: formatThreshold(consigneSup) },
      { label: t("export.presentation.target_threshold"), value: formatThreshold(consigne) },
      { label: t("export.presentation.lower_threshold"), value: formatThreshold(consigneInf) },
      { label: t("export.presentation.pre_alarm_upper"), value: formatThreshold(preAlarmSup) },
      { label: t("export.presentation.pre_alarm_lower"), value: formatThreshold(preAlarmInf) },
      {
        label: t("export.presentation.battery"),
        value: batteryPercent !== null && batteryPercent !== undefined ? `${batteryPercent}%` : notAvailable,
      },
      { label: t("export.presentation.rssi"), value: gsoRssi ?? notAvailable },
      { label: t("export.presentation.voltage"), value: gsoTension ?? notAvailable },
      { label: t("export.presentation.graph_points"), value: formatNumber(orderedData.length, { locale: localeTag, decimals: 0 }) },
      { label: t("export.presentation.table_measurements"), value: formatNumber(measurementsCount, { locale: localeTag, decimals: 0 }) },
      { label: t("export.presentation.last_measure_time"), value: summary.lastDateTime || notAvailable },
      { label: t("export.presentation.last_measure_value"), value: summary.lastMeasureText || notAvailable },
    ];
  }, [
    batteryPercent,
    consigne,
    consigneInf,
    consigneSup,
    gsoRssi,
    gsoTension,
    isSurveillanceActive,
    nomLieu,
    localeTag,
    orderedData.length,
    orderedHistoryData.length,
    preAlarmInf,
    preAlarmSup,
    selectedRangeLabel,
    summary.lastDateTime,
    summary.lastMeasureText,
    sondeNumeroSerie,
    t,
    totalRows,
    unite,
  ]);

  const measuresLabel = useMemo(() => t("chart.measures", { unit: unite }), [t, unite]);
  const [yMin, yMax] = useMemo(
    () => calculateYDomain(orderedData, { consigneSup, consigneInf, consigne }),
    [consigne, consigneInf, consigneSup, orderedData],
  );

  const updateGuidePositions = useCallback(() => {
    const chart = chartRef.current;
    const yScale = chart?.scales?.y;
    if (!yScale) return;

    const chartArea = chart.chartArea;
    const clamp = (value: number) => (chartArea ? Math.max(chartArea.top, Math.min(chartArea.bottom, value)) : value);
    const toPosition = (value: number | null) => (value === null ? null : clamp(yScale.getPixelForValue(value)));

    setGuidePositions({
      sup: toPosition(consigneSup),
      inf: toPosition(consigneInf),
      consigne: toPosition(consigne),
      preSup: toPosition(preAlarmSup),
      preInf: toPosition(preAlarmInf),
    });
  }, [consigne, consigneInf, consigneSup, preAlarmInf, preAlarmSup]);

  useEffect(() => {
    if (!isOpen) return;
    const frame = requestAnimationFrame(updateGuidePositions);
    return () => cancelAnimationFrame(frame);
  }, [isOpen, orderedData, updateGuidePositions, yMin, yMax]);

  useEffect(() => {
    if (!isOpen) return;
    const handleResize = () => updateGuidePositions();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isOpen, updateGuidePositions]);

  useEffect(() => {
    if (!isOpen) return;
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    setTableSorting([]);
  }, [idLieu, isOpen, hasExplicitRange]);

  const shouldLoadAuditLogs =
    isOpen &&
    (activeTab === "audit" || (activeTab === "graph" && showGraphAudits)) &&
    Boolean(historyRangeStart && historyRangeEnd);

  const { logs: auditLogs, isLoading: auditLoading, error: auditError, reset: resetAuditState } = useMonitoringAuditLogs(idLieu, {
    enabled: shouldLoadAuditLogs,
    errorMessage: t("audit.error"),
    rangeStart: historyRangeStart,
    rangeEnd: historyRangeEnd,
  });

  useEffect(() => {
    if (!isOpen) return;
    setActiveTab("graph");
    resetAuditState();
  }, [idLieu, isOpen, isSurveillanceActive, resetAuditState]);

  useEffect(() => {
    if (!isOpen) return;
    resetAuditState();
  }, [isOpen, isSurveillanceActive, hasExplicitRange, graphRangeStart, graphRangeEnd, resetAuditState]);

  const captureZoomBounds = useCallback((chart: ChartJS<"line">) => {
    const xScale = chart.scales?.x;
    const yScale = chart.scales?.y;
    const next = {
      xMin: typeof xScale?.min === "number" ? xScale.min : undefined,
      xMax: typeof xScale?.max === "number" ? xScale.max : undefined,
      yMin: typeof yScale?.min === "number" ? yScale.min : undefined,
      yMax: typeof yScale?.max === "number" ? yScale.max : undefined,
    };

    setZoomBounds((prev) => {
      if (
        prev?.xMin === next.xMin &&
        prev?.xMax === next.xMax &&
        prev?.yMin === next.yMin &&
        prev?.yMax === next.yMax
      ) {
        return prev;
      }
      return next;
    });
  }, []);

  const resetChartZoom = useCallback(() => {
    const chart = chartRef.current;
    if (!chart) return;
    chart.resetZoom();
    setZoomBounds(null);
    chart.update("none");
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    setZoomBounds(null);
  }, [idLieu, isOpen, hasExplicitRange, graphRangeStart, graphRangeEnd]);

  const [detailsSize, setDetailsSize] = useState<"standard" | "expanded">("standard");
  const isExpanded = detailsSize === "expanded";
  const tabContentMaxHeight = isExpanded
    ? "calc(100vh - 18rem)"
    : "calc(88vh - 17rem)";
  const graphHeightClassName = isExpanded
    ? "relative h-[calc(100vh-20rem)] min-h-[68vh]"
    : "relative h-[380px] min-h-[380px]";

  const currentMeasurementText = useMemo(() => {
    const decimals = summary.decimals ?? 1;
    if (currentValue !== null && currentValue !== undefined) {
      return `${formatNumber(currentValue, { decimals, locale: localeTag })}${unite}`;
    }
    return summary.lastMeasureText || "—";
  }, [currentValue, localeTag, summary.decimals, summary.lastMeasureText, unite]);

  const currentMeasurementTime = useMemo(() => {
    if (lastMeasurement) {
      return formatStoredDbDateTime(lastMeasurement, {
        format: "dateTime",
        locale: localeTag,
        fallback: "",
      });
    }
    return summary.lastDateTime || "";
  }, [lastMeasurement, localeTag, summary.lastDateTime]);

  const formatThreshold = useCallback(
    (value: number | null) =>
      value === null
        ? "—"
        : `${formatNumber(value, { decimals: summary.decimals ?? 1, locale: localeTag })}${unite}`,
    [localeTag, summary.decimals, unite],
  );

  const alarmLabel =
    alarmType === "H"
      ? tCard("alarmTypes.high")
      : alarmType === "B"
        ? tCard("alarmTypes.low")
        : alarmType === "N"
          ? tCard("alarmTypes.no_response")
          : alarmType === "S" || alarmType === "A"
            ? tCard("alarmTypes.sector")
            : alarmType === "M"
              ? tCard("alarmTypes.module")
              : alarmType === "T" || status === "ended"
                ? tCard("alarmTypes.ended")
                : status === "warning"
                  ? tStatus("warning")
                  : tStatus("ok");

  const statusToneClass =
    alarmType === "H" || status === "critical"
      ? "border-red-200 bg-red-50/80 text-red-800 dark:border-red-500/25 dark:bg-red-500/10 dark:text-red-100"
      : alarmType === "B"
        ? "border-blue-200 bg-blue-50/80 text-blue-800 dark:border-blue-500/25 dark:bg-blue-500/10 dark:text-blue-100"
        : status === "warning"
          ? "border-amber-200 bg-amber-50/80 text-amber-800 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-100"
          : status === "technical"
            ? "border-slate-300 bg-slate-100 text-slate-900 dark:border-slate-600 dark:bg-slate-800/70 dark:text-slate-100"
            : status === "ended"
              ? "border-violet-200 bg-violet-50/80 text-violet-800 dark:border-violet-500/25 dark:bg-violet-500/10 dark:text-violet-100"
              : "border-sky-200 bg-sky-50/80 text-sky-800 dark:border-sky-500/25 dark:bg-sky-500/10 dark:text-sky-100";

  const statusDotClass =
    alarmType === "H" || status === "critical"
      ? "bg-red-600"
      : alarmType === "B"
        ? "bg-blue-600"
        : status === "warning"
          ? "bg-amber-500"
          : status === "technical"
            ? "bg-slate-900 dark:bg-slate-100"
            : status === "ended"
              ? "bg-violet-600"
              : "bg-sky-500";

  useEffect(() => {
    if (!isOpen) {
      setDetailsSize("standard");
    }
  }, [isOpen]);

  const gsoRssiLabel = useMemo(
    () => (gsoRssi ? t("gso.rssi", { value: gsoRssi }) : null),
    [gsoRssi, t],
  );

  const handleTableSortingChange = useCallback((updater: Updater<SortingState>) => {
    setTableSorting((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      return next;
    });
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    setPagination((current) =>
      current.pageIndex === 0 ? current : { ...current, pageIndex: 0 },
    );
  }, [
    explicitRangeEnd,
    explicitRangeStart,
    idLieu,
    isOpen,
    showNullNonResponse,
  ]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          "flex max-h-[96vh] flex-col overflow-hidden p-0 transition-all duration-300 ease-out",
          isExpanded
            ? "h-[96vh] w-[98vw] max-w-[98vw]"
            : "w-[min(94vw,1080px)] max-w-[1080px] sm:max-h-[88vh]",
        )}
      >
        <DialogHeader className="border-b border-border px-5 py-3 pr-14">
          <div className="flex min-w-0 flex-col gap-0.5">
            <p className="truncate text-[11px] font-medium text-muted-foreground">
              {siteName || tCard("site.unknown")}
              {groupName ? <span className="opacity-75"> · {groupName}</span> : null}
            </p>
            <DialogTitle className="truncate text-lg">{nomLieu}</DialogTitle>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span>{t("sensor", { serial: sondeNumeroSerie })}</span>
              {gsoRssi ? (
                <span className="inline-flex items-center gap-1.5">
                  <RssiBars value={gsoRssi} label={gsoRssiLabel ?? t("gso.rssi", { value: gsoRssi })} />
                  <span>{gsoRssiLabel ?? t("gso.rssi", { value: gsoRssi })}</span>
                </span>
              ) : null}
              {batteryPercent !== null && batteryPercent !== undefined ? (
                <span className="inline-flex items-center gap-1.5">
                  <BatteryIndicator
                    percent={batteryPercent}
                    voltage={gsoTension}
                    label={t("wireless.battery", { value: batteryPercent })}
                  />
                  <span>{t("wireless.battery", { value: batteryPercent })}</span>
                </span>
              ) : null}
              {gsoTension ? <span>{t("gso.tension", { value: gsoTension })}</span> : null}
            </div>
          </div>
        </DialogHeader>

        <div className="grid border-b border-border md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)_minmax(0,1.15fr)] md:divide-x md:divide-border">
          <div className="flex flex-col justify-center gap-1 px-5 py-3">
            <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              {t("chart.measures", { unit: unite })}
            </span>
            <span className="text-2xl font-semibold tabular-nums text-foreground">{currentMeasurementText}</span>
            {currentMeasurementTime ? (
              <span className="text-xs tabular-nums text-muted-foreground">{currentMeasurementTime}</span>
            ) : null}
          </div>

          <dl className="grid grid-cols-3 content-center gap-x-3 gap-y-2 px-5 py-3">
            <div className="min-w-0">
              <dt className="truncate text-[11px] text-muted-foreground">{tCard("chart.upper_threshold", { unit: unite })}</dt>
              <dd className="text-sm font-semibold tabular-nums text-red-600 dark:text-red-300">{formatThreshold(consigneSup)}</dd>
            </div>
            <div className="min-w-0">
              <dt className="truncate text-[11px] text-muted-foreground">{tCard("chart.target", { unit: unite })}</dt>
              <dd className="text-sm font-semibold tabular-nums text-foreground">{formatThreshold(consigne)}</dd>
            </div>
            <div className="min-w-0">
              <dt className="truncate text-[11px] text-muted-foreground">{tCard("chart.lower_threshold", { unit: unite })}</dt>
              <dd className="text-sm font-semibold tabular-nums text-red-600 dark:text-red-300">{formatThreshold(consigneInf)}</dd>
            </div>
          </dl>

          <div className={cn("flex items-center gap-3 border md:border-0 px-5 py-3", statusToneClass)}>
            <span className="relative inline-flex h-5 w-5 shrink-0 items-center justify-center">
              {(alarmType || status === "critical" || status === "technical") ? (
                <span className={cn("absolute inline-flex h-full w-full animate-ping rounded-full opacity-25 motion-reduce:hidden", statusDotClass)} />
              ) : null}
              <span className={cn("relative h-2.5 w-2.5 rounded-full shadow-sm", statusDotClass)} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{alarmLabel}</p>
              <p className="truncate text-xs opacity-75">
                {isSurveillanceActive ? tCard("surveillance.active") : tCard("surveillance.disabled")}
              </p>
            </div>
            {canAcknowledge && onAcknowledge ? (
              <Button type="button" size="sm" variant="outline" className="shrink-0 bg-background/80" onClick={onAcknowledge}>
                {tCard("acknowledge.button")}
              </Button>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-5 py-2">
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as "graph" | "table" | "audit")}
            className="w-auto"
          >
            <TabsList className="grid h-9 grid-cols-3 bg-muted/70 p-1">
              <TabsTrigger value="graph" className="px-4 text-xs">{t("tabs.graph")}</TabsTrigger>
              <TabsTrigger value="table" className="px-4 text-xs">{t("tabs.table")}</TabsTrigger>
              <TabsTrigger value="audit" className="px-4 text-xs">{t("tabs.audit")}</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <DateRangePicker
              key={hasExplicitRange ? `custom-${explicitRangeStart?.getTime()}-${explicitRangeEnd?.getTime()}` : "rolling-24-hours"}
              allowEmpty
              initialDateFrom={dateRange?.from}
              initialDateTo={dateRange?.to ?? dateRange?.from}
              onUpdate={({ range }) => {
                if (!range.from) {
                  setDateRange(null);
                  setRollingGraphRange(getRollingGraphRange());
                  return;
                }
                setDateRange({ from: range.from, to: range.to ?? range.from });
              }}
              align="end"
              locale={localeTag}
              showCompare={false}
              matchTriggerWidth={false}
              popoverClassName="w-[min(1280px,calc(100vw-1rem))]"
              triggerLabel={selectedRangeLabel}
            />
            {hasExplicitRange ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setDateRange(null);
                  setRollingGraphRange(getRollingGraphRange());
                }}
              >
                {t("actions.last_24_hours")}
              </Button>
            ) : null}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDetailsSize((prev) => (prev === "expanded" ? "standard" : "expanded"))}
            >
              {isExpanded ? <Minimize2 className="mr-2 h-4 w-4" /> : <Maximize2 className="mr-2 h-4 w-4" />}
              {isExpanded ? t("actions.standard_size") : t("actions.expanded_size")}
            </Button>
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "graph" | "table" | "audit")}
          className="flex min-h-0 w-full flex-1 flex-col overflow-hidden"
        >
          <TabsContent value="graph" className="m-0 min-h-0 flex-1 overflow-auto px-5 py-3">
            <MonitoringGraphTab
              chartRef={chartRef}
              isLoading={rangeGraphLoading}
              orderedData={orderedData}
              graphMeasureCount={graphSourceCount || orderedData.length}
              displayedPointCount={orderedData.length}
              isSampled={isGraphSampled}
              isRangeSelected={hasExplicitRange}
              isRollingWindow={!hasExplicitRange}
              auditLogs={auditLogs}
              showAuditMarkers={showGraphAudits}
              onShowAuditMarkersChange={setShowGraphAudits}
              measuresLabel={measuresLabel}
              locale={locale}
              unite={unite}
              consigneSup={consigneSup}
              consigneInf={consigneInf}
              consigne={consigne}
              preAlarmSup={preAlarmSup}
              preAlarmInf={preAlarmInf}
              guidePositions={guidePositions}
              yMin={yMin}
              yMax={yMax}
              xRangeStart={graphRangeStart}
              xRangeEnd={graphRangeEnd}
              zoomBounds={zoomBounds}
              resetChartZoom={resetChartZoom}
              captureZoomBounds={captureZoomBounds}
              t={t}
              graphHeightClassName={graphHeightClassName}
              exportFileName={exportFileName}
            />
          </TabsContent>

          <TabsContent value="table" className="m-0 min-h-0 flex-1 overflow-auto px-5 py-3">
            <MonitoringTableTab
              tableMeasurements={orderedHistoryData}
              nomLieu={nomLieu}
              sondeNumeroSerie={sondeNumeroSerie}
              exportFileName={exportFileName}
              unite={unite}
              consigneSup={consigneSup}
              consigneInf={consigneInf}
              rangeLoading={isHistoryLoading}
              pagination={pagination}
              pageCount={pageCount}
              totalRows={totalRows}
              onPaginationChange={setPagination}
              sorting={tableSorting}
              onSortingChange={handleTableSortingChange}
              isSurveillanceActive={isSurveillanceActive}
              rangeEnabled={true}
              presentationRows={presentationRows}
              t={t}
              maxHeight={tabContentMaxHeight}
            />
          </TabsContent>

          <TabsContent value="audit" className="m-0 min-h-0 flex-1 overflow-auto px-5 py-3">
            <MonitoringAuditTab
              logs={auditLogs}
              isLoading={auditLoading}
              error={auditError}
              t={t}
              maxHeight={tabContentMaxHeight}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}