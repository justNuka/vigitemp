import { strict as assert } from "node:assert"

import { runSequentialMetrologyConfiguration } from "../src/lib/metrology-gsp-sequential-configuration"

const events: string[] = []
const originalError = new Error("sensor 148 unreachable")

await assert.rejects(
  () => runSequentialMetrologyConfiguration(["147", "148", "149"], {
    apply: async (serial) => {
      events.push(`apply:${serial}`)
      if (serial === "148") throw originalError
    },
    rollback: async (serial) => {
      events.push(`rollback:${serial}`)
    },
    rollbackOnFailure: true,
  }),
  (error) => error === originalError,
)
assert.deepEqual(events, ["apply:147", "apply:148", "rollback:147"])

const rollbackEvents: string[] = []
await assert.rejects(
  () => runSequentialMetrologyConfiguration(["147", "148"], {
    apply: async (serial) => {
      rollbackEvents.push(`apply:${serial}`)
      if (serial === "148") throw originalError
    },
    rollback: async (serial) => {
      rollbackEvents.push(`rollback:${serial}`)
      throw new Error("rollback failed")
    },
    rollbackOnFailure: true,
    onRollbackError: (serial) => rollbackEvents.push(`rollback-error:${serial}`),
  }),
  (error) => error === originalError,
)
assert.deepEqual(rollbackEvents, ["apply:147", "apply:148", "rollback:147", "rollback-error:147"])

const normalEvents: string[] = []
await assert.rejects(
  () => runSequentialMetrologyConfiguration(["147", "148"], {
    apply: async (serial) => {
      normalEvents.push(`apply:${serial}`)
      if (serial === "148") throw originalError
    },
    rollback: async (serial) => {
      normalEvents.push(`rollback:${serial}`)
    },
    rollbackOnFailure: false,
  }),
  (error) => error === originalError,
)
assert.deepEqual(normalEvents, ["apply:147", "apply:148"])

console.log("metrology GSP sequential configuration rollback: OK")
