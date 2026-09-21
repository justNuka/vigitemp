import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import path from "node:path"

import { buildLocationValueRangeIssues } from "../src/lib/sensor-value-range-contract"

const soetRange = {
  min: -40,
  max: 125,
  unit: "°C",
}

const minus80 = buildLocationValueRangeIssues(
  {
    Consigne: -80,
  },
  soetRange,
)

assert.equal(minus80.length, 1)
assert.deepEqual(minus80[0]?.path, ["Consigne"])
assert.equal(
  minus80[0]?.message,
  "La consigne doit être supérieure ou égale à -40 °C.",
)

const minus80English = buildLocationValueRangeIssues(
  { Consigne: -80 },
  soetRange,
  "en",
)
assert.equal(
  minus80English[0]?.message,
  "The setpoint must be greater than or equal to -40 °C.",
)

assert.deepEqual(
  buildLocationValueRangeIssues({ Consigne: -40 }, soetRange),
  [],
)
assert.deepEqual(
  buildLocationValueRangeIssues({ Consigne: 125 }, soetRange),
  [],
)

const overMax = buildLocationValueRangeIssues(
  { Consigne: 126 },
  soetRange,
)
assert.equal(
  overMax[0]?.message,
  "La consigne doit être inférieure ou égale à 125 °C.",
)

const multiple = buildLocationValueRangeIssues(
  {
    Consigne: -80,
    Consigne_Sup: 130,
    Consigne_Inf: -50,
  },
  soetRange,
)
assert.equal(multiple.length, 3)

const websiteRoot = process.cwd()
const readWebsite = (relativePath: string) =>
  readFileSync(path.join(websiteRoot, relativePath), "utf8")

const createRoute = readWebsite("src/app/api/lieux/route.ts")
const updateRoute = readWebsite("src/app/api/lieux/[id]/route.ts")
assert.ok(
  createRoute.includes('rangeIssues[0]?.message ?? "Validation impossible"'),
)
assert.ok(
  updateRoute.includes('rangeIssues[0]?.message ?? "Validation impossible"'),
)

const formDialog = readWebsite(
  "src/app/[locale]/(admin)/admin/lieux/_components/location-form-dialog.tsx",
)
assert.ok(formDialog.includes("buildLocationValueRangeIssues"))
assert.ok(formDialog.includes("validateSelectedSensorRange"))

const generalTab = readWebsite(
  "src/app/[locale]/(admin)/admin/lieux/_components/location-form-tab-general.tsx",
)
assert.ok(generalTab.includes("Valeur_Min"))
assert.ok(generalTab.includes("Valeur_Max"))
assert.ok(generalTab.includes("Unite_Type"))

console.log("location-sensor-range: OK")
