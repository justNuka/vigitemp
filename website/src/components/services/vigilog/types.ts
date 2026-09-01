export type VigilogConfiguration = {
  id: number
  name: string
  description: string | null
  target: number | null
  lowLimitActive: boolean
  lowLimit: number | null
  highLimitActive: boolean
  highLimit: number | null
  frequencyMinutes: number
  alarmDelayMinutes: number
  startDelayMinutes: number
  stopButtonEnabled: boolean
  resetWithStartEnabled: boolean
  active: boolean
  createdAt: string
  updatedAt: string | null
  createdBy: string | null
  updatedBy: string | null
}

export type VigilogLogger = {
  id: number
  serial: string
  model: string | null
  label: string | null
  active: boolean
  calibrationDate: string | null
  calibrationValidityDate: string | null
  calibrationValidityDays: number | null
  accuracyError: number | null
  comment: string | null
  createdAt: string
  updatedAt: string | null
}

export type VigilogTournee = {
  id: number
  loggerId: number | null
  reference: string
  configurationId: number | null
  configurationName: string
  loggerSerial: string
  status: string
  trafficLight: "VERT" | "ORANGE" | "ROUGE" | null
  departureAt: string
  arrivalAt: string | null
  target: number | null
  lowLimitActive: boolean
  lowLimit: number | null
  highLimitActive: boolean
  highLimit: number | null
  frequencyMinutes: number
  alarmDelayMinutes: number
  startDelayMinutes: number
  stopButtonEnabled: boolean
  resetWithStartEnabled: boolean
  measurementCount: number
  temperatureMin: number | null
  temperatureAverage: number | null
  temperatureMax: number | null
  outOfLimitDurationSeconds: number
  alarmDurationSeconds: number
  hasExcursion: boolean
  hasAlarm: boolean
  acknowledged: boolean
  comment: string | null
  acknowledgeComment: string | null
  acknowledgedAt: string | null
  createdAt: string
  updatedAt: string | null
  departureSite: {
    id: number
    name: string | null
  }
  arrivalSite: {
    id: number
    name: string | null
  }
  departureUser: string | null
  arrivalUser: string | null
  acknowledgedBy: string | null
  configurationActive: boolean | null
}

export type VigilogTourneesResponse = {
  stats: {
    pendingCount: number
    activeAlarmCount: number
    totalCount: number
  }
  tournees: VigilogTournee[]
}

export type VigilogTemporaryUsage = {
  id: number
  reference: string
  configurationId: number | null
  loggerId: number | null
  configurationName: string
  loggerSerial: string
  temporaryLocationName: string
  status: "EN_COURS" | "TERMINE" | string
  startedAt: string
  stoppedAt: string | null
  startComment: string | null
  stopComment: string | null
  createdAt: string
  updatedAt: string | null
  startedBy: string | null
  stoppedBy: string | null
}

export type VigilogTemporaryUsagesResponse = {
  stats: {
    activeCount: number
    totalCount: number
  }
  usages: VigilogTemporaryUsage[]
}

export type VigilogMeasure = {
  id: number
  order: number | null
  measuredAt: string
  value: number | null
  outOfLimit: boolean
  inAlarm: boolean
  marker: boolean
  details: string | null
  importedAt: string
}

export type VigilogTourneeDetail = {
  tournee: VigilogTournee
  measures: VigilogMeasure[]
}
