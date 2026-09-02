import { prisma } from "@/lib/prisma"
import { decryptTelephonySecret, encryptTelephonySecret } from "@/lib/secret-crypto"

export type TelephonyProviderId = "none" | "twilio" | "ovhcloud" | "keyyo" | "asterisk"
export type TwilioAuthMode = "api_key" | "auth_token"

export type TelephonyConfig = {
  enabled: boolean
  provider: TelephonyProviderId
  callerId: string
  notes: string
  twilioAuthMode: TwilioAuthMode
  twilioAccountSid: string
  twilioApiKeySid: string
  twilioApiKeySecret: string
  twilioAuthToken: string
  twilioFromNumber: string
  ovhEndpoint: string
  ovhApplicationKey: string
  ovhApplicationSecret: string
  ovhConsumerKey: string
  ovhBillingAccount: string
  ovhServiceName: string
  ovhClick2CallUserId: string
  ovhClick2CallLogin: string
  ovhClick2CallPassword: string
  keyyoClientId: string
  keyyoClientSecret: string
  keyyoAccessToken: string
  keyyoRefreshToken: string
  keyyoLineId: string
  asteriskBaseUrl: string
  asteriskUsername: string
  asteriskPassword: string
  asteriskAppName: string
}

export const TELEPHONY_SECTION = "TELEPHONIE"

export const DEFAULT_TELEPHONY_CONFIG: TelephonyConfig = {
  enabled: false,
  provider: "none",
  callerId: "",
  notes: "",
  twilioAuthMode: "api_key",
  twilioAccountSid: "",
  twilioApiKeySid: "",
  twilioApiKeySecret: "",
  twilioAuthToken: "",
  twilioFromNumber: "",
  ovhEndpoint: "ovh-eu",
  ovhApplicationKey: "",
  ovhApplicationSecret: "",
  ovhConsumerKey: "",
  ovhBillingAccount: "",
  ovhServiceName: "",
  ovhClick2CallUserId: "",
  ovhClick2CallLogin: "",
  ovhClick2CallPassword: "",
  keyyoClientId: "",
  keyyoClientSecret: "",
  keyyoAccessToken: "",
  keyyoRefreshToken: "",
  keyyoLineId: "",
  asteriskBaseUrl: "http://127.0.0.1:8088/ari",
  asteriskUsername: "",
  asteriskPassword: "",
  asteriskAppName: "vigitemp",
}

type ParamSpec = {
  key: keyof TelephonyConfig
  motCle: string
  secret?: boolean
}

const PARAM_SPECS: ParamSpec[] = [
  { key: "enabled", motCle: "ENABLED" },
  { key: "provider", motCle: "PROVIDER" },
  { key: "callerId", motCle: "CALLER_ID" },
  { key: "notes", motCle: "NOTES" },
  { key: "twilioAuthMode", motCle: "TWILIO_AUTH_MODE" },
  { key: "twilioAccountSid", motCle: "TWILIO_ACCOUNT_SID" },
  { key: "twilioApiKeySid", motCle: "TWILIO_API_KEY_SID" },
  { key: "twilioApiKeySecret", motCle: "TWILIO_API_KEY_SECRET", secret: true },
  { key: "twilioAuthToken", motCle: "TWILIO_AUTH_TOKEN", secret: true },
  { key: "twilioFromNumber", motCle: "TWILIO_FROM_NUMBER" },
  { key: "ovhEndpoint", motCle: "OVH_ENDPOINT" },
  { key: "ovhApplicationKey", motCle: "OVH_APPLICATION_KEY", secret: true },
  { key: "ovhApplicationSecret", motCle: "OVH_APPLICATION_SECRET", secret: true },
  { key: "ovhConsumerKey", motCle: "OVH_CONSUMER_KEY", secret: true },
  { key: "ovhBillingAccount", motCle: "OVH_BILLING_ACCOUNT" },
  { key: "ovhServiceName", motCle: "OVH_SERVICE_NAME" },
  { key: "ovhClick2CallUserId", motCle: "OVH_CLICK2CALL_USER_ID" },
  { key: "ovhClick2CallLogin", motCle: "OVH_CLICK2CALL_LOGIN", secret: true },
  { key: "ovhClick2CallPassword", motCle: "OVH_CLICK2CALL_PASSWORD", secret: true },
  { key: "keyyoClientId", motCle: "KEYYO_CLIENT_ID" },
  { key: "keyyoClientSecret", motCle: "KEYYO_CLIENT_SECRET", secret: true },
  { key: "keyyoAccessToken", motCle: "KEYYO_ACCESS_TOKEN", secret: true },
  { key: "keyyoRefreshToken", motCle: "KEYYO_REFRESH_TOKEN", secret: true },
  { key: "keyyoLineId", motCle: "KEYYO_LINE_ID" },
  { key: "asteriskBaseUrl", motCle: "ASTERISK_BASE_URL" },
  { key: "asteriskUsername", motCle: "ASTERISK_USERNAME" },
  { key: "asteriskPassword", motCle: "ASTERISK_PASSWORD", secret: true },
  { key: "asteriskAppName", motCle: "ASTERISK_APP_NAME" },
]

