import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

export type LicenseResponse = {
  ok: boolean;
  reason: string;
  licenseId?: string;
  customerId?: string;
  edition?: string;
  concurrentAccess?: string;
  options?: string[];
  issuedAtRaw?: string;
  expiresAtUtc?: string | null;
};

type LicensePayload = {
  licenseId?: string;
  customerId?: string;
  edition?: string;
  concurrentAccess?: string | number;
  issuedAt?: string;
  expiresAt?: string;
  options?: string[];
  bind?: {
    instancePublicKey?: string;
  };
};

const PROGRAM_DATA = process.env.ProgramData || "C:\\ProgramData";
const LICENSE_DIR = path.join(PROGRAM_DATA, "Vigitemp", "licenses");
const DEFAULT_LICENSE_PATH = path.join(PROGRAM_DATA, "Vigitemp", "license.vtlic");
const DEFAULT_PUBLIC_KEY_PATH = path.join(PROGRAM_DATA, "Vigitemp", "license_keys", "public_key.pem");
const FALLBACK_PUBLIC_KEY_PATH = path.join(PROGRAM_DATA, "Vigitemp", "public_key.pem");

function base64UrlToBuffer(input: string) {
  let base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  switch (base64.length % 4) {
    case 2:
      base64 += "==";
      break;
    case 3:
      base64 += "=";
      break;
    default:
      break;
  }
  return Buffer.from(base64, "base64");
}

function normalizeKey(value?: string) {
  if (!value) return "";
  return value.replace(/\s+/g, "");
}

async function resolveLicensePath() {
  if (process.env.VIGITEMP_LICENSE_PATH) {
    return process.env.VIGITEMP_LICENSE_PATH;
  }

  try {
    const entries = await fs.readdir(LICENSE_DIR, { withFileTypes: true });
    const found = entries.find((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".vtlic"));
    if (found) {
      return path.join(LICENSE_DIR, found.name);
    }
  } catch {
    // ignore
  }

  return DEFAULT_LICENSE_PATH;
}

async function resolvePublicKeyPath() {
  if (process.env.VIGITEMP_LICENSE_PUBLIC_KEY_PATH) {
    return process.env.VIGITEMP_LICENSE_PUBLIC_KEY_PATH;
  }

  try {
    await fs.access(DEFAULT_PUBLIC_KEY_PATH);
    return DEFAULT_PUBLIC_KEY_PATH;
  } catch {
    return FALLBACK_PUBLIC_KEY_PATH;
  }
}

export async function validateLicense(): Promise<LicenseResponse> {
  const licensePath = await resolveLicensePath();
  const publicKeyPath = await resolvePublicKeyPath();
  const instancePublicKey = normalizeKey(process.env.VIGITEMP_LICENSE_INSTANCE_PUBLIC_KEY);

  let token: string;
  let publicKeyPem: string;

  try {
    token = (await fs.readFile(licensePath, "utf8")).trim();
  } catch {
    return { ok: false, reason: `license_file_not_found:${licensePath}` };
  }

  if (!token) {
    return { ok: false, reason: "license_file_empty" };
  }

  try {
    publicKeyPem = await fs.readFile(publicKeyPath, "utf8");
  } catch {
    return { ok: false, reason: `public_key_not_found:${publicKeyPath}` };
  }

  const parts = token.split(".");
  if (parts.length !== 3) {
    return { ok: false, reason: "invalid_license_format" };
  }

  const [headerPart, payloadPart, signaturePart] = parts;
  const data = Buffer.from(`${headerPart}.${payloadPart}`, "utf8");
  const signature = base64UrlToBuffer(signaturePart);

  let payload: LicensePayload;
  try {
    const payloadJson = base64UrlToBuffer(payloadPart).toString("utf8");
    payload = JSON.parse(payloadJson) as LicensePayload;
  } catch {
    return { ok: false, reason: "invalid_license_payload" };
  }

  const publicKey = crypto.createPublicKey(publicKeyPem);
  const isValid = crypto.verify(null, data, publicKey, signature);
  if (!isValid) {
    return { ok: false, reason: "invalid_license_signature" };
  }

  if (!payload.licenseId || !payload.customerId) {
    return { ok: false, reason: "missing_license_fields" };
  }

  const expiresAtUtc = payload.expiresAt ? new Date(payload.expiresAt) : null;
  if (expiresAtUtc && Number.isFinite(expiresAtUtc.valueOf())) {
    if (Date.now() > expiresAtUtc.valueOf()) {
      return { ok: false, reason: `license_expired:${expiresAtUtc.toISOString().slice(0, 10)}` };
    }
  }

  const bindKey = normalizeKey(payload.bind?.instancePublicKey);
  if (bindKey && bindKey !== instancePublicKey) {
    return { ok: false, reason: "license_instance_mismatch" };
  }

  return {
    ok: true,
    reason: "OK",
    licenseId: payload.licenseId,
    customerId: payload.customerId,
    edition: (payload.edition || "one").trim(),
    concurrentAccess: payload.concurrentAccess?.toString(),
    options: payload.options ?? [],
    issuedAtRaw: payload.issuedAt,
    expiresAtUtc: expiresAtUtc?.toISOString() ?? null,
  };
}
