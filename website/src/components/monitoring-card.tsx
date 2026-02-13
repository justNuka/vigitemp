import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
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
import { calculateYDomain, formatMeasureValue, getMeasureSummary } from "@/lib/measurements";
import { formatDbDateTime } from "@/lib/date-display";
import { AlarmAcknowledgeDialog, type AcknowledgeDialogAlarm } from "@/components/alarm-acknowledge-dialog";
import { useQueryClient } from "@tanstack/react-query";

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

const parseRssiValue = (value?: string | null) => {
  if (!value) return null;
  const match = value.match(/-?\d+/);
  if (!match) return null;
  const num = Number(match[0]);
  return Number.isFinite(num) ? num : null;
};

const getRssiLevel = (dbm: number | null) => {
  if (dbm === null) return 0;
  if (dbm >= -60) return 5;
  if (dbm >= -70) return 4;
  if (dbm >= -80) return 3;
  if (dbm >= -90) return 2;
  return 1;
};
interface MonitoringCardProps {
  idLieu: number;
  nomLieu: string;
  sondeNumeroSerie?: string;
  lieuEtat: string;
  lieuType: LieuTypeValue;
  siteName: string;
  groupName: string;
  status: SensorStatus;
  alarmType?: "H" | "B" | "N" | "T" | null;
  alarmDisabled: boolean;
  alarmDisabledUntil: Date | string | null;
  alarmDelayMinutes: number | null;
  alarmDelayHighMinutes?: number | null;
  alarmDelayLowMinutes?: number | null;
  noResponseDelayMinutes?: number | null;
  locationComment?: string | null;
  surveillanceDisabled: boolean;
  isGso?: boolean | null;
  gsoRssi?: string | null;
  gsoTension?: string | null;
  alarmId?: number | null;
  onEditLocation?: (idLieu: number) => void;
  onSurveillanceToggle: (
    idLieu: number,
    action: "surveillance" | "alarms",
    newState: boolean,
    durationMinutes: number | null,
  ) => void;
}

