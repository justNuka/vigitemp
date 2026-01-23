import { useEffect, useMemo, useState } from "react";
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
} from "chart.js";
import { FileText, MapPin, Power, PowerOff, Settings } from "lucide-react";

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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLieuMeasurements } from "@/hooks/useLieuMeasurements";
import { calculateYDomain, getMeasureSummary } from "@/lib/measurements";

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
  lieuEtat: string;
  lieuType: LieuTypeValue;
  siteName: string;
  groupName: string;
  status: SensorStatus;
  alarmDisabled: boolean;
  alarmDisabledUntil: Date | string | null;
  alarmDelayMinutes: number | null;
  surveillanceDisabled: boolean;
  onSurveillanceToggle: (idLieu: number, newState: boolean, durationMinutes: number | null) => void;
}

export default function MonitoringCard({
  idLieu,
  nomLieu,
  sondeNumeroSerie = "",
  lieuEtat,
  lieuType,
  siteName,
  groupName,
  status = "ok",
  alarmDisabled,
  alarmDisabledUntil,
  alarmDelayMinutes,
  surveillanceDisabled,
  onSurveillanceToggle,
}: MonitoringCardProps) {
  const { data, isLoading, reload, meta } = useLieuMeasurements(idLieu, { includeMeta: true });

  const orderedData = useMemo(() => {
    if (!data.length) return data;
    return [...data].sort((a, b) => {
      const dateA = a.DateHeureMesureIso
        ? Date.parse(a.DateHeureMesureIso)
        : Date.parse(a.DateHeureMesure);
      const dateB = b.DateHeureMesureIso
        ? Date.parse(b.DateHeureMesureIso)
        : Date.parse(b.DateHeureMesure);
      return dateA - dateB;
    });
  }, [data]);

  const summary = useMemo(() => getMeasureSummary(orderedData), [orderedData]);
  const { consigneSup, consigneInf, consigne, unite, frequence, lastMeasureText, lastDateTime } = summary;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [disableDuration, setDisableDuration] = useState<string>("60");

  const [isSurveillanceActive, setIsSurveillanceActive] = useState(
    surveillanceDisabled !== undefined ? !surveillanceDisabled : lieuEtat !== "D"
  );

  useEffect(() => {
    if (surveillanceDisabled !== undefined) {
      setIsSurveillanceActive(!surveillanceDisabled);
      return;
    }
    if (lieuEtat !== undefined) {
      setIsSurveillanceActive(lieuEtat !== "D");
    }
  }, [lieuEtat, surveillanceDisabled]);

  useEffect(() => {
    if (!isModalOpen) return;
    reload(true);
  }, [isModalOpen, reload]);

  const headerTheme = useMemo(
    () => getStatusTheme(status, isSurveillanceActive),
    [isSurveillanceActive, status]
  );

  const headerBgClassName = headerTheme.headerBgClassName;
  const headerTextClassName = isSurveillanceActive ? headerTheme.headerTextClassName : "text-white";
  const headerStatusLabel = headerTheme.label;

  const handleSurveillanceToggle = () => {
    setShowConfirmModal(true);
  };

  const confirmSurveillanceToggle = () => {
    const newState = !isSurveillanceActive;
    const durationMinutes =
      newState === false
        ? disableDuration === "manual"
          ? null
          : Number(disableDuration)
        : null;
    setIsSurveillanceActive(newState);
    setShowConfirmModal(false);
    if (onSurveillanceToggle) {
      onSurveillanceToggle(idLieu, newState, durationMinutes);
    }
  };

  const HeaderIcon = headerTheme.Icon;
  const resolvedLieuType = lieuType ?? meta?.lieuType ?? null;
  const typeIconInfo = useMemo(
    () => (resolvedLieuType ? getTypeIcon(resolvedLieuType, "w-4 h-4") : null),
    [resolvedLieuType]
  );

  const [yMin, yMax] = useMemo(
    () => calculateYDomain(orderedData, { consigneSup, consigneInf, consigne }),
    [consigne, consigneInf, consigneSup, orderedData]
  );

  const alarmDisabledLabel = useMemo(() => {
    if (isSurveillanceActive) return null;
    if (!alarmDisabledUntil) return "Surveillance désactivée";
    const date = new Date(alarmDisabledUntil);
    if (Number.isNaN(date.getTime())) return "Surveillance désactivée";
    return `Surveillance désactivée jusqu'au ${date.toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  }, [alarmDisabledUntil, isSurveillanceActive]);

  const alarmBadgeClassName = isSurveillanceActive
    ? "bg-gray-500/20 text-gray-900 dark:text-gray-100"
    : "bg-white/20 text-white";

  const contentTextClassName = isSurveillanceActive
    ? "text-gray-600 dark:text-gray-400"
    : "text-white";

  const actionButtonClassName = isSurveillanceActive
    ? "hover:bg-gray-100 dark:hover:bg-gray-700"
    : "hover:bg-white/10";

  const actionIconClassName = isSurveillanceActive
    ? "text-gray-600 dark:text-gray-400"
    : "text-white";

  return (
    <>
      <div
        className={`relative w-full rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden ${
          isSurveillanceActive ? "bg-white dark:bg-gray-800" : "bg-slate-600 dark:bg-gray-800"
        }`}
      >
        <div
          className={`px-3 py-2 ${headerBgClassName} border-b-2 ${headerTheme.headerBorderClassName}`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className={`${headerTextClassName} text-xs font-medium space-y-1 flex-1`}>
              {(() => {
                const label =
                  lieuEtat === "S"
                    ? "En surveillance"
                    : lieuEtat === "D"
                      ? "Surveillance désactivée"
                      : lieuEtat || null
                const siteLabel = siteName || "Site inconnu"
                return (
                  <TooltipProvider>
                    <UITooltip>
                      <TooltipTrigger asChild>
                        <div className="cursor-help hover:opacity-80 transition-opacity truncate">
                          {siteLabel}
                        </div>
                      </TooltipTrigger>
                      {label ? (
                        <TooltipContent>
                          <p className="max-w-xs">{label}</p>
                        </TooltipContent>
                      ) : null}
                    </UITooltip>
                  </TooltipProvider>
                )
              })()}
              {groupName ? <div className="truncate">{groupName}</div> : null}
              <div className="text-base font-semibold truncate">{nomLieu}</div>
              {alarmDisabledLabel ? (
                <div className={`inline-flex items-center w-fit gap-1 rounded-full text-[10px] px-2 py-0.5 ${alarmBadgeClassName}`}>
                  <PowerOff className="h-3 w-3" />
                  <span>{alarmDisabledLabel}</span>
                </div>
              ) : null}
            </div>

            <TooltipProvider>
              <div className={`${headerTextClassName} shrink-0 mt-0.5 flex flex-col items-center gap-1.5`}>
                <UITooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <HeaderIcon className="w-4 h-4" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">{headerStatusLabel}</p>
                  </TooltipContent>
                </UITooltip>
                {typeIconInfo?.icon ? (
                  <UITooltip>
                    <TooltipTrigger asChild>
                      <span className={isSurveillanceActive ? "text-current" : "text-white"}>
                        {typeIconInfo.icon}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">{typeIconInfo.label}</p>
                    </TooltipContent>
                  </UITooltip>
                ) : null}
              </div>
            </TooltipProvider>
          </div>
        </div>

        <div className="p-4 flex flex-col">
          {isSurveillanceActive ? (
            <>
              <div
                className="cursor-pointer relative"
                onClick={() => setIsModalOpen(true)}
              >
                {isLoading ? (
                  <div className="h-32.5">
                    <Skeleton className="h-full w-full rounded-md" />
                  </div>
                ) : (
                  <>
                    <div className="h-32.5">
                      <Line
                        data={{
                          labels: orderedData.map((d) => d.DateHeureMesureXaxis),
                          datasets: [
                            {
                              label: `Mesures (${unite})`,
                              data: orderedData.map((d) => d.Valeur),
                              borderColor: "#3b82f6",
                              backgroundColor: "rgba(59, 130, 246, 0.1)",
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
                              mode: "index",
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
                            mode: "nearest",
                            axis: "x",
                            intersect: false,
                          },
                        }}
                      />
                    </div>

                    <div className="absolute inset-0 pointer-events-none">
                      {consigneSup !== null ? (
                        <div
                          className="absolute w-full border-t-2 border-red-500 border-dashed"
                          style={{
                            top: `${((yMax - consigneSup) / (yMax - yMin)) * 100}%`,
                          }}
                        />
                      ) : null}
                      {consigne !== null ? (
                        <div
                          className="absolute w-full border-t border-gray-900 dark:border-white"
                          style={{
                            top: `${((yMax - consigne) / (yMax - yMin)) * 100}%`,
                          }}
                        />
                      ) : null}
                      {consigneInf !== null ? (
                        <div
                          className="absolute w-full border-t-2 border-red-500 border-dashed"
                          style={{
                            top: `${((yMax - consigneInf) / (yMax - yMin)) * 100}%`,
                          }}
                        />
                      ) : null}
                    </div>

                    <div className="absolute right-0 top-0 bottom-0 flex flex-col justify-between py-2 pointer-events-none pr-1">
                      {consigneSup !== null ? (
                        <div
                          className="text-[9px] font-medium text-red-600 dark:text-red-400 bg-white/90 dark:bg-gray-800/90 px-1 rounded shadow-sm whitespace-nowrap"
                          style={{
                            position: "absolute",
                            top: `${((yMax - consigneSup) / (yMax - yMin)) * 100}%`,
                            transform: "translateY(-50%)",
                            right: "4px",
                          }}
                        >
                          Max: {consigneSup}
                          {unite}
                        </div>
                      ) : null}
                      {consigne !== null ? (
                        <div
                          className="text-[9px] font-medium text-gray-900 dark:text-white bg-white/90 dark:bg-gray-800/90 px-1 rounded shadow-sm whitespace-nowrap"
                          style={{
                            position: "absolute",
                            top: `${((yMax - consigne) / (yMax - yMin)) * 100}%`,
                            transform: "translateY(-50%)",
                            right: "4px",
                          }}
                        >
                          {consigne}
                          {unite}
                        </div>
                      ) : null}
                      {consigneInf !== null ? (
                        <div
                          className="text-[9px] font-medium text-red-600 dark:text-red-400 bg-white/90 dark:bg-gray-800/90 px-1 rounded shadow-sm whitespace-nowrap"
                          style={{
                            position: "absolute",
                            top: `${((yMax - consigneInf) / (yMax - yMin)) * 100}%`,
                            transform: "translateY(-50%)",
                            right: "4px",
                          }}
                        >
                          Min: {consigneInf}
                          {unite}
                        </div>
                      ) : null}
                    </div>
                  </>
                )}
              </div>

              <div className="mt-auto space-y-3 text-sm border-t border-gray-200 dark:border-gray-700 pt-3">
                {lastDateTime ? (
                  <>
                    <div className={`flex items-center justify-between text-[11px] ${contentTextClassName}`}>
                      <span>Dernière mesure : {lastMeasureText}</span>
                      <span>{lastDateTime}</span>
                    </div>
                    <div className={`flex items-center justify-center gap-4 text-[11px] ${contentTextClassName}`}>
                      <span>Fréq : {frequence} min</span>
                      {alarmDelayMinutes !== null && alarmDelayMinutes !== undefined ? (
                        <span>Retard alarme : {alarmDelayMinutes} min</span>
                      ) : null}
                    </div>
                  </>
                ) : (
                  <div className="text-center text-gray-500 dark:text-gray-400 italic py-3">
                    Aucune mesure disponible
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className={`text-sm font-medium ${contentTextClassName}`}>
              Surveillance désactivée
            </div>
          )}

          <div
            className={`mt-4 border-t border-gray-200 dark:border-gray-700 pt-3 ${
              isSurveillanceActive ? "" : "border-white/20"
            }`}
          >
            <TooltipProvider>
              <div className="flex justify-center gap-4">
                <UITooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsModalOpen(true);
                      }}
                      className={`p-1.5 rounded-md transition-colors ${actionButtonClassName}`}
                    >
                      <FileText className={`w-4 h-4 ${actionIconClassName}`} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Détails des mesures</p>
                  </TooltipContent>
                </UITooltip>

                <UITooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSurveillanceToggle();
                      }}
                      className={`p-1.5 rounded-md transition-colors ${actionButtonClassName} ${
                        isSurveillanceActive ? "text-red-600" : "text-white"
                      }`}
                    >
                      {isSurveillanceActive ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">
                      {isSurveillanceActive ? "Désactiver la surveillance" : "Activer la surveillance"}
                    </p>
                  </TooltipContent>
                </UITooltip>

                <UITooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      className={`p-1.5 rounded-md transition-colors ${actionButtonClassName}`}
                    >
                      <MapPin className={`w-4 h-4 ${actionIconClassName}`} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Localisation</p>
                  </TooltipContent>
                </UITooltip>

                <UITooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      className={`p-1.5 rounded-md transition-colors ${actionButtonClassName}`}
                    >
                      <Settings className={`w-4 h-4 ${actionIconClassName}`} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Modifier les paramètres du lieu</p>
                  </TooltipContent>
                </UITooltip>
              </div>
            </TooltipProvider>
          </div>
        </div>

        <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Confirmation</DialogTitle>
              <DialogDescription>
                Voulez-vous {isSurveillanceActive ? "désactiver" : "activer"} la surveillance de ce lieu ?
              </DialogDescription>
            </DialogHeader>

            {isSurveillanceActive ? (
              <div className="space-y-2">
                <label className="text-sm font-medium">Durée de désactivation</label>
                <Select value={disableDuration} onValueChange={setDisableDuration}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir une durée" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="60">1 heure</SelectItem>
                    <SelectItem value="240">4 heures</SelectItem>
                    <SelectItem value="720">12 heures</SelectItem>
                    <SelectItem value="manual">Illimitée (manuel)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ) : null}

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowConfirmModal(false)}>
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

        {isModalOpen ? (
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
            isSurveillanceActive={isSurveillanceActive}
            measurements={isSurveillanceActive ? orderedData : []}
          />
        ) : null}
      </div>
    </>
  );
}
