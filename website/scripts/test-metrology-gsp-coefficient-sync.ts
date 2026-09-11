import assert from "node:assert/strict"

import { buildAdjustmentXml } from "../src/lib/adjustment-export"
import { parseAdjustmentXml } from "../src/lib/adjustment-import"
import {
  mapGspPhysicalCoefficientsToStorage,
  parseGspCoefficientResponse,
} from "../src/lib/metrology-gsp-coefficients"

const linear = parseGspCoefficientResponse(
  "SN=SPNB-26000100\r\nA=1.125\r\nB=-0.375\r\nC=0\r\nMulti=0\r\nEND",
)
assert.ok(linear)
assert.deepEqual(linear, {
  coeffA: 1.125,
  coeffB: -0.375,
  coeffC: 0,
  multipoint: false,
})
assert.deepEqual(mapGspPhysicalCoefficientsToStorage(linear), {
  coeffX2: 0,
  coeffX: 1.125,
  coeffConstant: -0.375,
})

const multipoint = parseGspCoefficientResponse(
  "SN=SPNB-26000101\nA=0.0025\nB=0.998\nC=1.25\nMulti=1\nEND",
)
assert.ok(multipoint)
assert.deepEqual(mapGspPhysicalCoefficientsToStorage(multipoint), {
  coeffX2: 0.0025,
  coeffX: 0.998,
  coeffConstant: 1.25,
})

const compact = parseGspCoefficientResponse(
  "1.0000000000a0.0000000000b0.0000000000c 0m",
)
assert.ok(compact)
assert.equal(compact.coeffA, 1)
assert.equal(compact.coeffB, 0)
assert.equal(compact.coeffC, 0)
assert.equal(compact.multipoint, false)

assert.equal(parseGspCoefficientResponse("ACK=DCON\nEND"), null)

const xml = buildAdjustmentXml({
  adjustedAt: new Date(2026, 8, 10, 12, 30, 0),
  operator: "Test",
  displayDecimals: 3,
  standardSerial: "SPET-TEST",
  standardOrganization: "MC2",
  standardCertificateDate: new Date(2026, 0, 1),
  standardCertificateNumber: "CERT-1",
  standardUnit: "°C",
  standardPort: "COM1",
  standardIsExternal: false,
  standardUncertainty: 0.1,
  standardResolution: 0.01,
  standardDecimals: 2,
  sensorSerial: "SOIT-10007193",
  sensorAddress: "10007193",
  standardMeasure1: 0,
  standardMeasure2: 10,
  sensorRawValue1: 0.1,
  sensorRawValue2: 9.9,
  coeffX2: 0.005,
  coeffX: 1.002,
  coeffConstant: -0.15,
  correctedValue1: 0,
  correctedValue2: 10,
})
const parsedXml = parseAdjustmentXml(xml.toString("utf8"), "SOIT-10007193.xml")
assert.equal(parsedXml.data.Coeff_X2, 0.005)
assert.equal(parsedXml.data.Coeff_X, 1.002)
assert.equal(parsedXml.data.Coeff_Constant, -0.15)

console.log("metrology GSP coefficient sync tests: OK")
