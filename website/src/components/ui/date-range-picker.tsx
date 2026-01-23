/* eslint-disable max-lines */
'use client'

import React, { type FC, useState, useEffect, useMemo, useRef } from 'react'
import type { DateRange as DayPickerDateRange } from 'react-day-picker'
import { Button } from './button'
import { Popover, PopoverContent, PopoverTrigger } from './popover'
import { Calendar } from './calendar'
import { DateInput } from './date-input'
import { Label } from './label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from './select'
import { Switch } from './switch'
import { ChevronUpIcon, ChevronDownIcon, CheckIcon } from '@radix-ui/react-icons'
import { cn } from '@/lib/utils'
import { useLocale, useTranslations } from 'next-intl'
import { format } from 'date-fns'
import { enUS, fr } from 'date-fns/locale'

export interface DateRangePickerProps {
  /** Click handler for applying the updates from DateRangePicker. */
  onUpdate?: (values: { range: DateRange, rangeCompare?: DateRange }) => void
  /** Initial value for start date */
  initialDateFrom?: Date | string
  /** Initial value for end date */
  initialDateTo?: Date | string
  /** Initial value for start date for compare */
  initialCompareFrom?: Date | string
  /** Initial value for end date for compare */
  initialCompareTo?: Date | string
  /** Alignment of popover */
  align?: 'start' | 'center' | 'end'
  /** Option for locale */
  locale?: string
  /** Option for showing compare feature */
  showCompare?: boolean
  /** Allow empty selection */
  allowEmpty?: boolean
}

