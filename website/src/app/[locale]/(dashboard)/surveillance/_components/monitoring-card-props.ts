import type { ComponentProps } from "react"

import MonitoringCard from "@/components/monitoring-card"
import type { SensorWithLocation } from "@/lib/api"

type MonitoringCardProps = ComponentProps<typeof MonitoringCard>

type SurveillanceToggleHandler = (
  idLieu: number,
  action: "surveillance" | "alarms",
  newState: boolean,
  durationMinutes?: number | null,
) => void

export function buildMonitoringCardProps(
  sensor: SensorWithLocation,
  siteName: string,
  groupName: string,
  onSurveillanceToggle: SurveillanceToggleHandler,
  onEditLocation: MonitoringCardProps["onEditLocation"],
  showNullNonResponse: boolean,
): MonitoringCardProps {
  return {
    idLieu: Number(sensor.id),
    nomLieu: sensor.name ?? "",
    currentValue: sensor.currentValue ?? null,
    lastMeasurement: sensor.lastMeasurement ?? null,
    lieuType: sensor.lieuType ?? sensor.location.lieuType ?? null,
    siteName,
    groupName,
    status: sensor.status,
    alarmType: sensor.alarmType ?? null,
    alarmId: sensor.alarmId ?? sensor.location.alarmId ?? null,
    alarmDisabled: sensor.location.alarmDisabled ?? false,
    alarmDisabledUntil: sensor.location.alarmDisabledUntil ?? null,
    alarmDelayMinutes: sensor.location.alarmDelayMinutes ?? null,
    alarmDelayHighMinutes: sensor.location.alarmDelayHighMinutes ?? null,
    alarmDelayLowMinutes: sensor.location.alarmDelayLowMinutes ?? null,
    noResponseDelayMinutes: sensor.location.noResponseDelayMinutes ?? null,
    consigneSupPreAlarme: sensor.location.consigneSupPreAlarme ?? null,
    estConsigneSupPreAlarmeActive: sensor.location.estConsigneSupPreAlarmeActive ?? false,
    consigneInfPreAlarme: sensor.location.consigneInfPreAlarme ?? null,
    estConsigneInfPreAlarmeActive: sensor.location.estConsigneInfPreAlarmeActive ?? false,
    locationComment: sensor.location.comment ?? null,
    lieuEtat: sensor.location.lieuEtat ?? "",
    surveillanceDisabled: sensor.location.surveillanceDisabled ?? false,
    sondeNumeroSerie: sensor.location.sondeNumeroSerie ?? "",
    isGso: sensor.location.isGso ?? null,
    gsoRssi: sensor.location.gsoRssi ?? null,
    gsoTension: sensor.location.gsoTension ?? null,
    onSurveillanceToggle: (id, action, newState, durationMinutes) =>
      onSurveillanceToggle(id, action, newState, durationMinutes ?? null),
    onEditLocation,
    showNullNonResponse,
  }
}
