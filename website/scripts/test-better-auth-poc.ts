import assert from "node:assert/strict"

import bcrypt from "bcryptjs"
import { getMigrations } from "better-auth/db/migration"

import {
  BETTER_AUTH_POC_SESSION_MAX_AGE_SECONDS,
  betterAuthPocPassword,
  createBetterAuthPoc,
} from "../src/lib/better-auth/poc/auth"
import {
  getBetterAuthPocDatabaseProvider,
  parsePrismaSqlServerUrl,
} from "../src/lib/better-auth/poc/database"
import { prisma } from "../src/lib/prisma"

const TEST_USER_ID = 42
const TEST_LOGIN = "Legacy.User-42"
const TEST_EMAIL = "legacy.user42@example.com"
const TEST_PASSWORD = "VigiSensys-Poc-Password-42!"
const TEST_SECRET = "vigisensys-better-auth-poc-only-secret-2026"
const TEST_BASE_URL = "http://localhost:3000"

function requireDisposableDatabase() {
  if (process.env.BETTER_AUTH_POC_ALLOW_SCHEMA_CHANGES !== "1") {
    throw new Error(
      "Refusing to run: BETTER_AUTH_POC_ALLOW_SCHEMA_CHANGES=1 is required for this destructive PoC test.",
    )
  }

  const databaseUrl = process.env.DATABASE_URL?.trim()
  if (!databaseUrl) throw new Error("DATABASE_URL is required")

  const provider = getBetterAuthPocDatabaseProvider(databaseUrl)
  const databaseName =
    provider === "mssql"
      ? parsePrismaSqlServerUrl(databaseUrl).database
      : decodeURIComponent(new URL(databaseUrl.replace(/^mariadb:/i, "mysql:")).pathname.replace(/^\//, ""))

  if (!/(poc|test|ci|tmp|temp)/i.test(databaseName)) {
    throw new Error(
      `Refusing to run destructive Better Auth PoC test against database '${databaseName}'. Use a disposable POC/test/CI database.`,
    )
  }

  return { databaseUrl, provider, databaseName }
}

async function dropPocTables(provider: "mysql" | "mssql") {
  if (provider === "mssql") {
    await prisma.$executeRawUnsafe(`
      IF OBJECT_ID(N'dbo.t_auth_poc_session', N'U') IS NOT NULL DROP TABLE dbo.t_auth_poc_session;
      IF OBJECT_ID(N'dbo.t_auth_poc_account', N'U') IS NOT NULL DROP TABLE dbo.t_auth_poc_account;
      IF OBJECT_ID(N'dbo.t_auth_poc_verification', N'U') IS NOT NULL DROP TABLE dbo.t_auth_poc_verification;
      IF OBJECT_ID(N'dbo.t_auth_poc_user', N'U') IS NOT NULL DROP TABLE dbo.t_auth_poc_user;
      IF OBJECT_ID(N'dbo.t_utilisateur', N'U') IS NOT NULL DROP TABLE dbo.t_utilisateur;
    `)
    return
  }

  await prisma.$executeRawUnsafe("DROP TABLE IF EXISTS `t_auth_poc_session`")
  await prisma.$executeRawUnsafe("DROP TABLE IF EXISTS `t_auth_poc_account`")
  await prisma.$executeRawUnsafe("DROP TABLE IF EXISTS `t_auth_poc_verification`")
  await prisma.$executeRawUnsafe("DROP TABLE IF EXISTS `t_auth_poc_user`")
  await prisma.$executeRawUnsafe("DROP TABLE IF EXISTS `t_utilisateur`")
}

async function createBusinessUserTable(provider: "mysql" | "mssql") {
  if (provider === "mssql") {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE dbo.t_utilisateur (
        Id_Utilisateur INT NOT NULL PRIMARY KEY,
        Login VARCHAR(64) NULL UNIQUE,
        Mot_De_Passe VARCHAR(60) NULL,
        Adresse_Email VARCHAR(255) NULL,
        Est_Archive BIT NOT NULL CONSTRAINT DF_t_utilisateur_Est_Archive DEFAULT 0
      )
    `)
    return
  }

  await prisma.$executeRawUnsafe(`
    CREATE TABLE t_utilisateur (
      Id_Utilisateur INT NOT NULL PRIMARY KEY,
      Login VARCHAR(64) NULL UNIQUE,
      Mot_De_Passe VARCHAR(60) NULL,
      Adresse_Email VARCHAR(255) NULL,
      Est_Archive BOOLEAN NOT NULL DEFAULT FALSE
    )
  `)
}

async function seedBusinessUser() {
  const legacyHash = await bcrypt.hash(TEST_PASSWORD, 10)
  assert.equal(await betterAuthPocPassword.verify({ hash: legacyHash, password: TEST_PASSWORD }), true)
  assert.equal(await betterAuthPocPassword.verify({ hash: legacyHash, password: "wrong-password" }), false)

  await prisma.$executeRaw`
    INSERT INTO t_utilisateur (Id_Utilisateur, Login, Mot_De_Passe, Adresse_Email, Est_Archive)
    VALUES (${TEST_USER_ID}, ${TEST_LOGIN}, ${legacyHash}, ${TEST_EMAIL}, ${0})
  `
}

function buildCookieHeader(headers: Headers) {
  return headers
    .getSetCookie()
    .map((cookie) => cookie.split(";", 1)[0])
    .filter(Boolean)
    .join("; ")
}

async function assertUnmappedSignupIsRejected(auth: ReturnType<typeof createBetterAuthPoc>) {
  let rejected = false
  try {
    await auth.api.signUpEmail({
      body: {
        email: "unknown@example.com",
        name: "Unknown User",
        password: TEST_PASSWORD,
        username: "unknown-user",
      },
    })
  } catch {
    rejected = true
  }
  assert.equal(rejected, true, "PoC signup must reject identities without a VigiSensys business user")
}

async function run() {
  const { databaseUrl, provider, databaseName } = requireDisposableDatabase()
  console.log(`[better-auth-poc] provider=${provider} database=${databaseName}`)

  await dropPocTables(provider)

  try {
    await createBusinessUserTable(provider)
    await seedBusinessUser()

    const auth = createBetterAuthPoc({
      allowSignUp: true,
      baseURL: TEST_BASE_URL,
      databaseUrl,
      secret: TEST_SECRET,
    })

    const migrations = await getMigrations(auth.options)
    assert.ok(migrations.toBeCreated.length >= 4, "Better Auth should plan its isolated PoC tables")
    await migrations.runMigrations()

    await assertUnmappedSignupIsRejected(auth)

    const signup = await auth.api.signUpEmail({
      body: {
        email: TEST_EMAIL,
        name: "Legacy User 42",
        password: TEST_PASSWORD,
        username: TEST_LOGIN,
      },
    })

    assert.equal(signup.user.email, TEST_EMAIL)
    assert.equal(signup.user.username, TEST_LOGIN)
    assert.equal(signup.user.vigisensysUserId, TEST_USER_ID)

    const authUsers = await prisma.$queryRaw<
      Array<{ id: string; vigisensysUserId: number; username: string | null }>
    >`SELECT id, vigisensysUserId, username FROM t_auth_poc_user`
    assert.equal(authUsers.length, 1)
    assert.equal(Number(authUsers[0].vigisensysUserId), TEST_USER_ID)
    assert.equal(authUsers[0].username, TEST_LOGIN)

    const accounts = await prisma.$queryRaw<Array<{ password: string | null }>>`
      SELECT password FROM t_auth_poc_account
    `
    assert.equal(accounts.length, 1)
    assert.ok(accounts[0].password?.startsWith("$2"), "Credential password must remain bcrypt in BA-1")
    assert.equal(
      await betterAuthPocPassword.verify({ hash: accounts[0].password ?? "", password: TEST_PASSWORD }),
      true,
    )

    const signedIn = await auth.api.signInUsername({
      returnHeaders: true,
      body: {
        username: TEST_LOGIN,
        password: TEST_PASSWORD,
      },
    })

    const cookie = buildCookieHeader(signedIn.headers)
    assert.ok(cookie.includes("vigisensys-auth-poc"), "PoC session cookie must use its isolated prefix")

    const requestHeaders = new Headers({ cookie })
    const session1 = await auth.api.getSession({ headers: requestHeaders })
    assert.ok(session1, "Username/password sign-in must create a server session")
    assert.equal(session1.user.username, TEST_LOGIN)
    assert.equal(session1.user.vigisensysUserId, TEST_USER_ID)

    const expiresAt1 = new Date(session1.session.expiresAt).getTime()
    const expectedExpiry = Date.now() + BETTER_AUTH_POC_SESSION_MAX_AGE_SECONDS * 1000
    assert.ok(
      Math.abs(expiresAt1 - expectedExpiry) < 60_000,
      "Session expiry should be approximately 24 hours from creation",
    )

    await new Promise((resolve) => setTimeout(resolve, 25))
    const session2 = await auth.api.getSession({ headers: requestHeaders })
    assert.ok(session2)
    const expiresAt2 = new Date(session2.session.expiresAt).getTime()
    assert.equal(expiresAt2, expiresAt1, "Session expiry must not slide on reads")

    await auth.api.signOut({ headers: requestHeaders })
    const revoked = await auth.api.getSession({ headers: requestHeaders })
    assert.equal(revoked, null, "Sign out must revoke the database session")

    console.log("[better-auth-poc] PASS: bcrypt, mapping, username, 24h absolute session and revocation")
  } finally {
    await dropPocTables(provider)
  }
}

run()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error("[better-auth-poc] FAIL", error instanceof Error ? error.message : error)
    process.exit(1)
  })
