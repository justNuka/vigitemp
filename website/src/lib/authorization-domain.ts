export type AuthorizationDomain = "admin" | "metrologie" | "surveillance" | "vigilog" | "other";

const ADMIN_ALIASES = ["ACCES_ADMIN", "ADMIN_ACCESS"];
const METROLOGIE_ALIASES = ["ACCES_METROLOGIE", "METROLOGIE_ACCESS"];
const SURVEILLANCE_ALIASES = ["ACCES_SURVEILLANCE", "SURVEILLANCE_ACCESS"];
const VIGILOG_ALIASES = ["ACCES_VIGILOG", "VIGILOG_ACCESS"];

function normalize(value: string | null | undefined): string {
  return (value ?? "").trim().toUpperCase();
}

function matchesAny(code: string, aliases: readonly string[]): boolean {
  const normalized = normalize(code);
  return aliases.some((alias) => normalized === alias || normalized.startsWith(`${alias}_`) || normalized.endsWith(`_${alias}`));
}

export function isAdminDomainCode(code: string | null | undefined): boolean {
  const normalized = normalize(code);
  if (!normalized) return false;
  return matchesAny(normalized, ADMIN_ALIASES) || normalized.includes("_ADMIN") || normalized.endsWith("ADMIN");
}

export function isMetrologieDomainCode(code: string | null | undefined): boolean {
  const normalized = normalize(code);
  if (!normalized) return false;
  return (
    matchesAny(normalized, METROLOGIE_ALIASES) ||
    normalized.includes("METROLOGIE") ||
    normalized.includes("ETALONNAGE") ||
    normalized.includes("AJUSTAGE")
  );
}

export function isSurveillanceDomainCode(code: string | null | undefined): boolean {
  const normalized = normalize(code);
  if (!normalized) return false;
  return (
    matchesAny(normalized, SURVEILLANCE_ALIASES) ||
    normalized.includes("SURVEILLANCE") ||
    normalized.includes("ALARME") ||
    normalized.includes("LIEU")
  );
}

export function isVigiLogDomainCode(code: string | null | undefined): boolean {
  const normalized = normalize(code);
  if (!normalized) return false;
  return matchesAny(normalized, VIGILOG_ALIASES) || normalized.includes("VIGILOG");
}

export function getAuthorizationDomain(code: string | null | undefined): AuthorizationDomain {
  if (isAdminDomainCode(code)) return "admin";
  if (isMetrologieDomainCode(code)) return "metrologie";
  if (isSurveillanceDomainCode(code)) return "surveillance";
  if (isVigiLogDomainCode(code)) return "vigilog";
  return "other";
}
