import type { DateRange as DayPickerDateRange } from "react-day-picker"

export type DateRange = DayPickerDateRange

export interface Preset {
  name: string
}

export const PRESETS: Preset[] = [
  { name: "today" },
  { name: "yesterday" },
  { name: "last7" },
  { name: "last14" },
  { name: "last30" },
  { name: "thisWeek" },
  { name: "lastWeek" },
  { name: "thisMonth" },
  { name: "lastMonth" },
]

export const DAY_PICKER_RANGE_STYLES = `
  [data-daterangepicker='true'] .rdp {
    position: relative;
    --rdp-cell-size: 36px;
  }
  [data-daterangepicker='true'] .rdp-months {
    display: flex;
    gap: 1rem;
    padding-top: 1.75rem;
  }
  [data-daterangepicker='true'] .rdp-month {
    flex: 1;
    min-width: 0;
  }
  [data-daterangepicker='true'] .rdp-month_grid {
    width: 100%;
    border-collapse: collapse;
  }
  [data-daterangepicker='true'] .rdp-weekdays {
    display: flex;
  }
  [data-daterangepicker='true'] .rdp-weekday {
    width: 36px;
    border-radius: 0.375rem;
    font-weight: 400;
    font-size: 0.8rem;
    color: hsl(var(--muted-foreground));
    text-align: center;
  }
  [data-daterangepicker='true'] .rdp-week {
    display: flex;
    margin-top: 0.5rem;
  }
  [data-daterangepicker='true'] .rdp-day {
    width: 36px;
    height: 36px;
    padding: 0;
    position: relative;
    text-align: center;
  }
  [data-daterangepicker='true'] .rdp-day_button {
    width: 36px;
    height: 36px;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    line-height: 1;
  }
  [data-daterangepicker='true'] .rdp-outside .rdp-day_button {
    color: hsl(var(--muted-foreground));
    opacity: 0.5;
  }
  [data-daterangepicker='true'] .rdp-day_button:hover {
    background: #e2e8f0;
    color: #0f172a;
  }
  .dark [data-daterangepicker='true'] .rdp-day_button:hover {
    background: hsl(var(--accent));
    color: hsl(var(--accent-foreground));
  }
  [data-daterangepicker='true'] .rdp-selected .rdp-day_button {
    background: hsl(var(--primary));
    color: hsl(var(--primary-foreground));
  }
  [data-daterangepicker='true'] .rdp-range_middle .rdp-day_button,
  [data-daterangepicker='true'] .rdp-range_middle {
    background: hsl(var(--accent));
    color: hsl(var(--accent-foreground));
    border-radius: 0;
  }
  [data-daterangepicker='true'] .rdp-range_start .rdp-day_button,
  [data-daterangepicker='true'] .rdp-range_end .rdp-day_button {
    border-radius: 0.375rem;
  }
  [data-daterangepicker='true'] .rdp-range_middle { background: hsl(var(--accent)); }
  [data-daterangepicker='true'] .rdp-range_start {
    background: hsl(var(--accent));
    border-top-left-radius: 0.375rem;
    border-bottom-left-radius: 0.375rem;
  }
  [data-daterangepicker='true'] .rdp-range_end {
    background: hsl(var(--accent));
    border-top-right-radius: 0.375rem;
    border-bottom-right-radius: 0.375rem;
  }
  [data-daterangepicker='true'] .rdp nav[aria-label='Navigation bar'] {
    position: absolute;
    left: 0.25rem;
    right: 0.25rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    z-index: 20;
    pointer-events: none;
  }
  [data-daterangepicker='true'] .rdp nav[aria-label='Navigation bar'] button {
    pointer-events: auto;
    width: 28px;
    height: 28px;
    border-radius: 0.375rem;
    border: 1px solid hsl(var(--input));
    background: transparent;
    opacity: 0.5;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  [data-daterangepicker='true'] .rdp nav[aria-label='Navigation bar'] button:hover {
    opacity: 1;
    background: #e2e8f0;
    color: #0f172a;
  }
  .dark [data-daterangepicker='true'] .rdp nav[aria-label='Navigation bar'] button:hover {
    background: hsl(var(--accent));
    color: hsl(var(--accent-foreground));
  }
  [data-daterangepicker='true'] .rdp-month_caption {
    display: flex;
    justify-content: center;
    padding-top: 0.25rem;
    position: relative;
    align-items: center;
  }
  #radix-_r_t5_,
  #radix-_r_sr_ {
    justify-items: center;
  }
`

export const formatDate = (date: Date, locale: string = "en-us"): string => {
  return date.toLocaleDateString(locale, { month: "short", day: "numeric", year: "numeric" })
}

export const getDateAdjustedForTimezone = (dateInput: Date | string): Date => {
  if (typeof dateInput === "string") {
    const parts = dateInput.split("-").map((part) => parseInt(part, 10))
    return new Date(parts[0], parts[1] - 1, parts[2])
  }
  return dateInput
}

