import assert from "node:assert/strict"

import { formatMeasureValue, normalizeMeasureNumber } from "../src/lib/measurements"
import { formatNumber } from "../src/lib/number-display"

type TestCase = {
  name: string
  run: () => void
}

const cases: TestCase[] = [
  {
    name: "formatNumber uses the configured fallback for invalid values",
    run: () => {
      assert.equal(formatNumber(null, { fallback: "-" }), "-")
      assert.equal(formatNumber(undefined, { fallback: "N/A" }), "N/A")
      assert.equal(formatNumber(Number.NaN, { fallback: "invalid" }), "invalid")
      assert.equal(formatNumber(Number.POSITIVE_INFINITY, { fallback: "-" }), "-")
    },
  },
  {
    name: "formatNumber uses Intl decimal defaults when precision is omitted",
    run: () => {
      assert.equal(formatNumber(12.3456, { locale: "en-US", grouping: false }), "12.346")
      assert.equal(formatNumber(12, { locale: "en-US", grouping: false }), "12")
    },
  },
  {
    name: "formatNumber supports fixed decimals",
    run: () => {
      assert.equal(formatNumber(12.3, { decimals: 2, locale: "en-US", grouping: false }), "12.30")
      assert.equal(formatNumber(12.345, { decimals: 2, locale: "en-US", grouping: false }), "12.35")
      assert.equal(formatNumber(12.345, { decimals: 0, locale: "en-US", grouping: false }), "12")
    },
  },
  {
    name: "fixed decimals take precedence over min and max decimals",
    run: () => {
      assert.equal(
        formatNumber(12.3, {
          decimals: 1,
          minimumDecimals: 4,
          maximumDecimals: 6,
          locale: "en-US",
          grouping: false,
        }),
        "12.3",
      )
    },
  },
  {
    name: "formatNumber supports minimum and maximum decimals",
    run: () => {
      assert.equal(
        formatNumber(12.3, {
          minimumDecimals: 2,
          maximumDecimals: 4,
          locale: "en-US",
          grouping: false,
        }),
        "12.30",
      )
      assert.equal(
        formatNumber(12.34567, {
          minimumDecimals: 0,
          maximumDecimals: 4,
          locale: "en-US",
          grouping: false,
        }),
        "12.3457",
      )
    },
  },
  {
    name: "maximum decimals are raised when lower than minimum decimals",
    run: () => {
      assert.equal(
        formatNumber(12.3, {
          minimumDecimals: 4,
          maximumDecimals: 2,
          locale: "en-US",
          grouping: false,
        }),
        "12.3000",
      )
    },
  },
  {
    name: "decimal counts are normalized to the Intl supported range",
    run: () => {
      assert.equal(formatNumber(12.6, { decimals: -2, locale: "en-US", grouping: false }), "13")
      assert.equal(
        formatNumber(1.25, { decimals: 30, locale: "en-US", grouping: false }),
        "1.25000000000000000000",
      )
    },
  },
  {
    name: "formatNumber localizes decimal separators",
    run: () => {
      assert.equal(formatNumber(12.5, { decimals: 1, locale: "fr-FR", grouping: false }), "12,5")
      assert.equal(formatNumber(12.5, { decimals: 1, locale: "en-US", grouping: false }), "12.5")
    },
  },
  {
    name: "formatNumber controls grouping",
    run: () => {
      assert.equal(formatNumber(12345.6, { decimals: 1, locale: "en-US", grouping: true }), "12,345.6")
      assert.equal(formatNumber(12345.6, { decimals: 1, locale: "en-US", grouping: false }), "12345.6")
    },
  },
  {
    name: "measure helpers reject non-finite values consistently",
    run: () => {
      assert.equal(formatMeasureValue(Number.NaN), "")
      assert.equal(formatMeasureValue(Number.POSITIVE_INFINITY), "")
      assert.equal(formatMeasureValue(Number.NEGATIVE_INFINITY), "")
      assert.equal(formatMeasureValue(12.345, Number.POSITIVE_INFINITY, "en-US"), "12.35")
      assert.equal(normalizeMeasureNumber(Number.NaN), null)
      assert.equal(normalizeMeasureNumber(Number.NEGATIVE_INFINITY), null)
    },
  },
  {
    name: "formatter cache keeps locale precision and grouping isolated",
    run: () => {
      assert.equal(formatNumber(12345.6, { decimals: 1, locale: "en-US", grouping: true }), "12,345.6")
      assert.equal(formatNumber(12345.6, { decimals: 2, locale: "fr-FR", grouping: false }), "12345,60")
      assert.equal(formatNumber(12345.6, { decimals: 1, locale: "en-US", grouping: true }), "12,345.6")
    },
  },
]

let passed = 0
let failed = 0

console.log("\n=== Number display tests ===")

for (const testCase of cases) {
  try {
    testCase.run()
    passed += 1
    console.log(`PASS ${testCase.name}`)
  } catch (error) {
    failed += 1
    console.error(`FAIL ${testCase.name}`)
    console.error(error)
  }
}

console.log("\n--- Resultat ---")
console.log(`PASS: ${passed}`)
console.log(`FAIL: ${failed}`)

if (failed > 0) {
  process.exit(1)
}
