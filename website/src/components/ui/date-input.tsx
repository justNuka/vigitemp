import React, { useEffect, useRef } from 'react'

interface DateInputProps {
  value?: Date
  onChange: (date: Date) => void
  allowEmpty?: boolean
  locale?: string
}

interface DateParts {
  day: string
  month: string
  year: string
}

const EMPTY_DATE: DateParts = { day: '', month: '', year: '' }

const toDateParts = (value: Date): DateParts => ({
  day: value.getDate().toString(),
  month: (value.getMonth() + 1).toString(),
  year: value.getFullYear().toString()
})

const DateInput: React.FC<DateInputProps> = ({ value, onChange, allowEmpty = false, locale }) => {
  const resolvedLocale = locale ?? 'en-US'
  const isFrench = resolvedLocale.toLowerCase().startsWith('fr')
  const inputOrder: Array<keyof DateParts> = isFrench
    ? ['day', 'month', 'year']
    : ['month', 'day', 'year']
  const placeholders: Record<keyof DateParts, string> = isFrench
    ? { day: 'J', month: 'M', year: 'AAAA' }
    : { day: 'D', month: 'M', year: 'YYYY' }
  const [date, setDate] = React.useState<DateParts>(() => {
    if (!value && allowEmpty) {
      return EMPTY_DATE
    }
    const d = value ? new Date(value) : new Date()
    return toDateParts(d)
  })

  const monthRef = useRef<HTMLInputElement | null>(null)
  const dayRef = useRef<HTMLInputElement | null>(null)
  const yearRef = useRef<HTMLInputElement | null>(null)
  const inputRefs: Record<keyof DateParts, React.RefObject<HTMLInputElement | null>> = {
    day: dayRef,
    month: monthRef,
    year: yearRef
  }

  useEffect(() => {
    if (!value && allowEmpty) {
      const syncTimer = window.setTimeout(() => {
        setDate(EMPTY_DATE)
      }, 0)

      return () => {
        window.clearTimeout(syncTimer)
      }
    }
    const d = value ? new Date(value) : new Date()

    const syncTimer = window.setTimeout(() => {
      setDate(toDateParts(d))
    }, 0)

    return () => {
      window.clearTimeout(syncTimer)
    }
  }, [allowEmpty, value])

  const validateDate = (field: keyof DateParts, value: number): boolean => {
    if (
      (field === 'day' && (value < 1 || value > 31)) ||
      (field === 'month' && (value < 1 || value > 12)) ||
      (field === 'year' && (value < 1000 || value > 9999))
    ) {
      return false
    }

    // Validate the day of the month
    const newDate = { ...date, [field]: value }
    const day = Number(newDate.day)
    const month = Number(newDate.month)
    const year = Number(newDate.year)
    if (Number.isNaN(day) || Number.isNaN(month) || Number.isNaN(year)) {
      return false
    }
    const d = new Date(year, month - 1, day)
    return d.getFullYear() === year &&
           d.getMonth() + 1 === month &&
           d.getDate() === day
  }

  const handleInputChange =
    (field: keyof DateParts) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value

      // If the new value is valid, update the date
      const newDate = { ...date, [field]: newValue }
      setDate(newDate)

      if (allowEmpty && (!newDate.day || !newDate.month || !newDate.year)) {
        return
      }

      const newValueNumber = Number(newValue)
      const isValid = !Number.isNaN(newValueNumber) && validateDate(field, newValueNumber)

      // only call onChange when the entry is valid
      if (isValid) {
        onChange(new Date(Number(newDate.year), Number(newDate.month) - 1, Number(newDate.day)))
      }
    }

  const initialDate = useRef<DateParts>(date)

  const handleBlur = (field: keyof DateParts) => (
    e: React.FocusEvent<HTMLInputElement>
  ): void => {
    if (!e.target.value) {
      if (allowEmpty && !value) {
        setDate(EMPTY_DATE)
        return
      }
      setDate(initialDate.current)
      return
    }

    const newValue = Number(e.target.value)
    const isValid = validateDate(field, newValue)

    if (!isValid) {
      setDate(initialDate.current)
    } else {
      // If the new value is valid, update the initial value
      initialDate.current = { ...date, [field]: newValue }
    }
  }

  const handleKeyDown =
    (field: keyof DateParts) => (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Allow command (or control) combinations
      if (e.metaKey || e.ctrlKey) {
        return
      }

      // Prevent non-numeric characters, excluding allowed keys
      if (
        !/^[0-9]$/.test(e.key) &&
        ![
          'ArrowUp',
          'ArrowDown',
          'ArrowLeft',
          'ArrowRight',
          'Delete',
          'Tab',
          'Backspace',
          'Enter'
        ].includes(e.key)
      ) {
        e.preventDefault()
        return
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault()
        const currentDay = Number(date.day) || 1
        const currentMonth = Number(date.month) || 1
        const currentYear = Number(date.year) || new Date().getFullYear()
        let newDay = currentDay
        let newMonth = currentMonth
        let newYear = currentYear

        if (field === 'day') {
          const maxDay = new Date(currentYear, currentMonth, 0).getDate()
          if (currentDay >= maxDay) {
            newDay = 1
            newMonth = currentMonth === 12 ? 1 : currentMonth + 1
            if (currentMonth === 12) newYear = currentYear + 1
          } else {
            newDay = currentDay + 1
          }
        }

        if (field === 'month') {
          if (currentMonth === 12) {
            newMonth = 1
            newYear = currentYear + 1
          } else {
            newMonth = currentMonth + 1
          }
        }

        if (field === 'year') {
          newYear = currentYear + 1
        }

        const newDate = {
          day: String(newDay),
          month: String(newMonth),
          year: String(newYear)
        }
        setDate(newDate)
        onChange(new Date(newYear, newMonth - 1, newDay))
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        const currentDay = Number(date.day) || 1
        const currentMonth = Number(date.month) || 1
        const currentYear = Number(date.year) || new Date().getFullYear()
        let newDay = currentDay
        let newMonth = currentMonth
        let newYear = currentYear

        if (field === 'day') {
          if (currentDay === 1) {
            newMonth = currentMonth === 1 ? 12 : currentMonth - 1
            if (currentMonth === 1) newYear = currentYear - 1
            newDay = new Date(newYear, newMonth, 0).getDate()
          } else {
            newDay = currentDay - 1
          }
        }

        if (field === 'month') {
          if (currentMonth === 1) {
            newMonth = 12
            newYear = currentYear - 1
          } else {
            newMonth = currentMonth - 1
          }
        }

        if (field === 'year') {
          newYear = currentYear - 1
        }

        const newDate = {
          day: String(newDay),
          month: String(newMonth),
          year: String(newYear)
        }
        setDate(newDate)
        onChange(new Date(newYear, newMonth - 1, newDay))
      }

      if (e.key === 'ArrowRight') {
        if (
          e.currentTarget.selectionStart === e.currentTarget.value.length ||
          (e.currentTarget.selectionStart === 0 &&
            e.currentTarget.selectionEnd === e.currentTarget.value.length)
        ) {
          e.preventDefault()
          const currentIndex = inputOrder.indexOf(field)
          const nextField = inputOrder[currentIndex + 1]
          if (nextField) inputRefs[nextField].current?.focus()
        }
      } else if (e.key === 'ArrowLeft') {
        if (
          e.currentTarget.selectionStart === 0 ||
          (e.currentTarget.selectionStart === 0 &&
            e.currentTarget.selectionEnd === e.currentTarget.value.length)
        ) {
          e.preventDefault()
          const currentIndex = inputOrder.indexOf(field)
          const prevField = inputOrder[currentIndex - 1]
          if (prevField) inputRefs[prevField].current?.focus()
        }
      }
    }

  return (
    <div className="flex items-center rounded-lg border border-input bg-background px-1 text-sm text-foreground dark:border-border dark:bg-slate-950/70 dark:text-slate-100">
      {inputOrder.map((field, index) => {
        const config = field === 'month'
          ? { ref: monthRef, max: 12, maxLength: 2, width: 'w-6' }
          : field === 'day'
            ? { ref: dayRef, max: 31, maxLength: 2, width: 'w-7' }
            : { ref: yearRef, max: 9999, maxLength: 4, width: 'w-12' }

        return (
          <React.Fragment key={field}>
            <input
              type="text"
              ref={config.ref}
              max={config.max}
              maxLength={config.maxLength}
              value={date[field].toString()}
              onChange={handleInputChange(field)}
              onKeyDown={handleKeyDown(field)}
              onFocus={(e) => {
                if (window.innerWidth > 1024) {
                  e.target.select()
                }
              }}
              onBlur={handleBlur(field)}
              className={`border-none bg-transparent p-0 text-center outline-none placeholder:text-muted-foreground/70 ${config.width}`}
              placeholder={placeholders[field]}
            />
            {index < inputOrder.length - 1 && (
              <span className="opacity-20 -mx-px">/</span>
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

DateInput.displayName = 'DateInput'

export { DateInput }
