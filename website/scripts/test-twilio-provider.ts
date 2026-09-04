import assert from "node:assert/strict"

import { TwilioVoiceProvider } from "../src/lib/telephony/twilio-provider"

const ACCOUNT_SID = `AC${"a".repeat(32)}`
const API_KEY_SID = `SK${"b".repeat(32)}`
const FROM_NUMBER = "+4915888620339"
const TO_NUMBER = "+33612345678"
const TRIAL_TEMPLATE_URL = "https://webhooks.twilio.com/v1/Voice/Template/voice_text_to_speech"

function createProvider() {
  return new TwilioVoiceProvider({
    twilioAuthMode: "api_key",
    twilioAccountSid: ACCOUNT_SID,
    twilioApiKeySid: API_KEY_SID,
    twilioApiKeySecret: "test-secret",
    twilioAuthToken: "",
    twilioFromNumber: FROM_NUMBER,
  })
}

function parseBody(init?: RequestInit) {
  return new URLSearchParams(String(init?.body ?? ""))
}

async function testFullAccountUsesInlineTwiml() {
  const originalFetch = globalThis.fetch
  const requests: Array<{ url: string; init?: RequestInit }> = []

  globalThis.fetch = async (input, init) => {
    requests.push({ url: String(input), init })
    return new Response(JSON.stringify({
      sid: `CA${"c".repeat(32)}`,
      status: "queued",
      to: TO_NUMBER,
      from: FROM_NUMBER,
      direction: "outbound-api",
    }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    })
  }

  try {
    const result = await createProvider().triggerTestCall(TO_NUMBER)
    assert.equal(requests.length, 1)
    const body = parseBody(requests[0]?.init)
    assert.equal(body.get("To"), TO_NUMBER)
    assert.equal(body.get("From"), FROM_NUMBER)
    assert.match(body.get("Twiml") ?? "", /Ceci est un appel de test VigiSensys/)
    assert.equal(body.get("Timeout"), "30")
    assert.equal(body.has("Url"), false)
    assert.equal(result.testMode, "vigisensys_tts")
  } finally {
    globalThis.fetch = originalFetch
  }
}

async function testTrialFallsBackToAllowedTemplate() {
  const originalFetch = globalThis.fetch
  const requests: Array<{ url: string; init?: RequestInit }> = []

  globalThis.fetch = async (input, init) => {
    requests.push({ url: String(input), init })

    if (requests.length === 1) {
      return new Response(JSON.stringify({
        message: "Invalid or disallowed parameters provided - trial accounts have limited parameter access, upgrade your account to unlock full functionality",
        status: 400,
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    return new Response(JSON.stringify({
      sid: `CA${"d".repeat(32)}`,
      status: "queued",
      to: TO_NUMBER,
      from: FROM_NUMBER,
      direction: "outbound-api",
    }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    })
  }

  try {
    const result = await createProvider().triggerTestCall(TO_NUMBER)
    assert.equal(requests.length, 2)

    const firstBody = parseBody(requests[0]?.init)
    assert.equal(firstBody.has("Twiml"), true)

    const retryBody = parseBody(requests[1]?.init)
    assert.equal(retryBody.get("To"), TO_NUMBER)
    assert.equal(retryBody.get("From"), FROM_NUMBER)
    assert.equal(retryBody.get("Url"), TRIAL_TEMPLATE_URL)
    assert.equal(retryBody.has("Twiml"), false)
    assert.equal(retryBody.has("Timeout"), false)
    assert.equal(result.testMode, "twilio_trial_template")
  } finally {
    globalThis.fetch = originalFetch
  }
}

async function testUnrelatedTwilioErrorDoesNotRetry() {
  const originalFetch = globalThis.fetch
  let requestCount = 0

  globalThis.fetch = async () => {
    requestCount += 1
    return new Response(JSON.stringify({
      code: 21211,
      message: "The 'To' number is not a valid phone number.",
      status: 400,
    }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

  try {
    await assert.rejects(
      () => createProvider().triggerTestCall(TO_NUMBER),
      /21211/,
    )
    assert.equal(requestCount, 1)
  } finally {
    globalThis.fetch = originalFetch
  }
}

await testFullAccountUsesInlineTwiml()
await testTrialFallsBackToAllowedTemplate()
await testUnrelatedTwilioErrorDoesNotRetry()

console.log("Twilio provider tests: OK")
