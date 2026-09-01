export type ProviderId = "none" | "twilio" | "ovhcloud" | "keyyo" | "asterisk"
export type TwilioAuthMode = "api_key" | "auth_token"

export type TelephonyDraft = {
  enabled: boolean
  provider: ProviderId
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

export type TelephonyCopy = {
  title: string
  description: string
  warning: string
  frontOnly: string
  enabled: string
  provider: string
  callerId: string
  notes: string
  notesPlaceholder: string
  authMethod: string
  saveLocal: string
  reset: string
  localSaved: string
  summary: string
  emptySummary: string
  saveServer: string
  testConnection: string
  createClick2CallUser: string
  testCall: string
  testNumber: string
  testNumberPlaceholder: string
  userCreated: string
  providerLabel: Record<ProviderId, string>
  providerDesc: Record<ProviderId, string>
  placeholders: {
    secret: string
    password: string
    authToken: string
    billingAccount: string
    serviceName: string
    accessToken: string
    refreshToken: string
    lineIdentifier: string
    click2CallLogin: string
    click2CallUserId: string
  }
  twilio: Record<"apiKey" | "authToken" | "accountSid" | "apiKeySid" | "apiKeySecret" | "authTokenField" | "fromNumber", string>
  ovh: Record<"endpoint" | "applicationKey" | "applicationSecret" | "consumerKey" | "billingAccount" | "serviceName" | "click2CallUserId" | "click2CallLogin" | "click2CallPassword", string>
  keyyo: Record<"clientId" | "clientSecret" | "accessToken" | "refreshToken" | "lineId", string>
  asterisk: Record<"baseUrl" | "username" | "password" | "appName", string>
}
