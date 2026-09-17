const CP1252_EXTRA_BYTES = new Map<number, number>([
  [0x20ac, 0x80],
  [0x201a, 0x82],
  [0x0192, 0x83],
  [0x201e, 0x84],
  [0x2026, 0x85],
  [0x2020, 0x86],
  [0x2021, 0x87],
  [0x02c6, 0x88],
  [0x2030, 0x89],
  [0x0160, 0x8a],
  [0x2039, 0x8b],
  [0x0152, 0x8c],
  [0x017d, 0x8e],
  [0x2018, 0x91],
  [0x2019, 0x92],
  [0x201c, 0x93],
  [0x201d, 0x94],
  [0x2022, 0x95],
  [0x2013, 0x96],
  [0x2014, 0x97],
  [0x02dc, 0x98],
  [0x2122, 0x99],
  [0x0161, 0x9a],
  [0x203a, 0x9b],
  [0x0153, 0x9c],
  [0x017e, 0x9e],
  [0x0178, 0x9f],
])

const CP850_FRENCH_MOJIBAKE_REPLACEMENTS = [
  ["ÔÇÖ", "’"],
  ["ÔÇô", "–"],
  ["ÔÇö", "—"],
  ["├®", "é"],
  ["├¿", "è"],
  ["├¬", "ê"],
  ["├½", "ë"],
  ["├á", "à"],
  ["├ó", "â"],
  ["├ñ", "ä"],
  ["├╣", "ù"],
  ["├╗", "û"],
  ["├╝", "ü"],
  ["├┤", "ô"],
  ["├Â", "ö"],
  ["├«", "î"],
  ["├»", "ï"],
  ["├º", "ç"],
  ["├ë", "É"],
  ["├ê", "È"],
  ["├è", "Ê"],
  ["├ï", "Ë"],
  ["├Ç", "À"],
  ["├é", "Â"],
  ["├ä", "Ä"],
  ["├Ö", "Ù"],
  ["├ø", "Û"],
  ["├£", "Ü"],
  ["├ö", "Ô"],
  ["├û", "Ö"],
  ["├Ä", "Î"],
  ["├Å", "Ï"],
  ["├ç", "Ç"],
  ["┼ô", "œ"],
  ["┼Æ", "Œ"],
  ["┬░", "°"],
] as const

const MOJIBAKE_MARKER_PATTERN = /(?:Ã|Â|â€|â€™|â€œ|â€|â€“|â€”|â€¦|�|├|┬|┼|ÔÇ)/g

function mojibakeScore(value: string): number {
  return value.match(MOJIBAKE_MARKER_PATTERN)?.length ?? 0
}

function encodeWindows1252(value: string): Uint8Array | null {
  const bytes: number[] = []

  for (const char of value) {
    const codePoint = char.codePointAt(0)
    if (codePoint === undefined) return null

    if (codePoint <= 0x7f || (codePoint >= 0xa0 && codePoint <= 0xff)) {
      bytes.push(codePoint)
      continue
    }

    const mapped = CP1252_EXTRA_BYTES.get(codePoint)
    if (mapped === undefined) return null
    bytes.push(mapped)
  }

  return Uint8Array.from(bytes)
}

function decodeWindows1252Mojibake(value: string): string | null {
  const bytes = encodeWindows1252(value)
  if (!bytes) return null

  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes)
  } catch {
    return null
  }
}

function decodeCommonCp850Mojibake(value: string): string {
  let decoded = value
  for (const [mojibake, expected] of CP850_FRENCH_MOJIBAKE_REPLACEMENTS) {
    decoded = decoded.split(mojibake).join(expected)
  }
  return decoded
}

function repairOnce(value: string): string {
  const currentScore = mojibakeScore(value)
  if (currentScore === 0) return value

  const candidates = [decodeWindows1252Mojibake(value), decodeCommonCp850Mojibake(value)]
    .filter((candidate): candidate is string => Boolean(candidate))

  let best = value
  let bestScore = currentScore

  for (const candidate of candidates) {
    const score = mojibakeScore(candidate)
    if (score < bestScore) {
      best = candidate
      bestScore = score
    }
  }

  return best
}

/**
 * Répare de façon conservative les chaînes UTF-8 historiquement interprétées
 * comme Windows-1252 ou CP850 avant stockage. Une chaîne propre reste inchangée.
 */
export function repairLegacyUtf8Mojibake(value: string): string
export function repairLegacyUtf8Mojibake(value: string | null): string | null
export function repairLegacyUtf8Mojibake(value: string | undefined): string | undefined
export function repairLegacyUtf8Mojibake(value: string | null | undefined): string | null | undefined {
  if (value == null || value.length === 0) return value

  let repaired = value
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const next = repairOnce(repaired)
    if (next === repaired) break
    repaired = next
  }

  return repaired
}
