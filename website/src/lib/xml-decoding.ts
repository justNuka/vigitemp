const BOM_UTF8 = [0xef, 0xbb, 0xbf]
const BOM_UTF16LE = [0xff, 0xfe]
const BOM_UTF16BE = [0xfe, 0xff]

const normalizeEncoding = (value: string | null | undefined): string | null => {
  if (!value) return null
  const normalized = value.trim().toLowerCase()
  if (!normalized) return null

  if (["utf8", "utf-8"].includes(normalized)) return "utf-8"
  if (["utf16", "utf-16", "utf-16le", "unicode"].includes(normalized)) return "utf-16le"
  if (["utf-16be"].includes(normalized)) return "utf-16be"
  if (["latin1", "latin-1", "iso-8859-1", "iso8859-1", "windows-1252", "cp1252", "ansi"].includes(normalized)) return "windows-1252"
  return normalized
}

const detectBomEncoding = (bytes: Uint8Array): string | null => {
  if (bytes.length >= 3 && BOM_UTF8.every((b, i) => bytes[i] === b)) return "utf-8"
  if (bytes.length >= 2 && BOM_UTF16LE.every((b, i) => bytes[i] === b)) return "utf-16le"
  if (bytes.length >= 2 && BOM_UTF16BE.every((b, i) => bytes[i] === b)) return "utf-16be"
  return null
}

const detectDeclaredEncoding = (bytes: Uint8Array): string | null => {
  const head = new TextDecoder("ascii").decode(bytes.subarray(0, Math.min(bytes.length, 512)))
  const match = head.match(/encoding\s*=\s*["']([^"']+)["']/i)
  return normalizeEncoding(match?.[1] ?? null)
}

const countOccurrences = (value: string, needle: string) => (needle.length === 0 ? 0 : value.split(needle).length - 1)

const countSuspiciousControlChars = (value: string) => {
  let count = 0
  for (const char of value) {
    const code = char.charCodeAt(0)
    const isAllowed = code === 9 || code === 10 || code === 13
    if (!isAllowed && code < 32) count += 1
  }
  return count
}

const looksLikeXml = (value: string) => /^\s*(<\?xml\b[^>]*>\s*)?<([A-Za-z_][\w:.-]*)[^>]*>/i.test(value)

const countMojibakeSequences = (value: string) => {
  const patterns = [
    "\\u00C3.",
    "\\u00C2.",
    "\\u00E2\\u20AC.",
    "\\u00E2\\u20AC\\u2122",
    "\\u00E2\\u20AC\\u0153",
    "\\u00E2\\u20AC",
  ]
  return patterns.reduce((count, pattern) => count + ((value.match(new RegExp(pattern, "g")) ?? []).length), 0)
}

const mojibakeScore = (value: string) => {
  const replacement = countOccurrences(value, "\uFFFD")
  const controls = countSuspiciousControlChars(value)
  const mojibake = countMojibakeSequences(value)
  const missingXmlShapePenalty = looksLikeXml(value) ? 0 : 1000

  return replacement * 8 + controls * 10 + mojibake * 6 + missingXmlShapePenalty
}

const decodeWithEncoding = (bytes: Uint8Array, encoding: string) => {
  const text = new TextDecoder(encoding, { fatal: false }).decode(bytes)
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text
}

export function decodeXmlBytes(bytes: Uint8Array) {
  const bomEncoding = detectBomEncoding(bytes)
  const declaredEncoding = detectDeclaredEncoding(bytes)

  const candidates = Array.from(
    new Set(
      [
        bomEncoding,
        declaredEncoding,
        "utf-8",
        "windows-1252",
        "utf-16le",
        "utf-16be",
      ].filter((value): value is string => Boolean(value)),
    ),
  )

  if (declaredEncoding) {
    try {
      const declaredText = decodeWithEncoding(bytes, declaredEncoding)
      if (looksLikeXml(declaredText) && mojibakeScore(declaredText) === 0) {
        return {
          text: declaredText,
          encoding: declaredEncoding,
          corrected: false,
          detectedEncoding: declaredEncoding,
        }
      }
    } catch {
      // Fall back to scored candidates below.
    }
  }

  let best = {
    text: decodeWithEncoding(bytes, candidates[0] ?? "utf-8"),
    encoding: candidates[0] ?? "utf-8",
    score: Number.POSITIVE_INFINITY,
  }

  for (const encoding of candidates) {
    let text = ""
    try {
      text = decodeWithEncoding(bytes, encoding)
    } catch {
      continue
    }

    let score = mojibakeScore(text)
    if (encoding === bomEncoding) score -= 10
    if (encoding === declaredEncoding) score -= 25

    if (score < best.score) {
      best = { text, encoding, score }
    }
  }

  return {
    text: best.text,
    encoding: declaredEncoding ?? bomEncoding ?? best.encoding,
    corrected: best.encoding !== (declaredEncoding ?? bomEncoding ?? "utf-8"),
    detectedEncoding: best.encoding,
  }
}

export function decodeXmlArrayBuffer(buffer: ArrayBuffer) {
  return decodeXmlBytes(new Uint8Array(buffer))
}
