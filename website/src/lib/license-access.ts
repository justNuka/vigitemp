export type LicenseEdition = "pack" | "one" | "standard" | "expert";

export type LicenseLike = {
  edition?: string | null;
  options?: string[] | null;
} | string | null | undefined;

const KNOWN_EDITIONS: readonly LicenseEdition[] = ["pack", "one", "standard", "expert"] as const;

const PACK_EMAIL_OPTION_KEYS = new Set([
  "mail",
  "email",
  "emails",
  "notification_mail",
  "notification_email",
  "notifications_mail",
  "notifications_email",
  "alarm_mail",
  "alarm_email",
]);

export function getLicenseEdition(input: LicenseLike, fallback: LicenseEdition = "one"): LicenseEdition {
  const raw = typeof input === "string" ? input : input?.edition;
  const normalized = (raw ?? "").trim().toLowerCase();
  return (KNOWN_EDITIONS as readonly string[]).includes(normalized) ? (normalized as LicenseEdition) : fallback;
}

export function hasLicenseOption(input: LicenseLike, option: string): boolean {
  if (!input || typeof input === "string") return false;
  const normalizedOption = option.trim().toLowerCase();
  return (input.options ?? []).some((value) => value.trim().toLowerCase() === normalizedOption);
}

export function hasApplicationEmailAccess(input: LicenseLike): boolean {
  const edition = getLicenseEdition(input);
  if (edition !== "pack") return true;
  if (!input || typeof input === "string") return false;

  return (input.options ?? []).some((option) =>
    PACK_EMAIL_OPTION_KEYS.has(String(option).trim().toLowerCase()),
  );
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

export function isOneOrHigher(input: LicenseLike): boolean {
  const edition = getLicenseEdition(input);
  return edition === "one" || edition === "standard" || edition === "expert";
}

export function isStandardOrExpert(input: LicenseLike): boolean {
  const edition = getLicenseEdition(input);
  return edition === "standard" || edition === "expert";
}