function RssiBars({ value, label }: { value?: string | null; label: string }) {
  const dbm = parseRssiValue(value ?? null);
  const level = getRssiLevel(dbm);
  const levelClass =
    level >= 4
      ? "bg-emerald-500"
      : level === 3
        ? "bg-yellow-500"
        : level === 2
          ? "bg-orange-500"
          : "bg-red-500";

  return (
    <UITooltip>
      <TooltipTrigger asChild>
        <div className="inline-flex items-end gap-0.5 cursor-help" aria-label={label}>
          {Array.from({ length: 5 }).map((_, index) => {
            const isActive = index < level;
            const height = 4 + index * 3;
            return (
              <span
                key={index}
                className={`w-1 rounded-sm transition-colors ${
                  isActive ? levelClass : "bg-slate-400/80 dark:bg-slate-500/80"
                }`}
                style={{ height }}
              />
            );
          })}
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p className="text-xs">{label}</p>
      </TooltipContent>
    </UITooltip>
  );
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
  alarmType = null,
  alarmDisabled,
  alarmDisabledUntil,
  alarmDelayMinutes,
  alarmDelayHighMinutes,
  alarmDelayLowMinutes,
  noResponseDelayMinutes,
  locationComment,
  surveillanceDisabled,
  isGso,
  gsoRssi,
  gsoTension,
  alarmId = null,
  onEditLocation,
  onSurveillanceToggle,
}: MonitoringCardProps) {
  const t = useTranslations("monitoringCard");
  const tStatus = useTranslations("surveillanceStatus");
  const locale = useLocale();
  const localeTag = locale === "fr" ? "fr-FR" : locale;
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
  const {
    consigneSup,
    consigneInf,
    consigne,
    unite,
    frequence,
    lastMeasureText,
    lastDateTime,
    decimals,
    lastValue,
  } = summary;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showAcknowledgeModal, setShowAcknowledgeModal] = useState(false);
  const [ackComment, setAckComment] = useState("");
  const [disableDuration, setDisableDuration] = useState<string>("60");
  const [actionType, setActionType] = useState<"surveillance" | "alarms">("surveillance");

  const [isSurveillanceActive, setIsSurveillanceActive] = useState(
    surveillanceDisabled !== undefined ? !surveillanceDisabled : lieuEtat !== "D"
  );
  const [isAlarmActive, setIsAlarmActive] = useState(!alarmDisabled);
  const [locallyAcknowledgedAlarmId, setLocallyAcknowledgedAlarmId] = useState<number | null>(null);
  const queryClient = useQueryClient();

  const effectiveAlarmId =
    locallyAcknowledgedAlarmId !== null && alarmId === locallyAcknowledgedAlarmId ? null : alarmId;
  const effectiveAlarmType =
    locallyAcknowledgedAlarmId !== null && alarmId === locallyAcknowledgedAlarmId ? null : alarmType;
  const effectiveStatus =
    locallyAcknowledgedAlarmId !== null && alarmId === locallyAcknowledgedAlarmId && status === "ended"
      ? "ok"
      : status;

  const markAlarmAcknowledgedInCache = useCallback((acknowledgedAlarmId: number) => {
    queryClient.setQueriesData({ queryKey: ["capteurs", "paginated"] }, (cached) => {
      const data = cached as
        | { pages?: Array<{ sensors?: Array<Record<string, unknown>>; [key: string]: unknown }> }
        | undefined;
      if (!data?.pages) return cached;

      let changed = false;
      const pages = data.pages.map((page) => {
        if (!Array.isArray(page.sensors)) return page;

        const sensors = page.sensors.map((sensor) => {
          const location = ((sensor.location as Record<string, unknown> | undefined) ?? {});
          const sensorAlarmId = Number(sensor.alarmId ?? location.alarmId ?? NaN);
          if (!Number.isFinite(sensorAlarmId) || sensorAlarmId !== acknowledgedAlarmId) return sensor;

          changed = true;
          const nextStatus = sensor.status === "ended" ? "ok" : sensor.status;

          return {
            ...sensor,
            status: nextStatus,
            alarmId: null,
            alarmType: null,
            location: {
              ...location,
              alarmId: null,
            },
          };
        });

        return changed ? { ...page, sensors } : page;
      });

      return changed ? { ...data, pages } : cached;
    });
  }, [queryClient]);

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
    setIsAlarmActive(!alarmDisabled);
  }, [alarmDisabled]);

  useEffect(() => {
    if (!isModalOpen) return;
    reload(true);
  }, [isModalOpen, reload]);

  const statusLabels = useMemo(
    () => ({
      inactive: tStatus("inactive"),
      critical: tStatus("critical"),
      technical: tStatus("technical"),
      warning: tStatus("warning"),
      ended: tStatus("ended"),
      ok: tStatus("ok"),
    }),
    [tStatus]
  );

  const headerTheme = useMemo(
    () => getStatusTheme(effectiveStatus, isSurveillanceActive, statusLabels),
    [effectiveStatus, isSurveillanceActive, statusLabels]
  );

  const alarmTypeTheme = useMemo(() => {
    if (!effectiveAlarmType || !isSurveillanceActive) return null;
    switch (effectiveAlarmType) {
      case "H":
        return {
          label: t("alarmTypes.high"),
          headerBgClassName: "bg-red-700",
          headerBorderClassName: "border-red-800",
          headerTextClassName: "text-white",
        };
      case "B":
        return {
          label: t("alarmTypes.low"),
          headerBgClassName: "bg-blue-700",
          headerBorderClassName: "border-blue-800",
          headerTextClassName: "text-white",
        };
      case "N":
        return {
          label: t("alarmTypes.no_response"),
          headerBgClassName: "bg-black",
          headerBorderClassName: "border-black",
          headerTextClassName: "text-white",
        };
      case "T":
        return {
          label: t("alarmTypes.ended"),
          headerBgClassName: "bg-violet-600",
          headerBorderClassName: "border-violet-700",
          headerTextClassName: "text-white",
        };
      default:
        return null;
    }
  }, [effectiveAlarmType, isSurveillanceActive, t]);

  const headerBgClassName = alarmTypeTheme?.headerBgClassName ?? headerTheme.headerBgClassName;
  const headerTextClassName =
    alarmTypeTheme?.headerTextClassName ??
    (isSurveillanceActive ? headerTheme.headerTextClassName : "text-white");
  const headerStatusLabel = alarmTypeTheme?.label ?? headerTheme.label;
  const headerBorderClassName = alarmTypeTheme?.headerBorderClassName ?? headerTheme.headerBorderClassName;

  const handleSurveillanceToggle = () => {
    setActionType("surveillance");
    setShowConfirmModal(true);
  };

  const confirmSurveillanceToggle = () => {
    const isDisabling = actionType === "surveillance" ? isSurveillanceActive : isAlarmActive;
    const durationMinutes =
      isDisabling
        ? disableDuration === "manual"
          ? null
          : Number(disableDuration)
        : null;

    if (actionType === "surveillance") {
      const newState = !isSurveillanceActive;
      setIsSurveillanceActive(newState);
      onSurveillanceToggle(idLieu, "surveillance", newState, durationMinutes);
    } else {
      const newState = !isAlarmActive;
      setIsAlarmActive(newState);
      onSurveillanceToggle(idLieu, "alarms", newState, durationMinutes);
    }

    setShowConfirmModal(false);
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

  const surveillanceDisabledLabel = useMemo(() => {
    if (isSurveillanceActive) return null;
    return t("surveillance.disabled");
  }, [isSurveillanceActive, t]);

  const alarmDisabledLabel = useMemo(() => {
    if (isAlarmActive) return null;
    if (!alarmDisabledUntil) return t("alarms.disabled");
    const date = new Date(alarmDisabledUntil);
    if (Number.isNaN(date.getTime())) return t("alarms.disabled");
    return t("alarms.disabled_until", {
      date: formatDbDateTime(date, { withSeconds: false }),
    });
  }, [alarmDisabledUntil, isAlarmActive, t]);

  const alarmBadgeClassName = isSurveillanceActive
    ? "bg-red-500/30 text-red-500 dark:text-red-100"
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

  const canAcknowledge =
    isSurveillanceActive &&
    effectiveAlarmId !== null &&
    effectiveAlarmId !== undefined &&
    (effectiveStatus === "critical" || effectiveStatus === "technical" || effectiveStatus === "ended");

  const frequencyMinutes = useMemo(() => {
    if (isGso) return 15
    if (!frequence || frequence <= 0) return null
    return Math.round(frequence / 60)
  }, [frequence, isGso])


  const chartDatasets = useMemo(() => {
    const baseData = orderedData.map((d) => d.Valeur)
    const labelsCount = orderedData.length
    const datasets = [
      {
        label: t("chart.measures", { unit: unite }),
        data: baseData,
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        borderWidth: 2,
        fill: false,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 4,
        order: 1,
      },
    ]

    return datasets
  }, [consigne, consigneInf, consigneSup, orderedData, t, unite])

  const formattedConsigne = useMemo(
    () => formatMeasureValue(consigne, decimals, localeTag),
    [consigne, decimals, localeTag]
  );

  const formattedConsigneSup = useMemo(
    () => formatMeasureValue(consigneSup, decimals, localeTag),
    [consigneSup, decimals, localeTag]
  );

  const formattedConsigneInf = useMemo(
    () => formatMeasureValue(consigneInf, decimals, localeTag),
    [consigneInf, decimals, localeTag]
  );

  const formattedLastValue = useMemo(
    () => formatMeasureValue(lastValue, decimals, localeTag),
    [lastValue, decimals, localeTag]
  );

  const hasGsoMetrics = Boolean(isGso && (gsoRssi || gsoTension));

  const acknowledgeDialogAlarm: AcknowledgeDialogAlarm | null = canAcknowledge && effectiveAlarmId
    ? {
        id: String(effectiveAlarmId),
        locationId: String(idLieu),
        locationName: nomLieu,
        sensorName: sondeNumeroSerie || nomLieu,        type:
          effectiveAlarmType === "H"
            ? "high"
            : effectiveAlarmType === "B"
              ? "low"
              : effectiveAlarmType === "N"
                ? "no-response"
                : effectiveStatus === "ended" || effectiveAlarmType === "T"
                  ? "ended"
                  : undefined,
        currentValue: typeof lastValue === "number" ? lastValue : null,
        value: typeof lastValue === "number" ? lastValue : null,
        unit: unite,
        minThreshold: consigneInf,
        maxThreshold: consigneSup,
      }
    : null;

  return (
    <>
      <div
        className={`relative w-full rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden flex flex-col ${
          isSurveillanceActive ? "bg-white dark:bg-gray-800" : "bg-slate-700 dark:bg-gray-800"
        }`}
      >
        <div
          className={`px-3 py-2 ${headerBgClassName} border-b-2 ${headerBorderClassName} ${
            canAcknowledge ? "cursor-pointer" : ""
          }`}
          onClick={() => {
            if (!canAcknowledge) return;
            setAckComment("");
            setShowAcknowledgeModal(true);
          }}
          onKeyDown={(event) => {
            if (!canAcknowledge) return;
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              setAckComment("");
              setShowAcknowledgeModal(true);
            }
          }}
          role={canAcknowledge ? "button" : undefined}
          tabIndex={canAcknowledge ? 0 : undefined}
          aria-label={canAcknowledge ? t("acknowledge.button") : undefined}
        >
          <div className="flex items-start justify-between gap-2">
            <div className={`${headerTextClassName} text-xs font-medium space-y-1 flex-1`}>
              {(() => {
                const label =
                  lieuEtat === "S"
                    ? t("surveillance.active")
                    : lieuEtat === "D"
                      ? t("surveillance.disabled")
                      : lieuEtat || null
                const siteLabel = siteName || t("site.unknown")
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
              <div className="flex items-center gap-2">
                <UITooltip>
                  <TooltipTrigger asChild>
                    <div className="text-base font-semibold truncate cursor-help">{nomLieu}</div>
                  </TooltipTrigger>
                  {locationComment ? (
                    <TooltipContent side="top" className="max-w-sm whitespace-pre-wrap wrap-break-word">
                      <p className="text-xs">{locationComment}</p>
                    </TooltipContent>
                  ) : null}
                </UITooltip>
              </div>
              {surveillanceDisabledLabel ? (
                <div className={`inline-flex items-center w-fit gap-1 rounded-full text-[10px] px-2 py-0.5 ${alarmBadgeClassName}`}>
                  <PowerOff className="h-3 w-3" />
                  <span>{surveillanceDisabledLabel}</span>
                </div>
              ) : null}
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
                {effectiveAlarmType ? (
                  <UITooltip>
                    <TooltipTrigger asChild>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide ${
                          effectiveAlarmType === "H"
                            ? "bg-red-700 text-white"
                            : effectiveAlarmType === "B"
                              ? "bg-blue-700 text-white"
                              : effectiveAlarmType === "T"
                                ? "bg-violet-600 text-white"
                                : "bg-black text-white"
                        }`}
                      >
                        {effectiveAlarmType}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">
                        {effectiveAlarmType === "H"
                          ? t("alarmTypes.high")
                          : effectiveAlarmType === "B"
                            ? t("alarmTypes.low")
                            : effectiveAlarmType === "T"
                              ? t("alarmTypes.ended")
                              : t("alarmTypes.no_response")}
                      </p>
                    </TooltipContent>
                  </UITooltip>
                ) : null}
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

        <div className="p-4 flex flex-col flex-1">
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
                          datasets: chartDatasets,
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
                      {consigneInf !== null ? (
                        <div
                          className="absolute w-full h-0.5"
                          style={{
                            top: `${yMax === yMin ? 0 : ((yMax - consigneInf) / (yMax - yMin)) * 100}%`,
                            backgroundImage:
                              "repeating-linear-gradient(to right, rgba(239, 68, 68, 0.8) 0 10px, transparent 10px 16px)",
                          }}
                        />
                      ) : null}
                      {consigneSup !== null ? (
                        <div
                          className="absolute w-full h-0.5"
                          style={{
                            top: `${yMax === yMin ? 0 : ((yMax - consigneSup) / (yMax - yMin)) * 100}%`,
                            backgroundImage:
                              "repeating-linear-gradient(to right, rgba(239, 68, 68, 0.8) 0 10px, transparent 10px 16px)",
                          }}
                        />
                      ) : null}
                      {consigne !== null ? (
                        <div
                          className="absolute w-full border-t border-gray-900 dark:border-white"
                          style={{
                            top: `${yMax === yMin ? 0 : ((yMax - consigne) / (yMax - yMin)) * 100}%`,
                          }}
                        />
                      ) : null}
                    </div>

                    <div className="absolute right-0 top-0 bottom-0 flex flex-col justify-between py-2 pointer-events-none pr-1">
                      {consigneSup !== null ? (
                        <div
                          className="text-[9px] font-medium text-red-600 dark:text-red-200 bg-white/90 dark:bg-gray-800/90 px-1 rounded shadow-sm whitespace-nowrap"
                          style={{
                            position: "absolute",
                            top: `${yMax === yMin ? 0 : ((yMax - consigneSup) / (yMax - yMin)) * 100}%`,
                            transform: "translateY(-50%)",
                            right: "4px",
                          }}
                        >
                          {formattedConsigneSup || consigneSup}
                          {unite}
                        </div>
                      ) : null}
                      {consigneInf !== null ? (
                        <div
                          className="text-[9px] font-medium text-red-600 dark:text-red-200 bg-white/90 dark:bg-gray-800/90 px-1 rounded shadow-sm whitespace-nowrap"
                          style={{
                            position: "absolute",
                            top: `${yMax === yMin ? 0 : ((yMax - consigneInf) / (yMax - yMin)) * 100}%`,
                            transform: "translateY(-50%)",
                            right: "4px",
                          }}
                        >
                          {formattedConsigneInf || consigneInf}
                          {unite}
                        </div>
                      ) : null}
                      {consigne !== null ? (
                        <div
                          className="text-[9px] font-medium text-gray-900 dark:text-white bg-white/90 dark:bg-gray-800/90 px-1 rounded shadow-sm whitespace-nowrap"
                          style={{
                            position: "absolute",
                            top: `${yMax === yMin ? 0 : ((yMax - consigne) / (yMax - yMin)) * 100}%`,
                            transform: "translateY(-50%)",
                            right: "4px",
                          }}
                        >
                          {formattedConsigne || consigne}
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
                      <span>
                        {t("last_measure.label", {
                          value: formattedLastValue ? `${formattedLastValue}${unite}` : lastMeasureText,
                        })}
                      </span>
                      <span>{lastDateTime}</span>
                    </div>
                    {hasGsoMetrics ? (
                      <div className={`flex flex-wrap items-center justify-center gap-4 text-[11px] ${contentTextClassName}`}>
                        {gsoRssi ? <RssiBars value={gsoRssi} label={t("gso.rssi", { value: gsoRssi })} /> : null}
                        {gsoTension ? <span>{t("gso.tension", { value: gsoTension })}</span> : null}
                      </div>
                    ) : null}
                    <div className={`flex items-center justify-center gap-4 text-[11px] ${contentTextClassName}`}>
                      <span>{t("frequency", { minutes: frequencyMinutes ?? "-" })}</span>
                      {(alarmDelayHighMinutes !== null && alarmDelayHighMinutes !== undefined) ||
                       (alarmDelayLowMinutes !== null && alarmDelayLowMinutes !== undefined) ||
                       (noResponseDelayMinutes !== null && noResponseDelayMinutes !== undefined) ? (
                        <UITooltip>
                          <TooltipTrigger asChild>
                            <span className="cursor-help underline decoration-dotted underline-offset-2">
                              {t("alarm_delay_hover.summary")}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs">
                            <div className="space-y-1 text-xs">
                              <p>{t("alarm_delay_hover.high", { minutes: alarmDelayHighMinutes ?? "-" })}</p>
                              <p>{t("alarm_delay_hover.low", { minutes: alarmDelayLowMinutes ?? "-" })}</p>
                              <p>{t("alarm_delay_hover.no_response", { minutes: noResponseDelayMinutes ?? "-" })}</p>
                            </div>
                          </TooltipContent>
                        </UITooltip>
                      ) : null}
                    </div>
                  </>
                ) : (
                  <div className="text-center text-gray-500 dark:text-gray-400 italic py-3">
                    {t("no_measurements")}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className={`text-sm font-medium ${contentTextClassName}`}>
              {t("surveillance.disabled")}
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
                      <p className="text-xs">{t("actions.details")}</p>
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
                    <p className="text-xs">{t("actions.toggle")}</p>
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
                    <p className="text-xs">{t("actions.location")}</p>
                  </TooltipContent>
                </UITooltip>

                <UITooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditLocation?.(idLieu);
                      }}
                      className={`p-1.5 rounded-md transition-colors ${actionButtonClassName}`}
                    >
                      <Settings className={`w-4 h-4 ${actionIconClassName}`} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                      <p className="text-xs">{t("actions.settings")}</p>
                  </TooltipContent>
                </UITooltip>
              </div>
            </TooltipProvider>
          </div>
        </div>

        <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t("confirm.title")}</DialogTitle>
              <DialogDescription>
                {actionType === "surveillance"
                  ? t("confirm.description_surveillance", {
                      action: isSurveillanceActive ? t("confirm.action_disable") : t("confirm.action_enable"),
                    })
                  : t("confirm.description_alarms", {
                      action: isAlarmActive ? t("confirm.action_disable") : t("confirm.action_enable"),
                    })}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t("confirm.action_type.label")}</label>
              <Select value={actionType} onValueChange={(value) => setActionType(value as "surveillance" | "alarms")}>
                <SelectTrigger>
                  <SelectValue placeholder={t("confirm.action_type.placeholder")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="surveillance">{t("confirm.action_type.options.surveillance")}</SelectItem>
                  <SelectItem value="alarms">{t("confirm.action_type.options.alarms")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(actionType === "surveillance" ? isSurveillanceActive : isAlarmActive) ? (
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("confirm.disable_duration.label")}</label>
                <Select value={disableDuration} onValueChange={setDisableDuration}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("confirm.disable_duration.placeholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">{t("confirm.disable_duration.options.15")}</SelectItem>
                    <SelectItem value="60">{t("confirm.disable_duration.options.60")}</SelectItem>
                    <SelectItem value="240">{t("confirm.disable_duration.options.240")}</SelectItem>
                    <SelectItem value="720">{t("confirm.disable_duration.options.720")}</SelectItem>
                    <SelectItem value="manual">{t("confirm.disable_duration.options.manual")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ) : null}

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowConfirmModal(false)}>
                {t("confirm.cancel")}
              </Button>
              <Button
                variant={(actionType === "surveillance" ? isSurveillanceActive : isAlarmActive) ? "destructive" : "default"}
                onClick={confirmSurveillanceToggle}
              >
                {t("confirm.confirm")}
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
            isGso={isGso ?? null}
            gsoRssi={gsoRssi ?? null}
            gsoTension={gsoTension ?? null}
            consigneSup={consigneSup}
            consigneInf={consigneInf}
            consigne={consigne}
            unite={unite}
            isSurveillanceActive={isSurveillanceActive}
            measurements={isSurveillanceActive ? orderedData : []}
          />
        ) : null}

        <AlarmAcknowledgeDialog
          open={showAcknowledgeModal}
          alarm={acknowledgeDialogAlarm}
          onOpenChange={(open) => {
            setShowAcknowledgeModal(open);
            if (!open) setAckComment("");
          }}
          onConfirm={async (ackAlarmId, commentValue) => {
            try {
              const res = await fetch(`/api/alarmes/${ackAlarmId}/acknowledge`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ comment: commentValue || ackComment || undefined }),
              });
              if (!res.ok) {
                console.error("Acknowledge alarm error", await res.text());
                return;
              }
              const acknowledgedId = Number(ackAlarmId);
              if (Number.isFinite(acknowledgedId)) {
                setLocallyAcknowledgedAlarmId(acknowledgedId);
                markAlarmAcknowledgedInCache(acknowledgedId);
              }
              setShowAcknowledgeModal(false);
              setAckComment("");
              reload(true);
            } catch (error) {
              console.error("Acknowledge alarm error", error);
            }
          }}
        />
      </div>
    </>
  );
}




























