import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"

const root = process.cwd()
const read = (relative: string) => fs.readFileSync(path.join(root, relative), "utf8")

const credentials = read("src/app/[locale]/login/_components/login-credentials-form.tsx")
assert.match(credentials, /EyeOff/)
assert.match(credentials, /Eye/)
assert.match(credentials, /getModifierState\("CapsLock"\)/)
assert.match(credentials, /capsLockWarning/)
assert.match(credentials, /type=\{showPassword \? "text" : "password"\}/)

const loginRoute = read("src/app/api/auth/login/route.ts")
assert.match(loginRoute, /isBetterAuthRuntimeEnabled\(\) \? "new" : "legacy"/)
assert.doesNotMatch(loginRoute, /better-auth-transition/)

const auditConfig = read("src/app/[locale]/(admin)/admin/audit/_components/audit-action-config.ts")
for (const code of ["GRPH", "MAIL", "ALARM_RESOLVED", "ETAP", "VLOG", "FERMSURV", "IMP", "PLAN", "TEL", "UT"]) {
  assert.match(auditConfig, new RegExp(`\\b${code}:`), `Missing audit action config for ${code}`)
}

const auditApi = read("src/app/api/audit/route.ts")
assert.match(auditApi, /Math\.min\(Math\.max\(rawLimit, 1\), 1000\)/)
assert.match(auditApi, /const skip = \(page - 1\) \* limit/)
assert.match(auditApi, /paginated = searchParams\.get\("paginated"\) === "1"/)
assert.match(auditApi, /prismaMesure\.tm_journal\.count\(\{ where \}\)/)
assert.match(auditApi, /pagination:/)

const auditPage = read("src/app/[locale]/(admin)/admin/audit/page.tsx")
assert.match(auditPage, /<AuditClient \/>/)
assert.doesNotMatch(auditPage, /loadRecentAuditLogs\(100\)/)

const auditClient = read("src/app/[locale]/(admin)/admin/audit/audit-client.tsx")
assert.match(auditClient, /manualPagination/)
assert.match(auditClient, /limit: String\(pagination\.pageSize\)/)
assert.match(auditClient, /page: String\(pagination\.pageIndex \+ 1\)/)
assert.match(auditClient, /max-h-\[min\(60vh,30rem\)\]/)
assert.match(auditClient, /renderChangesAsRows\(changesJson, localeTag, timezone, t\)/)

const codesRoute = read("src/app/api/audit/codes/route.ts")
assert.match(codesRoute, /distinct: \["Code_Journal"\]/)
assert.match(codesRoute, /configuredCodes/)
assert.match(codesRoute, /journalCodes/)

const helpers = read("src/app/[locale]/(admin)/admin/audit/_components/audit-client-helpers.ts")
assert.match(helpers, /authEngine/)
assert.match(helpers, /auth_legacy/)
assert.match(helpers, /auth_new/)
assert.match(helpers, /details\.fields\./)
assert.match(helpers, /details\.values\./)
assert.match(helpers, /email_event/)

const alarmEmail = read("src/lib/alarm-email.ts")
const sentUpdateIndex = alarmEmail.indexOf('status: "sent"')
const mailAuditIndex = alarmEmail.indexOf('log.audit("MAIL"')
assert.ok(sentUpdateIndex >= 0 && mailAuditIndex > sentUpdateIndex, "MAIL audit must occur only after a sent state")
assert.match(alarmEmail, /lieuId: deliveredInput\.idLieu \?\? undefined/)
assert.match(alarmEmail, /emailEvent: deliveredInput\.eventType/)
assert.match(alarmEmail, /emailStatus: "sent"/)

const locationAudit = read("src/app/api/lieux/[id]/audit/route.ts")
assert.match(locationAudit, /MAIL: "Email d'alarme envoyé"/)
assert.match(locationAudit, /GRPH: "Ouverture d'un graphique"/)

for (const language of ["fr", "en"]) {
  const messages = JSON.parse(read(`src/messages/${language}.json`))
  assert.ok(messages.login?.fields?.show_password)
  assert.ok(messages.login?.fields?.hide_password)
  assert.ok(messages.login?.fields?.caps_lock_warning)
  assert.ok(messages.audit?.actions?.GRPH)
  assert.ok(messages.audit?.actions?.MAIL)
  assert.ok(messages.audit?.details?.fields?.authEngine)
  assert.equal(messages.audit?.details?.values?.auth_legacy, "legacy")
  assert.equal(messages.audit?.details?.values?.auth_new, "new")
  assert.ok(messages.audit?.details?.values?.email_triggered)
  assert.ok(messages.audit?.details?.values?.email_ended)
  assert.ok(messages.audit?.details?.values?.email_acknowledged)
}

console.log("login-audit-trail: OK")
