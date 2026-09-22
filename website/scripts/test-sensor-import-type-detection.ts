import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"

import { buildLocalizedPath } from "../src/i18n/pathnames"
import {
  extractImportedTypeCodeFromSerial,
  getSensorFamilyFromTypeCode,
  resolveImportedSensorIdentity,
} from "../src/lib/sensor-naming"

const root = process.cwd()
const read = (relative: string) => fs.readFileSync(path.join(root, relative), "utf8")

const databaseTypeCodes = [
  "E", "G", "H", "I", "R", "V",
  "GSO", "GSP",
  "SOIT", "SOIH", "SOET", "SOEH",
  "SPNB", "SPNG", "SPPS", "SPFP",
]

const cases = [
  { serial: "IN123456", type: "I", family: "CLASSIC" },
  { serial: "IN-123456", type: "I", family: "CLASSIC" },
  { serial: "IEE123456", type: "I", family: "CLASSIC" },
  { serial: "IEE-123456", type: "I", family: "CLASSIC" },
  { serial: "EN123456", type: "E", family: "CLASSIC" },
  { serial: "G123456", type: "G", family: "CLASSIC" },
  { serial: "H123456", type: "H", family: "CLASSIC" },
  { serial: "R123456", type: "R", family: "CLASSIC" },
  { serial: "V123456", type: "V", family: "CLASSIC" },
  { serial: "SOIT-123456", type: "SOIT", family: "GSO" },
  { serial: "SOIH-123456-T", type: "SOIH", family: "GSO" },
  { serial: "SPNB-123456", type: "SPNB", family: "GSP" },
  { serial: "SPFP123456", type: "SPFP", family: "GSP" },
] as const

for (const testCase of cases) {
  const extracted = extractImportedTypeCodeFromSerial(testCase.serial, databaseTypeCodes)
  assert.equal(extracted, testCase.type, `Unexpected imported type for ${testCase.serial}`)

  const identity = resolveImportedSensorIdentity(testCase.serial, "", databaseTypeCodes)
  assert.equal(identity.typeCode, testCase.type, `Unexpected resolved type for ${testCase.serial}`)
  assert.equal(
    getSensorFamilyFromTypeCode(identity.typeCode),
    testCase.family,
    `Unexpected family for ${testCase.serial}`,
  )
}

const bulkRoute = read("src/app/api/sondes/ajustages/bulk/route.ts")
assert.ok(bulkRoute.includes('isLegacyGenericSensorTypeCode'))
assert.ok(bulkRoute.includes('const importSensorTypes = sensorTypes.filter'))

const importPage = read("src/app/[locale]/(admin)/admin/sondes/ajustage-import/page.tsx")
assert.ok(importPage.includes('<Link href="/admin/sondes">'))
assert.ok(!importPage.includes('<Link href="/sondes">'))
assert.equal(buildLocalizedPath("/admin/sondes", "fr"), "/fr/admin/sondes")
assert.equal(buildLocalizedPath("/admin/sondes", "en"), "/en/admin/sensors")

console.log("sensor-import-type-detection: OK")
