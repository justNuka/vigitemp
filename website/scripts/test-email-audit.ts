import assert from "node:assert/strict"

import {
  mapEmailAuditNotification,
  SYSTEM_EMAIL_AUDIT_TYPE,
} from "../src/lib/email-audit-payload"

const generic = mapEmailAuditNotification({
  id: 10,
  type: SYSTEM_EMAIL_AUDIT_TYPE,
  alarmId: null,
  subject: "VigiSensys - Test configuration email",
  createdAt: "2026-09-18T09:15:00",
  payloadJson: JSON.stringify({
    version: 1,
    kind: "smtp_test",
    status: "sent",
    recipient: "admin@example.test",
    ccRecipients: ["audit@example.test"],
    attempts: 1,
    lastError: null,
    context: null,
  }),
})

assert.deepEqual(generic, {
  id: 10,
  createdAt: "2026-09-18T09:15:00",
  kind: "smtp_test",
  status: "sent",
  recipient: "admin@example.test",
  ccRecipients: ["audit@example.test"],
  subject: "VigiSensys - Test configuration email",
  attempts: 1,
  lastError: null,
  context: null,
  alarmId: null,
})

const alarm = mapEmailAuditNotification({
  id: 11,
  type: "ALARM_EMAIL",
  alarmId: null,
  subject: "[VIGISENSYS] ALARME DECLENCHEE - Chambre froide",
  createdAt: "2026-09-18T09:16:00",
  payloadJson: JSON.stringify({
    version: 1,
    status: "failed",
    attempts: 3,
    recipient: "quality@example.test",
    ccRecipients: [],
    lastError: "SMTP timeout",
    input: {
      eventType: "triggered",
      lieu: "Chambre froide",
      alarmId: 42,
    },
  }),
})

assert.equal(alarm.kind, "alarm_triggered")
assert.equal(alarm.status, "failed")
assert.equal(alarm.attempts, 3)
assert.equal(alarm.context, "Chambre froide")
assert.equal(alarm.alarmId, 42)
assert.equal(alarm.lastError, "SMTP timeout")

const malformed = mapEmailAuditNotification({
  id: 12,
  type: SYSTEM_EMAIL_AUDIT_TYPE,
  alarmId: null,
  subject: null,
  createdAt: null,
  payloadJson: "{invalid",
})

assert.equal(malformed.kind, "other")
assert.equal(malformed.status, "unknown")
assert.equal(malformed.recipient, "")
assert.equal(malformed.attempts, 0)

console.log("email-audit: OK")
