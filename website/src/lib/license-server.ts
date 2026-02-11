import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

export type LicenseResponse = {
  ok: boolean;
  reason: string;
  licenseId?: string;
  customerId?: string;
  edition?: string;
  maxSensors?: number | null;
  concurrentAccess?: string;
  options?: string[];
  issuedAtRaw?: string;
  expiresAtUtc?: string | null;
};

type LicensePayload = {
  licenseId?: string;
  customerId?: string;
  edition?: string;
  maxSensors?: number | string;
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
const ALLOWED_EDITIONS = new Set(["pack", "one", "standard", "expert"]);

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

function parsePositiveInt(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed = typeof value === "number" ? value : Number(String(value));
  if (!Number.isFinite(parsed)) return null;
  const intVal = Math.trunc(parsed);
  if (intVal <= 0) return null;
  return intVal;
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
  let header: { alg?: string; typ?: string };
  try {
    const payloadJson = base64UrlToBuffer(payloadPart).toString("utf8");
    const headerJson = base64UrlToBuffer(headerPart).toString("utf8");
    payload = JSON.parse(payloadJson) as LicensePayload;
    header = JSON.parse(headerJson) as { alg?: string; typ?: string };
  } catch {
    return { ok: false, reason: "invalid_license_payload" };
  }

  if ((header.alg || "") !== "EdDSA") {
    return { ok: false, reason: "invalid_license_alg" };
  }

  const publicKey = crypto.createPublicKey(publicKeyPem);
  const isValid = crypto.verify(null, data, publicKey, signature);
  if (!isValid) {
    return { ok: false, reason: "invalid_license_signature" };
  }

  if (!payload.licenseId || !payload.customerId) {
    return { ok: false, reason: "missing_license_fields" };
  }

  const normalizedEdition = (payload.edition || "one").trim().toLowerCase();
  if (!ALLOWED_EDITIONS.has(normalizedEdition)) {
    return { ok: false, reason: `invalid_license_edition:${normalizedEdition}` };
  }

  const maxSensors = parsePositiveInt(payload.maxSensors);
  if (normalizedEdition === "pack" && !maxSensors) {
    return { ok: false, reason: "invalid_pack_max_sensors" };
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
    edition: normalizedEdition,
    maxSensors: maxSensors ?? null,
    concurrentAccess: payload.concurrentAccess?.toString(),
    options: payload.options ?? [],
    issuedAtRaw: payload.issuedAt,
    expiresAtUtc: expiresAtUtc?.toISOString() ?? null,
  };
}
