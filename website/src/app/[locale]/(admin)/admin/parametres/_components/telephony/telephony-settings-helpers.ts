import type { TelephonyCopy, TelephonyDraft } from "./telephony-settings-types"

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

export const COPY: Record<"fr" | "en", TelephonyCopy> = {
  fr: {
    title: "Téléphonie",
    description: "Configurez le canal voix. Twilio est recommandé pour la V1 ; OVHcloud et Asterisk restent disponibles pour des besoins spécifiques.",
    warning: "La V1 Twilio déclenche un appel sortant et lit un message TTS en français via HTTPS uniquement. Le moteur d'alarmes, l'escalade, les callbacks et le DTMF seront branchés dans des lots séparés après validation du PoC.",
    frontOnly: "Configuration téléphonie",
    enabled: "Activer la téléphonie",
    provider: "Fournisseur",
    callerId: "Numéro présenté / Caller ID",
    notes: "Notes d'intégration",
    notesPlaceholder: "Ex: ligne dédiée alarmes, contraintes opérateur, horaires...",
    authMethod: "Méthode d'authentification",
    saveLocal: "Enregistrer localement",
    reset: "Réinitialiser",
    localSaved: "Configuration téléphonie",
    summary: "Résumé",
    emptySummary: "Aucun paramètre saisi pour le moment.",
    saveServer: "Enregistrer",
    testConnection: "Tester la connexion",
    createClick2CallUser: "Créer l'utilisateur Click2Call",
    testCall: "Tester l'appel",
    testNumber: "Numéro de test",
    testNumberPlaceholder: "+33612345678",
    userCreated: "Utilisateur Click2Call créé et sélectionné",
    providerLabel: {
      none: "Aucun",
      twilio: "Twilio",
      ovhcloud: "OVHcloud",
      keyyo: "Keyyo",
      asterisk: "Asterisk",
    },
    providerDesc: {
      none: "Sélectionnez un provider pour afficher la configuration correspondante.",
      twilio: "Provider recommandé V1 : appel sortant + TTS via l'API HTTPS Twilio, sans SIP/RTP ni port entrant côté client.",
      ovhcloud: "OVHcloud API Telephony + Click2Call. Son utilisation dépend de l'offre souscrite et ne fournit pas le même contrôle vocal que Twilio/Asterisk.",
      keyyo: "Préconfiguration UI uniquement pour l'instant.",
      asterisk: "Provider avancé/on-premise : connexion ARI et appel sortant via une infrastructure SIP Asterisk séparée.",
    },
    placeholders: {
      secret: "secret",
      password: "mot de passe",
      authToken: "auth token",
      billingAccount: "xx12345-ovh-1",
      serviceName: "+33123456789",
      accessToken: "access token",
      refreshToken: "refresh token",
      lineIdentifier: "CSI / identifiant de ligne",
      click2CallLogin: "vigitemp_alarm",
      click2CallUserId: "id utilisateur Click2Call",
    },
    twilio: {
      apiKey: "API Key SID + Secret (recommandé)",
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
      click2CallUserId: "Id utilisateur Click2Call",
      click2CallLogin: "Login Click2Call",
      click2CallPassword: "Mot de passe Click2Call",
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
    title: "Telephony",
    description: "Configure the voice channel. Twilio is recommended for V1; OVHcloud and Asterisk remain available for specific requirements.",
    warning: "Twilio V1 places an outbound call and reads a French TTS message using HTTPS only. Alarm orchestration, escalation, callbacks and DTMF will be connected in separate lots after the PoC is validated.",
    frontOnly: "Telephony configuration",
    enabled: "Enable telephony",
    provider: "Provider",
    callerId: "Caller ID",
    notes: "Integration notes",
    notesPlaceholder: "Example: alarm line, routing constraints, allowed hours...",
    authMethod: "Authentication method",
    saveLocal: "Save locally",
    reset: "Reset",
    localSaved: "Telephony configuration",
    summary: "Summary",
    emptySummary: "No parameters entered yet.",
    saveServer: "Save",
    testConnection: "Test connection",
    createClick2CallUser: "Create Click2Call user",
    testCall: "Test call",
    testNumber: "Test number",
    testNumberPlaceholder: "+33612345678",
    userCreated: "Click2Call user created and selected",
    providerLabel: {
      none: "None",
      twilio: "Twilio",
      ovhcloud: "OVHcloud",
      keyyo: "Keyyo",
      asterisk: "Asterisk",
    },
    providerDesc: {
      none: "Select a provider to show the matching configuration.",
      twilio: "Recommended V1 provider: outbound call + TTS through Twilio HTTPS API, with no SIP/RTP or inbound customer port.",
      ovhcloud: "OVHcloud Telephony API + Click2Call. Availability depends on the subscribed plan and provides less voice control than Twilio/Asterisk.",
      keyyo: "UI preconfiguration only for now.",
      asterisk: "Advanced/on-premise provider: ARI connectivity and outbound calls through a separate Asterisk SIP infrastructure.",
    },
    placeholders: {
      secret: "secret",
      password: "password",
      authToken: "auth token",
      billingAccount: "xx12345-ovh-1",
      serviceName: "+33123456789",
      accessToken: "access token",
      refreshToken: "refresh token",
      lineIdentifier: "CSI / line identifier",
      click2CallLogin: "vigitemp_alarm",
      click2CallUserId: "Click2Call user id",
    },
    twilio: {
      apiKey: "API Key SID + Secret (recommended)",
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
      click2CallUserId: "Click2Call user id",
      click2CallLogin: "Click2Call login",
      click2CallPassword: "Click2Call password",
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
            `${copy.twilio.fromNumber}: ${draft.twilioFromNumber || "?"}`,
          ]
        : [
            `${copy.twilio.accountSid}: ${draft.twilioAccountSid || "?"}`,
            `${copy.twilio.authTokenField}: ${maskSecret(draft.twilioAuthToken)}`,
            `${copy.twilio.fromNumber}: ${draft.twilioFromNumber || "?"}`,
          ]
    case "ovhcloud":
      return [
        `${copy.ovh.endpoint}: ${draft.ovhEndpoint || "?"}`,
        `${copy.ovh.applicationKey}: ${draft.ovhApplicationKey || "?"}`,
        `${copy.ovh.applicationSecret}: ${maskSecret(draft.ovhApplicationSecret)}`,
        `${copy.ovh.consumerKey}: ${maskSecret(draft.ovhConsumerKey)}`,
        `${copy.ovh.billingAccount}: ${draft.ovhBillingAccount || "?"}`,
        `${copy.ovh.serviceName}: ${draft.ovhServiceName || "?"}`,
        `${copy.ovh.click2CallUserId}: ${draft.ovhClick2CallUserId || "?"}`,
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
        `${copy.asterisk.appName}: ${draft.asteriskAppName || "?"}`,
      ]
    default:
      return []
  }
}
