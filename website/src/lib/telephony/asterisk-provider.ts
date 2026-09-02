import type { TelephonyConfig } from "@/lib/telephony/config"

type AsteriskConfig = Pick<
  TelephonyConfig,
  "asteriskBaseUrl" | "asteriskUsername" | "asteriskPassword"
>

type AsteriskInfo = {
  build?: {
    version?: string
  }
  system?: {
    entity_id?: string
  }
  config?: {
    name?: string
  }
}

type AsteriskChannel = {
  id?: string
  name?: string
  state?: string
  caller?: {
    name?: string
    number?: string
  }
  connected?: {
    name?: string
    number?: string
  }
}

const ASTERISK_POC_ENDPOINT = "ovh"
const ASTERISK_POC_CONTEXT = "vigisensys-test"

function normalizeDialNumber(value: string) {
  const normalized = value.trim().replace(/[\s().-]/g, "")
  if (!/^\+?[0-9]{6,20}$/.test(normalized)) {
    throw new Error("invalid_phone_number")
  }
  return normalized
}

export class AsteriskAriProvider {
  private readonly baseUrl: string
  private readonly authorization: string

  constructor(private readonly config: AsteriskConfig) {
    const configuredUrl = config.asteriskBaseUrl.trim().replace(/\/+$/, "")
    if (!configuredUrl) {
      this.baseUrl = ""
    } else {
      const parsed = new URL(configuredUrl)
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        throw new Error("invalid_asterisk_url")
      }
      this.baseUrl = parsed.toString().replace(/\/+$/, "")
    }

    this.authorization = `Basic ${Buffer.from(`${config.asteriskUsername}:${config.asteriskPassword}`, "utf8").toString("base64")}`
  }

  validateConfig() {
    const missing = [
      ["asteriskBaseUrl", this.config.asteriskBaseUrl],
      ["asteriskUsername", this.config.asteriskUsername],
      ["asteriskPassword", this.config.asteriskPassword],
    ]
      .filter(([, value]) => !String(value || "").trim())
      .map(([key]) => key)

    return { ok: missing.length === 0, missing }
  }

  async testConnection() {
    const info = await this.request<AsteriskInfo>("GET", "/asterisk/info")
    return {
      ok: true,
      version: info.build?.version ?? null,
      systemName: info.config?.name ?? info.system?.entity_id ?? null,
    }
  }

  async triggerTestCall(to: string) {
    const dialNumber = normalizeDialNumber(to)
    const params = new URLSearchParams({
      endpoint: `PJSIP/${dialNumber}@${ASTERISK_POC_ENDPOINT}`,
      extension: "s",
      context: ASTERISK_POC_CONTEXT,
      priority: "1",
      timeout: "30",
    })

    const channel = await this.request<AsteriskChannel>("POST", `/channels?${params.toString()}`)
    return {
      id: channel.id ?? null,
      name: channel.name ?? null,
      state: channel.state ?? null,
      calledNumber: dialNumber,
    }
  }

  private async request<TResponse>(method: string, path: string): Promise<TResponse> {
    if (!this.baseUrl) {
      throw new Error("missing_asterisk_base_url")
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: {
        Accept: "application/json",
        Authorization: this.authorization,
      },
      cache: "no-store",
    })

    if (!response.ok) {
      const text = await response.text().catch(() => "")
      throw new Error(text || `asterisk_request_failed_${response.status}`)
    }

    if (response.status === 204) {
      return undefined as TResponse
    }

    return (await response.json()) as TResponse
  }
}
