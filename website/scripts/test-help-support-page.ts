import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"

import {
  enHelpSupportSupplements,
  frHelpSupportSupplements,
} from "../src/messages/help-support-supplements"
import {
  VIGISENSYS_SUPPORT_EMAIL,
  VIGISENSYS_SUPPORT_PHONE,
} from "../src/lib/support-contact"

const root = process.cwd()
const read = (relative: string) => fs.readFileSync(path.join(root, relative), "utf8")

const routing = read("src/i18n/routing.ts")
assert.match(routing, /'\/help'/)
assert.match(routing, /fr: '\/aide'/)
assert.match(routing, /en: '\/help'/)

const request = read("src/i18n/request.ts")
assert.match(request, /helpSupportSupplementForLocale/)
assert.match(request, /messagesWithHelpSupport/)

const sidebar = read("src/components/app-sidebar.tsx")
assert.match(sidebar, /href="\/help"/)
assert.match(sidebar, /nav-hotline-help/)
assert.match(sidebar, /hotline_help/)

const page = read("src/app/[locale]/(dashboard)/help/help-support-page-client.tsx")
assert.match(page, /mailtoHref/)
assert.match(page, /WEB_APP_VERSION/)
assert.match(page, /unassignedSensor/)
assert.match(page, /acknowledgeAlarm/)
assert.match(page, /pauseMonitoring/)
assert.match(page, /viewHistory/)
assert.match(page, /VIGISENSYS_SUPPORT_EMAIL/)
assert.match(page, /VIGISENSYS_SUPPORT_PHONE/)

assert.equal(VIGISENSYS_SUPPORT_EMAIL, "contact@mc2lab.fr")
assert.equal(VIGISENSYS_SUPPORT_PHONE.display, "04 73 28 99 99")
assert.equal(VIGISENSYS_SUPPORT_PHONE.href, "+33473289999")

function flattenKeys(value: unknown, prefix = ""): string[] {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return prefix ? [prefix] : []
  }

  return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) => {
    const next = prefix ? `${prefix}.${key}` : key
    if (child && typeof child === "object" && !Array.isArray(child)) {
      return flattenKeys(child, next)
    }
    return [next]
  })
}

assert.deepEqual(
  flattenKeys(frHelpSupportSupplements).sort(),
  flattenKeys(enHelpSupportSupplements).sort(),
  "FR and EN Hotline/help catalogs must expose the same keys",
)

assert.ok(frHelpSupportSupplements.helpSupport)
assert.ok(enHelpSupportSupplements.helpSupport)

console.log("help-support-page: OK")
