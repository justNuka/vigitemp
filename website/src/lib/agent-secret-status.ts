import fs from "fs/promises"
import path from "path"
import crypto from "crypto"
import { getCompatEnv } from "@/lib/vigisensys-compat"
import { appDataPath, firstExistingPath, legacyAppDataPath } from "@/lib/vigisensys-paths"

export type AgentSecretStatus = {
  status:
    | "ok"
    | "agent_unreachable"
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
  scope: "agent" | "configuration"
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
const AGENT_URLS = ["http://127.0.0.1:8000/info", "http://localhost:8000/info"] as const

function createTimeoutSignal(timeoutMs: number): AbortSignal {
  const controller = new AbortController()
  setTimeout(() => controller.abort(), timeoutMs)
  return controller.signal
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

async function isAgentReachable() {
  for (const url of AGENT_URLS) {
    try {
      const res = await fetch(url, {
        method: "GET",
        signal: createTimeoutSignal(1200),
        cache: "no-store",
      })
      if (res.ok) return true
    } catch {
      // try next url
    }
  }

  return false
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
      return { status: "license_missing", scope: "configuration", message: "Fichier licence introuvable." }
    }

    if (!token) {
      return { status: "license_empty", scope: "configuration", message: "Fichier licence vide." }
    }

    try {
      publicKeyPem = await fs.readFile(publicKeyPath, "utf8")
    } catch {
      return { status: "public_key_missing", scope: "configuration", message: "Cle publique introuvable." }
    }

    const parts = token.split(".")
    if (parts.length !== 3) {
      return { status: "invalid_format", scope: "configuration", message: "Format de licence invalide." }
    }

    const [headerPart, payloadPart, signaturePart] = parts
    const data = Buffer.from(`${headerPart}.${payloadPart}`, "utf8")
    const signature = base64UrlToBuffer(signaturePart)

    let payload: {
      edition?: string
      agentSecret?: string
      agentSecretEnc?: { alg?: string; value?: string }
    }

    try {
      const payloadJson = base64UrlToBuffer(payloadPart).toString("utf8")
      payload = JSON.parse(payloadJson) as typeof payload
    } catch {
      return { status: "invalid_payload", scope: "configuration", message: "Payload de licence invalide." }
    }

    const publicKey = crypto.createPublicKey(publicKeyPem)
    const isValid = crypto.verify(null, data, publicKey, signature)
    if (!isValid) {
      return { status: "invalid_signature", scope: "configuration", message: "Signature de licence invalide." }
    }

    if ((payload.edition ?? "").trim().toLowerCase() === "pack") {
      return { status: "ok", scope: "configuration", message: "Agent non requis pour la licence Pack." }
    }

    if (payload.agentSecretEnc?.value) {
      let privateKeyPem: string
      try {
        privateKeyPem = await fs.readFile(privateKeyPath, "utf8")
      } catch {
        return {
          status: "private_key_missing",
          scope: "configuration",
          message: "Cle privee absente pour dechiffrer la configuration agent.",
        }
      }

      try {
        const encrypted = base64UrlToBuffer(payload.agentSecretEnc.value)
        const decrypted = crypto.privateDecrypt(
          {
            key: privateKeyPem,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: "sha1",
          },
          encrypted,
        )
        const secret = decrypted.toString("utf8")
        if (!secret) {
          return { status: "missing", scope: "configuration", message: "Configuration agent absente de la licence." }
        }
      } catch {
        return {
          status: "decrypt_failed",
          scope: "configuration",
          message: "Impossible de dechiffrer la configuration agent.",
        }
      }
    } else if (!payload.agentSecret) {
      return { status: "missing", scope: "configuration", message: "Configuration agent absente de la licence." }
    }

    const agentReachable = await isAgentReachable()
    if (!agentReachable) {
      return { status: "agent_unreachable", scope: "agent", message: "Agent local inaccessible ou non demarre." }
    }

    return { status: "ok", scope: "configuration", message: "OK" }
  } catch {
    return { status: "error", scope: "configuration", message: "Erreur lors de la verification de l'agent local." }
  }
}
