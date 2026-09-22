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

import { TanStackTable } from "@/components/data-table/tanstack-table";
import { MonitoringAuditTab } from "@/components/monitoring-details/monitoring-audit-tab";
import { MonitoringGraphTab } from "@/components/monitoring-details/monitoring-graph-tab";
import { MonitoringTableTab } from "@/components/monitoring-details/monitoring-table-tab";
import { RssiBars } from "@/components/monitoring-card/rssi-bars";
import type { DateRangeValue, ZoomBounds } from "@/components/monitoring-details/types";
import { useMonitoringAuditLogs } from "@/components/monitoring-details/use-monitoring-audit-logs";
import { useMonitoringRangeMeasurements } from "@/components/monitoring-details/use-monitoring-range-measurements";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLieuMeasurementsPaged } from "@/hooks/useLieuMeasurementsPaged";
import { calculateYDomain, getMeasureSummary, sortMeasuresChronologically } from "@/lib/measurements";
import { MONITORING_DETAIL_GRAPH_MAX_POINTS } from "@/lib/measurement-downsampling";
import { formatNumber } from "@/lib/number-display";
import { cn } from "@/lib/utils";
import type { MeasureData } from "@/lib/measurements";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, ChartTooltip, Legend, Filler);

let isChartZoomPluginRegistered = false;

interface MonitoringDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  idLieu: number;
  nomLieu: string;
  sondeNumeroSerie: string;
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
  sondeNumeroSerie,
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
    if (!effectiveRange?.from) return t("filters.last24Hours");
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
  const isDialogLoading = rangeGraphLoading;
  const expandedHistoryLayout =
    detailsSize === "expanded" || activeTab === "graph" || activeTab === "table";
  const tabContentMaxHeight =
    detailsSize === "expanded"
      ? "calc(100vh - 18rem)"
      : "calc(100vh - 26rem)";
  const graphHeightClassName =
    detailsSize === "expanded"
      ? "relative h-[calc(100vh-20rem)] min-h-[72vh]"
      : "relative h-[calc(100vh-28rem)] min-h-[52vh]";

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
      <DialogContent className={cn(
        "max-h-[95vh] overflow-y-auto overflow-x-hidden transition-all duration-300 ease-out",
        expandedHistoryLayout
          ? "w-[98vw] max-w-[98vw] h-[96vh]"
          : "w-[min(94vw,1200px)] max-w-[1200px]",
      )}>
        <DialogHeader>
          <DialogTitle>{nomLieu}</DialogTitle>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{t("sensor", { serial: sondeNumeroSerie })}</p>
            {gsoRssi || gsoTension || batteryPercent !== null && batteryPercent !== undefined ? (
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                {gsoRssi ? (
                  <span className="inline-flex items-center gap-2">
                    <RssiBars value={gsoRssi} label={gsoRssiLabel ?? t("gso.rssi", { value: gsoRssi })} />
                    <span>{gsoRssiLabel ?? t("gso.rssi", { value: gsoRssi })}</span>
                  </span>
                ) : null}
                {batteryPercent !== null && batteryPercent !== undefined ? <span>{t("wireless.battery", { value: batteryPercent })}</span> : null}
                {gsoTension ? <span>{t("gso.tension", { value: gsoTension })}</span> : null}
              </div>
            ) : null}
          </div>
        </DialogHeader>

        {isDialogLoading ? (
          <div className="space-y-4 pt-4">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-100 w-full" />
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col gap-4">
            <div className="flex w-full flex-wrap items-center justify-between gap-3">
              <div className="w-full max-w-5xl flex-1 space-y-2">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
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
                    align="start"
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
                      {t("actions.last24Hours")}
                    </Button>
                  ) : null}
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDetailsSize((prev) => (prev === "expanded" ? "standard" : "expanded"))}
              >
                {detailsSize === "expanded" ? (
                  <Minimize2 className="mr-2 h-4 w-4" />
                ) : (
                  <Maximize2 className="mr-2 h-4 w-4" />
                )}
                {detailsSize === "expanded" ? t("actions.standard_size") : t("actions.expanded_size")}
              </Button>
            </div>

            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "graph" | "table" | "audit")} className="flex min-h-0 w-full flex-1 flex-col">
              <TabsList className="grid w-full grid-cols-3 bg-primary/10 text-primary">
                <TabsTrigger value="graph" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  {t("tabs.graph")}
                </TabsTrigger>
                <TabsTrigger value="table" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  {t("tabs.table")}
                </TabsTrigger>
                <TabsTrigger value="audit" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  {t("tabs.audit")}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="graph" className={cn("flex min-h-0 flex-1 flex-col", expandedHistoryLayout && "space-y-6") }>
                <MonitoringGraphTab
                  chartRef={chartRef}
                  orderedData={orderedData}
                  graphMeasureCount={graphSourceCount || orderedData.length}
                  displayedPointCount={orderedData.length}
                  isSampled={isGraphSampled}
                  isRangeSelected={hasExplicitRange}
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

              <TabsContent value="table" className="flex min-h-0 flex-1 flex-col">
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

              <TabsContent value="audit" className="flex min-h-0 flex-1 flex-col">
                <MonitoringAuditTab
                  logs={auditLogs}
                  isLoading={auditLoading}
                  error={auditError}
                  t={t}
                  maxHeight={tabContentMaxHeight}
                />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}