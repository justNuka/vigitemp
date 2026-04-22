import type { AuditLog } from '@/lib/api'
import { parseDbDateTime } from '@/lib/date-display'

export interface AuditCode {
  Code_Journal: string
  Commentaire: string | null
}

export interface AuditLogRow {
  id: string
  timestamp: string | Date
  action: string
  userId: string | null
  details: string | null
}

type ParsedDetails = {
  title: string
  subtitle?: string
  raw?: string
}

function joinParts(parts: string[], separator = ' - ') {
  return parts.filter(Boolean).join(separator)
}

export function formatDateSafe(value: string, localeTag: string, timezone?: string): string | null {
  const date = parseDbDateTime(value)
  if (!date) return null
  if (Number.isNaN(date.getTime())) return null

  return date.toLocaleString(localeTag, {
    ...(timezone ? { timeZone: timezone } : {}),
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
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

  const rawTitle = joinParts([resource, idPart], ' ').trim()
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
      const fromText = from !== undefined ? t('details.from', { value: String(from) }) : ''
      const toText = to !== undefined ? t('details.to', { value: String(to) }) : ''
      subtitleParts.push(joinParts([fromText, toText]))
    }

    if (action && subtitleParts.length === 0) {
      subtitleParts.push(t('details.action', { action }))
    }
  }

  if (ip && !subtitleParts.some((part) => part.startsWith('IP:')) && !title.startsWith('IP:')) {
    subtitleParts.push(t('details.ip', { ip }))
  }

  if (subtitleParts.length === 0 && normalizedDetails !== title) {
    if (!(normalizedDetails.startsWith('IP:') && (ip || title.startsWith('IP:')))) {
      subtitleParts.push(normalizedDetails)
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
      log.userId?.toLowerCase().includes(query)
    )
  })
}

export function toAuditTableData(logs: AuditLog[]): AuditLogRow[] {
  return logs.map((log) => ({
    id: log.id,
    timestamp: log.timestamp,
    action: log.action,
    userId: log.userId,
    details: log.details,
  }))
}

// ─── Human-readable expanded details ────────────────────────────────────────

const FIELD_LABEL_MAP: Record<string, { fr: string; en: string }> = {
  // CONNEXION / DECONNEXION
  address: { fr: 'Adresse', en: 'Address' },
  connectedAt: { fr: 'Connecté le', en: 'Connected at' },
  machineName: { fr: 'Machine', en: 'Machine' },
  // AIM (analyse d'impact)
  newToleranceSup: { fr: 'Tolérance sup.', en: 'Upper tolerance' },
  newToleranceInf: { fr: 'Tolérance inf.', en: 'Lower tolerance' },
  simAlarms: { fr: 'Alarmes simulées', en: 'Simulated alarms' },
  realAlarms: { fr: 'Alarmes réelles', en: 'Real alarms' },
  dateRange: { fr: 'Période', en: 'Period' },
  // ACQ
  alarmId: { fr: 'N° alarme', en: 'Alarm #' },
  acknowledgedAt: { fr: 'Acquitté le', en: 'Acknowledged at' },
  // Champs génériques de changement (CF, CR, CS, config.change)
  from: { fr: 'Avant', en: 'Before' },
  to: { fr: 'Après', en: 'After' },
  forced: { fr: 'Forcé', en: 'Forced' },
  description: { fr: 'Description', en: 'Description' },
  format: { fr: 'Format', en: 'Format' },
  // Noms de champs Prisma / DB dans les entrées CC
  Nom_Lieu: { fr: 'Nom du lieu', en: 'Location name' },
  Tolerance_Sup: { fr: 'Tolérance sup.', en: 'Upper tolerance' },
  Tolerance_Inf: { fr: 'Tolérance inf.', en: 'Lower tolerance' },
  Consigne_Sup: { fr: 'Consigne sup.', en: 'Upper setpoint' },
  Consigne_Inf: { fr: 'Consigne inf.', en: 'Lower setpoint' },
  Est_Son_Alarme_Active: { fr: "Son d'alarme", en: 'Alarm sound' },
  Nom_Sonde: { fr: 'Nom de la sonde', en: 'Sensor name' },
  Frequence_Mesure: { fr: 'Fréquence mesure (s)', en: 'Measurement freq. (s)' },
  Retard_Alarme: { fr: "Retard d'alarme (s)", en: 'Alarm delay (s)' },
  Hysteresis: { fr: 'Hystérésis', en: 'Hysteresis' },
}

function formatFieldValue(
  key: string,
  value: unknown,
  localeTag: string,
  timezone?: string,
): string {
  if (value === null || value === undefined) return '—'

  if (typeof value === 'boolean') {
    return localeTag.startsWith('fr') ? (value ? 'Oui' : 'Non') : (value ? 'Yes' : 'No')
  }

  if (typeof value === 'number') return String(value)

  if (typeof value === 'string') {
    // Plage de dates : "ISO_START → ISO_END"
    if (value.includes(' → ')) {
      const sep = value.indexOf(' → ')
      const start = value.slice(0, sep).trim()
      const end = value.slice(sep + 3).trim()
      const startFmt = formatDateSafe(start, localeTag, timezone) ?? start
      const endFmt = formatDateSafe(end, localeTag, timezone) ?? end
      return `${startFmt} → ${endFmt}`
    }
    // Chaînes ISO pour les clés à connotation temporelle
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

/**
 * Convertit un objet `changes` (extrait du JSON d'audit) en liste de paires
 * label / valeur lisibles, pour l'affichage dans la ligne expandée.
 */
export function renderChangesAsRows(
  changes: Record<string, unknown>,
  localeTag: string,
  timezone?: string,
): Array<{ label: string; value: string }> {
  const isFr = localeTag.toLowerCase().startsWith('fr')
  const rows: Array<{ label: string; value: string }> = []

  for (const [key, value] of Object.entries(changes)) {
    // On saute le champ synthétique 'action' (create/update/delete) — déjà
    // visible via le badge d'action et le titre de ressource
    if (key === 'action') continue
    if (value === null || value === undefined) continue

    const labelDef = FIELD_LABEL_MAP[key]
    const label = labelDef ? (isFr ? labelDef.fr : labelDef.en) : key
    rows.push({ label, value: formatFieldValue(key, value, localeTag, timezone) })
  }

  return rows
}
