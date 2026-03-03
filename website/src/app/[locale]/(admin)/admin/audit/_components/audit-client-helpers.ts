import type { AuditLog } from '@/lib/api'

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
  targetType: string | null
  targetId: string | null
}

type ParsedDetails = {
  title: string
  subtitle?: string
  raw?: string
}

export function formatDateSafe(value: string, localeTag: string, timezone?: string): string | null {
  const date = new Date(value)
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
  const parts = normalizedDetails.split('|').map((part) => part.trim()).filter(Boolean)
  const resource = parts[0] || ''
  const idPart = parts.find((part) => part.startsWith('#')) || ''
  const ipPart = parts.find((part) => part.toLowerCase().startsWith('ip:'))
  let ip = ipPart ? ipPart.replace(/^IP:\s*/i, '').trim() : ''
  if (ip.startsWith('::ffff:')) ip = ip.replace('::ffff:', '')

  let changes: Record<string, unknown> | null = null
  const jsonPart = parts.find((part) => part.startsWith('{') && part.endsWith('}'))
  if (jsonPart) {
    try {
      changes = JSON.parse(jsonPart)
    } catch {
      changes = null
    }
  }

  const rawTitle = [resource, idPart].filter(Boolean).join(' ').trim()
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
      subtitleParts.push([machine, addressText].filter(Boolean).join(' • '))
    }
    if (connectedAt) {
      const formatted = formatDateSafe(connectedAt, localeTag, timezone)
      if (formatted) subtitleParts.push(t('details.connection', { date: formatted }))
    }
    if (from !== undefined || to !== undefined) {
      const fromText = from !== undefined ? t('details.from', { value: String(from) }) : ''
      const toText = to !== undefined ? t('details.to', { value: String(to) }) : ''
      subtitleParts.push([fromText, toText].filter(Boolean).join(' ? '))
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

  return { title, subtitle: subtitleParts.join(' • '), raw: normalizedDetails }
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
    targetType: log.targetType,
    targetId: log.targetId,
  }))
}
