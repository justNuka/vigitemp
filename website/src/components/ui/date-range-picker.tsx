/* eslint-disable max-lines */
'use client'

import React, { type FC, useState, useEffect, useMemo, useRef } from 'react'
import { ChevronUpIcon, ChevronDownIcon } from '@radix-ui/react-icons'
import { format } from 'date-fns'
import { enUS, fr } from 'date-fns/locale'
import { useLocale, useTranslations } from 'next-intl'

import { cn } from '@/lib/utils'
import { Button } from './button'
import { Calendar } from './calendar'
import { Popover, PopoverContent, PopoverTrigger } from './popover'
import { DateRangeInputs, DateRangePresetButtons, DateRangePresetSelect } from './date-range-picker/date-range-picker-controls'
import { DAY_PICKER_RANGE_STYLES, PRESETS, areRangesEqual, buildInitialCompareRange, buildInitialRange, findMatchingPreset, formatDate, getCompareRangeFromPreset, getPresetRange, type DateRange } from './date-range-picker/date-range-picker-helpers'

export interface DateRangePickerProps {
  onUpdate?: (values: { range: DateRange; rangeCompare?: DateRange }) => void
  initialDateFrom?: Date | string
  initialDateTo?: Date | string
  initialCompareFrom?: Date | string
  initialCompareTo?: Date | string
  align?: 'start' | 'center' | 'end'
  locale?: string
  showCompare?: boolean
  allowEmpty?: boolean
  matchTriggerWidth?: boolean
  popoverClassName?: string
}

