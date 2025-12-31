'use client';

import { useMemo, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Power, FileText, MapPin, Settings } from "lucide-react";
import { getTypeIcon } from "@/lib/lieu-types";
import type { LieuTypeValue } from "@/lib/lieu-types";
import MonitoringDetailsModal from "@/components/monitoring-details-modal";
import { getStatusTheme, type SensorStatus } from "@/lib/surveillance-status";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { useLieuMeasurements } from "@/hooks/useLieuMeasurements";
import { calculateYDomain, getMeasureSummary } from "@/lib/measurements";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface MonitoringCardProps {
  idLieu: number;
  nomLieu: string;
  sondeNumeroSerie?: string;
  lieuEtat?: string;
  lieuType?: LieuTypeValue;
  siteName?: string;
  groupName?: string;
  status?: SensorStatus;
  onSurveillanceToggle?: (idLieu: number, newState: boolean) => void;
}

export default function MonitoringCard({
  idLieu,
  nomLieu,
  sondeNumeroSerie,
  lieuEtat,
  lieuType,
  siteName,
  groupName,
  status = "ok",
  onSurveillanceToggle,
}: MonitoringCardProps) {
  const { data, isLoading } = useLieuMeasurements(idLieu);

  const summary = useMemo(() => getMeasureSummary(data), [data]);
  const { consigneSup, consigneInf, consigne, unite, frequence, lastMeasureText, lastDateTime } = summary;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSurveillanceActive, setIsSurveillanceActive] = useState(lieuEtat !== "I");
  const headerTheme = useMemo(
    () => getStatusTheme(status, isSurveillanceActive),
    [isSurveillanceActive, status],
  );

  const handleSurveillanceToggle = () => {
    setShowConfirmModal(true);
  };

  const confirmSurveillanceToggle = () => {
    const newState = !isSurveillanceActive;
    setIsSurveillanceActive(newState);
    setShowConfirmModal(false);
    if (onSurveillanceToggle) {
      onSurveillanceToggle(idLieu, newState);
    }
  };

  const HeaderIcon = headerTheme.Icon;

  const [yMin, yMax] = useMemo(
    () => calculateYDomain(data, { consigneSup, consigneInf, consigne }),
    [consigne, consigneInf, consigneSup, data],
  );

  return (
    <>
      <div className="relative w-full max-w-[300px] max-h-[300px] mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
        {/* Header avec site, groupe et lieu */}
        <div
          className={`px-3 py-2 ${headerTheme.headerBgClassName} border-b-2 ${headerTheme.headerBorderClassName}`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="text-white text-xs font-medium space-y-1 flex-1">
              {siteName && (
                <TooltipProvider>
                  <UITooltip>
                    <TooltipTrigger asChild>
                      <div className="cursor-help hover:opacity-80 transition-opacity truncate">
                        {siteName}
                      </div>
                    </TooltipTrigger>
                    {lieuEtat && (
                      <TooltipContent>
                        <p className="max-w-xs">{lieuEtat}</p>
                      </TooltipContent>
                    )}
                  </UITooltip>
                </TooltipProvider>
              )}
              {groupName && <div className="truncate">{groupName}</div>}
              <div className="font-semibold truncate flex items-center gap-1.5">
                {lieuType && getTypeIcon(lieuType, 'w-3.5 h-3.5').icon}
                {nomLieu}
              </div>
            </div>
            <div className="text-white flex-shrink-0 mt-0.5" title={headerTheme.label}>
              <HeaderIcon className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Card content */}
        <div className="p-4 max-h-[280px] flex flex-col">
        {/* Top icons - removed from here */}

        {/* Mini graph - clickable */}
        <div 
          className="cursor-pointer relative"
          onClick={() => setIsModalOpen(true)}
        >
          {isLoading ? (
            <div className="h-[130px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              <div className="h-[130px]">
                <Line
                  data={{
                    labels: data.map(d => d.DateHeureMesureXaxis),
                    datasets: [
                      {
                        label: `Mesures (${unite})`,
                        data: data.map(d => d.Valeur),
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        borderWidth: 2,
                        fill: false,
                        tension: 0.4,
                        pointRadius: 0,
                        pointHoverRadius: 4,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false,
                      },
                      tooltip: {
                        enabled: true,
                        mode: 'index',
                        intersect: false,
                      },
                    },
                    scales: {
                      x: {
                        display: false,
                      },
                      y: {
                        display: false,
                        min: yMin,
                        max: yMax,
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
              
              {/* Lignes de consigne superposées */}
              <div className="absolute inset-0 pointer-events-none">
                {consigneSup !== null && (
                  <div 
                    className="absolute w-full border-t-2 border-red-500 border-dashed"
                    style={{ 
                      top: `${((yMax - consigneSup) / (yMax - yMin)) * 100}%`,
                    }}
                  />
                )}
                {consigne !== null && (
                  <div 
                    className="absolute w-full border-t border-gray-900 dark:border-white"
                    style={{ 
                      top: `${((yMax - consigne) / (yMax - yMin)) * 100}%`,
                    }}
                  />
                )}
                {consigneInf !== null && (
                  <div 
                    className="absolute w-full border-t-2 border-red-500 border-dashed"
                    style={{ 
                      top: `${((yMax - consigneInf) / (yMax - yMin)) * 100}%`,
                    }}
                  />
                )}
              </div>
              
              {/* Labels pour les consignes sur la droite */}
              <div className="absolute right-0 top-0 bottom-0 flex flex-col justify-between py-2 pointer-events-none pr-1">
                {consigneSup !== null && (
                  <div 
                    className="text-[9px] font-medium text-red-600 dark:text-red-400 bg-white/90 dark:bg-gray-800/90 px-1 rounded shadow-sm whitespace-nowrap"
                    style={{ 
                      position: 'absolute',
                      top: `${((yMax - consigneSup) / (yMax - yMin)) * 100}%`,
                      transform: 'translateY(-50%)',
                      right: '4px'
                    }}
                  >
                    Max: {consigneSup}{unite}
                  </div>
                )}
                {consigne !== null && (
                  <div 
                    className="text-[9px] font-medium text-gray-900 dark:text-white bg-white/90 dark:bg-gray-800/90 px-1 rounded shadow-sm whitespace-nowrap"
                    style={{ 
                      position: 'absolute',
                      top: `${((yMax - consigne) / (yMax - yMin)) * 100}%`,
                      transform: 'translateY(-50%)',
                      right: '4px'
                    }}
                  >
                    {consigne}{unite}
                  </div>
                )}
                {consigneInf !== null && (
                  <div 
                    className="text-[9px] font-medium text-red-600 dark:text-red-400 bg-white/90 dark:bg-gray-800/90 px-1 rounded shadow-sm whitespace-nowrap"
                    style={{ 
                      position: 'absolute',
                      top: `${((yMax - consigneInf) / (yMax - yMin)) * 100}%`,
                      transform: 'translateY(-50%)',
                      right: '4px'
                    }}
                  >
                    Min: {consigneInf}{unite}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Last measure info and icons */}
        <div className="mt-auto space-y-3 text-sm border-t border-gray-200 dark:border-gray-700 pt-3">
          {lastDateTime ? (
            <>
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900 dark:text-white">{lastMeasureText}</div>
              </div>
              <div className="flex items-center justify-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                <span>Fréq: {frequence} min</span>
                <span>{lastDateTime}</span>
              </div>
              
              {/* Icons at bottom center */}
              <div className="flex justify-center gap-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsModalOpen(true);
                  }}
                  className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title="Détails des mesures"
                >
                  <FileText className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSurveillanceToggle();
                  }}
                  className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-red-600"
                  title={isSurveillanceActive ? "Désactiver la surveillance" : "Activer la surveillance"}
                >
                  <Power className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // TODO: Localisation
                  }}
                  className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title="Localisation"
                >
                  <MapPin className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // TODO: Paramétrage
                  }}
                  className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title="Paramétrage du lieu"
                >
                  <Settings className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </>
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400 italic py-3">
              Aucune mesure disponible
            </div>
          )}
        </div>
        </div>
      </div>

      {/* Confirmation modal for surveillance toggle */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmation</DialogTitle>
            <DialogDescription>
              Voulez-vous {isSurveillanceActive ? "désactiver" : "activer"} la surveillance de ce lieu ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowConfirmModal(false)}
            >
              Annuler
            </Button>
            <Button 
              variant={isSurveillanceActive ? "destructive" : "default"}
              onClick={confirmSurveillanceToggle}
            >
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details modal */}
      {isModalOpen && (
        <MonitoringDetailsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          idLieu={idLieu}
          nomLieu={nomLieu}
          sondeNumeroSerie={sondeNumeroSerie || ""}
          consigneSup={consigneSup}
          consigneInf={consigneInf}
          consigne={consigne}
          unite={unite}
        />
      )}
    </>
  );
}

// Import for details modal