export function getPresetRange(presetName: string): DateRange {
  const preset = PRESETS.find(({ name }) => name === presetName)
  if (!preset) throw new Error(`Unknown date range preset: ${presetName}`)
  const from = new Date()
  const to = new Date()
  const first = from.getDate() - from.getDay()

  switch (preset.name) {
    case "today":
      from.setHours(0, 0, 0, 0)
      to.setHours(23, 59, 59, 999)
      break
    case "yesterday":
      from.setDate(from.getDate() - 1)
      from.setHours(0, 0, 0, 0)
      to.setDate(to.getDate() - 1)
      to.setHours(23, 59, 59, 999)
      break
    case "last7":
      from.setDate(from.getDate() - 6)
      from.setHours(0, 0, 0, 0)
      to.setHours(23, 59, 59, 999)
      break
    case "last14":
      from.setDate(from.getDate() - 13)
      from.setHours(0, 0, 0, 0)
      to.setHours(23, 59, 59, 999)
      break
    case "last30":
      from.setDate(from.getDate() - 29)
      from.setHours(0, 0, 0, 0)
      to.setHours(23, 59, 59, 999)
      break
    case "thisWeek":
      from.setDate(first)
      from.setHours(0, 0, 0, 0)
      to.setHours(23, 59, 59, 999)
      break
    case "lastWeek":
      from.setDate(from.getDate() - 7 - from.getDay())
      to.setDate(to.getDate() - to.getDay() - 1)
      from.setHours(0, 0, 0, 0)
      to.setHours(23, 59, 59, 999)
      break
    case "thisMonth":
      from.setDate(1)
      from.setHours(0, 0, 0, 0)
      to.setHours(23, 59, 59, 999)
      break
    case "lastMonth":
      from.setMonth(from.getMonth() - 1)
      from.setDate(1)
      from.setHours(0, 0, 0, 0)
      to.setDate(0)
      to.setHours(23, 59, 59, 999)
      break
  }

  return { from, to }
}

export function getCompareRangeFromPreset(presetRange: DateRange): DateRange | undefined {
  const compareFrom = presetRange.from
  const compareTo = presetRange.to
  if (!compareFrom || !compareTo) return undefined

  return {
    from: new Date(compareFrom.getFullYear() - 1, compareFrom.getMonth(), compareFrom.getDate()),
    to: new Date(compareTo.getFullYear() - 1, compareTo.getMonth(), compareTo.getDate()),
  }
}

export function findMatchingPreset(range: DateRange | null) {
  if (!range?.from || !range?.to) return undefined

  for (const preset of PRESETS) {
    const presetRange = getPresetRange(preset.name)
    if (!presetRange.from || !presetRange.to) continue

    const normalizedRangeFrom = new Date(range.from)
    normalizedRangeFrom.setHours(0, 0, 0, 0)
    const normalizedPresetFrom = new Date(presetRange.from)
    normalizedPresetFrom.setHours(0, 0, 0, 0)

    const normalizedRangeTo = new Date(range.to)
    normalizedRangeTo.setHours(0, 0, 0, 0)
    const normalizedPresetTo = new Date(presetRange.to)
    normalizedPresetTo.setHours(0, 0, 0, 0)

    if (normalizedRangeFrom.getTime() === normalizedPresetFrom.getTime() && normalizedRangeTo.getTime() === normalizedPresetTo.getTime()) {
      return preset.name
    }
  }

  return undefined
}

export function areRangesEqual(a?: DateRange | null, b?: DateRange | null): boolean {
  if (!a && !b) return true
  if (!a || !b) return false
  if (!a.from || !b.from) return false

  const fromEqual = a.from.getTime() === b.from.getTime()
  if (!a.to && !b.to) return fromEqual
  if (!a.to || !b.to) return false

  return fromEqual && a.to.getTime() === b.to.getTime()
}

export function buildInitialRange({
  initialDateFrom,
  initialDateTo,
  allowEmpty,
}: {
  initialDateFrom?: Date | string
  initialDateTo?: Date | string
  allowEmpty: boolean
}): DateRange | null {
  const resolvedInitialFrom = initialDateFrom
    ? getDateAdjustedForTimezone(initialDateFrom)
    : allowEmpty
      ? undefined
      : new Date(new Date().setHours(0, 0, 0, 0))
  const resolvedInitialTo = initialDateTo ? getDateAdjustedForTimezone(initialDateTo) : resolvedInitialFrom

  return resolvedInitialFrom ? { from: resolvedInitialFrom, to: resolvedInitialTo } : null
}

export function buildInitialCompareRange({
  initialCompareFrom,
  initialCompareTo,
}: {
  initialCompareFrom?: Date | string
  initialCompareTo?: Date | string
}): DateRange | undefined {
  return initialCompareFrom
    ? {
        from: new Date(new Date(initialCompareFrom).setHours(0, 0, 0, 0)),
        to: initialCompareTo
          ? new Date(new Date(initialCompareTo).setHours(0, 0, 0, 0))
          : new Date(new Date(initialCompareFrom).setHours(0, 0, 0, 0)),
      }
    : undefined
}
