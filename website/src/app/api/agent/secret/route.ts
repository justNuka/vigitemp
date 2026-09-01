import { NextRequest } from "next/server"
import fs from "fs/promises"
import path from "path"
import crypto from "crypto"
import { withLogging } from "@/lib/api-logger"
import { apiError, apiOk } from "@/lib/api-response"
import { getAuthenticatedUser } from "@/lib/auth"
import { isPack } from "@/lib/license-access"
import { validateLicense } from "@/lib/license-server"
import { log } from "@/lib/logger"
import { getCompatEnv } from "@/lib/vigisensys-compat"
import { appDataPath, firstExistingPath, legacyAppDataPath } from "@/lib/vigisensys-paths"

const LICENSE_DIR = appDataPath("licenses")
const LEGACY_LICENSE_DIR = legacyAppDataPath("licenses")
const DEFAULT_LICENSE_PATH = appDataPath("license.vtlic")
const LEGACY_DEFAULT_LICENSE_PATH = legacyAppDataPath("license.vtlic")
const DEFAULT_PUBLIC_KEY_PATH = appDataPath("license_keys", "public_key.pem")
const LEGACY_DEFAULT_PUBLIC_KEY_PATH = legacyAppDataPath("license_keys", "public_key.pem")
const FALLBACK_PUBLIC_KEY_PATH = appDataPath("public_key.pem")
const LEGACY_FALLBACK_PUBLIC_KEY_PATH = legacyAppDataPath("public_key.pem")
const DEFAULT_PRIVATE_KEY_PATH = appDataPath("agent_secret_private.pem")
const LEGACY_DEFAULT_PRIVATE_KEY_PATH = legacyAppDataPath("agent_secret_private.pem")

function resolveConfiguredAgentSecret() {
  const configured = getCompatEnv("VIGISENSYS_AGENT_SECRET", "VIGITEMP_AGENT_SECRET")
  return configured ? configured : null
}

function base64UrlToBuffer(input: string) {
  let base64 = input.replace(/-/g, "+").replace(/_/g, "/")
  switch (base64.length % 4) {
    case 2:
      base64 += "=="
      break
    case 3:
      base64 += "="
      break
    default:
      break
  }
  return Buffer.from(base64, "base64")
}

async function resolveLicensePath() {
  const configured = getCompatEnv("VIGISENSYS_LICENSE_PATH", "VIGITEMP_LICENSE_PATH")
  if (configured) return configured

  try {
    const entries = await fs.readdir(LICENSE_DIR, { withFileTypes: true })
    const found = entries.find((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".vtlic"))
    if (found) {
      return path.join(LICENSE_DIR, found.name)
    }
  } catch {
    // ignore
  }

  try {
    const entries = await fs.readdir(LEGACY_LICENSE_DIR, { withFileTypes: true })
    const found = entries.find((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".vtlic"))
    if (found) {
      return path.join(LEGACY_LICENSE_DIR, found.name)
    }
  } catch {
    // ignore
  }

  return firstExistingPath([DEFAULT_LICENSE_PATH, LEGACY_DEFAULT_LICENSE_PATH], DEFAULT_LICENSE_PATH)
}

async function resolvePublicKeyPath() {
  const configured = getCompatEnv("VIGISENSYS_LICENSE_PUBLIC_KEY_PATH", "VIGITEMP_LICENSE_PUBLIC_KEY_PATH")
  if (configured) return configured

  return firstExistingPath(
    [DEFAULT_PUBLIC_KEY_PATH, LEGACY_DEFAULT_PUBLIC_KEY_PATH, FALLBACK_PUBLIC_KEY_PATH, LEGACY_FALLBACK_PUBLIC_KEY_PATH],
    DEFAULT_PUBLIC_KEY_PATH,
  )
}

async function resolvePrivateKeyPath() {
  const configured = getCompatEnv("VIGISENSYS_AGENT_SECRET_PRIVATE_KEY_PATH", "VIGITEMP_AGENT_SECRET_PRIVATE_KEY_PATH")
  if (configured) return configured
  return firstExistingPath([DEFAULT_PRIVATE_KEY_PATH, LEGACY_DEFAULT_PRIVATE_KEY_PATH], DEFAULT_PRIVATE_KEY_PATH)
}

async function readAgentSecret(): Promise<string | null> {
  const licensePath = await resolveLicensePath()
  const publicKeyPath = await resolvePublicKeyPath()
  const privateKeyPath = await resolvePrivateKeyPath()

  const token = (await fs.readFile(licensePath, "utf8")).trim()
  if (!token) {
    throw new Error("license_file_empty")
  }

  const publicKeyPem = await fs.readFile(publicKeyPath, "utf8")

  const parts = token.split(".")
  if (parts.length !== 3) {
    throw new Error("invalid_license_format")
  }

  const [headerPart, payloadPart, signaturePart] = parts
  const data = Buffer.from(`${headerPart}.${payloadPart}`, "utf8")
  const signature = base64UrlToBuffer(signaturePart)

  const payloadJson = base64UrlToBuffer(payloadPart).toString("utf8")
  const payload = JSON.parse(payloadJson) as {
    agentSecret?: string
    agentSecretEnc?: { alg?: string; value?: string }
  }

  const publicKey = crypto.createPublicKey(publicKeyPem)
  const isValid = crypto.verify(null, data, publicKey, signature)
  if (!isValid) {
    throw new Error("invalid_license_signature")
  }

  if (payload.agentSecretEnc?.value) {
    const privateKeyPem = await fs.readFile(privateKeyPath, "utf8")
    const encrypted = base64UrlToBuffer(payload.agentSecretEnc.value)
    const decrypted = crypto.privateDecrypt(
      {
        key: privateKeyPem,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: "sha1",
      },
      encrypted,
    )
    return decrypted.toString("utf8")
  }

  return payload.agentSecret ?? null
}

export const GET = withLogging(async (req: NextRequest) => {
  const user = getAuthenticatedUser(req)
  if (!user) {
    return apiError(401, "unauthorized", "Non authentifie")
  }

  const license = await validateLicense()
  if (license.ok && isPack(license)) {
    return apiOk({ secret: null, notRequired: true })
  }

  const configuredSecret = resolveConfiguredAgentSecret()
  if (configuredSecret) {
    return apiOk({ secret: configuredSecret })
  }

  try {
    const secret = await readAgentSecret()
    if (!secret) {
      log.warn("AGENT_SECRET", "Secret agent absent dans la licence", {
        userId: user.userId,
        username: user.username,
      })
      return apiError(404, "secret_missing", "Secret agent absent de la licence")
    }

    return apiOk({ secret })
  } catch (error) {
    log.warn("AGENT_SECRET", "Lecture du secret agent impossible", {
      userId: user.userId,
      username: user.username,
      error: error instanceof Error ? error.message : String(error),
    })
    return apiError(500, "secret_read_failed", "Lecture du secret impossible", {
      details: error instanceof Error ? error.message : String(error),
    })
  }
})
