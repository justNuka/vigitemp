'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
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

interface MonitoringDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  idLieu: number;
  nomLieu: string;
  sondeNumeroSerie: string;
  consigneSup: number | null;
  consigneInf: number | null;
  consigne: number | null;
  unite: string;
  isSurveillanceActive: boolean;
  measurements?: MeasureData[];
}

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
}: MonitoringDetailsModalProps) {
  const locale = useLocale();
  const localeTag = locale === "fr" ? "fr-FR" : locale;
  const t = useTranslations("monitoringDetailsModal");
  const [dateRange, setDateRange] = useState<{ from: Date; to?: Date } | null>(null);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 });
  const chartRef = useRef<ChartJS<"line"> | null>(null);
  const [guidePositions, setGuidePositions] = useState<{
    sup: number | null;
    inf: number | null;
    consigne: number | null;
  }>({ sup: null, inf: null, consigne: null });

  const hasLocalMeasurements = Boolean(initialMeasurements?.length);
  const shouldLoadBase = isOpen && isSurveillanceActive && !hasLocalMeasurements;
  const { data: fetchedData, isLoading } = useLieuMeasurements(idLieu, {
    enabled: shouldLoadBase,
  });
  const baseLoading = shouldLoadBase && isLoading;
  const data = hasLocalMeasurements ? initialMeasurements ?? [] : fetchedData ?? [];

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

  const {
    data: historyData,
    isLoading: isHistoryLoading,
    totalRows,
    pageCount,
  } = useLieuMeasurementsPaged(idLieu, {
    enabled: isOpen && !baseLoading,
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

  const [yMin, yMax] = useMemo(
    () => calculateYDomain(orderedData, { consigneSup, consigneInf, consigne }),
    [consigne, consigneInf, consigneSup, orderedData],
  );

  const updateGuidePositions = useCallback(() => {
    const chart = chartRef.current;
    const yScale = chart?.scales?.y;
    if (!yScale) return;

    const toPos = (value: number | null) =>
      value === null ? null : yScale.getPixelForValue(value);

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto overflow-x-hidden">
        <DialogHeader>
          <DialogTitle>{nomLieu}</DialogTitle>
          <p className="text-sm text-muted-foreground">
            {t("probe", { serial: sondeNumeroSerie })}
          </p>
        </DialogHeader>

        {isSurveillanceActive && baseLoading ? (
          <div className="space-y-4 pt-4">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-100 w-full" />
          </div>
        ) : isSurveillanceActive ? (
          <Tabs defaultValue="graph" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-primary/10 text-primary">
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
                              fill: "start",
                              backgroundColor: "rgba(30, 64, 175, 0.2)",
                              order: 0,
                            },
                          ]
                        : []),
                      {
                        label: t("chart.measures", { unit: unite }),
                        data: orderedData.map(d => d.Valeur),
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.2)',
                        borderWidth: 2,
                        fill: false,
                        tension: 0.4,
                        pointRadius: 1,
                        pointHoverRadius: 6,
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
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        titleFont: {
                          size: 13,
                          weight: 'bold',
                        },
                        bodyFont: {
                          size: 12,
                        },
                        callbacks: {
                          title: (context) => {
                            const index = context[0].dataIndex;
                            return orderedData[index]?.DateHeureMesure || '';
                          },
                          label: (context) => {
                            const index = context.dataIndex;
                            const measure = orderedData[index];
                            const lines = [t("tooltip.value", { value: measure.Valeur, unit: unite })];
                            
                            if (measure.Etat_Alarme === 1) {
                              lines.push(t("tooltip.in_alarm"));
                            }
                            
                            return lines;
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

                {/* Lignes de consigne superposees avec annotations (alignement via scale) */}
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
              <TanStackTable
                columns={columns}
                data={tableData}
                showSearch={false}
                pageSize={pagination.pageSize}
                emptyMessage={t("table.empty")}
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
          </Tabs>
        ) : (
          <div className="space-y-4 pt-4 h-140">
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
            <TanStackTable
              columns={columns}
              data={tableData}
              showSearch={false}
              pageSize={pagination.pageSize}
              emptyMessage={
                rangeEnabled
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
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
