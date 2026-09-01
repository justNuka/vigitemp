const DEGREE_C = '\u00b0C'
const BAD_DEGREE = '\u00c2\u00b0'
const REPLACEMENT_CHAR = String.fromCharCode(0xfffd)

export const defaultMetrologyUnit = DEGREE_C

export const normalizeMetrologyUnit = (value: string | null | undefined) => {
  let normalized = value ?? ''
  normalized = normalized.split(BAD_DEGREE).join('\u00b0')
  normalized = normalized.split(REPLACEMENT_CHAR).join('\u00c9')
  return normalized.trim()
}
