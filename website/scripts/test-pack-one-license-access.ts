import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"

import { getDefaultLocationFormData } from "../src/app/[locale]/(admin)/admin/lieux/_components/location-form-defaults"
import {
  prepareLocationPayloadForLicense,
  STANDARD_METROLOGY_LOCATION_FIELDS,
} from "../src/lib/location-license-payload"
import { hasApplicationEmailAccess } from "../src/lib/license-access"

const root = process.cwd()
const read = (relative: string) => fs.readFileSync(path.join(root, relative), "utf8")

const defaults = getDefaultLocationFormData()
assert.equal(defaults.EMT_Mode, "sans-objet")
assert.equal(defaults.Corriger_Erreur_Justesse, false)
assert.equal(defaults.Prendre_En_Compte_Derive, false)

assert.equal(hasApplicationEmailAccess({ edition: "pack", options: [] }), false)
assert.equal(hasApplicationEmailAccess({ edition: "pack", options: ["mail"] }), true)
assert.equal(hasApplicationEmailAccess({ edition: "pack", options: ["ALARM_EMAIL"] }), true)
assert.equal(hasApplicationEmailAccess({ edition: "one", options: [] }), true)
assert.equal(hasApplicationEmailAccess({ edition: "standard", options: [] }), true)
assert.equal(hasApplicationEmailAccess({ edition: "expert", options: [] }), true)

const locationPayload = {
  Nom_Lieu: "Test",
  Consigne: 5,
  GroupIds: [1],
  EMT_Mode: "sans-objet",
  EMT_Valeur: undefined,
  Corriger_Erreur_Justesse: false,
  Prendre_En_Compte_Derive: false,
  Derniere_Date_Etalonnage: undefined,
  Applied_Etalonnage_Id: undefined,
  Unite: "°C",
  Erreur_Justesse: undefined,
  Incertitude: undefined,
  Derive: undefined,
}

for (const edition of ["pack", "one"] as const) {
  const prepared = prepareLocationPayloadForLicense(locationPayload, { edition })
  assert.equal(prepared.Nom_Lieu, "Test")
  assert.equal(prepared.Consigne, 5)
  assert.deepEqual(prepared.GroupIds, [1])
  for (const field of STANDARD_METROLOGY_LOCATION_FIELDS) {
    assert.equal(
      Object.prototype.hasOwnProperty.call(prepared, field),
      false,
      `${field} must not be sent for ${edition}`,
    )
  }
}

for (const edition of ["standard", "expert"] as const) {
  const prepared = prepareLocationPayloadForLicense(locationPayload, { edition })
  for (const field of STANDARD_METROLOGY_LOCATION_FIELDS) {
    assert.equal(
      Object.prototype.hasOwnProperty.call(prepared, field),
      true,
      `${field} must remain available for ${edition}`,
    )
  }
}

const locationsClient = read("src/app/[locale]/(admin)/admin/lieux/locations-client.tsx")
assert.match(locationsClient, /prepareLocationPayloadForLicense\(payload, license\)/)

const locationDialog = read("src/app/[locale]/(admin)/admin/lieux/_components/location-form-dialog.tsx")
assert.match(locationDialog, /hasApplicationEmailAccess\(license\)/)
assert.match(locationDialog, /hasMailingTab && \(/)
assert.match(locationDialog, /hasMailingTab && <LocationFormTabTelephony/)

const surveillanceEditor = read(
  "src/app/[locale]/(dashboard)/surveillance/_components/page-client/use-surveillance-location-editor.ts",
)
assert.match(surveillanceEditor, /prepareLocationPayloadForLicense/)
assert.match(surveillanceEditor, /useLicense\(\)/)

for (const apiRoute of [
  "src/app/api/lieux/route.ts",
  "src/app/api/lieux/[id]/route.ts",
]) {
  const source = read(apiRoute)
  assert.match(source, /STANDARD_METROLOGY_LOCATION_FIELDS/)
  assert.match(source, /requireStandardOrExpertIfFieldsUsed/)
}

const chatGuard = read("src/lib/chat-guard.ts")
assert.doesNotMatch(chatGuard, /isStandardOrExpert/)
assert.match(chatGuard, /if \(!license\.ok\)/)
assert.match(chatGuard, /messaging_disabled/)

const messagingHook = read("src/hooks/useMessagingEnabled.ts")
assert.doesNotMatch(messagingHook, /isStandardOrExpert/)
assert.match(messagingHook, /license\?\.ok === true/)

const messagingSettingRoute = read("src/app/api/settings/messaging-enabled/route.ts")
assert.doesNotMatch(messagingSettingRoute, /isStandardOrExpert/)
assert.match(messagingSettingRoute, /if \(!license\.ok\)/)

const parameterGuards = read("src/lib/parameter-license-guards.ts")
assert.doesNotMatch(parameterGuards, /MESSAGING:ENABLED/)
assert.match(parameterGuards, /DASHBOARD:SURVEILLANCE_REFRESH/)

const settingsClient = read("src/app/[locale]/(admin)/admin/parametres/_components/settings-client.tsx")
assert.match(settingsClient, /<MessagingSettingsCard/)
assert.doesNotMatch(
  settingsClient,
  /isStandardOrExpert\(license\)\s*\?\s*\(\s*<MessagingSettingsCard/,
)

const sidebar = read("src/components/app-sidebar.tsx")
assert.match(
  sidebar,
  /canAccessMessaging\s*=\s*messagingEnabled\s*&&\s*hasPermission\(currentUser,\s*"CONVERSATION_ACCESS"\)/,
)

const upgradeContent = read("src/components/upgrade/upgradeContent.ts")
assert.match(
  upgradeContent,
  /features\.20"\), pack: true, one: true, standard: true, expert: true/,
)

const licenseInfo = read("docs/infos-licences.md")
assert.doesNotMatch(licenseInfo, /Pas de chat/)
assert.match(licenseInfo, /Licence \*\*Pack\*\*[\s\S]*Messagerie inter-utilisateurs/)

const licenseMatrix = read("docs/matrice-licences-acces.md")
assert.match(licenseMatrix, /\/messages.*Oui\*.*Oui\*.*Oui\*.*Oui\*/)
assert.match(licenseMatrix, /POST\/PATCH \/api\/lieux.*hors champs EMT.*Oui.*Oui.*Oui.*Oui/)

console.log("pack-one-license-access: OK")
