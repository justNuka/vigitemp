import fs from "fs/promises"
import path from "path"
import crypto from "crypto"
import { getCompatEnv } from "@/lib/vigisensys-compat"
import { appDataPath, firstExistingPath, legacyAppDataPath } from "@/lib/vigisensys-paths"

export type AgentSecretStatus = {
  status:
    | "ok"
    | "license_missing"
    | "license_empty"
    | "public_key_missing"
    | "invalid_format"
    | "invalid_payload"
    | "invalid_signature"
    | "private_key_missing"
    | "decrypt_failed"
    | "missing"
    | "error"
  message: string
}

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
    DEFAULT_PUBLIC_KEY_PATH
  )
}

async function resolvePrivateKeyPath() {
  const configured = getCompatEnv("VIGISENSYS_AGENT_SECRET_PRIVATE_KEY_PATH", "VIGITEMP_AGENT_SECRET_PRIVATE_KEY_PATH")
  if (configured) return configured
  return firstExistingPath([DEFAULT_PRIVATE_KEY_PATH, LEGACY_DEFAULT_PRIVATE_KEY_PATH], DEFAULT_PRIVATE_KEY_PATH)
}

export async function getAgentSecretStatus(): Promise<AgentSecretStatus> {
  try {
    const licensePath = await resolveLicensePath()
    const publicKeyPath = await resolvePublicKeyPath()
    const privateKeyPath = await resolvePrivateKeyPath()

    let token: string
    let publicKeyPem: string

    try {
      token = (await fs.readFile(licensePath, "utf8")).trim()
    } catch {
      return { status: "license_missing", message: "Fichier licence introuvable." }
    }

    if (!token) {
      return { status: "license_empty", message: "Fichier licence vide." }
    }

    try {
      publicKeyPem = await fs.readFile(publicKeyPath, "utf8")
    } catch {
      return { status: "public_key_missing", message: "Clé publique introuvable." }
    }

    const parts = token.split(".")
    if (parts.length !== 3) {
      return { status: "invalid_format", message: "Format de licence invalide." }
    }

    const [headerPart, payloadPart, signaturePart] = parts
    const data = Buffer.from(`${headerPart}.${payloadPart}`, "utf8")
    const signature = base64UrlToBuffer(signaturePart)

    let payload: {
      agentSecret?: string
      agentSecretEnc?: { alg?: string; value?: string }
    }

    try {
      const payloadJson = base64UrlToBuffer(payloadPart).toString("utf8")
      payload = JSON.parse(payloadJson) as typeof payload
    } catch {
      return { status: "invalid_payload", message: "Payload de licence invalide." }
    }

    const publicKey = crypto.createPublicKey(publicKeyPem)
    const isValid = crypto.verify(null, data, publicKey, signature)
    if (!isValid) {
      return { status: "invalid_signature", message: "Signature de licence invalide." }
    }

    if (payload.agentSecretEnc?.value) {
      let privateKeyPem: string
      try {
        privateKeyPem = await fs.readFile(privateKeyPath, "utf8")
      } catch {
        return { status: "private_key_missing", message: "Clé privée absente pour déchiffrer le secret." }
      }

      try {
        const encrypted = base64UrlToBuffer(payload.agentSecretEnc.value)
        const decrypted = crypto.privateDecrypt(
          {
            key: privateKeyPem,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: "sha1",
          },
          encrypted
        )
        const secret = decrypted.toString("utf8")
        if (!secret) {
          return { status: "missing", message: "Secret agent absent de la licence." }
        }
        return { status: "ok", message: "OK" }
      } catch {
        return { status: "decrypt_failed", message: "Impossible de déchiffrer le secret agent." }
      }
    }

    if (!payload.agentSecret) {
      return { status: "missing", message: "Secret agent absent de la licence." }
    }

    return { status: "ok", message: "OK" }
  } catch {
    return { status: "error", message: "Erreur lors de la vérification du secret agent." }
  }
}
