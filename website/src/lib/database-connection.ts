export type DatabaseProvider = "mysql" | "mssql"

export type ParsedMysqlConnection = {
  host: string
  port: number
  user: string
  password: string
  database: string
  allowPublicKeyRetrieval: boolean
}

export type ParsedSqlServerConnection = {
  server: string
  port: number
  database: string
  user: string
  password: string
  encrypt: boolean
  trustServerCertificate: boolean
}

function decodeConnectionValue(value: string) {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function parseBoolean(value: string | null | undefined, fallback: boolean) {
  if (value == null) return fallback
  return ["1", "true", "yes", "on"].includes(value.trim().toLowerCase())
}

function getSearchParamIgnoreCase(searchParams: URLSearchParams, name: string) {
  const expected = name.toLowerCase()
  for (const [key, value] of searchParams.entries()) {
    if (key.toLowerCase() === expected) return value
  }
  return null
}

export function parseMysqlConnectionUrl(databaseUrl: string): ParsedMysqlConnection {
  const normalizedUrl = databaseUrl.trim().replace(/^mariadb:/i, "mysql:")
  const parsed = new URL(normalizedUrl)

  if (parsed.protocol !== "mysql:") {
    throw new Error("[database] Expected a mysql:// or mariadb:// DATABASE_URL")
  }

  const database = decodeConnectionValue(parsed.pathname.replace(/^\//, ""))
  const port = parsed.port ? Number.parseInt(parsed.port, 10) : 3306
  if (!parsed.hostname || !database || !Number.isFinite(port) || port <= 0 || port > 65535) {
    throw new Error("[database] Invalid MySQL DATABASE_URL")
  }

  return {
    host: parsed.hostname,
    port,
    user: decodeConnectionValue(parsed.username),
    password: decodeConnectionValue(parsed.password),
    database,
    allowPublicKeyRetrieval: parseBoolean(
      getSearchParamIgnoreCase(parsed.searchParams, "allowPublicKeyRetrieval"),
      false,
    ),
  }
}

function splitSqlServerProperties(value: string) {
  const properties: string[] = []
  let current = ""
  let braceDepth = 0

  for (let index = 0; index < value.length; index += 1) {
    const char = value[index]
    if (char === "{") braceDepth += 1
    if (char === "}" && braceDepth > 0) braceDepth -= 1

    if (char === ";" && braceDepth === 0) {
      properties.push(current)
      current = ""
      continue
    }
    current += char
  }

  properties.push(current)
  return properties
}

function unwrapSqlServerValue(value: string) {
  const trimmed = value.trim()
  const unwrapped =
    trimmed.startsWith("{") && trimmed.endsWith("}")
      ? trimmed.slice(1, -1).replace(/}}/g, "}")
      : trimmed
  return decodeConnectionValue(unwrapped)
}

function parseSqlServerHost(authority: string) {
  if (authority.startsWith("[")) {
    const end = authority.indexOf("]")
    if (end < 0) throw new Error("[database] Invalid SQL Server host")
    const server = authority.slice(1, end)
    const portPart = authority.slice(end + 1)
    const port = portPart.startsWith(":") ? Number.parseInt(portPart.slice(1), 10) : 1433
    if (!server || !Number.isFinite(port) || port <= 0 || port > 65535) {
      throw new Error("[database] Invalid SQL Server host or port")
    }
    return { server, port }
  }

  const separator = authority.lastIndexOf(":")
  if (separator < 0) return { server: authority, port: 1433 }

  const port = Number.parseInt(authority.slice(separator + 1), 10)
  if (!Number.isFinite(port) || port <= 0 || port > 65535) {
    throw new Error("[database] Invalid SQL Server port")
  }
  return { server: authority.slice(0, separator), port }
}

export function parseSqlServerConnectionUrl(databaseUrl: string): ParsedSqlServerConnection {
  const prefix = "sqlserver://"
  const trimmed = databaseUrl.trim()
  if (!trimmed.toLowerCase().startsWith(prefix)) {
    throw new Error("[database] Expected a sqlserver:// DATABASE_URL")
  }

  const parts = splitSqlServerProperties(trimmed.slice(prefix.length))
  const authority = parts.shift()?.trim()
  if (!authority) throw new Error("[database] SQL Server host is missing")

  const values = new Map<string, string>()
  for (const part of parts) {
    const separator = part.indexOf("=")
    if (separator <= 0) continue
    values.set(
      part.slice(0, separator).trim().toLowerCase(),
      unwrapSqlServerValue(part.slice(separator + 1)),
    )
  }

  const { server, port } = parseSqlServerHost(authority)
  const database = values.get("database") ?? values.get("initial catalog")
  const user = values.get("user") ?? values.get("username") ?? values.get("uid")
  const password = values.get("password") ?? values.get("pwd")

  if (!server || !database || !user || password === undefined) {
    throw new Error(
      "[database] SQL Server DATABASE_URL must include host, database, user and password",
    )
  }

  return {
    server,
    port,
    database,
    user,
    password,
    encrypt: parseBoolean(values.get("encrypt"), true),
    trustServerCertificate: parseBoolean(values.get("trustservercertificate"), false),
  }
}

export function detectDatabaseProvider(databaseUrl: string): DatabaseProvider {
  const configured = process.env.DATABASE_PROVIDER?.trim().toLowerCase()
  const normalizedUrl = databaseUrl.trim().toLowerCase()

  if (
    configured === "mssql" ||
    configured === "sqlserver" ||
    normalizedUrl.startsWith("sqlserver://")
  ) {
    return "mssql"
  }
  if (
    configured === "mysql" ||
    normalizedUrl.startsWith("mysql://") ||
    normalizedUrl.startsWith("mariadb://")
  ) {
    return "mysql"
  }
  throw new Error("[database] Unsupported DATABASE_PROVIDER")
}
