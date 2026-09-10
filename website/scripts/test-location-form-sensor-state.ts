import { strict as assert } from "node:assert"
import { resolveLocationSensorFormState } from "../src/app/[locale]/(admin)/admin/lieux/_components/general-tab/location-sensor-form-state"

const base = {
  sensorSerial: null,
  sensorChanged: false,
  selectedSensorModuleId: null,
  currentModuleId: null,
  monitoringState: null,
  monitoringWasAutoDisabled: false,
  monitoringExplicitlySet: false,
  moduleExplicitlySet: false,
}

const initial = resolveLocationSensorFormState(base)
assert.equal(initial.monitoringState, "D")
assert.equal(initial.monitoringWasAutoDisabled, true)
assert.equal(initial.moduleId, null)

const templateDisabled = resolveLocationSensorFormState({
  ...base,
  sensorSerial: "SPNB-26000001",
  sensorChanged: true,
  selectedSensorModuleId: 12,
  monitoringState: "D",
  monitoringWasAutoDisabled: true,
  monitoringExplicitlySet: true,
})
assert.equal(templateDisabled.monitoringState, "D")
assert.equal(templateDisabled.moduleId, 12)

const automaticEnabled = resolveLocationSensorFormState({
  ...base,
  sensorSerial: "SPNB-26000001",
  sensorChanged: true,
  selectedSensorModuleId: 12,
  monitoringState: "D",
  monitoringWasAutoDisabled: true,
})
assert.equal(automaticEnabled.monitoringState, "S")

const templateEnabled = resolveLocationSensorFormState({
  ...base,
  sensorSerial: "SPNB-26000001",
  sensorChanged: true,
  selectedSensorModuleId: 12,
  monitoringState: "S",
  monitoringWasAutoDisabled: true,
  monitoringExplicitlySet: true,
})
assert.equal(templateEnabled.monitoringState, "S")

const manualModule = resolveLocationSensorFormState({
  ...base,
  sensorSerial: "SPNB-26000001",
  sensorChanged: false,
  selectedSensorModuleId: 12,
  currentModuleId: 42,
  monitoringState: "S",
  moduleExplicitlySet: true,
})
assert.equal(manualModule.moduleId, 42)

const changedSensor = resolveLocationSensorFormState({
  ...base,
  sensorSerial: "SPNB-26000002",
  sensorChanged: true,
  selectedSensorModuleId: 7,
  currentModuleId: 42,
  monitoringState: "D",
  monitoringExplicitlySet: true,
  moduleExplicitlySet: true,
})
assert.equal(changedSensor.moduleId, 7)
assert.equal(changedSensor.monitoringState, "D")

const removedSensor = resolveLocationSensorFormState({
  ...base,
  sensorSerial: null,
  sensorChanged: true,
  currentModuleId: 7,
  monitoringState: "S",
})
assert.equal(removedSensor.moduleId, null)
assert.equal(removedSensor.monitoringState, "D")

console.log("location form sensor state: OK")
