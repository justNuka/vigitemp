import assert from "node:assert/strict"

import {
  calculateGsoAdjustmentDisplayValue,
  withGsoAdjustmentDisplayValue,
} from "../src/lib/metrology-gso-adjustment-display"

assert.equal(
  calculateGsoAdjustmentDisplayValue(10, { coeffA: 2, coeffB: 3, coeffC: 0 }),
  23,
  "linear coefficients must use A*x+B",
)

assert.equal(
  calculateGsoAdjustmentDisplayValue(2, { coeffA: 2, coeffB: 3, coeffC: 4 }),
  18,
  "three coefficients must use A*x²+B*x+C",
)

assert.deepEqual(
  withGsoAdjustmentDisplayValue(
    { value: 10, rawValue: null, measuredAt: "2026-09-09T12:00:00.000Z" },
    { coeffA: 2, coeffB: 3, coeffC: 0 },
  ),
  {
    value: 23,
    rawValue: "10",
    measuredAt: "2026-09-09T12:00:00.000Z",
  },
  "the current GSO adjustment path must preserve the raw signal while exposing the corrected value",
)

assert.deepEqual(
  withGsoAdjustmentDisplayValue(
    { value: 999, rawValue: "10", measuredAt: "2026-09-09T12:00:00.000Z" },
    { coeffA: 2, coeffB: 3, coeffC: 0 },
  ),
  {
    value: 23,
    rawValue: "10",
    measuredAt: "2026-09-09T12:00:00.000Z",
  },
  "an explicit rawValue must remain the calculation source if the DB later exposes a corrected Valeur",
)

assert.deepEqual(
  withGsoAdjustmentDisplayValue(
    { value: null, rawValue: null },
    { coeffA: 2, coeffB: 3, coeffC: 0 },
  ),
  { value: null, rawValue: null },
  "missing readings must remain missing",
)

console.log("GSO adjustment display tests passed")
