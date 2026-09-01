import { formatDbDateTime, parseDbDateTime } from "@/lib/date-display"
import { formatMeasureValue } from "@/lib/measurements"

const AUDIT_FIELD_LABELS: Record<string, string> = {
  action: "Action",
  Nom_Lieu: "Nom du lieu",
  Commentaire: "Commentaire",
  Commentaire_Utilisateur: "Commentaire utilisateur",
  Observations_Info: "Observations",
  Id_Site: "Site",
  Sonde_Numero_Serie: "Sonde",
  Adresse_Sonde: "Adresse sonde",
  Consigne: "Consigne",
  Consigne_Sup: "Consigne sup.",
  Consigne_Inf: "Consigne inf.",
  Tolerance_Surveillance_Sup: "Tolerance sup.",
  Tolerance_Surveillance_Inf: "Tolerance inf.",
  Retard_Alarme_Haut: "Retard alarme haut",
  Retard_Alarme_Bas: "Retard alarme bas",
  Retard_Non_Reponse: "Retard non reponse",
  Frequence: "Frequence",
  idSite: "Site",
  groupIds: "Groupes",
  idModule: "Module",
  mailingContactsCount: "Contacts mail",
  dateHeureSurveillanceOn: "Date activation surveillance",
  dateHeureSurveillanceOff: "Date desactivation surveillance",
  acknowledgedAt: "Date d'acquittement",
  reason: "Motif",
  from: "Avant",
  to: "Apres",
}

const AUDIT_ACTION_LABELS: Record<string, string> = {
  create: "Creation",
  update: "Modification",
  delete: "Suppression",
  enable: "Activation",
  disable: "Desactivation",
}

export function sanitizeMonitoringAuditText(value: string | null | undefined) {
  if (!value) return "-"
  const normalized = value
    .replace(/%[12]/g, "")
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.replace(/[ \t]{2,}/g, " ").trim())
    .join("\n")
    .trim()

  return normalized || "-"
}

export function formatMonitoringAuditValue(key: string, value: unknown) {
  if (value === null || value === undefined || value === "") return "-"
  if (typeof value === "boolean") return value ? "Oui" : "Non"
  if (typeof value === "number") return formatMeasureValue(value)
  if (Array.isArray(value)) return value.length > 0 ? value.join(", ") : "-"
  if (typeof value === "string") {
    if (key === "action") return AUDIT_ACTION_LABELS[value] ?? value

    const lowered = key.toLowerCase()
    if (lowered.endsWith("at") || lowered.includes("date") || lowered.includes("time")) {
      const parsed = parseDbDateTime(value)
      if (parsed && !Number.isNaN(parsed.getTime())) {
        return formatDbDateTime(parsed, { format: "dateTimeSeconds" })
      }
    }

    const asNumber = Number(value)
    if (value.trim() !== "" && Number.isFinite(asNumber) && /^-?\d+(?:[.,]\d+)?$/.test(value.trim())) {
      return formatMeasureValue(asNumber)
    }

    return value
  }
  return String(value)
}

function isFromToChange(value: unknown): value is { from?: unknown; to?: unknown } {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false
  return Object.prototype.hasOwnProperty.call(value, "from") || Object.prototype.hasOwnProperty.call(value, "to")
}

export function buildMonitoringAuditRows(raw: string | null | undefined) {
  const sanitized = sanitizeMonitoringAuditText(raw)
  if (sanitized === "-") return [] as Array<{ label: string; value: string }>

  const jsonStart = sanitized.indexOf("{")
  const jsonEnd = sanitized.lastIndexOf("}")
  if (jsonStart < 0 || jsonEnd <= jsonStart) return []

  try {
    const parsed = JSON.parse(sanitized.slice(jsonStart, jsonEnd + 1)) as Record<string, unknown>
    return Object.entries(parsed)
      .filter(
        ([key, value]) =>
          !["alarmId", "locationId", "lieuId", "acknowledgedAt"].includes(key) &&
          value !== null &&
          value !== undefined,
      )
      .map(([key, value]) => {
        const label = AUDIT_FIELD_LABELS[key] ?? key
        if (isFromToChange(value)) {
          return {
            label,
            value: `Avant: ${formatMonitoringAuditValue("from", value.from)} | Apres: ${formatMonitoringAuditValue("to", value.to)}`,
          }
        }

        return {
          label,
          value: formatMonitoringAuditValue(key, value),
        }
      })
  } catch {
    return []
  }
}

export function formatMonitoringAuditSummary(value: string | null | undefined) {
  const sanitized = sanitizeMonitoringAuditText(value)
  if (sanitized === "-") return sanitized

  const prefix = sanitized
    .split("{")[0]
    ?.split("|")
    .map((segment) => segment.trim())
    .filter(
      (segment) =>
        segment.length > 0 &&
        !/^(acknowledgedAt|alarmId|locationId|lieuId)\s*:/i.test(segment) &&
        !/^IP\s*:/i.test(segment),
    )
    .join(" | ")
    .trim()
  const rows = buildMonitoringAuditRows(value)

  if (rows.length === 0) return prefix || sanitized

  const compactRows = rows
    .slice(0, 3)
    .map(({ label, value: rowValue }) => `${label}: ${rowValue}`)
    .join(" | ")

  if (prefix) {
    return compactRows ? `${prefix} | ${compactRows}` : prefix
  }

  return compactRows
}
