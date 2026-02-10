'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Skeleton } from "@/components/ui/skeleton";
import { TanStackTable } from "@/components/data-table/tanstack-table";
import type { ColumnDef } from "@tanstack/react-table";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler,
} from 'chart.js';
import { useLieuMeasurements } from "@/hooks/useLieuMeasurements";
import { useLieuMeasurementsPaged } from "@/hooks/useLieuMeasurementsPaged";
import { calculateYDomain, getMeasureSummary } from "@/lib/measurements";
import type { MeasureData } from "@/lib/measurements";
import { fetchJson } from "@/lib/http";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend,
  Filler
);

type DateRangeValue = { from: Date; to?: Date };

interface MonitoringDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  idLieu: number;
  nomLieu: string;
  sondeNumeroSerie: string;
  isGso?: boolean | null;
  gsoRssi?: string | null;
  gsoTension?: string | null;
  consigneSup: number | null;
  consigneInf: number | null;
  consigne: number | null;
  unite: string;
  isSurveillanceActive: boolean;
  measurements?: MeasureData[];
  initialRange?: DateRangeValue;
}

type AuditLog = {
  id: number;
  timestamp: string | null;
  code: string;
  label: string;
  commentaire: string | null;
  commentaireUtilisateur: string | null;
  user: string | null;
  profile: string | null;
  lieuId: number;
};

