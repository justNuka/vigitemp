import type { TelephonyCopy, TelephonyDraft } from "./telephony-settings-types"

export const STORAGE_KEY = "vigitemp.admin.telephony.preview"

export const DEFAULT_DRAFT: TelephonyDraft = {
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

export const COPY: Record<"fr" | "en", TelephonyCopy> = {
  fr: {
    title: "T?l?phonie VoIP",
    description: "Pr?parez le branchement d'un provider VoIP. Cette carte est uniquement front pour le moment.",
    warning: "Aucune donn?e n'est envoy?e au serveur pour l'instant. Cette pr?configuration reste locale au navigateur.",
    enabled: "Activer la t?l?phonie",
    provider: "Provider",
    callerId: "Num?ro pr?sent? / Caller ID",
    notes: "Notes d'int?gration",
    notesPlaceholder: "Ex: num?ro de test, routage, contraintes du client...",
    authMethod: "M?thode d'authentification",
    saveLocal: "Enregistrer localement",
    reset: "R?initialiser",
    localSaved: "Configuration front locale",
    summary: "R?sum?",
    providerLabel: {
      none: "Aucun",
      twilio: "Twilio",
      ovhcloud: "OVHcloud",
      keyyo: "Keyyo",
      asterisk: "Asterisk",
    },
    providerDesc: {
      none: "S?lectionnez un provider pour afficher la m?thode d'auth adapt?e.",
      twilio: "Twilio Voice: API Key SID + Secret pr?f?r?s; Auth Token possible en repli.",
      ovhcloud: "OVHcloud API: Application Key, Application Secret et Consumer Key.",
      keyyo: "Keyyo API: OAuth2 avec application d?clar?e, access token et refresh token.",
      asterisk: "Asterisk ARI: URL ARI + utilisateur + mot de passe d?di?s.",
    },
    twilio: {
      apiKey: "API Key SID + Secret",
      authToken: "Account SID + Auth Token",
      accountSid: "Account SID",
      apiKeySid: "API Key SID",
      apiKeySecret: "API Key Secret",
      authTokenField: "Auth Token",
      fromNumber: "Num?ro Twilio ?metteur",
    },
    ovh: {
      endpoint: "Endpoint",
      applicationKey: "Application Key",
      applicationSecret: "Application Secret",
      consumerKey: "Consumer Key",
      billingAccount: "Billing account",
      serviceName: "Service name / ligne",
    },
    keyyo: {
      clientId: "OAuth2 Client ID",
      clientSecret: "OAuth2 Client Secret",
      accessToken: "Access Token",
      refreshToken: "Refresh Token",
      lineId: "Identifiant de ligne / CSI",
    },
    asterisk: {
      baseUrl: "URL ARI",
      username: "Utilisateur ARI",
      password: "Mot de passe ARI",
      appName: "Nom d'application ARI",
    },
  },
  en: {
    title: "VoIP Telephony",
    description: "Prepare the connection to a VoIP provider. This card is front-only for now.",
    warning: "No data is sent to the server yet. This draft stays local to the browser.",
    enabled: "Enable telephony",
    provider: "Provider",
    callerId: "Caller ID",
    notes: "Integration notes",
    notesPlaceholder: "Example: test number, routing, client constraints...",
    authMethod: "Authentication method",
    saveLocal: "Save locally",
    reset: "Reset",
    localSaved: "Local front configuration",
    summary: "Summary",
    providerLabel: {
      none: "None",
      twilio: "Twilio",
      ovhcloud: "OVHcloud",
      keyyo: "Keyyo",
      asterisk: "Asterisk",
    },
    providerDesc: {
      none: "Select a provider to show the matching auth method.",
      twilio: "Twilio Voice: API Key SID + Secret preferred; Auth Token available as fallback.",
      ovhcloud: "OVHcloud API: Application Key, Application Secret and Consumer Key.",
      keyyo: "Keyyo API: OAuth2 with a registered app, access token and refresh token.",
      asterisk: "Asterisk ARI: ARI URL + dedicated username + password.",
    },
    twilio: {
      apiKey: "API Key SID + Secret",
      authToken: "Account SID + Auth Token",
      accountSid: "Account SID",
      apiKeySid: "API Key SID",
      apiKeySecret: "API Key Secret",
      authTokenField: "Auth Token",
      fromNumber: "Twilio caller number",
    },
    ovh: {
      endpoint: "Endpoint",
      applicationKey: "Application Key",
      applicationSecret: "Application Secret",
      consumerKey: "Consumer Key",
      billingAccount: "Billing account",
      serviceName: "Service name / line",
    },
    keyyo: {
      clientId: "OAuth2 Client ID",
      clientSecret: "OAuth2 Client Secret",
      accessToken: "Access Token",
      refreshToken: "Refresh Token",
      lineId: "Line / CSI identifier",
    },
    asterisk: {
      baseUrl: "ARI URL",
      username: "ARI username",
      password: "ARI password",
      appName: "ARI app name",
    },
  },
}

export function maskSecret(value: string) {
  if (!value) return "?"
  if (value.length <= 6) return "?".repeat(value.length)
  return `${value.slice(0, 3)}????${value.slice(-2)}`
}

export function buildSummary(draft: TelephonyDraft, copy: TelephonyCopy) {
  switch (draft.provider) {
    case "twilio":
      return draft.twilioAuthMode === "api_key"
        ? [
            `${copy.twilio.accountSid}: ${draft.twilioAccountSid || "?"}`,
            `${copy.twilio.apiKeySid}: ${draft.twilioApiKeySid || "?"}`,
            `${copy.twilio.apiKeySecret}: ${maskSecret(draft.twilioApiKeySecret)}`,
          ]
        : [
            `${copy.twilio.accountSid}: ${draft.twilioAccountSid || "?"}`,
            `${copy.twilio.authTokenField}: ${maskSecret(draft.twilioAuthToken)}`,
          ]
    case "ovhcloud":
      return [
        `${copy.ovh.endpoint}: ${draft.ovhEndpoint || "?"}`,
        `${copy.ovh.applicationKey}: ${draft.ovhApplicationKey || "?"}`,
        `${copy.ovh.applicationSecret}: ${maskSecret(draft.ovhApplicationSecret)}`,
        `${copy.ovh.consumerKey}: ${maskSecret(draft.ovhConsumerKey)}`,
      ]
    case "keyyo":
      return [
        `${copy.keyyo.clientId}: ${draft.keyyoClientId || "?"}`,
        `${copy.keyyo.clientSecret}: ${maskSecret(draft.keyyoClientSecret)}`,
        `${copy.keyyo.accessToken}: ${maskSecret(draft.keyyoAccessToken)}`,
        `${copy.keyyo.refreshToken}: ${maskSecret(draft.keyyoRefreshToken)}`,
      ]
    case "asterisk":
      return [
        `${copy.asterisk.baseUrl}: ${draft.asteriskBaseUrl || "?"}`,
        `${copy.asterisk.username}: ${draft.asteriskUsername || "?"}`,
        `${copy.asterisk.password}: ${maskSecret(draft.asteriskPassword)}`,
      ]
    default:
      return []
  }
}
