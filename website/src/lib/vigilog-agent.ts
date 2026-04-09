const AGENT_URLS = ["http://127.0.0.1:8000", "http://localhost:8000"] as const
const AGENT_PRESENCE_TIMEOUT_MS = 5_000
const AGENT_PROBE_TIMEOUT_MS = 15_000
const AGENT_CONFIGURE_TIMEOUT_MS = 35_000
const AGENT_READ_TIMEOUT_MS = 35_000

function createTimeoutSignal(timeoutMs: number): AbortSignal {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  controller.signal.addEventListener("abort", () => clearTimeout(timeout), { once: true })
  return controller.signal
}

async function fetchAgentJson<T>(path: string, init: RequestInit, timeoutMs = 3000): Promise<T> {
  let lastStatus: number | null = null
  let lastDetails: string | null = null
  let lastError: Error | null = null

  for (const baseUrl of AGENT_URLS) {
    try {
      const response = await fetch(`${baseUrl}${path}`, {
        ...init,
        signal: createTimeoutSignal(timeoutMs),
      })

      if (!response.ok) {
        lastStatus = response.status

        try {
          const payload = (await response.json()) as { details?: string; message?: string; error?: string }
          const detail = payload?.details || payload?.message || payload?.error
          if (typeof detail === "string" && detail.trim().length > 0) {
            lastDetails = detail.trim()
          }
        } catch {
          // ignore malformed/non-json response body
        }

        continue
      }

      return (await response.json()) as T
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Agent unavailable")
    }
  }

  if (lastStatus != null) {
    if (lastDetails) {
      throw new Error(`Agent request failed with status ${lastStatus}: ${lastDetails}`)
    }
    throw new Error(`Agent request failed with status ${lastStatus}`)
  }

  if (lastError) {
    throw lastError
  }

  throw new Error("Agent unavailable")
}

export type VigilogAgentProbeResponse = {
  res: boolean
  details: string
  loggerSerial: string | null
  productId: string | null
  frequencyMinutes: number | null
  alarmDelayMinutes: number | null
  lowLimitActive: boolean
  lowLimit: number | null
  highLimitActive: boolean
  highLimit: number | null
  startDelayMinutes: number | null
  stopButtonEnabled: boolean | null
  resetWithStartEnabled: boolean | null
}

export type VigilogAgentPresenceResponse = {
  res: boolean
  details: string
  step: string | null
}

export type VigilogAgentConfigureResponse = {
  res: boolean
  details: string
  loggerSerial: string | null
  productId: string | null
  frequencyMinutes: number
  alarmDelayMinutes: number
  lowLimitActive: boolean
  lowLimit: number | null
  highLimitActive: boolean
  highLimit: number | null
  startDelayMinutes: number
  stopButtonEnabled: boolean
  resetWithStartEnabled: boolean
  startedAutomatically: boolean | null
  scheduledStartAt: string | null
}

export type VigilogAgentReadResponse = {
  res: boolean
  details: string
  loggerSerial: string | null
  productId: string | null
  measurementCount: number
  measures: Array<{
    Numero_Ordre: number
    Date_Heure_Mesure: string
    Valeur: number | null
    Est_Marqueur: boolean
    Details: string | null
  }>
}

export type VigilogAgentClearResponse = {
  res: boolean
  details: string
  loggerSerial: string | null
  productId: string | null
  step: string | null
}

export async function probeVigilogAgent() {
  return fetchAgentJson<VigilogAgentProbeResponse>(
    "/vigilog/probe",
    { method: "GET" },
    AGENT_PROBE_TIMEOUT_MS,
  )
}

export async function presenceVigilogAgent() {
  return fetchAgentJson<VigilogAgentPresenceResponse>(
    "/vigilog/presence",
    { method: "GET" },
    AGENT_PRESENCE_TIMEOUT_MS,
  )
}

export async function configureVigilogAgent(payload: {
  lowLimitActive: boolean
  lowLimit: number | null
  highLimitActive: boolean
  highLimit: number | null
  frequencyMinutes: number
  alarmDelayMinutes: number
  startDelayMinutes: number
  stopButtonEnabled: boolean
  resetWithStartEnabled: boolean
  startAutomatically: boolean
}) {
  return fetchAgentJson<VigilogAgentConfigureResponse>(
    "/vigilog/configure",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
    AGENT_CONFIGURE_TIMEOUT_MS,
  )
}

export async function readVigilogAgent() {
  return fetchAgentJson<VigilogAgentReadResponse>(
    "/vigilog/read",
    { method: "GET" },
    AGENT_READ_TIMEOUT_MS,
  )
}

export async function clearVigilogAgent() {
  return fetchAgentJson<VigilogAgentClearResponse>(
    "/vigilog/clear",
    { method: "POST" },
    AGENT_READ_TIMEOUT_MS,
  )
}
