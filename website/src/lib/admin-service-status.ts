export type TelephonyProviderId = "none" | "twilio" | "ovhcloud" | "keyyo" | "asterisk"

export type MailingServiceStatus = {
  enabled: boolean
  configured: boolean
}

export type TelephonyServiceStatus = {
  enabled: boolean
  provider: TelephonyProviderId
  configured: boolean
}

export type SmtpConfigurationStatusInput = {
  enabled: boolean
  host: string
  port: number
  user: string
  passwordConfigured?: boolean
}

export function summarizeMailingService(
  config: SmtpConfigurationStatusInput,
): MailingServiceStatus {
  const configured = Boolean(
    config.host.trim() &&
      config.user.trim() &&
      config.passwordConfigured &&
      Number.isFinite(config.port) &&
      config.port > 0,
  )

  return {
    enabled: config.enabled,
    configured,
  }
}
