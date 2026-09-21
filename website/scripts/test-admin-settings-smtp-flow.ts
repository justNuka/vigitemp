import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import path from "node:path"

const websiteRoot = process.cwd()
const repoRoot = path.resolve(websiteRoot, "..")

const readWebsite = (relativePath: string) =>
  readFileSync(path.join(websiteRoot, relativePath), "utf8")
const readRepo = (relativePath: string) =>
  readFileSync(path.join(repoRoot, relativePath), "utf8")

const settingsClient = readWebsite(
  "src/app/[locale]/(admin)/admin/parametres/_components/settings-client.tsx",
)
for (const tab of ["general", "security", "alerts", "services"]) {
  assert.ok(
    settingsClient.includes(`<TabsTrigger value="${tab}"`),
    `Missing settings tab: ${tab}`,
  )
}

const smtpCard = readWebsite(
  "src/app/[locale]/(admin)/admin/parametres/_components/smtp-settings-card.tsx",
)
assert.ok(smtpCard.includes("patchJson"))
assert.ok(smtpCard.includes('variant="destructive"'))
assert.ok(smtpCard.includes("onOpenSmtpGuide"))
assert.ok(
  smtpCard.indexOf("onOpenSmtpGuide") !== -1,
  "SMTP guide must remain available independently from activation",
)

const smtpModal = readWebsite(
  "src/app/[locale]/(admin)/admin/parametres/_components/smtp-config-modal.tsx",
)
assert.ok(
  smtpModal.includes("/api/admin/configuration-smtp/verification/request"),
)
assert.ok(
  smtpModal.includes("/api/admin/configuration-smtp/verification/confirm"),
)
assert.ok(smtpModal.includes("save_and_send"))

const smtpRoute = readWebsite(
  "src/app/api/admin/configuration-smtp/route.ts",
)
assert.ok(smtpRoute.includes("export const PATCH"))
assert.ok(smtpRoute.includes("setSmtpConfirmed(false)"))
assert.ok(smtpRoute.includes("verificationRequired"))

const emailEngine = readWebsite("src/lib/email.ts")
assert.ok(emailEngine.includes("config.confirmed"))
assert.ok(emailEngine.includes("smtp_configuration_unconfirmed"))

const mysqlSeed = readRepo("db/vigisensys_seed.sql")
const mssqlSeed = readRepo("db/vigisensys_seed_mssql.sql")
assert.ok(mysqlSeed.includes("'SMTP_CONFIRME','false'"))
assert.ok(mssqlSeed.includes("N'SMTP_CONFIRME', N'false'"))

console.log("admin-settings-smtp-flow: OK")
