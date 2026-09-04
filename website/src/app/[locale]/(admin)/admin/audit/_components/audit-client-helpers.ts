import type { AuditLog } from '@/lib/api'
import { formatDbDateTime, parseDbDateTime } from '@/lib/date-display'
import { formatNumber } from '@/lib/number-display'

export interface AuditCode {
  Code_Journal: string
  Commentaire: string | null
}

export interface AuditLogRow {
  id: string
  timestamp: string | Date
  action: string
  userId: string | null
  userDisplayName: string | null
  details: string | null
  locationName: string | null
}

type ParsedDetails = {
  title: string
  subtitle?: string
  raw?: string
}

const RESOURCE_LABEL_MAP: Record<string, { fr: string; en: string }> = {
  'dashboard:audit_graph_openings': {
    fr: "Affichage des ouvertures d'audit sur les graphiques",
    en: 'Display audit openings on charts',
  },
}

function joinParts(parts: string[], separator = ' - ') {
  return parts.filter(Boolean).join(separator)
}

function humanizeIdentifier(value: string, localeTag: string): string {
  const normalized = value.trim().toLowerCase()
  const configured = RESOURCE_LABEL_MAP[normalized]
  if (configured) return localeTag.toLowerCase().startsWith('fr') ? configured.fr : configured.en

  const words = value
    .replace(/[.:/_-]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()

  if (!words) return value
  return `${words.charAt(0).toUpperCase()}${words.slice(1)}`
}

export function formatDateSafe(value: string, localeTag: string, timezone?: string): string | null {
  const date = parseDbDateTime(value)
  if (!date) return null
  if (Number.isNaN(date.getTime())) return null

  return formatDbDateTime(date, { format: "dateTimeSeconds", locale: localeTag, timeZone: timezone })
}

export function parseAuditDetails(
  details: string | null,
  t: (key: string, values?: Record<string, string | number>) => string,
  localeTag: string,
  timezone?: string,
): ParsedDetails {
  if (!details) return { title: t('table.empty_value') }

  const normalizedDetails = details.replace(/::ffff:/g, '')
  const parts = normalizedDetails
    .split('|')
    .map((part) => part.trim())
    .filter(Boolean)

  const resource = parts[0] || ''
  const idPart = parts.find((part) => part.startsWith('#')) || ''
  const ipPart = parts.find((part) => part.toLowerCase().startsWith('ip:'))
  let ip = ipPart ? ipPart.replace(/^IP:\s*/i, '').trim() : ''

  if (ip.startsWith('::ffff:')) {
    ip = ip.replace('::ffff:', '')
  }

  let changes: Record<string, unknown> | null = null
  const jsonPart = parts.find((part) => part.startsWith('{') && part.endsWith('}'))
  if (jsonPart) {
    try {
      changes = JSON.parse(jsonPart)
    } catch {
      changes = null
    }
  }

  const resourceLabel = resource && !resource.startsWith('{') && !resource.toLowerCase().startsWith('ip:')
    ? humanizeIdentifier(resource, localeTag)
    : resource
  const rawTitle = joinParts([resourceLabel, idPart], ' ').trim()
  const title = rawTitle || normalizedDetails
  const subtitleParts: string[] = []

  if (changes) {
    const machineName = typeof changes.machineName === 'string' ? changes.machineName : null
    const address = typeof changes.address === 'string' ? changes.address : null
    const connectedAt = typeof changes.connectedAt === 'string' ? changes.connectedAt : null
    const from = changes.from
    const to = changes.to
    const action = typeof changes.action === 'string' ? changes.action : null

    if (machineName || address) {
      const machine = machineName ? t('details.machine', { name: machineName }) : ''
      const addressText = address ? t('details.address', { address }) : ''
      subtitleParts.push(joinParts([machine, addressText]))
    }

    if (connectedAt) {
      const formatted = formatDateSafe(connectedAt, localeTag, timezone)
      if (formatted) {
        subtitleParts.push(t('details.connection', { date: formatted }))
      }
    }

    if (from !== undefined || to !== undefined) {
      const fromText = from !== undefined ? t('details.from', { value: formatFieldValue('from', from, localeTag, timezone) }) : ''
      const toText = to !== undefined ? t('details.to', { value: formatFieldValue('to', to, localeTag, timezone) }) : ''
      subtitleParts.push(joinParts([fromText, toText]))
    }

    if (action && subtitleParts.length === 0) {
      subtitleParts.push(t('details.action', { action: humanizeIdentifier(action, localeTag) }))
    }
  }

  if (ip && !subtitleParts.some((part) => part.startsWith('IP:')) && !title.startsWith('IP:')) {
    subtitleParts.push(t('details.ip', { ip }))
  }

  if (subtitleParts.length === 0 && normalizedDetails !== resource && normalizedDetails !== title) {
    if (!(normalizedDetails.startsWith('IP:') && (ip || title.startsWith('IP:')))) {
      const readableParts = parts
        .slice(1)
        .filter((part) => !part.startsWith('{') && !part.toLowerCase().startsWith('ip:'))
      if (readableParts.length > 0) subtitleParts.push(readableParts.join(' - '))
    }
  }

  return {
    title,
    subtitle: joinParts(subtitleParts),
    raw: normalizedDetails,
  }
}

export function filterAuditLogs(logs: AuditLog[], codeFilter: string, searchQuery: string) {
  return logs.filter((log) => {
    if (codeFilter !== 'all' && log.action !== codeFilter) return false
    if (!searchQuery) return true

    const query = searchQuery.toLowerCase()
    return (
      log.action.toLowerCase().includes(query) ||
      log.details?.toLowerCase().includes(query) ||
      log.userId?.toLowerCase().includes(query) ||
      log.userDisplayName?.toLowerCase().includes(query) ||
      log.locationName?.toLowerCase().includes(query)
    )
  })
}

export function toAuditTableData(logs: AuditLog[]): AuditLogRow[] {
  return logs.map((log) => ({
    id: log.id,
    timestamp: log.timestamp,
    action: log.action,
    userId: log.userId,
    userDisplayName: log.userDisplayName ?? null,
    details: log.details,
    locationName: log.locationName ?? null,
  }))
}

const FIELD_LABEL_MAP: Record<string, { fr: string; en: string }> = {
  address: { fr: 'Adresse', en: 'Address' },
  connectedAt: { fr: 'Connecte le', en: 'Connected at' },
  machineName: { fr: 'Machine', en: 'Machine' },
  newToleranceSup: { fr: 'Tolerance sup.', en: 'Upper tolerance' },
  newToleranceInf: { fr: 'Tolerance inf.', en: 'Lower tolerance' },
  simAlarms: { fr: 'Alarmes simulees', en: 'Simulated alarms' },
  realAlarms: { fr: 'Alarmes reelles', en: 'Real alarms' },
  dateRange: { fr: 'Periode', en: 'Period' },
  alarmId: { fr: 'No alarme', en: 'Alarm #' },
  acknowledgedAt: { fr: 'Acquitte le', en: 'Acknowledged at' },
  from: { fr: 'Avant', en: 'Before' },
  to: { fr: 'Apres', en: 'After' },
  forced: { fr: 'Force', en: 'Forced' },
  description: { fr: 'Description', en: 'Description' },
  format: { fr: 'Format', en: 'Format' },
  Nom_Lieu: { fr: 'Nom du lieu', en: 'Location name' },
  Tolerance_Sup: { fr: 'Tolerance sup.', en: 'Upper tolerance' },
  Tolerance_Inf: { fr: 'Tolerance inf.', en: 'Lower tolerance' },
  Consigne_Sup: { fr: 'Consigne sup.', en: 'Upper setpoint' },
  Consigne_Inf: { fr: 'Consigne inf.', en: 'Lower setpoint' },
  Est_Son_Alarme_Active: { fr: "Son d'alarme", en: 'Alarm sound' },
  Nom_Sonde: { fr: 'Nom de la sonde', en: 'Sensor name' },
  Frequence_Mesure: { fr: 'Frequence mesure (s)', en: 'Measurement freq. (s)' },
  Retard_Alarme: { fr: "Retard d'alarme (s)", en: 'Alarm delay (s)' },
  Hysteresis: { fr: 'Hysteresis', en: 'Hysteresis' },
  disabled: { fr: 'Surveillance desactivee', en: 'Monitoring disabled' },
  durationMinutes: { fr: 'Duree (min)', en: 'Duration (min)' },
  reactivationAt: { fr: 'Reactivation prevue', en: 'Scheduled reactivation' },
  updated: { fr: 'Lieux modifies', en: 'Updated locations' },
  lieuIds: { fr: 'Lieux concernes', en: 'Locations' },
  groupOrLiaisonId: { fr: 'Groupe / liaison', en: 'Group / link' },
}

function formatFieldValue(
  key: string,
  value: unknown,
  localeTag: string,
  timezone?: string,
): string {
  if (value === null || value === undefined) return '-'

  if (typeof value === 'boolean') {
    return localeTag.startsWith('fr') ? (value ? 'Oui' : 'Non') : (value ? 'Yes' : 'No')
  }

  if (typeof value === 'number') {
    if (Number.isInteger(value)) return String(value)
    return formatNumber(value, { locale: localeTag, maximumDecimals: 4 })
  }

  if (Array.isArray(value)) {
    return value.map((item) => formatFieldValue(key, item, localeTag, timezone)).join(', ')
  }

  if (typeof value === 'string') {
    if (value.includes(' ? ')) {
      const sep = value.indexOf(' ? ')
      const start = value.slice(0, sep).trim()
      const end = value.slice(sep + 3).trim()
      const startFmt = formatDateSafe(start, localeTag, timezone) ?? start
      const endFmt = formatDateSafe(end, localeTag, timezone) ?? end
      return `${startFmt} ? ${endFmt}`
    }

    const keyLower = key.toLowerCase()
    if (keyLower.endsWith('at') || keyLower.includes('date') || keyLower.includes('time')) {
      const formatted = formatDateSafe(value, localeTag, timezone)
      if (formatted) return formatted
    }
    return value
  }

  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

function isFromToChange(value: unknown): value is { from?: unknown; to?: unknown } {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  return Object.prototype.hasOwnProperty.call(value, 'from') || Object.prototype.hasOwnProperty.call(value, 'to')
}

export function renderChangesAsRows(
  changes: Record<string, unknown>,
  localeTag: string,
  timezone?: string,
): Array<{ label: string; value: string }> {
  const isFr = localeTag.toLowerCase().startsWith('fr')
  const rows: Array<{ label: string; value: string }> = []

  for (const [key, value] of Object.entries(changes)) {
    if (key === 'action') continue
    if (value === null || value === undefined) continue

    const labelDef = FIELD_LABEL_MAP[key]
    const label = labelDef ? (isFr ? labelDef.fr : labelDef.en) : humanizeIdentifier(key, localeTag)

    if (isFromToChange(value)) {
      const beforeLabel = isFr ? 'Avant' : 'Before'
      const afterLabel = isFr ? 'Apres' : 'After'
      rows.push({
        label,
        value: `${beforeLabel}: ${formatFieldValue('from', value.from, localeTag, timezone)} | ${afterLabel}: ${formatFieldValue('to', value.to, localeTag, timezone)}`,
      })
      continue
    }

    rows.push({ label, value: formatFieldValue(key, value, localeTag, timezone) })
  }

  return rows
}
