export function parseSmtpBoolean(
  value: string | null | undefined,
) {
  const normalized = (value ?? "").trim().toLowerCase()
  return ["1", "true", "yes", "on"].includes(normalized)
}

export function isSmtpConfigurationComplete(input: {
  host: string
  port: number
  user: string
  passwordConfigured: boolean
  sender: string
}) {
  return Boolean(
    input.host.trim() &&
      input.user.trim() &&
      input.passwordConfigured &&
      input.sender.trim() &&
      Number.isFinite(input.port) &&
      input.port > 0 &&
      input.port <= 65535,
  )
}
