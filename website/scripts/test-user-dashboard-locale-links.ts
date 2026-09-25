import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"

import { buildLocalizedPath } from "../src/i18n/pathnames"

const root = process.cwd()
const read = (relative: string) => fs.readFileSync(path.join(root, relative), "utf8")

const pageHeader = read("src/components/page-header-base.tsx")
assert.ok(pageHeader.includes('from "@/i18n/navigation"'))
assert.ok(!pageHeader.includes('<Link href="alarmes"'))
assert.equal(
  pageHeader.split('<Link href="/alarmes"').length - 1,
  2,
  "Both alarm header links must use the canonical localized pathname",
)

const activeAlarmsSection = read(
  "src/app/[locale]/(dashboard)/_components/dashboard/dashboard-active-alarms-section.tsx",
)
assert.ok(activeAlarmsSection.includes('from "@/i18n/navigation"'))
assert.ok(activeAlarmsSection.includes('<Link href="/alarmes">'))

assert.equal(buildLocalizedPath("/alarmes", "fr"), "/fr/alarmes")
assert.equal(buildLocalizedPath("/alarmes", "en"), "/en/alarms")

console.log("user-dashboard-locale-links: OK")
