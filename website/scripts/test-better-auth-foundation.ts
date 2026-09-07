import assert from "node:assert/strict"

import bcrypt from "bcryptjs"

import {
  BETTER_AUTH_SESSION_MAX_AGE_SECONDS,
  BETTER_AUTH_SESSION_UPDATE_AGE_SECONDS,
  betterAuthPassword,
  createVigiSensysBetterAuth,
} from "../src/lib/better-auth/auth"
import {
  getBetterAuthDatabaseProvider,
  parsePrismaSqlServerUrl,
} from "../src/lib/better-auth/database"
import { prisma } from "../src/lib/prisma"

const TEST_USER_ID = 2147483001
const TEST_LOGIN = "BetterAuth.Foundation"
const TEST_EMAIL = "better-auth-foundation@vigisensys.test"
const TEST_PASSWORD = "VigiSensys-BetterAuth-Foundation-2026!"
const TEST_SECRET = "vigisensys-better-auth-foundation-test-secret-2026-only"
const TEST_BASE_URL = "http://localhost:3000"
const TEST_SESSION_MAX_AGE_SECONDS = 10
const TEST_SESSION_UPDATE_AGE_SECONDS = 1

function requireDisposableDatabase() {
  if (process.env.BETTER_AUTH_TEST_ALLOW_DATA_CHANGES !== "1") {
    throw new Error(
      "Refusing to run: BETTER_AUTH_TEST_ALLOW_DATA_CHANGES=1 is required.",
    )
  }

  const databaseUrl = process.env.DATABASE_URL?.trim()
  if (!databaseUrl) throw new Error("DATABASE_URL is required")

  const provider = getBetterAuthDatabaseProvider(databaseUrl)
  const databaseName =
    provider === "mssql"
      ? parsePrismaSqlServerUrl(databaseUrl).database
      : decodeURIComponent(
          new URL(databaseUrl.replace(/^mariadb:/i, "mysql:")).pathname.replace(/^\//, ""),
        )

  const isCiDisposable = process.env.CI === "true" && databaseName === "vigi_main"
  const explicitlyDisposable = /(poc|test|ci|tmp|temp)/i.test(databaseName)
  if (!isCiDisposable && !explicitlyDisposable) {
    throw new Error(
      `Refusing to alter Better Auth test data in database '${databaseName}'. Use a disposable database.`,
    )
  }

  return { databaseUrl, provider, databaseName }
}

async function cleanupTestIdentity() {
  await prisma.$executeRawUnsafe(`
    DELETE FROM t_auth_session
    WHERE userId IN (
      SELECT id FROM t_auth_user WHERE vigisensysUserId = ${TEST_USER_ID}
    )
  `)
  await prisma.$executeRawUnsafe(`
    DELETE FROM t_auth_account
    WHERE userId IN (
      SELECT id FROM t_auth_user WHERE vigisensysUserId = ${TEST_USER_ID}
    )
  `)
  await prisma.$executeRawUnsafe(
    `DELETE FROM t_auth_user WHERE vigisensysUserId = ${TEST_USER_ID}`,
  )
  await prisma.$executeRawUnsafe(
    `DELETE FROM t_utilisateur WHERE Id_Utilisateur = ${TEST_USER_ID}`,
  )
}

async function seedBusinessUser() {
  const legacyHash = await bcrypt.hash(TEST_PASSWORD, 10)
  assert.equal(
    await betterAuthPassword.verify({ hash: legacyHash, password: TEST_PASSWORD }),
    true,
  )
  assert.equal(
    await betterAuthPassword.verify({ hash: legacyHash, password: "wrong-password" }),
    false,
  )

  await prisma.$executeRaw`
    INSERT INTO t_utilisateur (
      Id_Utilisateur,
      Login,
      Mot_De_Passe,
      Adresse_Email,
      Est_Archive
    ) VALUES (
      ${TEST_USER_ID},
      ${TEST_LOGIN},
      ${legacyHash},
      ${TEST_EMAIL},
      ${0}
    )
  `
}

function buildCookieHeader(headers: Headers) {
  return headers
    .getSetCookie()
    .map((cookie) => cookie.split(";", 1)[0])
    .filter(Boolean)
    .join("; ")
}

async function assertUnknownProvisioningIsRejected(
  auth: ReturnType<typeof createVigiSensysBetterAuth>,
) {
  let rejected = false
  try {
    await auth.api.signUpEmail({
      body: {
        email: "unknown-foundation@vigisensys.test",
        name: "Unknown Foundation User",
        password: TEST_PASSWORD,
        username: "Unknown.Foundation",
      },
    })
  } catch {
    rejected = true
  }
  assert.equal(
    rejected,
    true,
    "Provisioning must reject identities without an active VigiSensys business user",
  )
}

async function run() {
  const { databaseUrl, provider, databaseName } = requireDisposableDatabase()
  console.log(`[better-auth-foundation] provider=${provider} database=${databaseName}`)
  console.log(
    `[better-auth-foundation] production-session maxAge=${BETTER_AUTH_SESSION_MAX_AGE_SECONDS}s updateAge=${BETTER_AUTH_SESSION_UPDATE_AGE_SECONDS}s`,
  )
  assert.equal(BETTER_AUTH_SESSION_MAX_AGE_SECONDS, 60 * 60)
  assert.ok(BETTER_AUTH_SESSION_UPDATE_AGE_SECONDS < BETTER_AUTH_SESSION_MAX_AGE_SECONDS)

  await cleanupTestIdentity()

  try {
    console.log("[better-auth-foundation] stage=seed-business-user")
    await seedBusinessUser()

    console.log("[better-auth-foundation] stage=create-auth")
    const auth = createVigiSensysBetterAuth({
      allowProvisioning: true,
      baseURL: TEST_BASE_URL,
      databaseUrl,
      secret: TEST_SECRET,
      sessionMaxAgeSeconds: TEST_SESSION_MAX_AGE_SECONDS,
      sessionUpdateAgeSeconds: TEST_SESSION_UPDATE_AGE_SECONDS,
    })

    console.log("[better-auth-foundation] stage=reject-unknown-provisioning")
    await assertUnknownProvisioningIsRejected(auth)

    console.log("[better-auth-foundation] stage=signup")
    const signup = await auth.api.signUpEmail({
      body: {
        email: TEST_EMAIL,
        name: "Better Auth Foundation",
        password: TEST_PASSWORD,
        username: TEST_LOGIN,
      },
    })

    assert.equal(signup.user.email, TEST_EMAIL)
    assert.equal(signup.user.username, TEST_LOGIN)
    assert.equal(signup.user.vigisensysUserId, TEST_USER_ID)

    console.log("[better-auth-foundation] stage=verify-persistence")
    const authUsers = await prisma.$queryRaw<
      Array<{ id: string; vigisensysUserId: number; username: string | null }>
    >`SELECT id, vigisensysUserId, username FROM t_auth_user WHERE vigisensysUserId = ${TEST_USER_ID}`
    assert.equal(authUsers.length, 1)
    assert.equal(Number(authUsers[0].vigisensysUserId), TEST_USER_ID)
    assert.equal(authUsers[0].username, TEST_LOGIN)

    const accounts = await prisma.$queryRaw<Array<{ password: string | null }>>`
      SELECT password
      FROM t_auth_account
      WHERE userId = ${authUsers[0].id}
    `
    assert.equal(accounts.length, 1)
    assert.ok(accounts[0].password?.startsWith("$2"), "Credential password must use bcrypt")
    assert.equal(
      await betterAuthPassword.verify({
        hash: accounts[0].password ?? "",
        password: TEST_PASSWORD,
      }),
      true,
    )

    console.log("[better-auth-foundation] stage=sign-in-username")
    const signedIn = await auth.api.signInUsername({
      returnHeaders: true,
      body: {
        username: TEST_LOGIN,
        password: TEST_PASSWORD,
      },
    })

    const cookie = buildCookieHeader(signedIn.headers)
    assert.ok(
      cookie.includes("vigisensys-auth-v2"),
      "Better Auth session cookie must use the isolated transition prefix",
    )

    console.log("[better-auth-foundation] stage=get-session-initial")
    const requestHeaders = new Headers({ cookie })
    const session1 = await auth.api.getSession({ headers: requestHeaders })
    assert.ok(session1, "Username/password sign-in must create a server session")
    assert.equal(session1.user.username, TEST_LOGIN)
    assert.equal(session1.user.vigisensysUserId, TEST_USER_ID)

    const expiresAt1 = new Date(session1.session.expiresAt).getTime()
    const expectedExpiry = Date.now() + TEST_SESSION_MAX_AGE_SECONDS * 1000
    assert.ok(
      Math.abs(expiresAt1 - expectedExpiry) < 5_000,
      "Session expiry should match the configured sliding max age",
    )

    console.log("[better-auth-foundation] stage=refresh-sliding-session")
    await new Promise((resolve) => setTimeout(resolve, 1_250))
    const session2 = await auth.api.getSession({ headers: requestHeaders })
    assert.ok(session2)
    const expiresAt2 = new Date(session2.session.expiresAt).getTime()
    assert.ok(
      expiresAt2 > expiresAt1,
      `Session expiry must slide after activity (${expiresAt1} -> ${expiresAt2})`,
    )

    console.log("[better-auth-foundation] stage=sign-out")
    await auth.api.signOut({ headers: requestHeaders })
    const revoked = await auth.api.getSession({ headers: requestHeaders })
    assert.equal(revoked, null, "Sign out must revoke the database session")

    console.log(
      "[better-auth-foundation] PASS: final schema, bcrypt, business mapping, username, 1h sliding session policy and revocation",
    )
  } finally {
    await cleanupTestIdentity()
  }
}

run()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(
      "[better-auth-foundation] FAIL",
      error instanceof Error ? error.stack ?? error.message : error,
    )
    process.exit(1)
  })