export default function MonitoringDetailsModal({
  isOpen,
  onClose,
  idLieu,
  nomLieu,
  sondeNumeroSerie,
  consigneSup: initialConsigneSup,
  consigneInf: initialConsigneInf,
  consigne: initialConsigne,
  unite: initialUnite,
  isSurveillanceActive,
  measurements: initialMeasurements,
  initialRange,
}: MonitoringDetailsModalProps) {
  const locale = useLocale();
  const localeTag = locale === "fr" ? "fr-FR" : locale;
  const t = useTranslations("monitoringDetailsModal");
  const [dateRange, setDateRange] = useState<DateRangeValue | null>(initialRange ?? null);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 });
  const chartRef = useRef<ChartJS<"line"> | null>(null);
  const [guidePositions, setGuidePositions] = useState<{
    sup: number | null;
    inf: number | null;
    consigne: number | null;
  }>({ sup: null, inf: null, consigne: null });
  const [activeTab, setActiveTab] = useState<"graph" | "table" | "audit">("graph");
  const [rangeGraphData, setRangeGraphData] = useState<MeasureData[]>([]);
  const [rangeGraphLoading, setRangeGraphLoading] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditError, setAuditError] = useState<string | null>(null);
  const [auditLoaded, setAuditLoaded] = useState(false);

  useEffect(() => {
    if (initialRange) {
      setDateRange(initialRange);
    }
  }, [initialRange]);

  const effectiveRange = useMemo(() => {
    if (!dateRange?.from) return null;
    return {
      from: dateRange.from,
      to: dateRange.to ?? dateRange.from,
    };
  }, [dateRange]);
  const rangeEnabled = Boolean(effectiveRange?.from && effectiveRange?.to);
  const rangeStart = useMemo(() => {
    if (!effectiveRange?.from) return null;
    return new Date(effectiveRange.from);
  }, [effectiveRange]);
  const rangeEnd = useMemo(() => {
    if (!effectiveRange?.to) return null;
    const end = new Date(effectiveRange.to);
    end.setHours(23, 59, 59, 999);
    return end;
  }, [effectiveRange]);

  useEffect(() => {
    if (!isOpen) return;
    if (!rangeEnabled || !rangeStart || !rangeEnd) {
      setRangeGraphData([]);
      setRangeGraphLoading(false);
      return;
    }

    let isActive = true;
    const controller = new AbortController();

    const loadAllMeasures = async () => {
      setRangeGraphLoading(true);
      try {
        const all: MeasureData[] = [];
        const pageSize = 500;
        let page = 1;
        let total = 0;

        do {
          const params = new URLSearchParams({
            page: String(page),
            pageSize: String(pageSize),
            source: "mesures",
            startDate: rangeStart.toISOString(),
            endDate: rangeEnd.toISOString(),
          });

          const payload = await fetchJson<{
            measurements: MeasureData[];
            total: number;
            page: number;
            pageSize: number;
          }>(`/api/mesures/${idLieu}?${params}`, { signal: controller.signal });

          if (!isActive) return;

          if (Array.isArray(payload?.measurements)) {
            all.push(...payload.measurements);
          }

          total = payload?.total ?? all.length;
          page += 1;
        } while (all.length < total);

        const ordered = all.sort((a, b) => {
          const dateA = a.DateHeureMesureIso
            ? Date.parse(a.DateHeureMesureIso)
            : Date.parse(a.DateHeureMesure);
          const dateB = b.DateHeureMesureIso
            ? Date.parse(b.DateHeureMesureIso)
            : Date.parse(b.DateHeureMesure);
          return dateA - dateB;
        });

        if (!isActive) return;
        setRangeGraphData(ordered);
      } catch (error) {
        if ((error as Error)?.name === "AbortError") return;
        console.error("Erreur chargement mesures (range):", error);
        if (!isActive) return;
        setRangeGraphData([]);
      } finally {
        if (isActive) setRangeGraphLoading(false);
      }
    };

    void loadAllMeasures();
    return () => {
      isActive = false;
      controller.abort();
    };
  }, [idLieu, isOpen, rangeEnabled, rangeEnd, rangeStart]);

  const hasLocalMeasurements = Boolean(initialMeasurements?.length);
  const shouldLoadBase = isOpen && isSurveillanceActive && !hasLocalMeasurements;
  const { data: fetchedData, isLoading } = useLieuMeasurements(idLieu, {
    enabled: shouldLoadBase,
  });
  const baseLoading = isSurveillanceActive && shouldLoadBase && isLoading;
  const baseData = isSurveillanceActive
    ? hasLocalMeasurements
      ? initialMeasurements ?? []
      : fetchedData ?? []
    : rangeGraphData;
  const data = rangeEnabled ? rangeGraphData : baseData;

  const {
    data: historyData,
    isLoading: isHistoryLoading,
    totalRows,
    pageCount,
  } = useLieuMeasurementsPaged(idLieu, {
    enabled: isOpen && !baseLoading && (isSurveillanceActive || rangeEnabled),
    pageIndex: pagination.pageIndex,
    pageSize: pagination.pageSize,
    startDate: rangeEnabled ? rangeStart : null,
    endDate: rangeEnabled ? rangeEnd : null,
  });
  const rangeLoading = isHistoryLoading;

  const orderedData = useMemo(() => {
    if (!data.length) return data;
    return [...data].sort((a, b) => {
      const dateA = a.DateHeureMesureIso ? Date.parse(a.DateHeureMesureIso) : Date.parse(a.DateHeureMesure);
      const dateB = b.DateHeureMesureIso ? Date.parse(b.DateHeureMesureIso) : Date.parse(b.DateHeureMesure);
      return dateA - dateB;
    });
  }, [data]);

  const summary = useMemo(
    () =>
      getMeasureSummary(orderedData, {
        consigneSup: initialConsigneSup,
        consigneInf: initialConsigneInf,
        consigne: initialConsigne,
        unite: initialUnite,
      }),
    [orderedData, initialConsigneInf, initialConsigne, initialConsigneSup, initialUnite],
  );

  const { consigneSup, consigneInf, consigne, unite } = summary;
  const measuresLabel = useMemo(
    () => t("chart.measures", { unit: unite }),
    [t, unite],
  );

  const [yMin, yMax] = useMemo(
    () => calculateYDomain(orderedData, { consigneSup, consigneInf, consigne }),
    [consigne, consigneInf, consigneSup, orderedData],
  );

  const updateGuidePositions = useCallback(() => {
    const chart = chartRef.current;
    const yScale = chart?.scales?.y;
    if (!yScale) return;
    const chartArea = chart.chartArea;
    const clamp = (value: number) => {
      if (!chartArea) return value;
      return Math.max(chartArea.top, Math.min(chartArea.bottom, value));
    };

    const toPos = (value: number | null) =>
      value === null ? null : clamp(yScale.getPixelForValue(value));

    setGuidePositions({
      sup: toPos(consigneSup),
      inf: toPos(consigneInf),
      consigne: toPos(consigne),
    });
  }, [consigne, consigneInf, consigneSup]);

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
  }, [idLieu, isOpen, rangeEnabled]);

  useEffect(() => {
    if (!isOpen) return;
    setActiveTab("graph");
    setAuditLogs([]);
    setAuditError(null);
    setAuditLoaded(false);
  }, [idLieu, isOpen, isSurveillanceActive]);

  useEffect(() => {
    if (!isOpen) return;
    setAuditLogs([]);
    setAuditError(null);
    setAuditLoaded(false);
  }, [isOpen, isSurveillanceActive, rangeEnabled, rangeStart, rangeEnd]);

  useEffect(() => {
    if (!isOpen || activeTab !== "audit" || auditLoaded) return;
    if (!isSurveillanceActive && !rangeEnabled) return;

    const controller = new AbortController();
    const loadAudit = async () => {
      try {
        setAuditLoading(true);
        setAuditError(null);

        const response = await fetch(`/api/lieux/${idLieu}/audit?limit=200`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(t("audit.error"));
        }

        const payload = await response.json();
        if (!payload?.ok) {
          throw new Error(payload?.message || t("audit.error"));
        }

        const nextLogs = Array.isArray(payload?.data?.logs) ? (payload.data.logs as AuditLog[]) : [];
        setAuditLogs(nextLogs);
        setAuditLoaded(true);
      } catch (error) {
        if ((error as Error)?.name === "AbortError") return;
        setAuditError(t("audit.error"));
      } finally {
        setAuditLoading(false);
      }
    };

    void loadAudit();
    return () => controller.abort();
  }, [activeTab, auditLoaded, idLieu, isOpen, t]);

  const orderedHistoryData = useMemo(() => {
    if (!historyData.length) return historyData;
    return [...historyData].sort((a, b) => {
      const dateA = a.DateHeureMesureIso ? Date.parse(a.DateHeureMesureIso) : Date.parse(a.DateHeureMesure);
      const dateB = b.DateHeureMesureIso ? Date.parse(b.DateHeureMesureIso) : Date.parse(b.DateHeureMesure);
      return dateA - dateB;
    });
  }, [historyData]);
  const tableMeasurements = orderedHistoryData;

  const tableData = useMemo(() => {
    return tableMeasurements.map((measure) => ({
      id: measure.id,
      dateIso: measure.DateHeureMesureIso ?? measure.DateHeureMesure,
      dateLabel: measure.DateHeureMesure,
      value: measure.Valeur,
      unit: unite,
    }));
  }, [tableMeasurements, unite]);

  const columns: ColumnDef<{
    id: number | string;
    dateIso: string;
    dateLabel: string;
    value: number;
    unit: string;
  }>[] = [
    {
      accessorKey: "dateIso",
      header: t("table.columns.date_time"),
      sortingFn: (rowA, rowB, columnId) => {
        const a = Date.parse(rowA.getValue(columnId) as string);
        const b = Date.parse(rowB.getValue(columnId) as string);
        return a - b;
      },
      cell: ({ row }) => (
        <span className="font-medium">{row.original.dateLabel}</span>
      ),
    },
    {
      accessorKey: "value",
      header: t("table.columns.value"),
      cell: ({ row }) => {
        const value = row.getValue("value") as number;
        const isOutOfRange =
          (consigneInf !== null && value < consigneInf) ||
          (consigneSup !== null && value > consigneSup);

        return (
          <span className={isOutOfRange ? "text-red-600 dark:text-red-400 font-bold" : ""}>
            {value}{row.original.unit}
          </span>
        );
      },
    },
    {
      id: "consigneInf",
      header: t("table.columns.lower_threshold"),
      cell: () => (
        <span>{consigneInf !== null ? `${consigneInf}${unite}` : "-"}</span>
      ),
    },
    {
      id: "consigneSup",
      header: t("table.columns.upper_threshold"),
      cell: () => (
        <span>{consigneSup !== null ? `${consigneSup}${unite}` : "-"}</span>
      ),
    },
    {
      id: "statut",
      header: t("table.columns.status"),
      cell: ({ row }) => {
        const value = row.getValue("value") as number;
        const isOutOfRange =
          (consigneInf !== null && value < consigneInf) ||
          (consigneSup !== null && value > consigneSup);

        return isOutOfRange ? (
          <span className="text-red-600 dark:text-red-400 font-semibold">{t("table.status.out_of_range")}</span>
        ) : (
          <span className="text-green-600 dark:text-green-400">{t("table.status.ok")}</span>
        );
      },
    },
  ];

  type AuditRow = {
    id: number | string;
    code: string;
    label: string;
    dateIso: string;
    dateLabel: string;
    user: string;
    details: string;
  };

  const auditTableData = useMemo<AuditRow[]>(() => {
    return auditLogs.map((log) => {
      const dateIso = log.timestamp ?? "";
      const dateLabel = log.timestamp
        ? format(new Date(log.timestamp), "dd/MM/yyyy HH:mm:ss", { locale: fr })
        : "-";

      return {
        id: log.id,
        code: log.code || "-",
        label: log.label || "-",
        dateIso,
        dateLabel,
        user: log.user || "-",
        details: log.commentaireUtilisateur || log.commentaire || "-",
      };
    });
  }, [auditLogs]);

  const auditColumns: ColumnDef<AuditRow>[] = [
    {
      accessorKey: "code",
      header: t("audit.columns.code"),
      cell: ({ row }) => <span className="font-medium">{row.original.code}</span>,
    },
    {
      accessorKey: "label",
      header: t("audit.columns.label"),
      cell: ({ row }) => <span>{row.original.label}</span>,
    },
    {
      accessorKey: "dateIso",
      header: t("audit.columns.date_time"),
      sortingFn: (rowA, rowB, columnId) => {
        const a = Date.parse(rowA.getValue(columnId) as string);
        const b = Date.parse(rowB.getValue(columnId) as string);
        return a - b;
      },
      cell: ({ row }) => <span>{row.original.dateLabel}</span>,
    },
    {
      accessorKey: "user",
      header: t("audit.columns.user"),
      cell: ({ row }) => <span>{row.original.user}</span>,
    },
    {
      accessorKey: "details",
      header: t("audit.columns.details"),
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.details}</span>,
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto overflow-x-hidden">
        <DialogHeader>
          <DialogTitle>{nomLieu}</DialogTitle>
          <p className="text-sm text-muted-foreground">
            {t("sensor", { serial: sondeNumeroSerie })}
          </p>
        </DialogHeader>

        {(rangeEnabled ? rangeGraphLoading : baseLoading) ? (
          <div className="space-y-4 pt-4">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-100 w-full" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-full">
              <DateRangePicker
                allowEmpty
                onUpdate={({ range }) => {
                  if (!range.from) {
                    setDateRange(null)
                    return
                  }
                  setDateRange({ from: range.from, to: range.to ?? range.from })
                }}
                align="start"
                locale={localeTag}
                showCompare={false}
              />
            </div>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "graph" | "table" | "audit")} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-primary/10 text-primary">
              <TabsTrigger
                value="graph"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {t("tabs.graph")}
              </TabsTrigger>
              <TabsTrigger
                value="table"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {t("tabs.table")}
              </TabsTrigger>
              <TabsTrigger
                value="audit"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {t("tabs.audit")}
              </TabsTrigger>
            </TabsList>

            {/* Graph Tab */}
            <TabsContent value="graph" className="space-y-4 pt-4 h-140">
              <div className="relative h-125">
                <Line
                  ref={chartRef}
                  data={{
                    labels: orderedData.map(d => d.DateHeureMesureXaxis),
                    datasets: [
                      ...(consigneSup !== null
                        ? [
                            {
                              label: t("chart.over_high"),
                              data: orderedData.map(() => consigneSup),
                              borderColor: "transparent",
                              borderWidth: 0,
                              pointRadius: 0,
                              pointHoverRadius: 0,
                              pointHitRadius: 0,
                              hoverBorderWidth: 0,
                              fill: "end",
                              backgroundColor: "rgba(220, 38, 38, 0.2)",
                              order: 0,
                            },
                          ]
                        : []),
                      ...(consigneInf !== null
                        ? [
                            {
                              label: t("chart.over_low"),
                              data: orderedData.map(() => consigneInf),
                              borderColor: "transparent",
                              borderWidth: 0,
                              pointRadius: 0,
                              pointHoverRadius: 0,
                              pointHitRadius: 0,
                              hoverBorderWidth: 0,
                              fill: "start",
                              backgroundColor: "rgba(30, 64, 175, 0.2)",
                              order: 0,
                            },
                          ]
                        : []),
                      {
                        label: measuresLabel,
                        data: orderedData.map(d => d.Valeur),
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.2)',
                        borderWidth: 2,
                        fill: false,
                        tension: 0.4,
                        pointRadius: 1,
                        pointHoverRadius: 6,
        pointHitRadius: 12,
        pointStyle: "circle",
        hoverBorderWidth: 2,
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        order: 1,
      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: true,
                        position: 'top',
                        labels: {
                          usePointStyle: true,
                          padding: 20,
                          font: {
                            size: 12,
                          },
                          filter: (legendItem) =>
                            ![t("chart.over_high"), t("chart.over_low")].includes(
                              legendItem.text ?? "",
                            ),
                        },
                      },
                      tooltip: {
                        enabled: true,
                        mode: 'nearest',
                        intersect: false,
                        position: 'nearest',
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        titleFont: {
                          size: 13,
                          weight: 'bold',
                        },
                        bodyFont: {
                          size: 12,
                        },
                        itemSort: (a, b) => {
                          const aIsMeasure = a.dataset.label === measuresLabel;
                          const bIsMeasure = b.dataset.label === measuresLabel;
                          if (aIsMeasure && !bIsMeasure) return -1;
                          if (!aIsMeasure && bIsMeasure) return 1;
                          return 0;
                        },
                        filter: (context) => context.dataset.label === measuresLabel,
                        callbacks: {
                          title: (context) => {
                            const index = context[0].dataIndex;
                            return orderedData[index]?.DateHeureMesure || '';
                          },
                          label: (context) => {
                            const index = context.dataIndex;
                            const measure = orderedData[index];
                            return t("tooltip.value", { value: measure.Valeur, unit: unite });
                          },
                        },
                      },
                    },
                    scales: {
                      x: {
                        display: true,
                        grid: {
                          display: true,
                          color: 'rgba(0, 0, 0, 0.05)',
                        },
                        ticks: {
                          maxTicksLimit: 10,
                          font: {
                            size: 11,
                          },
                        },
                      },
                      y: {
                        display: true,
                        min: yMin,
                        max: yMax,
                        grid: {
                          display: true,
                          color: 'rgba(0, 0, 0, 0.1)',
                        },
                        ticks: {
                          font: {
                            size: 11,
                          },
                          callback: (value) => `${value}${unite}`,
                        },
                        title: {
                          display: true,
                          text: unite,
                          font: {
                            size: 12,
                            weight: 'bold',
                          },
                        },
                      },
                    },
                    interaction: {
                      mode: 'nearest',
                      axis: 'x',
                      intersect: false,
                    },
                  }}
                />

                {/* Lignes de consigne superposÃ©es + labels */}
                <div className="absolute inset-0 pointer-events-none">
                  {consigneSup !== null && guidePositions.sup !== null && (
                    <>
                      <div
                        className="absolute w-full border-t-2 border-red-500 border-dashed"
                        style={{
                          top: `${guidePositions.sup}px`,
                        }}
                      />
                      <div
                        className="absolute right-4 text-xs font-medium text-red-600 dark:text-red-400 bg-white/95 dark:bg-gray-800/95 px-2 py-1 rounded shadow-md"
                        style={{
                          top: `${guidePositions.sup}px`,
                          transform: 'translateY(-50%)',
                        }}
                      >
                        {t("guides.max", { value: consigneSup, unit: unite })}
                      </div>
                    </>
                  )}
                  {consigne !== null && guidePositions.consigne !== null && (
                    <>
                      <div
                        className="absolute w-full border-t-2 border-gray-900 dark:border-white"
                        style={{
                          top: `${guidePositions.consigne}px`,
                        }}
                      />
                      <div
                        className="absolute right-4 text-xs font-medium text-gray-900 dark:text-white bg-white/95 dark:bg-gray-800/95 px-2 py-1 rounded shadow-md"
                        style={{
                          top: `${guidePositions.consigne}px`,
                          transform: 'translateY(-50%)',
                        }}
                      >
                        {t("guides.target", { value: consigne, unit: unite })}
                      </div>
                    </>
                  )}
                  {consigneInf !== null && guidePositions.inf !== null && (
                    <>
                      <div
                        className="absolute w-full border-t-2 border-red-500 border-dashed"
                        style={{
                          top: `${guidePositions.inf}px`,
                        }}
                      />
                      <div
                        className="absolute right-4 text-xs font-medium text-red-600 dark:text-red-400 bg-white/95 dark:bg-gray-800/95 px-2 py-1 rounded shadow-md"
                        style={{
                          top: `${guidePositions.inf}px`,
                          transform: 'translateY(-50%)',
                        }}
                      >
                        {t("guides.min", { value: consigneInf, unit: unite })}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Table Tab */}
            <TabsContent value="table" className="space-y-4 pt-4 h-140">
              <TanStackTable
                columns={columns}
                data={tableData}
                showSearch={false}
                pageSize={pagination.pageSize}
                emptyMessage={
                  isSurveillanceActive
                    ? t("table.empty")
                    : rangeEnabled
                      ? t("table.empty")
                      : t("table.empty_with_range")
                }
                isLoading={rangeLoading}
                manualPagination
                pageCount={pageCount}
                totalRows={totalRows}
                paginationState={pagination}
                onPaginationChange={setPagination}
                headerClassName="!bg-sidebar !text-sidebar-foreground"
                headerCellClassName="!bg-sidebar !text-sidebar-foreground !border-r !border-white/25 hover:!bg-sidebar-accent/80"
                tableClassName="border-separate border-spacing-0 [&_thead_th]:!border-r [&_thead_th]:!border-white/25 [&_tbody_td]:!border-b [&_tbody_td]:!border-border"
              />
            </TabsContent>

            {/* Audit Tab */}
            <TabsContent value="audit" className="space-y-4 pt-4 h-140">
              {auditError ? (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                  {auditError}
                </div>
              ) : (
                <TanStackTable
                  columns={auditColumns}
                  data={auditTableData}
                  searchField={['code', 'label', 'user', 'details']}
                  searchPlaceholder={t("audit.search_placeholder")}
                  pageSize={20}
                  emptyMessage={t("audit.empty")}
                  isLoading={auditLoading}
                  headerClassName="!bg-sidebar !text-sidebar-foreground"
                  headerCellClassName="!bg-sidebar !text-sidebar-foreground !border-r !border-white/25 hover:!bg-sidebar-accent/80"
                  tableClassName="border-separate border-spacing-0 [&_thead_th]:!border-r [&_thead_th]:!border-white/25 [&_tbody_td]:!border-b [&_tbody_td]:!border-border"
                />
              )}
            </TabsContent>
          </Tabs>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}