export const DateRangePicker: FC<DateRangePickerProps> & { filePath: string } = ({
  initialDateFrom,
  initialDateTo,
  initialCompareFrom,
  initialCompareTo,
  onUpdate,
  align = 'end',
  locale,
  showCompare = true,
  allowEmpty = false,
  matchTriggerWidth = true,
  popoverClassName
}) => {
  const intlLocale = useLocale()
  const t = useTranslations('dateRangePicker')
  const [isOpen, setIsOpen] = useState(false)
  const fallbackDate = useMemo(() => new Date(new Date().setHours(0, 0, 0, 0)), [])
  const resolvedLocale = useMemo(
    () => locale ?? (intlLocale.toLowerCase().startsWith('fr') ? 'fr-FR' : 'en-US'),
    [locale, intlLocale]
  )
  const dayPickerLocale = useMemo(() => (resolvedLocale.toLowerCase().startsWith('fr') ? fr : enUS), [resolvedLocale])
  const formatCaption = useMemo(() => {
    const capitalize = (value: string) => (value.length ? `${value.charAt(0).toUpperCase()}${value.slice(1)}` : value)
    return (month: Date) => capitalize(format(month, 'LLLL yyyy', { locale: dayPickerLocale }))
  }, [dayPickerLocale])

  const [range, setRange] = useState<DateRange | null>(() => buildInitialRange({ initialDateFrom, initialDateTo, allowEmpty }))
  const [rangeCompare, setRangeCompare] = useState<DateRange | undefined>(() => buildInitialCompareRange({ initialCompareFrom, initialCompareTo }))
  const openedRangeRef = useRef<DateRange | null | undefined>(undefined)
  const openedRangeCompareRef = useRef<DateRange | null | undefined>(undefined)
  const [selectedPreset, setSelectedPreset] = useState<string | undefined>(undefined)
  const [isSmallScreen, setIsSmallScreen] = useState(typeof window !== 'undefined' ? window.innerWidth < 960 : false)

  useEffect(() => {
    const handleResize = () => setIsSmallScreen(window.innerWidth < 960)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const setPreset = (preset: string): void => {
    const presetRange = getPresetRange(preset)
    if (!presetRange.from) return
    setRange(presetRange)
    if (rangeCompare) {
      setRangeCompare(getCompareRangeFromPreset(presetRange))
    }
  }

  const resetValues = (): void => {
    const nextRange = buildInitialRange({ initialDateFrom, initialDateTo, allowEmpty })
    setRange(nextRange)
    setRangeCompare(buildInitialCompareRange({ initialCompareFrom, initialCompareTo }))
  }

  const restoreOpenedValues = (): void => {
    if (openedRangeRef.current === undefined) return
    setRange(openedRangeRef.current ?? null)
    setRangeCompare(openedRangeCompareRef.current ?? undefined)
  }

  useEffect(() => {
    setSelectedPreset(findMatchingPreset(range))
  }, [range])

  useEffect(() => {
    if (isOpen) {
      openedRangeRef.current = range
      openedRangeCompareRef.current = rangeCompare
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  return (
    <Popover
      modal={true}
      open={isOpen}
      onOpenChange={(open: boolean) => {
        if (!open) restoreOpenedValues()
        setIsOpen(open)
      }}
    >
      <PopoverTrigger asChild>
        <Button size={'lg'} variant="outline" className="w-full justify-between">
          <div className="text-left">
            <div className="py-1">
              <div>
                {range?.from
                  ? `${formatDate(range.from, resolvedLocale)}${range.to != null ? ' - ' + formatDate(range.to, resolvedLocale) : ''}`
                  : t('selectRange')}
              </div>
            </div>
            {rangeCompare != null ? (
              <div className="opacity-60 text-xs -mt-1">
                {rangeCompare.from ? (
                  <>
                    vs. {formatDate(rangeCompare.from, resolvedLocale)}
                    {rangeCompare.to != null ? ` - ${formatDate(rangeCompare.to, resolvedLocale)}` : ''}
                  </>
                ) : null}
              </div>
            ) : null}
          </div>
          <div className="pl-1 opacity-60 -mr-2 scale-125">
            {isOpen ? <ChevronUpIcon width={24} /> : <ChevronDownIcon width={24} />}
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align={align}
        className={cn(
          matchTriggerWidth ? 'w-(--radix-popover-trigger-width)' : 'w-auto min-w-88',
          'max-w-[95vw] p-4 max-h-[75vh] overflow-auto',
          popoverClassName,
        )}
      >
        <div data-daterangepicker="true" className="flex py-2">
          <div className="flex">
            <div className="flex flex-col flex-1 min-w-0">
              <DateRangeInputs
                range={range}
                rangeCompare={rangeCompare}
                resolvedLocale={resolvedLocale}
                allowEmpty={allowEmpty}
                showCompare={showCompare}
                fallbackDate={fallbackDate}
                setRange={setRange}
                setRangeCompare={setRangeCompare}
                t={t}
              />
              {isSmallScreen ? <DateRangePresetSelect selectedPreset={selectedPreset} setPreset={setPreset} t={t} /> : null}
              <div className="w-full overflow-x-auto">
                <style jsx global>{DAY_PICKER_RANGE_STYLES}</style>
                <Calendar
                  mode="range"
                  locale={dayPickerLocale}
                  formatters={{ formatCaption }}
                  onSelect={(value: { from?: Date; to?: Date } | undefined) => {
                    if (value?.from != null) {
                      setRange({ from: value.from, to: value?.to })
                      return
                    }
                    if (allowEmpty) setRange(null)
                  }}
                  selected={range ?? undefined}
                  numberOfMonths={isSmallScreen ? 1 : 2}
                  defaultMonth={new Date(new Date().setMonth(new Date().getMonth() - (isSmallScreen ? 0 : 1)))}
                />
              </div>
            </div>
          </div>
          {!isSmallScreen ? <DateRangePresetButtons selectedPreset={selectedPreset} setPreset={setPreset} t={t} /> : null}
        </div>
        <div className="flex justify-end gap-2 py-2 pr-4">
          <Button
            onClick={() => {
              restoreOpenedValues()
              setIsOpen(false)
            }}
            variant="ghost"
            className="text-red-600 hover:text-red-700 bg-red-500/10 hover:bg-red-500/20"
          >
            {t('cancel')}
          </Button>
          <Button
            onClick={() => {
              if (allowEmpty && !range?.from) {
                openedRangeRef.current = null
                openedRangeCompareRef.current = undefined
                setIsOpen(false)
                return
              }
              if (!areRangesEqual(range, openedRangeRef.current) || !areRangesEqual(rangeCompare, openedRangeCompareRef.current)) {
                if (range) onUpdate?.({ range, rangeCompare })
              }
              openedRangeRef.current = range
              openedRangeCompareRef.current = rangeCompare
              setIsOpen(false)
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
DateRangePicker.filePath = 'libs/shared/ui-kit/src/lib/date-range-picker/date-range-picker.tsx'
