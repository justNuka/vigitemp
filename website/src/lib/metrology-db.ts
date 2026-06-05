import { prisma } from "@/lib/prisma"
import { hasMainDbColumn, hasMainDbTable } from "@/lib/db-schema"

function asNumber(value: unknown) {
  if (typeof value === "number") return value
  if (typeof value === "bigint") return Number(value)
  if (typeof value === "string") return Number(value)
  return 0
}

function asNullableNumber(value: unknown) {
  if (value === null || value === undefined || value === "") return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

export function isMssqlProvider() {
  const provider = process.env.DATABASE_PROVIDER?.trim().toLowerCase()
  const url = process.env.DATABASE_URL?.trim().toLowerCase() ?? ""
  return provider === "mssql" || provider === "sqlserver" || url.startsWith("sqlserver://")
}

export function quoteIdentifier(name: string) {
  return isMssqlProvider() ? `[${name}]` : `\`${name}\``
}

export function getTableReference(tableName: string) {
  return `${isMssqlProvider() ? "dbo." : ""}${tableName}`
}

export function sqlNullToZero(columnName: string) {
  return isMssqlProvider() ? `ISNULL(${quoteIdentifier(columnName)}, 0)` : `IFNULL(${quoteIdentifier(columnName)}, 0)`
}

export async function resolveIntercomparisonTableName() {
  if (await hasMainDbTable("t_milieu_inter")) return "t_milieu_inter"
  return "t_milieu"
}

export async function hasEtalonColumn(columnName: string) {
  return hasMainDbColumn("t_etalon", columnName)
}

export async function hasIntercomparisonArchiveColumn() {
  const tableName = await resolveIntercomparisonTableName()
  return hasMainDbColumn(tableName, "Est_Archive")
}

export async function resolveEtalonFeatureFlags() {
  const [coeffA, coeffB, coeffC, uncertaintyMax] = await Promise.all([
    hasEtalonColumn("Coeff_A"),
    hasEtalonColumn("Coeff_B"),
    hasEtalonColumn("Coeff_C"),
    hasEtalonColumn("Incertitude_Max"),
  ])

  return { coeffA, coeffB, coeffC, uncertaintyMax }
}

export async function resolveEtalonBaseFlags() {
  const [
    estArchive,
    etatEtalon,
    portSerie,
    estSondeExterne,
    resolution,
    incertitude,
    nbDecimale,
    idWorker,
    idModule,
  ] = await Promise.all([
    hasEtalonColumn("Est_Archive"),
    hasEtalonColumn("Etat_Etalon"),
    hasEtalonColumn("Port_Serie"),
    hasEtalonColumn("Est_Sonde_Externe"),
    hasEtalonColumn("Resolution"),
    hasEtalonColumn("Incertitude"),
    hasEtalonColumn("Nb_Decimale"),
    hasEtalonColumn("Id_Worker"),
    hasEtalonColumn("Id_Module"),
  ])

  return {
    estArchive,
    etatEtalon,
    portSerie,
    estSondeExterne,
    resolution,
    incertitude,
    nbDecimale,
    idWorker,
    idModule,
  }
}

export async function fetchEtalonRows() {
  const flags = await resolveEtalonBaseFlags()
  const selectParts = [
    `${quoteIdentifier("Id_Etalon")} AS Id_Etalon`,
    `${quoteIdentifier("Etalon_Numero_Serie")} AS Etalon_Numero_Serie`,
    flags.etatEtalon ? `${quoteIdentifier("Etat_Etalon")} AS Etat_Etalon` : `NULL AS Etat_Etalon`,
    flags.portSerie ? `${quoteIdentifier("Port_Serie")} AS Port_Serie` : `NULL AS Port_Serie`,
    flags.idWorker ? `${quoteIdentifier("Id_Worker")} AS Id_Worker` : `NULL AS Id_Worker`,
    flags.idModule ? `${quoteIdentifier("Id_Module")} AS Id_Module` : `NULL AS Id_Module`,
    flags.resolution ? `${quoteIdentifier("Resolution")} AS Resolution` : `NULL AS Resolution`,
    flags.incertitude ? `${quoteIdentifier("Incertitude")} AS Incertitude` : `NULL AS Incertitude`,
    flags.nbDecimale ? `${quoteIdentifier("Nb_Decimale")} AS Nb_Decimale` : `NULL AS Nb_Decimale`,
    flags.estArchive ? `${quoteIdentifier("Est_Archive")} AS Est_Archive` : `0 AS Est_Archive`,
    flags.estSondeExterne ? `${quoteIdentifier("Est_Sonde_Externe")} AS Est_Sonde_Externe` : `0 AS Est_Sonde_Externe`,
  ]

  const whereClause = flags.estArchive ? `WHERE ${sqlNullToZero("Est_Archive")} = 0` : ""
  const sql = `SELECT ${selectParts.join(", ")} FROM ${getTableReference("t_etalon")} ${whereClause} ORDER BY ${quoteIdentifier("Etalon_Numero_Serie")} ASC`
  return prisma.$queryRawUnsafe<Array<Record<string, unknown>>>(sql)
}

export async function fetchEtalonById(etalonId: number) {
  const flags = await resolveEtalonBaseFlags()
  const selectParts = [
    `${quoteIdentifier("Id_Etalon")} AS Id_Etalon`,
    `${quoteIdentifier("Etalon_Numero_Serie")} AS Etalon_Numero_Serie`,
    flags.etatEtalon ? `${quoteIdentifier("Etat_Etalon")} AS Etat_Etalon` : `NULL AS Etat_Etalon`,
    flags.portSerie ? `${quoteIdentifier("Port_Serie")} AS Port_Serie` : `NULL AS Port_Serie`,
    flags.idWorker ? `${quoteIdentifier("Id_Worker")} AS Id_Worker` : `NULL AS Id_Worker`,
    flags.idModule ? `${quoteIdentifier("Id_Module")} AS Id_Module` : `NULL AS Id_Module`,
    flags.resolution ? `${quoteIdentifier("Resolution")} AS Resolution` : `NULL AS Resolution`,
    flags.incertitude ? `${quoteIdentifier("Incertitude")} AS Incertitude` : `NULL AS Incertitude`,
    flags.nbDecimale ? `${quoteIdentifier("Nb_Decimale")} AS Nb_Decimale` : `NULL AS Nb_Decimale`,
    flags.estArchive ? `${quoteIdentifier("Est_Archive")} AS Est_Archive` : `0 AS Est_Archive`,
    flags.estSondeExterne ? `${quoteIdentifier("Est_Sonde_Externe")} AS Est_Sonde_Externe` : `0 AS Est_Sonde_Externe`,
  ]

  const sql = isMssqlProvider()
    ? `SELECT TOP 1 ${selectParts.join(", ")} FROM ${getTableReference("t_etalon")} WHERE ${quoteIdentifier("Id_Etalon")} = @P1`
    : `SELECT ${selectParts.join(", ")} FROM ${getTableReference("t_etalon")} WHERE ${quoteIdentifier("Id_Etalon")} = ? LIMIT 1`

  const rows = await prisma.$queryRawUnsafe<Array<Record<string, unknown>>>(sql, etalonId)
  return rows[0] ?? null
}

export async function findEtalonBySerial(serial: string) {
  const sql = isMssqlProvider()
    ? `SELECT TOP 1 ${quoteIdentifier("Id_Etalon")} AS Id_Etalon, ${quoteIdentifier("Etalon_Numero_Serie")} AS Etalon_Numero_Serie FROM ${getTableReference("t_etalon")} WHERE ${quoteIdentifier("Etalon_Numero_Serie")} = @P1`
    : `SELECT ${quoteIdentifier("Id_Etalon")} AS Id_Etalon, ${quoteIdentifier("Etalon_Numero_Serie")} AS Etalon_Numero_Serie FROM ${getTableReference("t_etalon")} WHERE ${quoteIdentifier("Etalon_Numero_Serie")} = ? LIMIT 1`

  const rows = await prisma.$queryRawUnsafe<Array<Record<string, unknown>>>(sql, serial)
  return rows[0] ?? null
}

export async function insertEtalonBase(data: {
  serial: string
  state: string
  portSerie: string | null
  idWorker: number | null
  idModule: number | null
  estSondeExterne: boolean
}) {
  const flags = await resolveEtalonBaseFlags()
  const columns = [quoteIdentifier("Etalon_Numero_Serie")]
  const placeholders = [isMssqlProvider() ? "@P1" : "?"]
  const params: Array<string | number | boolean | null> = [data.serial]

  if (flags.etatEtalon) {
    columns.push(quoteIdentifier("Etat_Etalon"))
    placeholders.push(isMssqlProvider() ? `@P${params.length + 1}` : "?")
    params.push(data.state)
  }
  if (flags.portSerie) {
    columns.push(quoteIdentifier("Port_Serie"))
    placeholders.push(isMssqlProvider() ? `@P${params.length + 1}` : "?")
    params.push(data.portSerie)
  }
  if (flags.idWorker) {
    columns.push(quoteIdentifier("Id_Worker"))
    placeholders.push(isMssqlProvider() ? `@P${params.length + 1}` : "?")
    params.push(data.idWorker)
  }
  if (flags.idModule) {
    columns.push(quoteIdentifier("Id_Module"))
    placeholders.push(isMssqlProvider() ? `@P${params.length + 1}` : "?")
    params.push(data.idModule)
  }
  if (flags.estSondeExterne) {
    columns.push(quoteIdentifier("Est_Sonde_Externe"))
    placeholders.push(isMssqlProvider() ? `@P${params.length + 1}` : "?")
    params.push(data.estSondeExterne ? 1 : 0)
  }

  const sql = `INSERT INTO ${getTableReference("t_etalon")} (${columns.join(", ")}) VALUES (${placeholders.join(", ")})`
  await prisma.$executeRawUnsafe(sql, ...params)

  const fetchSql = isMssqlProvider()
    ? `SELECT TOP 1 ${quoteIdentifier("Id_Etalon")} AS Id_Etalon FROM ${getTableReference("t_etalon")} WHERE ${quoteIdentifier("Etalon_Numero_Serie")} = @P1 ORDER BY ${quoteIdentifier("Id_Etalon")} DESC`
    : `SELECT ${quoteIdentifier("Id_Etalon")} AS Id_Etalon FROM ${getTableReference("t_etalon")} WHERE ${quoteIdentifier("Etalon_Numero_Serie")} = ? ORDER BY ${quoteIdentifier("Id_Etalon")} DESC LIMIT 1`
  const rows = await prisma.$queryRawUnsafe<Array<{ Id_Etalon: number | bigint | string }>>(fetchSql, data.serial)
  return asNumber(rows?.[0]?.Id_Etalon ?? 0)
}

export async function updateEtalonBase(
  etalonId: number,
  data: {
    serial: string
    state: string
    portSerie: string | null
    idWorker: number | null
    idModule: number | null
    estSondeExterne: boolean
  },
) {
  const flags = await resolveEtalonBaseFlags()
  const assignments: string[] = []
  const params: Array<string | number | boolean | null> = []

  assignments.push(`${quoteIdentifier("Etalon_Numero_Serie")} = ${isMssqlProvider() ? `@P${params.length + 1}` : "?"}`)
  params.push(data.serial)

  if (flags.etatEtalon) {
    assignments.push(`${quoteIdentifier("Etat_Etalon")} = ${isMssqlProvider() ? `@P${params.length + 1}` : "?"}`)
    params.push(data.state)
  }
  if (flags.portSerie) {
    assignments.push(`${quoteIdentifier("Port_Serie")} = ${isMssqlProvider() ? `@P${params.length + 1}` : "?"}`)
    params.push(data.portSerie)
  }
  if (flags.idWorker) {
    assignments.push(`${quoteIdentifier("Id_Worker")} = ${isMssqlProvider() ? `@P${params.length + 1}` : "?"}`)
    params.push(data.idWorker)
  }
  if (flags.idModule) {
    assignments.push(`${quoteIdentifier("Id_Module")} = ${isMssqlProvider() ? `@P${params.length + 1}` : "?"}`)
    params.push(data.idModule)
  }
  if (flags.estSondeExterne) {
    assignments.push(`${quoteIdentifier("Est_Sonde_Externe")} = ${isMssqlProvider() ? `@P${params.length + 1}` : "?"}`)
    params.push(data.estSondeExterne ? 1 : 0)
  }

  const whereToken = isMssqlProvider() ? `@P${params.length + 1}` : "?"
  const sql = `UPDATE ${getTableReference("t_etalon")} SET ${assignments.join(", ")} WHERE ${quoteIdentifier("Id_Etalon")} = ${whereToken}`
  params.push(etalonId)
  await prisma.$executeRawUnsafe(sql, ...params)
}

export async function archiveEtalonById(etalonId: number) {
  const flags = await resolveEtalonBaseFlags()
  if (flags.estArchive) {
    const sql = isMssqlProvider()
      ? `UPDATE ${getTableReference("t_etalon")} SET ${quoteIdentifier("Est_Archive")} = 1 WHERE ${quoteIdentifier("Id_Etalon")} = @P1`
      : `UPDATE ${getTableReference("t_etalon")} SET ${quoteIdentifier("Est_Archive")} = 1 WHERE ${quoteIdentifier("Id_Etalon")} = ?`
    await prisma.$executeRawUnsafe(sql, etalonId)
    return
  }

  const sql = isMssqlProvider()
    ? `DELETE FROM ${getTableReference("t_etalon")} WHERE ${quoteIdentifier("Id_Etalon")} = @P1`
    : `DELETE FROM ${getTableReference("t_etalon")} WHERE ${quoteIdentifier("Id_Etalon")} = ?`
  await prisma.$executeRawUnsafe(sql, etalonId)
}

export async function fetchIntercomparisonMediaRows() {
  const tableName = await resolveIntercomparisonTableName()
  const supportsArchive = await hasIntercomparisonArchiveColumn()
  const tableRef = getTableReference(tableName)

  const sql = supportsArchive
    ? `SELECT ${quoteIdentifier("Id_Milieu")} AS Id_Milieu, ${quoteIdentifier("Model")} AS Model, ${quoteIdentifier("Reference")} AS Reference, ${quoteIdentifier("Stabilite")} AS Stabilite, ${quoteIdentifier("Homogeneite")} AS Homogeneite, ${quoteIdentifier("Contenu")} AS Contenu, ${quoteIdentifier("Est_Reserve_MC2")} AS Est_Reserve_MC2, ${quoteIdentifier("Est_Archive")} AS Est_Archive
       FROM ${tableRef}
       WHERE ${sqlNullToZero("Est_Archive")} = 0
       ORDER BY ${quoteIdentifier("Model")} ASC, ${quoteIdentifier("Reference")} ASC`
    : `SELECT ${quoteIdentifier("Id_Milieu")} AS Id_Milieu, ${quoteIdentifier("Model")} AS Model, ${quoteIdentifier("Reference")} AS Reference, ${quoteIdentifier("Stabilite")} AS Stabilite, ${quoteIdentifier("Homogeneite")} AS Homogeneite, ${quoteIdentifier("Contenu")} AS Contenu, ${quoteIdentifier("Est_Reserve_MC2")} AS Est_Reserve_MC2
       FROM ${tableRef}
       ORDER BY ${quoteIdentifier("Model")} ASC, ${quoteIdentifier("Reference")} ASC`

  return prisma.$queryRawUnsafe<Array<Record<string, unknown>>>(sql)
}

export async function insertIntercomparisonMedium(data: {
  model: string
  reference: string
  stabilite: number | null
  homogeneite: number | null
  contenu: string
}) {
  const tableName = await resolveIntercomparisonTableName()
  const tableRef = getTableReference(tableName)
  const sql = isMssqlProvider()
    ? `INSERT INTO ${tableRef} ([Model], [Reference], [Stabilite], [Homogeneite], [Contenu], [Est_Reserve_MC2], [Est_Archive]) VALUES (@P1, @P2, @P3, @P4, @P5, 0, 0)`
    : `INSERT INTO ${tableRef} (${quoteIdentifier("Model")}, ${quoteIdentifier("Reference")}, ${quoteIdentifier("Stabilite")}, ${quoteIdentifier("Homogeneite")}, ${quoteIdentifier("Contenu")}, ${quoteIdentifier("Est_Reserve_MC2")}, ${quoteIdentifier("Est_Archive")}) VALUES (?, ?, ?, ?, ?, 0, 0)`

  await prisma.$executeRawUnsafe(sql, data.model, data.reference, data.stabilite, data.homogeneite, data.contenu)

  const fetchSql = `SELECT TOP 1 ${quoteIdentifier("Id_Milieu")} AS Id_Milieu FROM ${tableRef} ORDER BY ${quoteIdentifier("Id_Milieu")} DESC`
  const fetchMySql = `SELECT ${quoteIdentifier("Id_Milieu")} AS Id_Milieu FROM ${tableRef} ORDER BY ${quoteIdentifier("Id_Milieu")} DESC LIMIT 1`
  const rows = await prisma.$queryRawUnsafe<Array<{ Id_Milieu: number | bigint | string }>>(isMssqlProvider() ? fetchSql : fetchMySql)
  return asNumber(rows?.[0]?.Id_Milieu ?? 0)
}

export async function updateIntercomparisonMedium(
  id: number,
  data: {
    model: string
    reference: string
    stabilite: number | null
    homogeneite: number | null
    contenu: string
  },
) {
  const tableName = await resolveIntercomparisonTableName()
  const tableRef = getTableReference(tableName)
  const sql = isMssqlProvider()
    ? `UPDATE ${tableRef} SET [Model] = @P1, [Reference] = @P2, [Stabilite] = @P3, [Homogeneite] = @P4, [Contenu] = @P5 WHERE [Id_Milieu] = @P6`
    : `UPDATE ${tableRef} SET ${quoteIdentifier("Model")} = ?, ${quoteIdentifier("Reference")} = ?, ${quoteIdentifier("Stabilite")} = ?, ${quoteIdentifier("Homogeneite")} = ?, ${quoteIdentifier("Contenu")} = ? WHERE ${quoteIdentifier("Id_Milieu")} = ?`

  await prisma.$executeRawUnsafe(sql, data.model, data.reference, data.stabilite, data.homogeneite, data.contenu, id)
}

export async function archiveIntercomparisonMedium(id: number) {
  const tableName = await resolveIntercomparisonTableName()
  const tableRef = getTableReference(tableName)
  const hasArchive = await hasIntercomparisonArchiveColumn()
  const sql = hasArchive
    ? isMssqlProvider()
      ? `UPDATE ${tableRef} SET [Est_Archive] = 1 WHERE [Id_Milieu] = @P1`
      : `UPDATE ${tableRef} SET ${quoteIdentifier("Est_Archive")} = 1 WHERE ${quoteIdentifier("Id_Milieu")} = ?`
    : isMssqlProvider()
      ? `DELETE FROM ${tableRef} WHERE [Id_Milieu] = @P1`
      : `DELETE FROM ${tableRef} WHERE ${quoteIdentifier("Id_Milieu")} = ?`

  await prisma.$executeRawUnsafe(sql, id)
}

export async function fetchIntercomparisonMediumById(id: number) {
  const tableName = await resolveIntercomparisonTableName()
  const tableRef = getTableReference(tableName)
  const hasArchive = await hasIntercomparisonArchiveColumn()
  const sql = hasArchive
    ? isMssqlProvider()
      ? `SELECT TOP 1 [Id_Milieu] AS Id_Milieu, [Model] AS Model, [Reference] AS Reference, [Stabilite] AS Stabilite, [Homogeneite] AS Homogeneite, [Contenu] AS Contenu, [Est_Reserve_MC2] AS Est_Reserve_MC2, [Est_Archive] AS Est_Archive FROM ${tableRef} WHERE [Id_Milieu] = @P1 AND ISNULL([Est_Archive], 0) = 0`
      : `SELECT ${quoteIdentifier("Id_Milieu")} AS Id_Milieu, ${quoteIdentifier("Model")} AS Model, ${quoteIdentifier("Reference")} AS Reference, ${quoteIdentifier("Stabilite")} AS Stabilite, ${quoteIdentifier("Homogeneite")} AS Homogeneite, ${quoteIdentifier("Contenu")} AS Contenu, ${quoteIdentifier("Est_Reserve_MC2")} AS Est_Reserve_MC2, ${quoteIdentifier("Est_Archive")} AS Est_Archive FROM ${tableRef} WHERE ${quoteIdentifier("Id_Milieu")} = ? AND IFNULL(${quoteIdentifier("Est_Archive")}, 0) = 0 LIMIT 1`
    : isMssqlProvider()
      ? `SELECT TOP 1 [Id_Milieu] AS Id_Milieu, [Model] AS Model, [Reference] AS Reference, [Stabilite] AS Stabilite, [Homogeneite] AS Homogeneite, [Contenu] AS Contenu, [Est_Reserve_MC2] AS Est_Reserve_MC2 FROM ${tableRef} WHERE [Id_Milieu] = @P1`
      : `SELECT ${quoteIdentifier("Id_Milieu")} AS Id_Milieu, ${quoteIdentifier("Model")} AS Model, ${quoteIdentifier("Reference")} AS Reference, ${quoteIdentifier("Stabilite")} AS Stabilite, ${quoteIdentifier("Homogeneite")} AS Homogeneite, ${quoteIdentifier("Contenu")} AS Contenu, ${quoteIdentifier("Est_Reserve_MC2")} AS Est_Reserve_MC2 FROM ${tableRef} WHERE ${quoteIdentifier("Id_Milieu")} = ? LIMIT 1`

  const rows = await prisma.$queryRawUnsafe<Array<Record<string, unknown>>>(sql, id)
  return rows[0] ?? null
}

export async function updateEtalonExtendedFields(
  etalonId: number,
  values: {
    coeffA?: number | null
    coeffB?: number | null
    coeffC?: number | null
    uncertaintyMax?: number | null
  },
) {
  const flags = await resolveEtalonFeatureFlags()
  const assignments: string[] = []
  const params: Array<number | null> = []

  if (flags.coeffA) {
    assignments.push(`${quoteIdentifier("Coeff_A")} = ${isMssqlProvider() ? `@P${params.length + 1}` : "?"}`)
    params.push(asNullableNumber(values.coeffA))
  }
  if (flags.coeffB) {
    assignments.push(`${quoteIdentifier("Coeff_B")} = ${isMssqlProvider() ? `@P${params.length + 1}` : "?"}`)
    params.push(asNullableNumber(values.coeffB))
  }
  if (flags.coeffC) {
    assignments.push(`${quoteIdentifier("Coeff_C")} = ${isMssqlProvider() ? `@P${params.length + 1}` : "?"}`)
    params.push(asNullableNumber(values.coeffC))
  }
  if (flags.uncertaintyMax) {
    assignments.push(`${quoteIdentifier("Incertitude_Max")} = ${isMssqlProvider() ? `@P${params.length + 1}` : "?"}`)
    params.push(asNullableNumber(values.uncertaintyMax))
  }

  if (assignments.length === 0) return

  const whereToken = isMssqlProvider() ? `@P${params.length + 1}` : "?"
  const sql = `UPDATE ${getTableReference("t_etalon")} SET ${assignments.join(", ")} WHERE ${quoteIdentifier("Id_Etalon")} = ${whereToken}`
  params.push(etalonId)
  await prisma.$executeRawUnsafe(sql, ...params)
}
