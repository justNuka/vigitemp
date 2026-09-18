import assert from "node:assert/strict"

import { summarizeMailingService } from "../src/lib/admin-service-status"
import { summarizeTelephonyService } from "../src/lib/admin-telephony-service-status"
import { DEFAULT_TELEPHONY_CONFIG } from "../src/lib/telephony/config"

const mailingReady = summarizeMailingService({
  enabled: true,
  host: "smtp.example.test",
  port: 587,
  user: "alerts@example.test",
  passwordConfigured: true,
})
assert.deepEqual(mailingReady, { enabled: true, configured: true })

const mailingMissingPassword = summarizeMailingService({
  enabled: true,
  host: "smtp.example.test",
  port: 587,
  user: "alerts@example.test",
  passwordConfigured: false,
})
assert.deepEqual(mailingMissingPassword, { enabled: true, configured: false })

const telephonyNone = summarizeTelephonyService(DEFAULT_TELEPHONY_CONFIG)
assert.deepEqual(telephonyNone, {
  enabled: false,
  provider: "none",
  configured: false,
})

const twilioConfigured = summarizeTelephonyService({
  ...DEFAULT_TELEPHONY_CONFIG,
  enabled: false,
  provider: "twilio",
  twilioAuthMode: "api_key",
  twilioAccountSid: "AC123",
  twilioApiKeySid: "SK123",
  twilioApiKeySecret: "secret",
  twilioFromNumber: "+33102030405",
})
assert.deepEqual(twilioConfigured, {
  enabled: false,
  provider: "twilio",
  configured: true,
})

const twilioIncomplete = summarizeTelephonyService({
  ...DEFAULT_TELEPHONY_CONFIG,
  enabled: true,
  provider: "twilio",
  twilioAuthMode: "api_key",
  twilioAccountSid: "AC123",
  twilioApiKeySid: "SK123",
  twilioApiKeySecret: "",
  twilioFromNumber: "+33102030405",
})
assert.deepEqual(twilioIncomplete, {
  enabled: true,
  provider: "twilio",
  configured: false,
})

const asteriskConfigured = summarizeTelephonyService({
  ...DEFAULT_TELEPHONY_CONFIG,
  enabled: true,
  provider: "asterisk",
  asteriskBaseUrl: "http://192.0.2.10:8088/ari",
  asteriskUsername: "vigisensys",
  asteriskPassword: "secret",
})
assert.deepEqual(asteriskConfigured, {
  enabled: true,
  provider: "asterisk",
  configured: true,
})

console.log("admin-service-status: OK")
