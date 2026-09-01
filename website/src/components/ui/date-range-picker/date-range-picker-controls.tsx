import { CheckIcon } from "@radix-ui/react-icons"

import { Button } from "../button"
import { DateInput } from "../date-input"
import { Label } from "../label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../select"
import { Switch } from "../switch"
import { cn } from "@/lib/utils"
import { PRESETS, type DateRange } from "./date-range-picker-helpers"

export function DateRangePresetButtons({
  selectedPreset,
  setPreset,
  t,
}: {
  selectedPreset?: string
  setPreset: (preset: string) => void
  t: (key: string) => string
}) {
  return (
    <div className="flex w-full flex-col items-end gap-1 pr-2 pl-6">
      {PRESETS.map((preset) => (
        <Button
          key={preset.name}
          className={cn("hover:bg-slate-100 dark:hover:bg-muted/60", selectedPreset === preset.name && "pointer-events-none")}
          variant="ghost"
          onClick={() => setPreset(preset.name)}
        >
          <span className={cn("pr-2 opacity-0", selectedPreset === preset.name && "opacity-70")}>
            <CheckIcon width={18} height={18} />
          </span>
          {t(`presets.${preset.name}`)}
        </Button>
      ))}
    </div>
  )
}

export function DateRangePresetSelect({
  selectedPreset,
  setPreset,
  t,
}: {
  selectedPreset?: string
  setPreset: (preset: string) => void
  t: (key: string) => string
}) {
  return (
    <Select value={selectedPreset} onValueChange={setPreset}>
      <SelectTrigger className="w-45 mx-auto mb-2">
        <SelectValue placeholder={t("select")} />
      </SelectTrigger>
      <SelectContent>
        {PRESETS.map((preset) => (
          <SelectItem key={preset.name} value={preset.name}>
            {t(`presets.${preset.name}`)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export function DateRangeInputs({
  range,
  rangeCompare,
  resolvedLocale,
  allowEmpty,
  showCompare,
  fallbackDate,
  setRange,
  setRangeCompare,
  t,
}: {
  range: DateRange | null
  rangeCompare?: DateRange
  resolvedLocale: string
  allowEmpty: boolean
  showCompare: boolean
  fallbackDate: Date
  setRange: (range: DateRange | null) => void
  setRangeCompare: (range: DateRange | undefined) => void
  t: (key: string) => string
}) {
  return (
    <div className="flex flex-col gap-2 px-3 justify-between items-center pb-4">
      {showCompare ? (
        <div className="flex items-center space-x-2 pr-4 py-1">
          <Switch
            checked={Boolean(rangeCompare)}
            onCheckedChange={(checked) => {
              if (checked) {
                const baseDate = range?.from ?? fallbackDate
                const endDate = range?.to ?? baseDate
                if (!range?.to || !range?.from) {
                  setRange({ from: baseDate, to: endDate })
                }
                setRangeCompare({
                  from: new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate() - 365),
                  to: new Date(endDate.getFullYear() - 1, endDate.getMonth(), endDate.getDate()),
                })
              } else {
                setRangeCompare(undefined)
              }
            }}
            id="compare-mode"
          />
          <Label htmlFor="compare-mode">{t("compare")}</Label>
        </div>
      ) : null}
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <DateInput
            value={range?.from}
            locale={resolvedLocale}
            allowEmpty={allowEmpty}
            onChange={(date) => {
              const toDate = range?.to == null || date > range.to ? date : range.to
              setRange({ from: date, to: toDate })
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
              setRange({ from: fromDate, to: date })
            }}
          />
        </div>
        {rangeCompare != null ? (
          <div className="flex gap-2">
            <DateInput
              value={rangeCompare.from}
              locale={resolvedLocale}
              onChange={(date) => {
                const compareToDate = rangeCompare.to == null || date > rangeCompare.to ? date : rangeCompare.to
                setRangeCompare({ ...rangeCompare, from: date, to: compareToDate })
              }}
            />
            <div className="py-1">-</div>
            <DateInput
              value={rangeCompare.to}
              locale={resolvedLocale}
              onChange={(date) => {
                if (!rangeCompare.from) return
                const compareFromDate = date < rangeCompare.from ? date : rangeCompare.from
                setRangeCompare({ ...rangeCompare, from: compareFromDate, to: date })
              }}
            />
          </div>
        ) : null}
      </div>
    </div>
  )
}
