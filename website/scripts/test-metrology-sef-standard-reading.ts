import assert from "node:assert/strict"

import { buildLegacyStandardModulePortCandidates, buildMetrologyStandardHotlineRequest } from "../src/lib/metrology-reading-preview"

assert.deepEqual(buildLegacyStandardModulePortCandidates("69").sort(), ["69", "COM69"].sort())
assert.deepEqual(buildLegacyStandardModulePortCandidates("COM69").sort(), ["69", "COM69"].sort())
assert.deepEqual(buildLegacyStandardModulePortCandidates(null), [])

const sefAdjustment = buildMetrologyStandardHotlineRequest({
  serialNumber: "SEF343",
  standardType: "SEF",
  unit: "°C",
  modulePort: "COM69",
  moduleName: "Sollae test",
  networkHost: "192.168.63.69",
}, "AJUSTAGE")
assert.equal(sefAdjustment.sensorType, "SEF")
assert.equal(sefAdjustment.networkHost, "192.168.63.69")
assert.equal(sefAdjustment.networkPort, 1470)
assert.equal(sefAdjustment.protocolAddress, "01")
assert.equal(sefAdjustment.operationContext, "AJUSTAGE")
assert.equal("manualPort" in sefAdjustment, false, "Une SEF ne doit jamais utiliser COM69/ezVSP")

const sefCalibration = buildMetrologyStandardHotlineRequest({
  serialNumber: "SEF343",
  standardType: "SEF",
  unit: "°C",
  modulePort: null,
  moduleName: "Sollae test",
  networkHost: "192.168.63.69",
}, "ETALONNAGE")
assert.equal(sefCalibration.sensorType, "SEF")
assert.equal(sefCalibration.operationContext, "ETALONNAGE")
assert.equal("manualPort" in sefCalibration, false)

const spet = buildMetrologyStandardHotlineRequest({
  serialNumber: "SPET001",
  standardType: "SPET",
  unit: "°C",
  modulePort: "69",
  moduleName: "Module GSP",
  networkHost: null,
}, "ETALONNAGE")
assert.equal(spet.sensorType, "GSP")
assert.equal(spet.manualPort, "COM69")
assert.equal("networkHost" in spet, false)

assert.throws(() => buildMetrologyStandardHotlineRequest({
  serialNumber: "SEF343",
  standardType: "SEF",
  unit: "°C",
  modulePort: "COM69",
  moduleName: null,
  networkHost: null,
}, "AJUSTAGE"), /IP Sollae/)

assert.throws(() => buildMetrologyStandardHotlineRequest({
  serialNumber: "OTHER1",
  standardType: "OTHER",
  unit: "°C",
  modulePort: null,
  moduleName: null,
  networkHost: null,
}, "ETALONNAGE"), /non supporté/)

console.log("SEF metrology standard transport selection OK")
