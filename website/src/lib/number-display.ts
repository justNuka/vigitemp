export type NumberDisplayInput = number | null | undefined

export type NumberDisplayOptions = {
  /**
   * Locale used by Intl.NumberFormat. When omitted, the runtime default locale is used.
   */
  locale?: string | string[]
  /**
   * Fixed number of decimal places. Takes precedence over minimumDecimals/maximumDecimals.
   */
  decimals?: number | null
  /**
   * Minimum number of decimal places when decimals is not provided.
   */
  minimumDecimals?: number | null
  /**
   * Maximum number of decimal places when decimals is not provided.
   */
  maximumDecimals?: number | null
  /**
   * Value returned for null, undefined, NaN or non-finite numbers.
   */
  fallback?: string
  /**
   * Controls thousands grouping. When omitted, Intl.NumberFormat keeps its default behavior.
   */
  grouping?: boolean
}

const MIN_FRACTION_DIGITS = 0
const MAX_FRACTION_DIGITS = 20
const DEFAULT_MINIMUM_DECIMALS = 0
const DEFAULT_MAXIMUM_DECIMALS = 3
const NUMBER_FORMATTER_CACHE_LIMIT = 64

const numberFormatterCache = new Map<string, Intl.NumberFormat>()

type DecimalRange = {
  minimumFractionDigits: number
  maximumFractionDigits: number
}

function normalizeDecimalCount(value: number | null | undefined): number | null {
  if (value === null || value === undefined || !Number.isFinite(value)) return null
  return Math.max(
    MIN_FRACTION_DIGITS,
    Math.min(MAX_FRACTION_DIGITS, Math.trunc(value)),
  )
}

function resolveDecimalRange(options: NumberDisplayOptions): DecimalRange {
  const fixedDecimals = normalizeDecimalCount(options.decimals)
  if (fixedDecimals !== null) {
    return {
      minimumFractionDigits: fixedDecimals,
      maximumFractionDigits: fixedDecimals,
    }
  }

  const minimumFractionDigits =
    normalizeDecimalCount(options.minimumDecimals) ?? DEFAULT_MINIMUM_DECIMALS
  const configuredMaximum = normalizeDecimalCount(options.maximumDecimals)
  const maximumFractionDigits = Math.max(
    minimumFractionDigits,
    configuredMaximum ?? Math.max(DEFAULT_MAXIMUM_DECIMALS, minimumFractionDigits),
  )

  return {
    minimumFractionDigits,
    maximumFractionDigits,
  }
}

function getNumberFormatter(
  locale: string | string[] | undefined,
  fractionDigits: DecimalRange,
  grouping: boolean | undefined,
): Intl.NumberFormat {
  const cacheKey = JSON.stringify([
    locale ?? null,
    fractionDigits.minimumFractionDigits,
    fractionDigits.maximumFractionDigits,
    grouping ?? null,
  ])
  const cachedFormatter = numberFormatterCache.get(cacheKey)

  if (cachedFormatter) {
    // Refresh insertion order so the bounded cache behaves as a small LRU.
    numberFormatterCache.delete(cacheKey)
    numberFormatterCache.set(cacheKey, cachedFormatter)
    return cachedFormatter
  }

  const intlOptions: Intl.NumberFormatOptions = {
    ...fractionDigits,
  }

  if (grouping !== undefined) {
    intlOptions.useGrouping = grouping
  }

  const formatter = new Intl.NumberFormat(locale, intlOptions)

  if (numberFormatterCache.size >= NUMBER_FORMATTER_CACHE_LIMIT) {
    const oldestKey = numberFormatterCache.keys().next().value
    if (oldestKey !== undefined) {
      numberFormatterCache.delete(oldestKey)
    }
  }

  numberFormatterCache.set(cacheKey, formatter)
  return formatter
}

export function formatNumber(
  value: NumberDisplayInput,
  options: NumberDisplayOptions = {},
): string {
  const { locale, fallback = "", grouping } = options

  if (typeof value !== "number" || !Number.isFinite(value)) return fallback

  const fractionDigits = resolveDecimalRange(options)
  return getNumberFormatter(locale, fractionDigits, grouping).format(value)
}
