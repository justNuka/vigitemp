import { createHash } from "crypto"

import type { TelephonyConfig } from "@/lib/telephony/config"

const OVH_API_BASE_BY_ENDPOINT: Record<string, string> = {
  "ovh-eu": "https://eu.api.ovh.com/1.0",
  "ovh-us": "https://api.us.ovhcloud.com/1.0",
  "ovh-ca": "https://ca.api.ovh.com/1.0",
}

type OvhClick2CallUser = {
  id: number
  login: string
}

type OvhConfig = Pick<
  TelephonyConfig,
  | "ovhEndpoint"
  | "ovhApplicationKey"
  | "ovhApplicationSecret"
  | "ovhConsumerKey"
  | "ovhBillingAccount"
  | "ovhServiceName"
  | "ovhClick2CallUserId"
  | "ovhClick2CallLogin"
  | "ovhClick2CallPassword"
  | "callerId"
>

export class OvhVoipProvider {
  private readonly baseUrl: string

  constructor(private readonly config: OvhConfig) {
    this.baseUrl = OVH_API_BASE_BY_ENDPOINT[config.ovhEndpoint] ?? OVH_API_BASE_BY_ENDPOINT["ovh-eu"]
  }

  validateConfig() {
    const missing = [
      ["ovhApplicationKey", this.config.ovhApplicationKey],
      ["ovhApplicationSecret", this.config.ovhApplicationSecret],
      ["ovhConsumerKey", this.config.ovhConsumerKey],
      ["ovhBillingAccount", this.config.ovhBillingAccount],
      ["ovhServiceName", this.config.ovhServiceName],
      ["callerId", this.config.callerId],
    ].filter(([, value]) => !String(value || "").trim()).map(([key]) => key)

    return { ok: missing.length === 0, missing }
  }

  async testConnection() {
    const users = await this.listClick2CallUsers()
    return {
      ok: true,
      endpoint: this.config.ovhEndpoint,
      billingAccount: this.config.ovhBillingAccount,
      serviceName: this.config.ovhServiceName,
      click2CallUsers: users,
    }
  }

  async listClick2CallUsers(): Promise<OvhClick2CallUser[]> {
    const ids = await this.request<number[]>("GET", `/telephony/${encodeURIComponent(this.config.ovhBillingAccount)}/line/${encodeURIComponent(this.config.ovhServiceName)}/click2CallUser`)

    const users = await Promise.all(
      ids.map(async (id) => {
        const details = await this.request<{ id?: number; login?: string }>(
          "GET",
          `/telephony/${encodeURIComponent(this.config.ovhBillingAccount)}/line/${encodeURIComponent(this.config.ovhServiceName)}/click2CallUser/${id}`,
        )

        return {
          id,
          login: details.login ?? String(id),
        }
      }),
    )

    return users
  }

  async createClick2CallUser() {
    if (!this.config.ovhClick2CallLogin.trim() || !this.config.ovhClick2CallPassword.trim()) {
      throw new Error("missing_click2call_credentials")
    }

    const id = await this.request<number>(
      "POST",
      `/telephony/${encodeURIComponent(this.config.ovhBillingAccount)}/line/${encodeURIComponent(this.config.ovhServiceName)}/click2CallUser`,
      {
        login: this.config.ovhClick2CallLogin.trim(),
        password: this.config.ovhClick2CallPassword,
      },
    )

    return {
      id,
      login: this.config.ovhClick2CallLogin.trim(),
    }
  }

  async triggerCall(to: string) {
    const userId = this.config.ovhClick2CallUserId.trim()
    if (!userId) {
      throw new Error("missing_click2call_user_id")
    }

    const result = await this.request<unknown>(
      "POST",
      `/telephony/${encodeURIComponent(this.config.ovhBillingAccount)}/line/${encodeURIComponent(this.config.ovhServiceName)}/click2CallUser/${encodeURIComponent(userId)}/click2Call`,
      {
        calledNumber: to,
        callingNumber: this.config.callerId.trim(),
      },
    )

    return result
  }

  private async request<TResponse>(method: string, path: string, body?: unknown): Promise<TResponse> {
    const bodyText = body == null ? "" : JSON.stringify(body)
    const url = `${this.baseUrl}${path}`
    const timestamp = await this.getTimestamp()
    const signature = this.buildSignature(method, url, bodyText, timestamp)

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        "X-Ovh-Application": this.config.ovhApplicationKey,
        "X-Ovh-Consumer": this.config.ovhConsumerKey,
        "X-Ovh-Timestamp": String(timestamp),
        "X-Ovh-Signature": signature,
      },
      body: body == null ? undefined : bodyText,
      cache: "no-store",
    })

    if (!response.ok) {
      const text = await response.text().catch(() => "")
      throw new Error(text || `ovh_request_failed_${response.status}`)
    }

    if (response.status === 204) {
      return undefined as TResponse
    }

    return (await response.json()) as TResponse
  }

  private async getTimestamp() {
    const response = await fetch(`${this.baseUrl}/auth/time`, { cache: "no-store" })
    if (!response.ok) {
      throw new Error(`ovh_time_failed_${response.status}`)
    }

    const text = await response.text()
    return Number.parseInt(text, 10)
  }

  private buildSignature(method: string, url: string, bodyText: string, timestamp: number) {
    const source = [
      this.config.ovhApplicationSecret,
      this.config.ovhConsumerKey,
      method.toUpperCase(),
      url,
      bodyText,
      String(timestamp),
    ].join("+")

    return `$1$${createHash("sha1").update(source, "utf8").digest("hex")}`
  }
}
