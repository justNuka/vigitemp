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
    title: "Téléphonie VoIP",
    description: "Préparez le branchement d'un provider VoIP. Cette carte est uniquement front pour le moment.",
    warning: "Aucune donnée n'est envoyée au serveur pour l'instant. Cette préconfiguration reste locale au navigateur.",
    frontOnly: "Configuration VoIP",
    enabled: "Activer la téléphonie",
    provider: "Fournisseur",
    callerId: "Numéro présenté / Caller ID",
    notes: "Notes d'intégration",
    notesPlaceholder: "Ex: numéro de test, routage, contraintes du client...",
    authMethod: "Méthode d'authentification",
    saveLocal: "Enregistrer localement",
    reset: "Réinitialiser",
    localSaved: "Configuration VoIP",
    summary: "Résumé",
    emptySummary: "Aucun paramètre saisi pour le moment.",
    providerLabel: {
      none: "Aucun",
      twilio: "Twilio",
      ovhcloud: "OVHcloud",
      keyyo: "Keyyo",
      asterisk: "Asterisk",
    },
    providerDesc: {
      none: "Sélectionnez un provider pour afficher la méthode d'auth adaptée.",
      twilio: "Twilio Voice: API Key SID + Secret préférés; Auth Token possible en repli.",
      ovhcloud: "OVHcloud API: Application Key, Application Secret et Consumer Key.",
      keyyo: "Keyyo API: OAuth2 avec application déclarée, access token et refresh token.",
      asterisk: "Asterisk ARI: URL ARI + utilisateur + mot de passe dédiés.",
    },
    placeholders: {
      secret: "secret",
      password: "mot de passe",
      authToken: "auth token",
      billingAccount: "compte de facturation",
      serviceName: "nom du service",
      accessToken: "access token",
      refreshToken: "refresh token",
      lineIdentifier: "CSI / identifiant de ligne",
    },
    twilio: {
      apiKey: "API Key SID + Secret",
      authToken: "Account SID + Auth Token",
      accountSid: "Account SID",
      apiKeySid: "API Key SID",
      apiKeySecret: "API Key Secret",
      authTokenField: "Auth Token",
      fromNumber: "Numéro Twilio émetteur",
    },
    ovh: {
      endpoint: "Point d'accès",
      applicationKey: "Application Key",
      applicationSecret: "Application Secret",
      consumerKey: "Consumer Key",
      billingAccount: "Compte de facturation",
      serviceName: "Nom du service / ligne",
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
    description: "Prepare the connection to a VoIP provider.",
    warning: "VoIP telephony configuration.",
    frontOnly: "VoIP configuration",
    enabled: "Enable telephony",
    provider: "Provider",
    callerId: "Caller ID",
    notes: "Integration notes",
    notesPlaceholder: "Example: test number, routing, client constraints...",
    authMethod: "Authentication method",
    saveLocal: "Save locally",
    reset: "Reset",
    localSaved: "VoIP configuration",
    summary: "Summary",
    emptySummary: "No parameters entered yet.",
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
    placeholders: {
      secret: "secret",
      password: "password",
      authToken: "auth token",
      billingAccount: "billing account",
      serviceName: "service name",
      accessToken: "access token",
      refreshToken: "refresh token",
      lineIdentifier: "CSI / line identifier",
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
