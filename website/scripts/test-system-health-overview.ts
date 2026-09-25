import assert from "node:assert/strict"

import { getSystemHealthOverview } from "../src/lib/system-health-overview"
import type { SystemHealthSnapshot } from "../src/types/system-health"

function buildSnapshot(
  overrides: Partial<SystemHealthSnapshot["services"]> = {},
): SystemHealthSnapshot {
  return {
    checkedAt: "2026-09-17T12:00:00.000Z",
    services: {
      web: { status: "ok", version: "0.90.2" },
      server: { status: "ok", configured: true, version: "1.0.0" },
      dbMain: { status: "ok" },
      dbMesure: { status: "ok" },
      dbChat: { status: "unknown", configured: false },
      ...overrides,
    },
    runtime: {
      hostname: "vigisensys-test",
      os: "Windows_NT 10.0",
      architecture: "x64",
      nodeVersion: "v22.0.0",
      processUptimeSeconds: 60,
      systemUptimeSeconds: 3600,
      databaseProvider: "mysql",
    },
  }
}

assert.deepEqual(getSystemHealthOverview(buildSnapshot()), {
  status: "ok",
  ok: 4,
  total: 4,
  errors: 0,
  unknown: 0,
})

assert.equal(
  getSystemHealthOverview(
    buildSnapshot({ server: { status: "error", configured: true, version: null } }),
  ).status,
  "error",
)

assert.equal(
  getSystemHealthOverview(
    buildSnapshot({ server: { status: "unknown", configured: false, version: null } }),
  ).status,
  "unknown",
)

const chatFailure = getSystemHealthOverview(
  buildSnapshot({ dbChat: { status: "error", configured: true } }),
)
assert.equal(chatFailure.status, "degraded")
assert.equal(chatFailure.ok, 4)
assert.equal(chatFailure.total, 5)
assert.equal(chatFailure.errors, 1)

assert.equal(
  getSystemHealthOverview(
    buildSnapshot({
      dbMain: { status: "error" },
      dbChat: { status: "error", configured: true },
    }),
  ).status,
  "error",
)

console.log("system-health-overview: OK")
