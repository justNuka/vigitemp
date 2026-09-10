import assert from "node:assert/strict";

import {
  buildImportedSensorStorageIdentity,
  resolveImportedSensorIdentity,
} from "../src/lib/sensor-naming";

function storageFromImportedSerial(serial: string, fileName = "") {
  return buildImportedSensorStorageIdentity(resolveImportedSensorIdentity(serial, fileName));
}

assert.deepEqual(storageFromImportedSerial("SOIT-10007193"), {
  serial: "SOIT-10007193",
  address: "10007193",
});

assert.deepEqual(storageFromImportedSerial("SOET-10007909"), {
  serial: "SOET-10007909",
  address: "10007909",
});

assert.deepEqual(storageFromImportedSerial("10007193", "Ajustage_SOIT-10007193_20260910.xml"), {
  serial: "SOIT-10007193",
  address: "10007193",
});

const dualTemperature = storageFromImportedSerial("SOIH-10007193-T");
assert.equal(dualTemperature.address, "10007193-T");

const dualHumidity = storageFromImportedSerial("SOIH-10007193-H");
assert.equal(dualHumidity.address, "10007193-H");

console.log("GSO adjustment import address normalization OK");
