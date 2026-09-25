import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"

import { buildLocalizedPath } from "../src/i18n/pathnames"

const root = process.cwd()
const read = (relative: string) => fs.readFileSync(path.join(root, relative), "utf8")

const dashboardLinkCard = read("src/components/dashboard-link-card.tsx")
assert.match(dashboardLinkCard, /from "@\/i18n\/navigation"/)
assert.doesNotMatch(dashboardLinkCard, /from "next\/link"/)
assert.match(dashboardLinkCard, /href=\{href as never\}/)

const adminDashboard = read("src/app/[locale]/(admin)/admin/page.tsx")
for (const route of [
  "/admin/sondes",
  "/admin/modules",
  "/admin/actionneurs",
  "/admin/groupes",
  "/admin/lieux",
  "/admin/sites",
  "/admin/outils",
]) {
  assert.ok(
    adminDashboard.includes(`href: \`${route}\``) || adminDashboard.includes(`href: "${route}"`),
    `Missing canonical admin dashboard route ${route}`,
  )
}

assert.equal(buildLocalizedPath("/admin/sondes", "fr"), "/fr/admin/sondes")
assert.equal(buildLocalizedPath("/admin/sondes", "en"), "/en/admin/sensors")
assert.equal(buildLocalizedPath("/admin/groupes", "fr"), "/fr/admin/groupes")
assert.equal(buildLocalizedPath("/admin/groupes", "en"), "/en/admin/groups")
assert.equal(buildLocalizedPath("/admin/lieux", "fr"), "/fr/admin/lieux")
assert.equal(buildLocalizedPath("/admin/lieux", "en"), "/en/admin/locations")
assert.equal(buildLocalizedPath("/admin/outils", "fr"), "/fr/admin/outils")
assert.equal(buildLocalizedPath("/admin/outils", "en"), "/en/admin/tools")

console.log("admin-dashboard-locale-links: OK")
