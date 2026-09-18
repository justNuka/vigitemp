import { prisma } from "@/lib/prisma"
import { serializeStoredDbDateTime } from "@/lib/date-display"
import { log } from "@/lib/logger"
import {
  ALARM_EMAIL_AUDIT_TYPE,
  mapEmailAuditNotification,
  SYSTEM_EMAIL_AUDIT_TYPE,
  type SystemEmailAuditPayload,
} from "@/lib/email-audit-payload"
import type {
  EmailAuditList,
  EmailAuditStatus,
  EmailSendAuditMetadata,
} from "@/types/email-audit"

type RecordEmailAuditInput = {
  metadata: EmailSendAuditMetadata
  status: Extract<EmailAuditStatus, "sent" | "failed" | "skipped">
  recipient: string
  ccRecipients: string[]
  subject: string
  attempts: number
  lastError?: string | null
}

export async function recordSystemEmailAudit(input: RecordEmailAuditInput) {
  const payload: SystemEmailAuditPayload = {
    version: 1,
    kind: input.metadata.kind,
    status: input.status,
    recipient: input.recipient.slice(0, 500),
    ccRecipients: input.ccRecipients.map((value) => value.slice(0, 320)),
    attempts: Math.max(0, Math.floor(input.attempts)),
    lastError: input.lastError?.slice(0, 500) ?? null,
    context: input.metadata.context?.slice(0, 250) ?? null,
  }

  await prisma.t_notification.create({
    data: {
      Type: SYSTEM_EMAIL_AUDIT_TYPE,
      Id_Alarme: null,
      Titre: input.subject.slice(0, 128),
      Message: `email-audit:${input.metadata.kind}`.slice(0, 512),
      Payload_Json: JSON.stringify(payload),
      Priorite: 0,
      Est_Archive: true,
    },
  })
}

export async function recordSystemEmailAuditSafely(input: RecordEmailAuditInput) {
  try {
    await recordSystemEmailAudit(input)
  } catch (error) {
    log.warn("EMAIL_AUDIT", "email_audit_persistence_failed", {
      kind: input.metadata.kind,
      status: input.status,
      error: error instanceof Error ? error.message : String(error),
    })
  }
}

export async function getSystemEmailAudit(limit = 50): Promise<EmailAuditList> {
  const safeLimit = Math.max(1, Math.min(100, Math.floor(limit) || 50))

  const rows = await prisma.t_notification.findMany({
    where: {
      Type: {
        in: [ALARM_EMAIL_AUDIT_TYPE, SYSTEM_EMAIL_AUDIT_TYPE],
      },
    },
    orderBy: [{ Date_Creation: "desc" }, { Id_Notification: "desc" }],
    take: safeLimit,
    select: {
      Id_Notification: true,
      Type: true,
      Id_Alarme: true,
      Titre: true,
      Payload_Json: true,
      Date_Creation: true,
    },
  })

  return {
    limit: safeLimit,
    items: rows.map((row) =>
      mapEmailAuditNotification({
        id: row.Id_Notification,
        type: row.Type,
        alarmId: row.Id_Alarme,
        subject: row.Titre,
        payloadJson: row.Payload_Json,
        createdAt: serializeStoredDbDateTime(row.Date_Creation),
      }),
    ),
  }
}
