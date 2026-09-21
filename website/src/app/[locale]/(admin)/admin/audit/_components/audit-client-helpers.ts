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

type AuditTranslator = (key: string, values?: Record<string, string | number>) => string

const RESOURCE_TRANSLATION_KEYS: Record<string, string> = {
  'dashboard:audit_graph_openings': 'details.resources.audit_graph_openings',
}

const FIELD_TRANSLATION_KEYS: Record<string, string> = {
  address: 'details.fields.address',
  connectedAt: 'details.fields.connectedAt',
  machineName: 'details.fields.machineName',
  authEngine: 'details.fields.authEngine',
  newToleranceSup: 'details.fields.newToleranceSup',
  newToleranceInf: 'details.fields.newToleranceInf',
  simAlarms: 'details.fields.simAlarms',
  realAlarms: 'details.fields.realAlarms',
  dateRange: 'details.fields.dateRange',
  alarmId: 'details.fields.alarmId',
  acknowledgedAt: 'details.fields.acknowledgedAt',
  from: 'details.fields.from',
  to: 'details.fields.to',
  forced: 'details.fields.forced',
  description: 'details.fields.description',
  format: 'details.fields.format',
  Nom_Lieu: 'details.fields.Nom_Lieu',
  Tolerance_Sup: 'details.fields.Tolerance_Sup',
  Tolerance_Inf: 'details.fields.Tolerance_Inf',
  Consigne_Sup: 'details.fields.Consigne_Sup',
  Consigne_Inf: 'details.fields.Consigne_Inf',
  Est_Son_Alarme_Active: 'details.fields.Est_Son_Alarme_Active',
  Nom_Sonde: 'details.fields.Nom_Sonde',
  Frequence_Mesure: 'details.fields.Frequence_Mesure',
  Retard_Alarme: 'details.fields.Retard_Alarme',
  Hysteresis: 'details.fields.Hysteresis',
  disabled: 'details.fields.disabled',
  durationMinutes: 'details.fields.durationMinutes',
  reactivationAt: 'details.fields.reactivationAt',
  updated: 'details.fields.updated',
  lieuIds: 'details.fields.lieuIds',
  groupOrLiaisonId: 'details.fields.groupOrLiaisonId',
  emailEvent: 'details.fields.emailEvent',
  emailStatus: 'details.fields.emailStatus',
  recipient: 'details.fields.recipient',
  attempts: 'details.fields.attempts',
  usedSystemFallback: 'details.fields.usedSystemFallback',
}

function joinParts(parts: string[], separator = ' - ') {
  return parts.filter(Boolean).join(separator)
}

function humanizeIdentifier(value: string, localeTag: string, t?: AuditTranslator): string {
  const normalized = value.trim().toLowerCase()
  const translationKey = RESOURCE_TRANSLATION_KEYS[normalized]
  if (translationKey && t) return t(translationKey)

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
    ? humanizeIdentifier(resource, localeTag, t)
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
      const fromText = from !== undefined ? t('details.from', { value: formatFieldValue('from', from, localeTag, timezone, t) }) : ''
      const toText = to !== undefined ? t('details.to', { value: formatFieldValue('to', to, localeTag, timezone, t) }) : ''
      subtitleParts.push(joinParts([fromText, toText]))
    }

    if (action && subtitleParts.length === 0) {
      subtitleParts.push(t('details.action', { action: formatFieldValue('action', action, localeTag, timezone, t) }))
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


function formatFieldValue(
  key: string,
  value: unknown,
  localeTag: string,
  timezone?: string,
  t?: AuditTranslator,
): string {
  if (value === null || value === undefined) return '-'

  if (typeof value === 'boolean') {
    if (t) return t(value ? 'details.values.yes' : 'details.values.no')
    return localeTag.startsWith('fr') ? (value ? 'Oui' : 'Non') : (value ? 'Yes' : 'No')
  }

  if (typeof value === 'number') {
    if (Number.isInteger(value)) return String(value)
    return formatNumber(value, { locale: localeTag, maximumDecimals: 4 })
  }

  if (Array.isArray(value)) {
    return value.map((item) => formatFieldValue(key, item, localeTag, timezone, t)).join(', ')
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
    const normalizedValue = value.trim().toLowerCase()
    if (t && key === 'authEngine') {
      if (normalizedValue === 'legacy') return t('details.values.auth_legacy')
      if (['new', 'better-auth', 'better-auth-transition'].includes(normalizedValue)) {
        return t('details.values.auth_new')
      }
    }
    if (t && key === 'action') {
      const actionKey = ['create', 'update', 'delete', 'enable', 'disable'].includes(normalizedValue)
        ? `details.values.action_${normalizedValue}`
        : null
      if (actionKey) return t(actionKey)
    }
    if (t && key === 'emailEvent') {
      if (['triggered', 'ended', 'acknowledged'].includes(normalizedValue)) {
        return t(`details.values.email_${normalizedValue}`)
      }
    }
    if (t && key === 'emailStatus' && normalizedValue === 'sent') {
      return t('details.values.email_sent')
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
  t?: AuditTranslator,
): Array<{ label: string; value: string }> {
  const isFr = localeTag.toLowerCase().startsWith('fr')
  const rows: Array<{ label: string; value: string }> = []

  for (const [key, value] of Object.entries(changes)) {
    if (key === 'action') continue
    if (value === null || value === undefined) continue

    const labelKey = FIELD_TRANSLATION_KEYS[key]
    const label = labelKey && t ? t(labelKey) : humanizeIdentifier(key, localeTag, t)

    if (isFromToChange(value)) {
      const beforeLabel = t ? t('details.values.before') : (isFr ? 'Avant' : 'Before')
      const afterLabel = t ? t('details.values.after') : (isFr ? 'Après' : 'After')
      rows.push({
        label,
        value: `${beforeLabel}: ${formatFieldValue('from', value.from, localeTag, timezone, t)} | ${afterLabel}: ${formatFieldValue('to', value.to, localeTag, timezone, t)}`,
      })
      continue
    }

    rows.push({ label, value: formatFieldValue(key, value, localeTag, timezone, t) })
  }

  return rows
}
