'use client';

import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
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
  measurements: initialMeasurements,
}: MonitoringDetailsModalProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const hasLocalMeasurements = Boolean(initialMeasurements?.length);
  const { data: fetchedData, isLoading } = useLieuMeasurements(idLieu, {
    enabled: isOpen && !hasLocalMeasurements,
  });
  const data = hasLocalMeasurements ? initialMeasurements ?? [] : fetchedData;

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

  useEffect(() => {
    if (!isOpen) return;

    const timeoutId = setTimeout(() => {
      setCurrentPage(1);
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [idLieu, isOpen]);

  const tableData = useMemo(() => {
    return orderedData.map((measure) => ({
      id: measure.id,
      dateIso: measure.DateHeureMesureIso ?? measure.DateHeureMesure,
      dateLabel: measure.DateHeureMesure,
      value: measure.Valeur,
      unit: unite,
    }));
  }, [orderedData, unite]);

  const columns: ColumnDef<{
    id: number | string;
    dateIso: string;
    dateLabel: string;
    value: number;
    unit: string;
  }>[] = [
    {
      accessorKey: "dateIso",
      header: "DATE/HEURE",
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
      header: "VALEUR",
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
      header: "CONSIGNE INF",
      cell: () => (
        <span>{consigneInf !== null ? `${consigneInf}${unite}` : "-"}</span>
      ),
    },
    {
      id: "consigneSup",
      header: "CONSIGNE SUP",
      cell: () => (
        <span>{consigneSup !== null ? `${consigneSup}${unite}` : "-"}</span>
      ),
    },
    {
      id: "statut",
      header: "STATUT",
      cell: ({ row }) => {
        const value = row.getValue("value") as number;
        const isOutOfRange =
          (consigneInf !== null && value < consigneInf) ||
          (consigneSup !== null && value > consigneSup);

        return isOutOfRange ? (
          <span className="text-red-600 dark:text-red-400 font-semibold">Hors limites</span>
        ) : (
          <span className="text-green-600 dark:text-green-400">OK</span>
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
            Sonde: {sondeNumeroSerie}
          </p>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4 pt-4">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-[400px] w-full" />
          </div>
        ) : (
          <Tabs defaultValue="graph" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="graph">Graphique</TabsTrigger>
              <TabsTrigger value="table">Tableau des mesures</TabsTrigger>
            </TabsList>

            {/* Graph Tab */}
            <TabsContent value="graph" className="space-y-4 pt-4">
              <div className="h-[500px]">
                <Line
                  data={{
                    labels: orderedData.map(d => d.DateHeureMesureXaxis),
                    datasets: [
                      {
                        label: `Mesures (${unite})`,
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
                            const lines = [`Valeur: ${measure.Valeur}${unite}`];
                            
                            if (measure.Etat_Alarme === 1) {
                              lines.push("En alarme");
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
              </div>
              
              {/* Lignes de consigne superposées avec annotations */}
              <div className="absolute left-16 right-8 top-[120px] bottom-[80px] pointer-events-none">
                {consigneSup !== null && (
                  <>
                    <div 
                      className="absolute w-full border-t-2 border-red-500 border-dashed"
                      style={{ 
                        top: `${((yMax - consigneSup) / (yMax - yMin)) * 100}%`,
                      }}
                    />
                    <div 
                      className="absolute right-4 text-xs font-medium text-red-600 dark:text-red-400 bg-white/95 dark:bg-gray-800/95 px-2 py-1 rounded shadow-md"
                      style={{ 
                        top: `${((yMax - consigneSup) / (yMax - yMin)) * 100}%`,
                        transform: 'translateY(-50%)',
                      }}
                    >
                      Max: {consigneSup}{unite}
                    </div>
                  </>
                )}
                {consigne !== null && (
                  <>
                    <div 
                      className="absolute w-full border-t-2 border-gray-900 dark:border-white"
                      style={{ 
                        top: `${((yMax - consigne) / (yMax - yMin)) * 100}%`,
                      }}
                    />
                    <div 
                      className="absolute right-4 text-xs font-medium text-gray-900 dark:text-white bg-white/95 dark:bg-gray-800/95 px-2 py-1 rounded shadow-md"
                      style={{ 
                        top: `${((yMax - consigne) / (yMax - yMin)) * 100}%`,
                        transform: 'translateY(-50%)',
                      }}
                    >
                      Consigne: {consigne}{unite}
                    </div>
                  </>
                )}
                {consigneInf !== null && (
                  <>
                    <div 
                      className="absolute w-full border-t-2 border-red-500 border-dashed"
                      style={{ 
                        top: `${((yMax - consigneInf) / (yMax - yMin)) * 100}%`,
                      }}
                    />
                    <div 
                      className="absolute right-4 text-xs font-medium text-red-600 dark:text-red-400 bg-white/95 dark:bg-gray-800/95 px-2 py-1 rounded shadow-md"
                      style={{ 
                        top: `${((yMax - consigneInf) / (yMax - yMin)) * 100}%`,
                        transform: 'translateY(-50%)',
                      }}
                    >
                      Min: {consigneInf}{unite}
                    </div>
                  </>
                )}
              </div>
            </TabsContent>

            {/* Table Tab */}
            <TabsContent value="table" className="space-y-4 pt-4">
              <TanStackTable
                columns={columns}
                data={tableData}
                showSearch={false}
                pageSize={20}
                emptyMessage="Aucune mesure"
                maxHeight="50vh"
              />
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