function stringifyValue(key: keyof TelephonyConfig, value: TelephonyConfig[keyof TelephonyConfig]) {
  if (key === "enabled") return value ? "true" : "false"
  return String(value ?? "")
}

function parseValue(key: keyof TelephonyConfig, value: string | null | undefined): TelephonyConfig[keyof TelephonyConfig] {
  if (key === "enabled") return value === "true"
  return value ?? ""
}

export async function getTelephonyConfig(): Promise<TelephonyConfig> {
  const params = await prisma.t_parametre.findMany({ where: { Section: TELEPHONY_SECTION } })
  const map = new Map(params.map((param) => [param.Mot_Cle, param.Valeur ?? ""]))

  const config: TelephonyConfig = { ...DEFAULT_TELEPHONY_CONFIG }

  for (const spec of PARAM_SPECS) {
    const raw = map.get(spec.motCle)
    if (raw == null) continue
    const value = spec.secret ? decryptTelephonySecret(raw) : raw
    config[spec.key] = parseValue(spec.key, value) as never
  }

  return config
}

export async function saveTelephonyConfig(config: TelephonyConfig) {
  for (const spec of PARAM_SPECS) {
    const value = stringifyValue(spec.key, config[spec.key])
    const storedValue = spec.secret ? encryptTelephonySecret(value) : value

    await prisma.t_parametre.upsert({
      where: {
        Section_Mot_Cle: {
          Section: TELEPHONY_SECTION,
          Mot_Cle: spec.motCle,
        },
      },
      update: { Valeur: storedValue },
      create: {
        Section: TELEPHONY_SECTION,
        Mot_Cle: spec.motCle,
        Valeur: storedValue,
        Commentaire: "",
      },
    })
  }
}

export function sanitizeTelephonyConfigForAudit(config: TelephonyConfig) {
  return {
    enabled: config.enabled,
    provider: config.provider,
    callerId: config.callerId,
    notes: config.notes,
    twilioAuthMode: config.twilioAuthMode,
    twilioAccountSid: config.twilioAccountSid,
    twilioApiKeySid: config.twilioApiKeySid,
    twilioFromNumber: config.twilioFromNumber,
    ovhEndpoint: config.ovhEndpoint,
    ovhBillingAccount: config.ovhBillingAccount,
    ovhServiceName: config.ovhServiceName,
    ovhClick2CallUserId: config.ovhClick2CallUserId,
    asteriskBaseUrl: config.asteriskBaseUrl,
    asteriskUsername: config.asteriskUsername,
    asteriskAppName: config.asteriskAppName,
    secretsConfigured: {
      ovhApplicationKey: Boolean(config.ovhApplicationKey),
      ovhApplicationSecret: Boolean(config.ovhApplicationSecret),
      ovhConsumerKey: Boolean(config.ovhConsumerKey),
      ovhClick2CallLogin: Boolean(config.ovhClick2CallLogin),
      ovhClick2CallPassword: Boolean(config.ovhClick2CallPassword),
      twilioApiKeySecret: Boolean(config.twilioApiKeySecret),
      twilioAuthToken: Boolean(config.twilioAuthToken),
      keyyoClientSecret: Boolean(config.keyyoClientSecret),
      keyyoAccessToken: Boolean(config.keyyoAccessToken),
      keyyoRefreshToken: Boolean(config.keyyoRefreshToken),
      asteriskPassword: Boolean(config.asteriskPassword),
    },
  }
}

export function getTelephonyConfigMissingFields(config: TelephonyConfig): string[] {
  if (!config.enabled) return []

  if (config.provider === "ovhcloud") {
    return [
      ["ovhApplicationKey", config.ovhApplicationKey],
      ["ovhApplicationSecret", config.ovhApplicationSecret],
      ["ovhConsumerKey", config.ovhConsumerKey],
      ["ovhBillingAccount", config.ovhBillingAccount],
      ["ovhServiceName", config.ovhServiceName],
      ["callerId", config.callerId],
    ].filter(([, value]) => !String(value || "").trim()).map(([key]) => key)
  }

  if (config.provider === "asterisk") {
    return [
      ["asteriskBaseUrl", config.asteriskBaseUrl],
      ["asteriskUsername", config.asteriskUsername],
      ["asteriskPassword", config.asteriskPassword],
    ].filter(([, value]) => !String(value || "").trim()).map(([key]) => key)
  }

  return []
}
