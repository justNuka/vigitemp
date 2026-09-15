import assert from "node:assert/strict"
import { readFileSync } from "node:fs"

import {
  buildAdjustmentImportModuleAssignments,
  resolveEffectiveImportModuleId,
} from "../src/lib/adjustment-import-module-assignment"

const multiModule = buildAdjustmentImportModuleAssignments([
  { sensorSerial: "GSP-001", moduleId: 10 },
  { sensorSerial: "GSP-002", moduleId: 11 },
  { sensorSerial: "GSO-003-T", moduleId: null },
  { sensorSerial: "GSP-001", moduleId: 10 },
])
assert.deepEqual(multiModule.conflicts, [])
assert.equal(multiModule.assignments.get("GSP-001"), 10)
assert.equal(multiModule.assignments.get("GSP-002"), 11)
assert.equal(multiModule.assignments.get("GSO-003-T"), null)

const conflict = buildAdjustmentImportModuleAssignments([
  { sensorSerial: "GSP-004", moduleId: 10 },
  { sensorSerial: "GSP-004", moduleId: 11 },
])
assert.deepEqual(conflict.conflicts, ["GSP-004"])

const noModule = buildAdjustmentImportModuleAssignments([
  { sensorSerial: "GSP-005", moduleId: null },
])
assert.equal(noModule.assignments.get("GSP-005"), null)

assert.equal(resolveEffectiveImportModuleId(7, 12), 7)
assert.equal(resolveEffectiveImportModuleId(null, 12), 12)
assert.equal(resolveEffectiveImportModuleId(null, null), null)

const routeSource = readFileSync(
  new URL("../src/app/api/sondes/ajustages/bulk/route.ts", import.meta.url),
  "utf8",
)
assert.match(routeSource, /gspCoefficientFallbackSerials\.add\(serial\)/)
assert.match(routeSource, /imported XML coefficients will be used/)
assert.doesNotMatch(routeSource, /gsp_module_required/)

console.log("Adjustment import module assignment OK")
