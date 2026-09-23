import assert from "node:assert/strict";

import {
  formatDbDateTime,
  formatDbDateTimeIntl,
  formatStoredDbDateTime,
  parseDbDateTime,
  parseStoredDbDateTime,
  serializeDbDateTime,
  serializeStoredDbDateTime,
} from "../src/lib/date-display";

type TestCase = {
  name: string;
  run: () => void;
};

const cases: TestCase[] = [
  {
    name: "parseDbDateTime rejects empty and invalid inputs",
    run: () => {
      assert.equal(parseDbDateTime(null), null);
      assert.equal(parseDbDateTime(undefined), null);
      assert.equal(parseDbDateTime(""), null);
      assert.equal(parseDbDateTime("not-a-date"), null);
    },
  },
  {
    name: "parseDbDateTime preserves local DATETIME components",
    run: () => {
      const parsed = parseDbDateTime("2026-08-31 14:05:06.123");
      assert.ok(parsed);
      assert.equal(parsed.getFullYear(), 2026);
      assert.equal(parsed.getMonth(), 7);
      assert.equal(parsed.getDate(), 31);
      assert.equal(parsed.getHours(), 14);
      assert.equal(parsed.getMinutes(), 5);
      assert.equal(parsed.getSeconds(), 6);
      assert.equal(parsed.getMilliseconds(), 123);
    },
  },
  {
    name: "parseDbDateTime clones Date inputs",
    run: () => {
      const input = new Date("2026-08-31T14:05:06.000Z");
      const parsed = parseDbDateTime(input);
      assert.ok(parsed);
      assert.notEqual(parsed, input);
      assert.equal(parsed.getTime(), input.getTime());
    },
  },
  {
    name: "serializeDbDateTime serializes local components without timezone suffix",
    run: () => {
      assert.equal(serializeDbDateTime("2026-08-31 14:05:06"), "2026-08-31T14:05:06");
    },
  },
  {
    name: "serializeStoredDbDateTime preserves UTC-wrapped stored DATETIME components",
    run: () => {
      const prismaDateWrapper = new Date("2026-08-31T14:05:06.000Z");
      assert.equal(serializeStoredDbDateTime(prismaDateWrapper), "2026-08-31T14:05:06");
      assert.equal(serializeStoredDbDateTime(new Date(Number.NaN)), null);
    },
  },
  {
    name: "serializeStoredDbDateTime stays stable around Europe DST transition dates",
    run: () => {
      assert.equal(
        serializeStoredDbDateTime(new Date("2026-03-29T01:30:00.000Z")),
        "2026-03-29T01:30:00",
      );
      assert.equal(
        serializeStoredDbDateTime(new Date("2026-10-25T01:30:00.000Z")),
        "2026-10-25T01:30:00",
      );
    },
  },
  {
    name: "stored DATETIME helpers preserve wall-clock components after JSON serialization",
    run: () => {
      const prismaJson = "2026-09-23T10:36:17.000Z";
      assert.equal(serializeStoredDbDateTime(prismaJson), "2026-09-23T10:36:17");

      const parsed = parseStoredDbDateTime(prismaJson);
      assert.ok(parsed);
      assert.equal(parsed.getHours(), 10);
      assert.equal(parsed.getMinutes(), 36);
      assert.equal(parsed.getSeconds(), 17);

      assert.equal(
        formatStoredDbDateTime(prismaJson, { format: "dateTimeSeconds" }),
        "23/09/2026 10:36:17",
      );
    },
  },
  {
    name: "stored DATETIME helpers keep timezone-less strings unchanged",
    run: () => {
      assert.equal(
        serializeStoredDbDateTime("2026-09-23T10:36:17"),
        "2026-09-23T10:36:17",
      );
      assert.equal(
        formatStoredDbDateTime("2026-09-23T10:36:17", { format: "time" }),
        "10:36",
      );
    },
  },
  {
    name: "formatDbDateTime keeps the legacy default format",
    run: () => {
      assert.equal(formatDbDateTime("2026-08-31 14:05:06"), "31/08/2026 14:05:06");
      assert.equal(
        formatDbDateTime("2026-08-31 14:05:06", { withSeconds: false }),
        "31/08/2026 14:05",
      );
    },
  },
  {
    name: "formatDbDateTime supports named display formats",
    run: () => {
      const value = "2026-08-31 14:05:06";

      assert.equal(formatDbDateTime(value, { format: "date" }), "31/08/2026");
      assert.equal(formatDbDateTime(value, { format: "dateShort" }), "31/08");
      assert.equal(formatDbDateTime(value, { format: "time" }), "14:05");
      assert.equal(formatDbDateTime(value, { format: "timeSeconds" }), "14:05:06");
      assert.equal(formatDbDateTime(value, { format: "dateTime" }), "31/08/2026 14:05");
      assert.equal(formatDbDateTime(value, { format: "dateTimeShort" }), "31/08 14:05");
      assert.equal(
        formatDbDateTime(value, { format: "dateTimeSeconds" }),
        "31/08/2026 14:05:06",
      );
    },
  },
  {
    name: "named display format takes precedence over legacy flags",
    run: () => {
      assert.equal(
        formatDbDateTime("2026-08-31 14:05:06", {
          format: "time",
          dateOnly: true,
          withSeconds: true,
          withYear: true,
        }),
        "14:05",
      );
    },
  },
  {
    name: "invalid runtime display format falls back to legacy behavior",
    run: () => {
      assert.equal(
        formatDbDateTime("2026-08-31 14:05:06", {
          format: "invalid" as never,
          withSeconds: false,
        }),
        "31/08/2026 14:05",
      );
    },
  },
  {
    name: "formatDbDateTime supports date-only variants",
    run: () => {
      assert.equal(
        formatDbDateTime("2026-08-31 14:05:06", { dateOnly: true }),
        "31/08/2026",
      );
      assert.equal(
        formatDbDateTime("2026-08-31 14:05:06", { dateOnly: true, withYear: false }),
        "31/08",
      );
    },
  },
  {
    name: "formatDbDateTime supports time-only variants",
    run: () => {
      assert.equal(
        formatDbDateTime("2026-08-31 14:05:06", { timeOnly: true }),
        "14:05:06",
      );
      assert.equal(
        formatDbDateTime("2026-08-31 14:05:06", { timeOnly: true, withSeconds: false }),
        "14:05",
      );
    },
  },
  {
    name: "formatDbDateTime preserves already formatted strings",
    run: () => {
      assert.equal(formatDbDateTime("31/08/2026 14:05:06"), "31/08/2026 14:05:06");
      assert.equal(formatDbDateTime("14:05"), "14:05");
    },
  },
  {
    name: "formatDbDateTime uses the configured fallback for invalid values",
    run: () => {
      assert.equal(formatDbDateTime("invalid", { fallback: "N/A" }), "N/A");
    },
  },
  {
    name: "formatDbDateTime forwards locale and timezone to Intl for legacy options",
    run: () => {
      const value = "2026-08-31T14:05:06.000Z";
      const expected = new Intl.DateTimeFormat("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "UTC",
      }).format(new Date(value));

      assert.equal(
        formatDbDateTime(value, { locale: "fr-FR", timeZone: "UTC", withSeconds: false }),
        expected,
      );
    },
  },
  {
    name: "named display formats forward locale and timezone to Intl",
    run: () => {
      const value = "2026-08-31T14:05:06.000Z";
      const expected = new Intl.DateTimeFormat("en-US", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
        timeZone: "UTC",
      }).format(new Date(value));

      assert.equal(
        formatDbDateTime(value, {
          format: "dateTimeSeconds",
          locale: "en-US",
          timeZone: "UTC",
        }),
        expected,
      );
    },
  },
  {
    name: "formatDbDateTimeIntl forwards explicit Intl options",
    run: () => {
      const value = "2026-08-31T14:05:06.000Z";
      const intl: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "long",
        day: "2-digit",
      };
      const expected = new Intl.DateTimeFormat("en-GB", {
        ...intl,
        timeZone: "UTC",
      }).format(new Date(value));

      assert.equal(
        formatDbDateTimeIntl(value, {
          locale: "en-GB",
          timeZone: "UTC",
          intl,
        }),
        expected,
      );
    },
  },
];

let passed = 0;
let failed = 0;

console.log("\n=== Date display characterization ===");

for (const testCase of cases) {
  try {
    testCase.run();
    passed += 1;
    console.log(`PASS ${testCase.name}`);
  } catch (error) {
    failed += 1;
    console.error(`FAIL ${testCase.name}`);
    console.error(error);
  }
}

console.log("\n--- Resultat ---");
console.log(`PASS: ${passed}`);
console.log(`FAIL: ${failed}`);

if (failed > 0) {
  process.exitCode = 1;
}
