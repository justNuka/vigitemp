export type LocationSensorFormStateInput = {
  sensorSerial: string | null | undefined
  sensorChanged: boolean
  selectedSensorModuleId: number | null | undefined
  currentModuleId: number | null | undefined
  monitoringState: string | null | undefined
  monitoringWasAutoDisabled: boolean
  monitoringExplicitlySet: boolean
  moduleExplicitlySet: boolean
}

export type LocationSensorFormState = {
  monitoringState: string | null
  monitoringWasAutoDisabled: boolean
  moduleId: number | null
}

export function resolveLocationSensorFormState({
  sensorSerial,
  sensorChanged,
  selectedSensorModuleId,
  currentModuleId,
  monitoringState,
  monitoringWasAutoDisabled,
  monitoringExplicitlySet,
  moduleExplicitlySet,
}: LocationSensorFormStateInput): LocationSensorFormState {
  const hasSensor = Boolean(sensorSerial?.trim())
  let nextMonitoringState = monitoringState ?? null
  let nextMonitoringWasAutoDisabled = monitoringWasAutoDisabled

  if (!hasSensor) {
    if (!monitoringExplicitlySet) {
      if (nextMonitoringState !== "D") {
        nextMonitoringWasAutoDisabled = true
      }
      nextMonitoringState = "D"
    }
  } else {
    if (
      monitoringWasAutoDisabled &&
      !monitoringExplicitlySet &&
      nextMonitoringState === "D"
    ) {
      nextMonitoringState = "S"
    }
    nextMonitoringWasAutoDisabled = false
  }

  let nextModuleId = currentModuleId ?? null
  if (!hasSensor) {
    nextModuleId = null
  } else if (
    sensorChanged ||
    (!moduleExplicitlySet && nextModuleId === null && selectedSensorModuleId != null)
  ) {
    nextModuleId = selectedSensorModuleId ?? null
  }

  return {
    monitoringState: nextMonitoringState,
    monitoringWasAutoDisabled: nextMonitoringWasAutoDisabled,
    moduleId: nextModuleId,
  }
}
