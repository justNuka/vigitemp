export type EmailAuditKind =
  | "alarm_triggered"
  | "alarm_ended"
  | "alarm_acknowledged"
  | "password_reset"
  | "account_creation"
  | "smtp_test"
  | "monthly_statistics"
  | "hardware_order"
  | "other"

export type EmailAuditStatus =
  | "queued"
  | "sending"
  | "sent"
  | "failed"
  | "skipped"
  | "unknown"

export type EmailAuditEntry = {
  id: number
  createdAt: string | null
  kind: EmailAuditKind
  status: EmailAuditStatus
  recipient: string
  ccRecipients: string[]
  subject: string
  attempts: number
  lastError: string | null
  context: string | null
  alarmId: number | null
}

export type EmailAuditList = {
  items: EmailAuditEntry[]
  limit: number
}

export type EmailSendAuditMetadata = {
  kind: Exclude<
    EmailAuditKind,
    "alarm_triggered" | "alarm_ended" | "alarm_acknowledged"
  >
  context?: string | null
}
