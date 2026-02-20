export type LicenseEdition = "pack" | "one" | "standard" | "expert";

type LicenseLike = { edition?: string | null } | string | null | undefined;

const KNOWN_EDITIONS: readonly LicenseEdition[] = ["pack", "one", "standard", "expert"] as const;

export function getLicenseEdition(input: LicenseLike, fallback: LicenseEdition = "one"): LicenseEdition {
  const raw = typeof input === "string" ? input : input?.edition;
  const normalized = (raw ?? "").trim().toLowerCase();
  return (KNOWN_EDITIONS as readonly string[]).includes(normalized) ? (normalized as LicenseEdition) : fallback;
}

export function isPack(input: LicenseLike): boolean {
  return getLicenseEdition(input) === "pack";
}

export function isOne(input: LicenseLike): boolean {
  return getLicenseEdition(input) === "one";
}

export function isStandard(input: LicenseLike): boolean {
  return getLicenseEdition(input) === "standard";
}

export function isExpert(input: LicenseLike): boolean {
  return getLicenseEdition(input) === "expert";
}

export function isOneOrPack(input: LicenseLike): boolean {
  const edition = getLicenseEdition(input);
  return edition === "one" || edition === "pack";
}

export function isStandardOrExpert(input: LicenseLike): boolean {
  const edition = getLicenseEdition(input);
  return edition === "standard" || edition === "expert";
}
