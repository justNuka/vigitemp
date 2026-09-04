import type { TelephonyConfig } from "@/lib/telephony/config"

type TwilioConfig = Pick<
  TelephonyConfig,
  | "twilioAuthMode"
  | "twilioAccountSid"
  | "twilioApiKeySid"
  | "twilioApiKeySecret"
  | "twilioAuthToken"
  | "twilioFromNumber"
>

type TwilioCallList = {
  calls?: unknown[]
}

type TwilioCall = {
  sid?: string
  status?: string
  to?: string
  from?: string
  direction?: string
}

type TwilioErrorPayload = {
  code?: number
  message?: string
  status?: number
  more_info?: string
}

type TwilioTestMode = "vigisensys_tts" | "twilio_trial_template"

const TWILIO_API_BASE = "https://api.twilio.com/2010-04-01"
const TWILIO_REQUEST_TIMEOUT_MS = 15_000
const TWILIO_TRIAL_TTS_TEMPLATE_URL = "https://webhooks.twilio.com/v1/Voice/Template/voice_text_to_speech"
const TEST_MESSAGE = "Ceci est un appel de test VigiSensys. La connexion téléphonique fonctionne correctement."

class TwilioApiError extends Error {
  constructor(
    message: string,
    readonly httpStatus: number,
    readonly twilioCode: number | null,
  ) {
    super(message)
    this.name = "TwilioApiError"
  }
}

function isAccountSid(value: string) {
  return /^AC[0-9a-f]{32}$/i.test(value)
}

function isApiKeySid(value: string) {
  return /^SK[0-9a-f]{32}$/i.test(value)
}

function normalizeE164(value: string) {
  const normalized = value.trim().replace(/[\s().-]/g, "")
  if (!/^\+[1-9][0-9]{7,14}$/.test(normalized)) {
    throw new Error("invalid_phone_number_e164")
  }
  return normalized
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

function isTrialParameterRestriction(error: unknown) {
  return error instanceof TwilioApiError
    && error.httpStatus === 400
    && /trial accounts have limited parameter access/i.test(error.message)
}

function toTestCallResult(call: TwilioCall, calledNumber: string, fromNumber: string, testMode: TwilioTestMode) {
  return {
    sid: call.sid ?? null,
    status: call.status ?? null,
    to: call.to ?? calledNumber,
    from: call.from ?? fromNumber,
    direction: call.direction ?? null,
    testMode,
  }
}

export class TwilioVoiceProvider {
  private readonly accountSid: string
  private readonly authorization: string

  constructor(private readonly config: TwilioConfig) {
    this.accountSid = config.twilioAccountSid.trim()

    const username = config.twilioAuthMode === "api_key"
      ? config.twilioApiKeySid.trim()
      : this.accountSid
    const password = config.twilioAuthMode === "api_key"
      ? config.twilioApiKeySecret
      : config.twilioAuthToken

    this.authorization = `Basic ${Buffer.from(`${username}:${password}`, "utf8").toString("base64")}`
  }

  validateConfig() {
    const missing: string[] = []

    if (!this.accountSid) missing.push("twilioAccountSid")
    if (!this.config.twilioFromNumber.trim()) missing.push("twilioFromNumber")

    if (this.config.twilioAuthMode === "api_key") {
      if (!this.config.twilioApiKeySid.trim()) missing.push("twilioApiKeySid")
      if (!this.config.twilioApiKeySecret) missing.push("twilioApiKeySecret")
    } else if (!this.config.twilioAuthToken) {
      missing.push("twilioAuthToken")
    }

    return { ok: missing.length === 0, missing }
  }

  async testConnection() {
    if (!isAccountSid(this.accountSid)) {
      throw new Error("invalid_twilio_account_sid")
    }
    if (this.config.twilioAuthMode === "api_key" && !isApiKeySid(this.config.twilioApiKeySid.trim())) {
      throw new Error("invalid_twilio_api_key_sid")
    }

    // Standard API keys cannot read the Accounts resource. Reading one call page
    // validates both authentication and the Voice permission needed by VigiSensys.
    const result = await this.request<TwilioCallList>(
      "GET",
      `/Accounts/${encodeURIComponent(this.accountSid)}/Calls.json?PageSize=1`,
    )

    return {
      ok: true,
      accountSid: this.accountSid,
      authMode: this.config.twilioAuthMode,
      callsReadable: Array.isArray(result.calls),
    }
  }

  async triggerTestCall(to: string) {
    if (!isAccountSid(this.accountSid)) {
      throw new Error("invalid_twilio_account_sid")
    }
    if (this.config.twilioAuthMode === "api_key" && !isApiKeySid(this.config.twilioApiKeySid.trim())) {
      throw new Error("invalid_twilio_api_key_sid")
    }

    const calledNumber = normalizeE164(to)
    const fromNumber = normalizeE164(this.config.twilioFromNumber)
    const twiml = `<Response><Say language="fr-FR">${escapeXml(TEST_MESSAGE)}</Say></Response>`
    const body = new URLSearchParams({
      To: calledNumber,
      From: fromNumber,
      Twiml: twiml,
      Timeout: "30",
    })

    try {
      const call = await this.request<TwilioCall>(
        "POST",
        `/Accounts/${encodeURIComponent(this.accountSid)}/Calls.json`,
        body,
      )

      return toTestCallResult(call, calledNumber, fromNumber, "vigisensys_tts")
    } catch (error) {
      if (!isTrialParameterRestriction(error)) {
        throw error
      }

      // Trial accounts reject inline TwiML and extra call parameters. Twilio only
      // allows a small set of hosted Voice templates for REST-created trial calls.
      // Retrying with the official TTS template validates the VigiSensys -> Twilio
      // outbound path without changing the production/full-account behavior above.
      const trialBody = new URLSearchParams({
        To: calledNumber,
        From: fromNumber,
        Url: TWILIO_TRIAL_TTS_TEMPLATE_URL,
      })
      const trialCall = await this.request<TwilioCall>(
        "POST",
        `/Accounts/${encodeURIComponent(this.accountSid)}/Calls.json`,
        trialBody,
      )

      return toTestCallResult(trialCall, calledNumber, fromNumber, "twilio_trial_template")
    }
  }

  private async request<TResponse>(method: "GET" | "POST", path: string, body?: URLSearchParams): Promise<TResponse> {
    let response: Response

    try {
      response = await fetch(`${TWILIO_API_BASE}${path}`, {
        method,
        headers: {
          Accept: "application/json",
          Authorization: this.authorization,
          ...(body ? { "Content-Type": "application/x-www-form-urlencoded" } : {}),
        },
        body: body?.toString(),
        cache: "no-store",
        signal: AbortSignal.timeout(TWILIO_REQUEST_TIMEOUT_MS),
      })
    } catch (error) {
      if (error instanceof Error && error.name === "TimeoutError") {
        throw new Error("twilio_request_timeout")
      }
      throw new Error(`twilio_request_failed: ${error instanceof Error ? error.message : "network_error"}`)
    }

    if (!response.ok) {
      const payload = await response.json().catch(() => null) as TwilioErrorPayload | null
      const code = payload?.code ? ` (${payload.code})` : ""
      const message = payload?.message?.trim() || `HTTP ${response.status}`
      throw new TwilioApiError(`Twilio${code}: ${message}`, response.status, payload?.code ?? null)
    }

    return (await response.json()) as TResponse
  }
}
