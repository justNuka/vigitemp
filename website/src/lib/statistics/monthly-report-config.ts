import { prisma } from "@/lib/prisma"

const SECTION = "STATISTICS_MONTHLY_REPORT"

const KEYS = {
  enabled: "ENABLED",
  recipients: "RECIPIENTS",
  dayOfMonth: "DAY_OF_MONTH",
  hourLocal: "HOUR_LOCAL",
  includeLocationSummary: "INCLUDE_LOCATION_SUMMARY",
  includeSettingsSummary: "INCLUDE_SETTINGS_SUMMARY",
  includeMax: "INCLUDE_MAX",
  includeMin: "INCLUDE_MIN",
  includeAvg: "INCLUDE_AVG",
  includeAlarmCount: "INCLUDE_ALARM_COUNT",
  includeAlarmHighDuration: "INCLUDE_ALARM_HIGH_DURATION",
  includeAlarmLowDuration: "INCLUDE_ALARM_LOW_DURATION",
  includeOverHighNoAlarm: "INCLUDE_OVER_HIGH_NO_ALARM",
  includeOverLowNoAlarm: "INCLUDE_OVER_LOW_NO_ALARM",
  lastSentMonth: "LAST_SENT_MONTH",
} as const

export type MonthlyStatsReportConfig = {
  enabled: boolean
  recipients: string
  dayOfMonth: number
  hourLocal: number
  includeLocationSummary: boolean
  includeSettingsSummary: boolean
  includeMax: boolean
  includeMin: boolean
  includeAvg: boolean
  includeAlarmCount: boolean
  includeAlarmHighDuration: boolean
  includeAlarmLowDuration: boolean
  includeOverHighNoAlarm: boolean
  includeOverLowNoAlarm: boolean
}

type ParamMap = Map<string, string>

function parseBoolean(value: string | undefined, fallback: boolean) {
  if (value == null || value === "") return fallback
  const normalized = value.trim().toLowerCase()
  if (["1", "true", "on", "yes"].includes(normalized)) return true
  if (["0", "false", "off", "no"].includes(normalized)) return false
  return fallback
}

function parseIntSafe(value: string | undefined, fallback: number, min: number, max: number) {
  if (!value) return fallback
  const parsed = Number.parseInt(value, 10)
  if (!Number.isFinite(parsed)) return fallback
  return Math.max(min, Math.min(max, parsed))
}

function toConfig(params: ParamMap): MonthlyStatsReportConfig {
  return {
    enabled: parseBoolean(params.get(KEYS.enabled), false),
    recipients: params.get(KEYS.recipients) ?? "",
    dayOfMonth: parseIntSafe(params.get(KEYS.dayOfMonth), 1, 1, 28),
    hourLocal: parseIntSafe(params.get(KEYS.hourLocal), 8, 0, 23),
    includeLocationSummary: parseBoolean(params.get(KEYS.includeLocationSummary), true),
    includeSettingsSummary: parseBoolean(params.get(KEYS.includeSettingsSummary), true),
    includeMax: parseBoolean(params.get(KEYS.includeMax), true),
    includeMin: parseBoolean(params.get(KEYS.includeMin), true),
    includeAvg: parseBoolean(params.get(KEYS.includeAvg), true),
    includeAlarmCount: parseBoolean(params.get(KEYS.includeAlarmCount), true),
    includeAlarmHighDuration: parseBoolean(params.get(KEYS.includeAlarmHighDuration), true),
    includeAlarmLowDuration: parseBoolean(params.get(KEYS.includeAlarmLowDuration), true),
    includeOverHighNoAlarm: parseBoolean(params.get(KEYS.includeOverHighNoAlarm), true),
    includeOverLowNoAlarm: parseBoolean(params.get(KEYS.includeOverLowNoAlarm), true),
  }
}

export function parseRecipients(value: string) {
  return Array.from(
    new Set(
      value
        .split(/[;,\n\r]+/)
        .map((item) => item.trim().toLowerCase())
        .filter((item) => item.length > 0),
    ),
  )
}

export async function getMonthlyStatsReportConfig() {
  const rows = await prisma.t_parametre.findMany({
    where: { Section: SECTION },
    select: { Mot_Cle: true, Valeur: true },
  })

  const map = new Map<string, string>()
  for (const row of rows) {
    map.set(row.Mot_Cle, row.Valeur ?? "")
  }

  return toConfig(map)
}

async function upsertParam(motCle: string, value: string) {
  await prisma.t_parametre.upsert({
    where: {
      Section_Mot_Cle: {
        Section: SECTION,
        Mot_Cle: motCle,
      },
    },
    update: { Valeur: value },
    create: {
      Section: SECTION,
      Mot_Cle: motCle,
      Valeur: value,
      Commentaire: "",
    },
  })
}

export async function saveMonthlyStatsReportConfig(config: MonthlyStatsReportConfig) {
  await Promise.all([
    upsertParam(KEYS.enabled, config.enabled ? "1" : "0"),
    upsertParam(KEYS.recipients, config.recipients),
    upsertParam(KEYS.dayOfMonth, String(config.dayOfMonth)),
    upsertParam(KEYS.hourLocal, String(config.hourLocal)),
    upsertParam(KEYS.includeLocationSummary, config.includeLocationSummary ? "1" : "0"),
    upsertParam(KEYS.includeSettingsSummary, config.includeSettingsSummary ? "1" : "0"),
    upsertParam(KEYS.includeMax, config.includeMax ? "1" : "0"),
    upsertParam(KEYS.includeMin, config.includeMin ? "1" : "0"),
    upsertParam(KEYS.includeAvg, config.includeAvg ? "1" : "0"),
    upsertParam(KEYS.includeAlarmCount, config.includeAlarmCount ? "1" : "0"),
    upsertParam(KEYS.includeAlarmHighDuration, config.includeAlarmHighDuration ? "1" : "0"),
    upsertParam(KEYS.includeAlarmLowDuration, config.includeAlarmLowDuration ? "1" : "0"),
    upsertParam(KEYS.includeOverHighNoAlarm, config.includeOverHighNoAlarm ? "1" : "0"),
    upsertParam(KEYS.includeOverLowNoAlarm, config.includeOverLowNoAlarm ? "1" : "0"),
  ])
}

export async function getLastSentMonth() {
  const row = await prisma.t_parametre.findUnique({
    where: {
      Section_Mot_Cle: {
        Section: SECTION,
        Mot_Cle: KEYS.lastSentMonth,
      },
    },
    select: { Valeur: true },
  })
  return row?.Valeur ?? null
}

export async function setLastSentMonth(value: string) {
  await upsertParam(KEYS.lastSentMonth, value)
}