const formatDate = (date: Date, locale: string = 'en-us'): string => {
  return date.toLocaleDateString(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const getDateAdjustedForTimezone = (dateInput: Date | string): Date => {
  if (typeof dateInput === 'string') {
    // Split the date string to get year, month, and day parts
    const parts = dateInput.split('-').map((part) => parseInt(part, 10))
    // Create a new Date object using the local timezone
    // Note: Month is 0-indexed, so subtract 1 from the month part
    const date = new Date(parts[0], parts[1] - 1, parts[2])
    return date
  } else {
    // If dateInput is already a Date object, return it directly
    return dateInput
  }
}

type DateRange = DayPickerDateRange

interface Preset {
  name: string
}

// Define presets
const PRESETS: Preset[] = [
  { name: 'today' },
  { name: 'yesterday' },
  { name: 'last7' },
  { name: 'last14' },
  { name: 'last30' },
  { name: 'thisWeek' },
  { name: 'lastWeek' },
  { name: 'thisMonth' },
  { name: 'lastMonth' }
]

/** The DateRangePicker component allows a user to select a range of dates */
export const DateRangePicker: FC<DateRangePickerProps> & {
  filePath: string
} = ({
  initialDateFrom,
  initialDateTo,
  initialCompareFrom,
  initialCompareTo,
  onUpdate,
  align = 'end',
  locale,
  showCompare = true,
  allowEmpty = false
}) => {
  const intlLocale = useLocale()
  const t = useTranslations('dateRangePicker')
  const [isOpen, setIsOpen] = useState(false)
  const fallbackDate = useMemo(() => new Date(new Date().setHours(0, 0, 0, 0)), [])
  const resolvedLocale = useMemo(
    () => locale ?? (intlLocale.toLowerCase().startsWith('fr') ? 'fr-FR' : 'en-US'),
    [locale, intlLocale]
  )
  const dayPickerLocale = useMemo(
    () => (resolvedLocale.toLowerCase().startsWith('fr') ? fr : enUS),
    [resolvedLocale]
  )
  const formatCaption = useMemo(() => {
    const capitalize = (value: string) =>
      value.length ? `${value.charAt(0).toUpperCase()}${value.slice(1)}` : value

    return (month: Date) =>
      capitalize(format(month, 'LLLL yyyy', { locale: dayPickerLocale }))
  }, [dayPickerLocale])

  const resolvedInitialFrom = initialDateFrom
    ? getDateAdjustedForTimezone(initialDateFrom)
    : allowEmpty
      ? undefined
      : new Date(new Date().setHours(0, 0, 0, 0))
  const resolvedInitialTo = initialDateTo
    ? getDateAdjustedForTimezone(initialDateTo)
    : resolvedInitialFrom
  const [range, setRange] = useState<DateRange | null>(
    resolvedInitialFrom
      ? {
          from: resolvedInitialFrom,
          to: resolvedInitialTo
        }
      : null
  )
  const [rangeCompare, setRangeCompare] = useState<DateRange | undefined>(
    initialCompareFrom
      ? {
          from: new Date(new Date(initialCompareFrom).setHours(0, 0, 0, 0)),
          to: initialCompareTo
            ? new Date(new Date(initialCompareTo).setHours(0, 0, 0, 0))
            : new Date(new Date(initialCompareFrom).setHours(0, 0, 0, 0))
        }
      : undefined
  )

  // Refs to store the values of range and rangeCompare when the date picker is opened
  const openedRangeRef = useRef<DateRange | null | undefined>(undefined)
  const openedRangeCompareRef = useRef<DateRange | null | undefined>(undefined)

  const [selectedPreset, setSelectedPreset] = useState<string | undefined>(undefined)

  const [isSmallScreen, setIsSmallScreen] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 960 : false
  )

  useEffect(() => {
    const handleResize = (): void => {
      setIsSmallScreen(window.innerWidth < 960)
    }

    window.addEventListener('resize', handleResize)

    // Clean up event listener on unmount
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const getPresetRange = (presetName: string): DateRange => {
    const preset = PRESETS.find(({ name }) => name === presetName)
    if (!preset) throw new Error(`Unknown date range preset: ${presetName}`)
    const from = new Date()
    const to = new Date()
    const first = from.getDate() - from.getDay()

    switch (preset.name) {
      case 'today':
        from.setHours(0, 0, 0, 0)
        to.setHours(23, 59, 59, 999)
        break
      case 'yesterday':
        from.setDate(from.getDate() - 1)
        from.setHours(0, 0, 0, 0)
        to.setDate(to.getDate() - 1)
        to.setHours(23, 59, 59, 999)
        break
      case 'last7':
        from.setDate(from.getDate() - 6)
        from.setHours(0, 0, 0, 0)
        to.setHours(23, 59, 59, 999)
        break
      case 'last14':
        from.setDate(from.getDate() - 13)
        from.setHours(0, 0, 0, 0)
        to.setHours(23, 59, 59, 999)
        break
      case 'last30':
        from.setDate(from.getDate() - 29)
        from.setHours(0, 0, 0, 0)
        to.setHours(23, 59, 59, 999)
        break
      case 'thisWeek':
        from.setDate(first)
        from.setHours(0, 0, 0, 0)
        to.setHours(23, 59, 59, 999)
        break
      case 'lastWeek':
        from.setDate(from.getDate() - 7 - from.getDay())
        to.setDate(to.getDate() - to.getDay() - 1)
        from.setHours(0, 0, 0, 0)
        to.setHours(23, 59, 59, 999)
        break
      case 'thisMonth':
        from.setDate(1)
        from.setHours(0, 0, 0, 0)
        to.setHours(23, 59, 59, 999)
        break
      case 'lastMonth':
        from.setMonth(from.getMonth() - 1)
        from.setDate(1)
        from.setHours(0, 0, 0, 0)
        to.setDate(0)
        to.setHours(23, 59, 59, 999)
        break
    }

    return { from, to }
  }

  const setPreset = (preset: string): void => {
    const presetRange = getPresetRange(preset)
    if (!presetRange.from) return

    setRange(presetRange)
    if (rangeCompare) {
      const compareFrom = presetRange.from
      const compareTo = presetRange.to

      if (!compareTo) {
        setRangeCompare(undefined)
        return
      }

      const rangeCompare = {
        from: new Date(
          compareFrom.getFullYear() - 1,
          compareFrom.getMonth(),
          compareFrom.getDate()
        ),
        to: new Date(
          compareTo.getFullYear() - 1,
          compareTo.getMonth(),
          compareTo.getDate()
        )
      }
      setRangeCompare(rangeCompare)
    }
  }

  const checkPreset = (): void => {
    if (!range || !range.from || !range.to) {
      setSelectedPreset(undefined)
      return
    }
    for (const preset of PRESETS) {
      const presetRange = getPresetRange(preset.name)
      if (!presetRange.from || !presetRange.to) continue

      const normalizedRangeFrom = new Date(range.from);
      normalizedRangeFrom.setHours(0, 0, 0, 0);
      const normalizedPresetFrom = new Date(
        presetRange.from.setHours(0, 0, 0, 0)
      )

      const normalizedRangeTo = new Date(range.to ?? 0);
      normalizedRangeTo.setHours(0, 0, 0, 0);
      const normalizedPresetTo = new Date(
        presetRange.to?.setHours(0, 0, 0, 0) ?? 0
      )

      if (
        normalizedRangeFrom.getTime() === normalizedPresetFrom.getTime() &&
        normalizedRangeTo.getTime() === normalizedPresetTo.getTime()
      ) {
        setSelectedPreset(preset.name)
        return
      }
    }

    setSelectedPreset(undefined)
  }

  const resetValues = (): void => {
    if (allowEmpty && !initialDateFrom) {
      setRange(null)
      setRangeCompare(undefined)
      return
    }
    const fromValue =
      typeof initialDateFrom === 'string'
        ? getDateAdjustedForTimezone(initialDateFrom)
        : initialDateFrom
    const toValue = initialDateTo
      ? typeof initialDateTo === 'string'
        ? getDateAdjustedForTimezone(initialDateTo)
        : initialDateTo
      : fromValue
    setRange(
      fromValue
        ? {
            from: fromValue,
            to: toValue
          }
        : null
    )
    setRangeCompare(
      initialCompareFrom
        ? {
            from:
              typeof initialCompareFrom === 'string'
                ? getDateAdjustedForTimezone(initialCompareFrom)
                : initialCompareFrom,
            to: initialCompareTo
              ? typeof initialCompareTo === 'string'
                ? getDateAdjustedForTimezone(initialCompareTo)
                : initialCompareTo
              : typeof initialCompareFrom === 'string'
                ? getDateAdjustedForTimezone(initialCompareFrom)
                : initialCompareFrom
          }
        : undefined
    )
  }

  useEffect(() => {
    checkPreset()
  }, [range])

  const PresetButton = ({
    preset,
    label,
    isSelected
  }: {
    preset: string
    label: string
    isSelected: boolean
  }) => (
    <Button
      className={cn(
        'hover:bg-slate-100 dark:hover:bg-muted/60',
        isSelected && 'pointer-events-none'
      )}
      variant="ghost"
      onClick={() => {
        setPreset(preset)
      }}
    >
      <>
        <span className={cn('pr-2 opacity-0', isSelected && 'opacity-70')}>
          <CheckIcon width={18} height={18} />
        </span>
        {label}
      </>
    </Button>
  )

  // Helper function to check if two date ranges are equal
  const areRangesEqual = (a?: DateRange | null, b?: DateRange | null): boolean => {
    if (!a && !b) return true
    if (!a || !b) return false
    if (!a.from || !b.from) return false

    const fromEqual = a.from.getTime() === b.from.getTime()
    if (!a.to && !b.to) return fromEqual
    if (!a.to || !b.to) return false

    return fromEqual && a.to.getTime() === b.to.getTime()
  }

  useEffect(() => {
    if (isOpen) {
      openedRangeRef.current = range
      openedRangeCompareRef.current = rangeCompare
    }
  }, [isOpen])

  return (
    <Popover
      modal={true}
      open={isOpen}
      onOpenChange={(open: boolean) => {
        if (!open) {
          resetValues()
        }
        setIsOpen(open)
      }}
    >
      <PopoverTrigger asChild>
        <Button size={'lg'} variant="outline" className="w-full justify-between">
          <div className="text-left">
            <div className="py-1">
              <div>
                {range?.from
                  ? `${formatDate(range.from, resolvedLocale)}${
                      range.to != null ? ' - ' + formatDate(range.to, resolvedLocale) : ''
                    }`
                  : t('selectRange')}
              </div>
            </div>
            {rangeCompare != null && (
              <div className="opacity-60 text-xs -mt-1">
                {rangeCompare.from ? (
                  <>
                    vs. {formatDate(rangeCompare.from, resolvedLocale)}
                    {rangeCompare.to != null
                      ? ` - ${formatDate(rangeCompare.to, resolvedLocale)}`
                      : ''}
                  </>
                ) : null}
              </div>
            )}
          </div>
          <div className="pl-1 opacity-60 -mr-2 scale-125">
            {isOpen ? (<ChevronUpIcon width={24} />) : (<ChevronDownIcon width={24} />)}
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent align={align} className="w-(--radix-popover-trigger-width) max-w-none p-4 max-h-[75vh] overflow-auto">
        <div data-daterangepicker="true" className="flex py-2">
          <div className="flex">
            <div className="flex flex-col flex-1 min-w-0">
              <div className="flex flex-col gap-2 px-3 justify-between items-center pb-4">
                {showCompare && (
                  <div className="flex items-center space-x-2 pr-4 py-1">
                    <Switch
                      defaultChecked={Boolean(rangeCompare)}
                      onCheckedChange={(checked: boolean) => {
                        if (checked) {
                          const baseDate = range?.from ?? fallbackDate
                          const endDate = range?.to ?? baseDate
                          if (!range?.to || !range?.from) {
                            setRange({
                              from: baseDate,
                              to: endDate
                            })
                          }
                          setRangeCompare({
                            from: new Date(
                              baseDate.getFullYear(),
                              baseDate.getMonth(),
                              baseDate.getDate() - 365
                            ),
                            to: endDate
                              ? new Date(
                                endDate.getFullYear() - 1,
                                endDate.getMonth(),
                                endDate.getDate()
                              )
                              : new Date(
                                baseDate.getFullYear() - 1,
                                baseDate.getMonth(),
                                baseDate.getDate()
                              )
                          })
                        } else {
                          setRangeCompare(undefined)
                        }
                      }}
                      id="compare-mode"
                    />
                    <Label htmlFor="compare-mode">{t('compare')}</Label>
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <DateInput
                      value={range?.from}
                      locale={resolvedLocale}
                      allowEmpty={allowEmpty}
                      onChange={(date) => {
                        const toDate =
                          range?.to == null || date > range.to ? date : range.to
                        setRange({
                          from: date,
                          to: toDate
                        })
                      }}
                    />
                    <div className="py-1">-</div>
                    <DateInput
                      value={range?.to}
                      locale={resolvedLocale}
                      allowEmpty={allowEmpty}
                      onChange={(date) => {
                        const currentFrom = range?.from
                        const fromDate = currentFrom && date < currentFrom ? date : currentFrom ?? date
                        setRange({
                          from: fromDate,
                          to: date
                        })
                      }}
                    />
                  </div>
                  {rangeCompare != null && (
                    <div className="flex gap-2">
                      <DateInput
                        value={rangeCompare?.from}
                        locale={resolvedLocale}
                        onChange={(date) => {
                          if (rangeCompare) {
                            const compareToDate =
                              rangeCompare.to == null || date > rangeCompare.to
                                ? date
                                : rangeCompare.to
                            setRangeCompare((prevRangeCompare) => ({
                              ...prevRangeCompare,
                              from: date,
                              to: compareToDate
                            }))
                          } else {
                            setRangeCompare({
                              from: date,
                              to: new Date()
                            })
                          }
                        }}
                      />
                      <div className="py-1">-</div>
                      <DateInput
                        value={rangeCompare?.to}
                        locale={resolvedLocale}
                        onChange={(date) => {
                          if (rangeCompare && rangeCompare.from) {
                            const compareFromDate =
                              date < rangeCompare.from
                                ? date
                                : rangeCompare.from
                            setRangeCompare({
                              ...rangeCompare,
                              from: compareFromDate,
                              to: date
                            })
                          }
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
              { isSmallScreen && (
                <Select defaultValue={selectedPreset} onValueChange={(value) => { setPreset(value) }}>
                  <SelectTrigger className="w-45 mx-auto mb-2">
                    <SelectValue placeholder={t('select')} />
                  </SelectTrigger>
                  <SelectContent>
                    {PRESETS.map((preset) => (
                      <SelectItem key={preset.name} value={preset.name}>
                        {t(`presets.${preset.name}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <div className="w-full overflow-x-auto">
                {/* Force styles for react-day-picker v9 to look like the demo (v8/shadcn style) */}
                <style jsx global>{`
                  /* Scope: only inside this popover */
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

                  /* Make each cell behave like shadcn (bg on selected range) */
                  [data-daterangepicker='true'] .rdp-day {
                    width: 36px;
                    height: 36px;
                    padding: 0;
                    position: relative;
                    text-align: center;
                  }

                  /* The button inside the cell */
                  [data-daterangepicker='true'] .rdp-day_button {
                    width: 36px;
                    height: 36px;
                    border-radius: 0.375rem;
                    font-size: 0.875rem;
                    line-height: 1;
                  }

                  /* Outside days */
                  [data-daterangepicker='true'] .rdp-outside .rdp-day_button {
                    color: hsl(var(--muted-foreground));
                    opacity: 0.5;
                  }

                  /* Hover like shadcn */
                  [data-daterangepicker='true'] .rdp-day_button:hover {
                    background: #e2e8f0; /* slate-200 */
                    color: #0f172a; /* slate-900 */
                  }

                  .dark [data-daterangepicker='true'] .rdp-day_button:hover {
                    background: hsl(var(--accent));
                    color: hsl(var(--accent-foreground));
                  }

                  /* Selected day */
                  [data-daterangepicker='true'] .rdp-selected .rdp-day_button {
                    background: hsl(var(--primary));
                    color: hsl(var(--primary-foreground));
                  }

                  /* Range middle (selected but not start/end) */
                  [data-daterangepicker='true'] .rdp-range_middle .rdp-day_button,
                  [data-daterangepicker='true'] .rdp-range_middle {
                    background: hsl(var(--accent));
                    color: hsl(var(--accent-foreground));
                    border-radius: 0;
                  }

                  /* Start/end rounded */
                  [data-daterangepicker='true'] .rdp-range_start .rdp-day_button,
                  [data-daterangepicker='true'] .rdp-range_end .rdp-day_button {
                    border-radius: 0.375rem;
                  }

                  /* Make the cell background extend for ranges (like demo) */
                  [data-daterangepicker='true'] .rdp-range_middle {
                    background: hsl(var(--accent));
                  }
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

                  /* --- NAV (RDP v9) : target the actual nav element --- */
                  [data-daterangepicker='true'] .rdp {
                    position: relative;
                  }

                  /* The real nav in v9 */
                  [data-daterangepicker='true'] .rdp nav[aria-label='Navigation bar'] {
                    position: absolute;
                    left: 0.25rem;
                    right: 0.25rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    z-index: 20;
                    pointer-events: none; /* don't block calendar */
                  }

                  /* Re-enable pointer events only on the buttons */
                  [data-daterangepicker='true'] .rdp nav[aria-label='Navigation bar'] button {
                    pointer-events: auto;
                  }

                  /* Style both buttons (prev/next) */
                  [data-daterangepicker='true'] .rdp nav[aria-label='Navigation bar'] button {
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
                    background: #e2e8f0; /* slate-200 */
                    color: #0f172a; /* slate-900 */
                  }

                  .dark [data-daterangepicker='true'] .rdp nav[aria-label='Navigation bar'] button:hover {
                    background: hsl(var(--accent));
                    color: hsl(var(--accent-foreground));
                  }

                  /* Give room for the nav */
                  [data-daterangepicker='true'] .rdp-months {
                    padding-top: 1.75rem;
                  }
                  /* Caption label */
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
                `}</style>

                <Calendar
                  mode="range"
                  locale={dayPickerLocale}
                  formatters={{
                    formatCaption
                  }}
                  onSelect={(value: { from?: Date, to?: Date } | undefined) => {
                    if (value?.from != null) {
                      setRange({ from: value.from, to: value?.to })
                      return
                    }
                    if (allowEmpty) {
                      setRange(null)
                    }
                  }}
                  selected={range ?? undefined}
                  numberOfMonths={isSmallScreen ? 1 : 2}
                  defaultMonth={
                    new Date(
                      new Date().setMonth(
                        new Date().getMonth() - (isSmallScreen ? 0 : 1)
                      )
                    )
                  }
                />
              </div>
            </div>
          </div>
          {!isSmallScreen && (
            <div className="flex flex-col items-end gap-1 pr-2 pl-6 shrink-0">
              <div className="flex w-full flex-col items-end gap-1 pr-2 pl-6">
                {PRESETS.map((preset) => (
                  <PresetButton
                    key={preset.name}
                    preset={preset.name}
                    label={t(`presets.${preset.name}`)}
                    isSelected={selectedPreset === preset.name}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2 py-2 pr-4">
          <Button
            onClick={() => {
              setIsOpen(false)
              resetValues()
            }}
            variant="ghost"
            className="text-red-600 hover:text-red-700 bg-red-500/10 hover:bg-red-500/20"
          >
            {t('cancel')}
          </Button>
          <Button
            onClick={() => {
              setIsOpen(false)
              if (allowEmpty && !range?.from) {
                resetValues()
                return
              }
              if (
                !areRangesEqual(range, openedRangeRef.current) ||
                !areRangesEqual(rangeCompare, openedRangeCompareRef.current)
              ) {
                if (range) {
                  onUpdate?.({ range, rangeCompare })
                }
              }
            }}
          >
            {t('update')}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

DateRangePicker.displayName = 'DateRangePicker'
DateRangePicker.filePath =
  'libs/shared/ui-kit/src/lib/date-range-picker/date-range-picker.tsx'
