import assert from 'node:assert/strict'

import {
  getBatteryIndicatorState,
  parseBatteryVoltage,
} from '../src/components/monitoring-card/battery-indicator'

assert.equal(parseBatteryVoltage('3.01 V'), 3.01)
assert.equal(parseBatteryVoltage('2,74V'), 2.74)
assert.equal(parseBatteryVoltage(''), null)
assert.equal(parseBatteryVoltage('n/a'), null)

assert.deepEqual(getBatteryIndicatorState({ percent: 100 }), { level: 4, severity: 'normal' })
assert.deepEqual(getBatteryIndicatorState({ percent: 75 }), { level: 3, severity: 'normal' })
assert.deepEqual(getBatteryIndicatorState({ percent: 50 }), { level: 2, severity: 'low' })
assert.deepEqual(getBatteryIndicatorState({ percent: 25 }), { level: 1, severity: 'critical' })
assert.deepEqual(getBatteryIndicatorState({ percent: 0 }), { level: 0, severity: 'critical' })
assert.deepEqual(getBatteryIndicatorState({ percent: 150 }), { level: 4, severity: 'normal' })

assert.deepEqual(getBatteryIndicatorState({ voltage: '3.05V' }), { level: 4, severity: 'normal' })
assert.deepEqual(getBatteryIndicatorState({ voltage: '2.95V' }), { level: 3, severity: 'normal' })
assert.deepEqual(getBatteryIndicatorState({ voltage: '2.80V' }), { level: 2, severity: 'low' })
assert.deepEqual(getBatteryIndicatorState({ voltage: '2.64V' }), { level: 1, severity: 'critical' })
assert.deepEqual(getBatteryIndicatorState({ voltage: 'invalid' }), { level: 0, severity: 'unknown' })

// A percentage is the preferred source when both metrics are available.
assert.deepEqual(getBatteryIndicatorState({ percent: 82, voltage: '2.50V' }), { level: 4, severity: 'normal' })

console.log('surveillance-battery-indicator: OK')
