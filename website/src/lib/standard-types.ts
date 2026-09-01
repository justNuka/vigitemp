export type StandardTypeLike = {
  Type_Etalon: string;
};

function normalizeCode(value: string | null | undefined) {
  return (value ?? "").trim().toUpperCase();
}

function normalizeSerial(value: string | null | undefined) {
  return (value ?? "").trim().toUpperCase();
}

export function inferStandardTypeCode(
  serial: string | null | undefined,
  types: StandardTypeLike[] | null | undefined,
): string | null {
  const normalizedSerial = normalizeSerial(serial);
  if (!normalizedSerial) return null;

  const codes = (types ?? [])
    .map((type) => normalizeCode(type.Type_Etalon))
    .filter(Boolean)
    .sort((a, b) => b.length - a.length);

  for (const code of codes) {
    if (
      normalizedSerial === code ||
      normalizedSerial.startsWith(`${code}-`) ||
      normalizedSerial.startsWith(`${code}_`) ||
      normalizedSerial.startsWith(`${code} `) ||
      normalizedSerial.startsWith(code)
    ) {
      return code;
    }
  }

  const rawPrefixMatch = normalizedSerial.match(/^([A-Z]{2,4})(?:[-_\s].*)?$/);
  return rawPrefixMatch?.[1] ?? null;
}

export function buildStandardSerial(typeCode: string | null | undefined, rawSerial: string | null | undefined) {
  const normalizedType = normalizeCode(typeCode);
  const normalizedSerial = normalizeSerial(rawSerial);

  if (!normalizedSerial) return "";
  if (!normalizedType) return normalizedSerial;

  if (
    normalizedSerial === normalizedType ||
    normalizedSerial.startsWith(`${normalizedType}-`) ||
    normalizedSerial.startsWith(`${normalizedType}_`) ||
    normalizedSerial.startsWith(`${normalizedType} `) ||
    normalizedSerial.startsWith(normalizedType)
  ) {
    return normalizedSerial;
  }

  if (/^\d+$/.test(normalizedSerial)) {
    return normalizedType.length >= 4 ? `${normalizedType}-${normalizedSerial}` : `${normalizedType}${normalizedSerial}`;
  }

  return normalizedSerial;
}
