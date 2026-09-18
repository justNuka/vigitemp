import type {
  EmailAuditEntry,
  EmailAuditKind,
  EmailAuditStatus,
  EmailSendAuditMetadata,
} from "@/types/email-audit"

export const SYSTEM_EMAIL_AUDIT_TYPE = "SYSTEM_EMAIL_AUDIT"
export const ALARM_EMAIL_AUDIT_TYPE = "ALARM_EMAIL"

export type SystemEmailAuditPayload = {
  version: 1
  kind: EmailSendAuditMetadata["kind"]
  status: "sent" | "failed" | "skipped"
  recipient: string
  ccRecipients: string[]
  attempts: number
  lastError: string | null
  context: string | null
}

type AlarmEmailAuditPayload = {
  version?: number
  status?: string
  attempts?: number
  recipient?: string
  ccRecipients?: unknown
  lastError?: string | null
  input?: {
    eventType?: string
    lieu?: string | null
    alarmId?: number | null
  }
}

type AuditNotificationRow = {
  id: number
  type: string
  subject: string | null
  createdAt: string | null
  alarmId: number | null
  payloadJson: string | null
}

const VALID_STATUSES = new Set<EmailAuditStatus>([
  "queued",
  "sending",
  "sent",
  "failed",
  "skipped",
  "unknown",
])

const VALID_KINDS = new Set<EmailAuditKind>([
  "alarm_triggered",
  "alarm_ended",
  "alarm_acknowledged",
  "password_reset",
  "account_creation",
  "smtp_test",
  "monthly_statistics",
  "hardware_order",
  "other",
])

function parseJson(raw: string | null): unknown {
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function normalizeStatus(value: unknown): EmailAuditStatus {
  return typeof value === "string" && VALID_STATUSES.has(value as EmailAuditStatus)
    ? (value as EmailAuditStatus)
    : "unknown"
}

function normalizeKind(value: unknown): EmailAuditKind {
  return typeof value === "string" && VALID_KINDS.has(value as EmailAuditKind)
    ? (value as EmailAuditKind)
    : "other"
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && item.length > 0)
    : []
}

function alarmKind(eventType: unknown): EmailAuditKind {
  if (eventType === "triggered") return "alarm_triggered"
  if (eventType === "ended") return "alarm_ended"
  if (eventType === "acknowledged") return "alarm_acknowledged"
  return "other"
}

export function mapEmailAuditNotification(row: AuditNotificationRow): EmailAuditEntry {
  const parsed = parseJson(row.payloadJson)

  if (row.type === ALARM_EMAIL_AUDIT_TYPE) {
    const payload = (parsed && typeof parsed === "object" ? parsed : {}) as AlarmEmailAuditPayload

    return {
      id: row.id,
      createdAt: row.createdAt,
      kind: alarmKind(payload.input?.eventType),
      status: normalizeStatus(payload.status),
      recipient: typeof payload.recipient === "string" ? payload.recipient : "",
      ccRecipients: stringArray(payload.ccRecipients),
      subject: row.subject ?? "",
      attempts:
        typeof payload.attempts === "number" && Number.isFinite(payload.attempts)
          ? Math.max(0, Math.floor(payload.attempts))
          : 0,
      lastError: typeof payload.lastError === "string" ? payload.lastError : null,
      context:
        typeof payload.input?.lieu === "string" && payload.input.lieu.trim()
          ? payload.input.lieu.trim()
          : null,
      alarmId:
        row.alarmId ??
        (typeof payload.input?.alarmId === "number" && Number.isFinite(payload.input.alarmId)
          ? payload.input.alarmId
          : null),
    }
  }

  const payload =
    parsed && typeof parsed === "object"
      ? (parsed as Partial<SystemEmailAuditPayload>)
      : {}

  return {
    id: row.id,
    createdAt: row.createdAt,
    kind: normalizeKind(payload.kind),
    status: normalizeStatus(payload.status),
    recipient: typeof payload.recipient === "string" ? payload.recipient : "",
    ccRecipients: stringArray(payload.ccRecipients),
    subject: row.subject ?? "",
    attempts:
      typeof payload.attempts === "number" && Number.isFinite(payload.attempts)
        ? Math.max(0, Math.floor(payload.attempts))
        : 0,
    lastError: typeof payload.lastError === "string" ? payload.lastError : null,
    context:
      typeof payload.context === "string" && payload.context.trim()
        ? payload.context.trim()
        : null,
    alarmId: row.alarmId,
  }
}
