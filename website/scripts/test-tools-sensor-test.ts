import assert from "node:assert/strict"

import {
  aggregateToolsSensorTestMeasurements,
  buildToolsSensorTestLookupValues,
  type ToolsSensorTestCatalogEntry,
} from "../src/lib/tools-sensor-test"

const sensors: ToolsSensorTestCatalogEntry[] = [
  {
    id: 1,
    serialNumber: "IN1234",
    address: "1234",
    sensorType: "IN",
    family: "CLASSIC",
    location: "Froid",
    module: "M1",
    modulePort: "COM1",
    surveillanceState: "S",
    frequencyMeasure: null,
    frequencyRecovery: null,
  },
  {
    id: 2,
    serialNumber: "10007193-T",
    address: "10007193-T",
    sensorType: "SOIH",
    family: "GSO",
    location: "Labo",
    module: "GSO-E1",
    modulePort: null,
    surveillanceState: "S",
    frequencyMeasure: null,
    frequencyRecovery: null,
  },
]

const lookupValues = buildToolsSensorTestLookupValues(sensors)
assert.ok(lookupValues.includes("IN1234"))
assert.ok(lookupValues.includes("1234"))
assert.ok(lookupValues.includes("10007193-T"))
assert.ok(lookupValues.includes("SOIH-10007193-T"))

const results = aggregateToolsSensorTestMeasurements(sensors, [
  {
    serialNumber: "IN1234",
    address: "1234",
    value: 21.2,
    rawValue: 21.2,
    unit: "°C",
    rssi: "-61",
    isNull: 0,
    measuredAt: "2026-09-11T10:00:00.000Z",
  },
  {
    serialNumber: "IN1234",
    address: "1234",
    value: null,
    rawValue: null,
    unit: "°C",
    rssi: null,
    isNull: 1,
    measuredAt: "2026-09-11T10:01:00.000Z",
  },
  {
    serialNumber: "SOIH-10007193-T",
    address: "10007193-T",
    value: 4.5,
    rawValue: 4.5,
    unit: "°C",
    rssi: "-70",
    isNull: 0,
    measuredAt: "2026-09-11T10:00:30.000Z",
  },
  {
    serialNumber: "OTHER",
    address: "9999",
    value: 10,
    rawValue: 10,
    unit: "°C",
    rssi: null,
    isNull: 0,
    measuredAt: "2026-09-11T10:00:40.000Z",
  },
])

const classic = results.find((result) => result.sensorId === 1)
assert.ok(classic)
assert.equal(classic.totalAttempts, 2)
assert.equal(classic.receivedAttempts, 1)
assert.equal(classic.responseRate, 50)
assert.equal(classic.lastValue, 21.2)
assert.equal(classic.lastAttemptAt, "2026-09-11T10:01:00.000Z")
assert.equal(classic.lastResponseAt, "2026-09-11T10:00:00.000Z")

const gso = results.find((result) => result.sensorId === 2)
assert.ok(gso)
assert.equal(gso.totalAttempts, 1)
assert.equal(gso.receivedAttempts, 1)
assert.equal(gso.responseRate, 100)
assert.equal(gso.lastValue, 4.5)

console.log("Tools sensor test aggregation OK")
