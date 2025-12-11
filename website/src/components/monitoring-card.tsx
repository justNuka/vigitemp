'use client';

import { useState, useEffect } from "react";
import axios from "axios";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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

interface MeasureData {
  id: string;
  Valeur: number;
  Unite: string;
  DateHeureMesure: string;
  DateHeureMesureXaxis: string;
  Consigne: number | null;
  Consigne_Sup: number | null;
  Consigne_Inf: number | null;
  SondeNumeroSerie: string;
  Frequence: number;
  Etat_Alarme: number;
}

interface MonitoringCardProps {
  idLieu: number;
  nomLieu: string;
  sondeNumeroSerie?: string;
  lieuEtat?: string;
  onSurveillanceToggle?: (idLieu: number, newState: boolean) => void;
}

export default function MonitoringCard({
  idLieu,
  nomLieu,
  sondeNumeroSerie,
  lieuEtat,
  onSurveillanceToggle,
}: MonitoringCardProps) {
  const [data, setData] = useState<MeasureData[]>([]);
  const [loading, setLoading] = useState(true);
  const [consigneSup, setConsigneSup] = useState<number | null>(null);
  const [consigneInf, setConsigneInf] = useState<number | null>(null);
  const [consigne, setConsigne] = useState<number | null>(null);
  const [unite, setUnite] = useState("°C");
  const [frequence, setFrequence] = useState<number>(15);
  const [lastMeasure, setLastMeasure] = useState("");
  const [lastDateTime, setLastDateTime] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSurveillanceActive, setIsSurveillanceActive] = useState(lieuEtat !== "I");

  useEffect(() => {
    loadData();
  }, [idLieu]);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/mesures/${idLieu}`, {
        params: { rowNumber: 125 }
      });

      const measures = response.data as MeasureData[];
      setData(measures);

      if (measures.length > 0) {
        const first = measures[0];
        const last = measures[measures.length - 1];
        
        setConsigneSup(first.Consigne_Sup);
        setConsigneInf(first.Consigne_Inf);
        setConsigne(first.Consigne);
        setUnite(first.Unite || "°C");
        setFrequence(first.Frequence || 15);
        setLastMeasure(`${last.Valeur}${last.Unite}`);
        setLastDateTime(last.DateHeureMesure);
      }
    } catch (error) {
      console.error("Error loading measurements:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate Y-axis domain
  const calculateYDomain = () => {
    if (data.length === 0) return [0, 30];
    
    const values = data.map(d => d.Valeur);
    const min = Math.min(...values, consigneInf || 0, consigne || 0);
    const max = Math.max(...values, consigneSup || 30, consigne || 30);
    const padding = (max - min) * 0.1;
    
    return [Math.floor(min - padding), Math.ceil(max + padding)];
  };

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

  const [yMin, yMax] = calculateYDomain();

  return (
    <>
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow p-4">
        {/* Top icons */}
        <div className="absolute top-2 left-2 right-2 flex justify-between">
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
        </div>

        {/* Lieu name */}
        <h3 className="text-center font-semibold text-gray-900 dark:text-white mb-3 mt-6">
          {nomLieu}
        </h3>

        {/* Mini graph - clickable */}
        <div 
          className="cursor-pointer relative"
          onClick={() => setIsModalOpen(true)}
        >
          {loading ? (
            <div className="h-[150px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              <div className="h-[150px]">
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

        {/* Last measure info */}
        <div className="mt-3 mb-10 space-y-2 text-sm">
          {lastDateTime ? (
            <>
              <div className="text-center font-medium text-gray-900 dark:text-white">
                {lastDateTime}
              </div>
              <div className="flex justify-between items-center text-xs text-gray-600 dark:text-gray-400">
                <span>Fréq: {frequence} min</span>
                {sondeNumeroSerie && (
                  <span>N° {sondeNumeroSerie}</span>
                )}
              </div>
            </>
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400 italic">
              Aucune mesure disponible
            </div>
          )}
        </div>

        {/* Bottom icons */}
        <div className="absolute bottom-2 left-2 right-2 flex justify-between">
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
import MonitoringDetailsModal from '@/components/monitoring-details-modal';
