export type ParsedMysqlConnection = {
  host: string
  port: number
  user: string
  password: string
  database: string
  allowPublicKeyRetrieval: boolean
}

function decodeConnectionValue(value: string) {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function getSearchParamIgnoreCase(searchParams: URLSearchParams, name: string) {
  const expected = name.toLowerCase()
  for (const [key, value] of searchParams.entries()) {
    if (key.toLowerCase() === expected) return value
  }
  return null
}

function parseBoolean(value: string | null, fallback = false) {
  if (value === null) return fallback
  return ["1", "true", "yes", "on"].includes(value.trim().toLowerCase())
}

export function parseMysqlConnectionUrl(databaseUrl: string): ParsedMysqlConnection {
  const normalizedUrl = databaseUrl.trim().replace(/^mariadb:/i, "mysql:")
  const parsed = new URL(normalizedUrl)

  if (parsed.protocol !== "mysql:") {
    throw new Error("[database] Expected a mysql:// or mariadb:// DATABASE_URL")
  }

  const database = decodeConnectionValue(parsed.pathname.replace(/^\//, ""))
  if (!database) {
    throw new Error("[database] MySQL database name is missing")
  }

  const parsedPort = parsed.port ? Number.parseInt(parsed.port, 10) : 3306
  if (!Number.isFinite(parsedPort) || parsedPort <= 0 || parsedPort > 65535) {
    throw new Error("[database] Invalid MySQL port")
  }

  return {
    host: parsed.hostname,
    port: parsedPort,
    user: decodeConnectionValue(parsed.username),
    password: decodeConnectionValue(parsed.password),
    database,
    allowPublicKeyRetrieval: parseBoolean(
      getSearchParamIgnoreCase(parsed.searchParams, "allowPublicKeyRetrieval"),
    ),
  }
}
