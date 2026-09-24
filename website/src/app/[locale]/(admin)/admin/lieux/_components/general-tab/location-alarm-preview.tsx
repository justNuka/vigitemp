'use client'

import { useEffect, useId, useMemo, useState } from 'react'
import { CircleHelp, TimerReset, Zap } from 'lucide-react'
import { m, useReducedMotion } from 'motion/react'
import { useLocale, useTranslations } from 'next-intl'
import { useFormContext } from 'react-hook-form'

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { formatNumber } from '@/lib/number-display'
import { computeEmt } from '@/lib/emt'
import type { SensorValueRange } from '@/lib/sensor-value-range-contract'

import type { LocationFormData } from '../location-form-types'

type PreviewLine = {
  key: string
  label: string
  value: number
  className: string
  description: string
}

function finite(value: number | null | undefined) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

export function LocationAlarmPreview({
  sensorRange,
}: {
  sensorRange?: SensorValueRange | null
}) {
  const t = useTranslations('locationsForm.general.alarm_preview')
  const locale = useLocale()
  const localeTag = locale === 'fr' ? 'fr-FR' : locale
  const reduceMotion = useReducedMotion()
  const gradientId = useId().replace(/:/g, '')
  const [stableDomain, setStableDomain] = useState<{ key: string; min: number; max: number } | null>(null)
  const { watch } = useFormContext<LocationFormData>()
  const data = watch()

  const unit = sensorRange?.unit?.trim() || data.Unite?.trim() || ''
  const target = finite(data.Consigne)
  const liveEmt = computeEmt({
    mode: data.EMT_Mode,
    emtValue: data.EMT_Valeur ?? null,
    consigne: data.Consigne ?? null,
    consigneSup: data.Consigne_Sup ?? null,
    consigneInf: data.Consigne_Inf ?? null,
    isConsigneSupActive: data.Est_Consigne_Sup_Active ?? false,
    isConsigneInfActive: data.Est_Consigne_Inf_Active ?? false,
    incertitude: data.Incertitude ?? null,
    erreurJustesse: data.Erreur_Justesse ?? null,
    derive: data.Derive ?? null,
    includeDeriveInUncertainty:
      data.EMT_Mode === 'quart' || data.EMT_Mode === 'manuel'
        ? true
        : (data.Prendre_En_Compte_Derive ?? false),
    correctAccuracyError: data.Corriger_Erreur_Justesse ?? false,
  })
  const normalHigh = data.Est_Consigne_Sup_Active
    ? finite(liveEmt.toleranceSup ?? data.Tolerance_Surveillance_Sup ?? data.Consigne_Sup)
    : null
  const normalLow = data.Est_Consigne_Inf_Active
    ? finite(liveEmt.toleranceInf ?? data.Tolerance_Surveillance_Inf ?? data.Consigne_Inf)
    : null
  const preHigh = data.Est_Consigne_Sup_Pre_Alarme_Active
    ? finite(data.Consigne_Sup_Pre_Alarme)
    : null
  const preLow = data.Est_Consigne_Inf_Pre_Alarme_Active
    ? finite(data.Consigne_Inf_Pre_Alarme)
    : null
  const criticalHigh = data.Est_Seuil_Critique_Haut_Active
    ? finite(data.Seuil_Critique_Haut)
    : null
  const criticalLow = data.Est_Seuil_Critique_Bas_Active
    ? finite(data.Seuil_Critique_Bas)
    : null

  const formatValue = (value: number | null | undefined) => {
    const formatted = formatNumber(value, {
      minimumDecimals: 0,
      maximumDecimals: 3,
      locale: localeTag,
      grouping: false,
      fallback: '-',
    })
    return unit && formatted !== '-' ? `${formatted} ${unit}` : formatted
  }

  const lines = useMemo<PreviewLine[]>(() => {
    const result: PreviewLine[] = []
    if (criticalHigh !== null) {
      result.push({
        key: 'critical-high',
        label: t('critical_high'),
        value: criticalHigh,
        className: 'text-red-700 dark:text-red-300',
        description: t('critical_description'),
      })
    }
    if (normalHigh !== null) {
      result.push({
        key: 'normal-high',
        label: t('alarm_high'),
        value: normalHigh,
        className: 'text-orange-700 dark:text-orange-300',
        description: t('alarm_description', { delay: data.Retard_Alarme_Haut ?? 0 }),
      })
    }
    if (preHigh !== null) {
      result.push({
        key: 'pre-high',
        label: t('prealarm_high'),
        value: preHigh,
        className: 'text-amber-700 dark:text-amber-300',
        description: t('prealarm_description'),
      })
    }
    if (target !== null) {
      result.push({
        key: 'target',
        label: t('setpoint'),
        value: target,
        className: 'text-sky-700 dark:text-sky-300',
        description: t('setpoint_description'),
      })
    }
    if (preLow !== null) {
      result.push({
        key: 'pre-low',
        label: t('prealarm_low'),
        value: preLow,
        className: 'text-amber-700 dark:text-amber-300',
        description: t('prealarm_description'),
      })
    }
    if (normalLow !== null) {
      result.push({
        key: 'normal-low',
        label: t('alarm_low'),
        value: normalLow,
        className: 'text-orange-700 dark:text-orange-300',
        description: t('alarm_description', { delay: data.Retard_Alarme_Bas ?? 0 }),
      })
    }
    if (criticalLow !== null) {
      result.push({
        key: 'critical-low',
        label: t('critical_low'),
        value: criticalLow,
        className: 'text-red-700 dark:text-red-300',
        description: t('critical_description'),
      })
    }
    return result
  }, [
    criticalHigh,
    criticalLow,
    data.Retard_Alarme_Bas,
    data.Retard_Alarme_Haut,
    normalHigh,
    normalLow,
    preHigh,
    preLow,
    t,
    target,
  ])

  const domainKey = `${sensorRange?.min ?? 'na'}|${sensorRange?.max ?? 'na'}|${unit}`
  const candidateDomain = useMemo(() => {
    const rangeMin = finite(sensorRange?.min)
    const rangeMax = finite(sensorRange?.max)
    const values = lines.map((line) => line.value)

    // Keep a useful local scale around the configured values. The sensor range
    // identifies the current context, but using the full physical range would
    // make small threshold edits visually unreadable on wide-range probes.
    if (values.length === 0) {
      if (rangeMin !== null && rangeMax !== null && rangeMax > rangeMin) {
        const center = (rangeMin + rangeMax) / 2
        const half = Math.max((rangeMax - rangeMin) * 0.15, 1)
        return { min: center - half, max: center + half }
      }
      return { min: -1, max: 1 }
    }

    let min = Math.min(...values)
    let max = Math.max(...values)
    if (min === max) {
      min -= 1
      max += 1
    }
    const padding = Math.max((max - min) * 0.18, 0.5)
    return { min: min - padding, max: max + padding }
  }, [lines, sensorRange?.max, sensorRange?.min])

  useEffect(() => {
    const values = lines.map((line) => line.value)
    setStableDomain((current) => {
      if (!current || current.key !== domainKey) {
        return { key: domainKey, ...candidateDomain }
      }

      if (values.length === 0) return current

      // Never shrink the scale while the form is open: editing one threshold
      // must not visually move every other guide line. Expand only when needed.
      let min = current.min
      let max = current.max
      const liveMin = Math.min(...values)
      const liveMax = Math.max(...values)
      const currentSpan = Math.max(max - min, 1)
      const expansion = Math.max(currentSpan * 0.08, 0.5)
      if (liveMin < min) min = liveMin - expansion
      if (liveMax > max) max = liveMax + expansion

      return min === current.min && max === current.max
        ? current
        : { key: current.key, min, max }
    })
  }, [candidateDomain, domainKey, lines])

  const domain =
    stableDomain?.key === domainKey
      ? { min: stableDomain.min, max: stableDomain.max }
      : candidateDomain

  const y = (value: number) => {
    const ratio = (value - domain.min) / Math.max(domain.max - domain.min, 0.0001)
    return 164 - ratio * 128
  }

  const baseline =
    target ??
    (normalHigh !== null && normalLow !== null
      ? (normalHigh + normalLow) / 2
      : normalHigh ?? normalLow ?? 0)

  const highAlarmLevel = normalHigh ?? baseline + Math.max((domain.max - domain.min) * 0.18, 0.5)
  const lowAlarmLevel = normalLow ?? baseline - Math.max((domain.max - domain.min) * 0.18, 0.5)
  const highPeak = criticalHigh ?? highAlarmLevel + Math.max((domain.max - domain.min) * 0.12, 0.4)
  const lowPeak = criticalLow ?? lowAlarmLevel - Math.max((domain.max - domain.min) * 0.12, 0.4)

  const delaySpan = (value: number | null | undefined) => {
    const minutes = finite(value) ?? 0
    const normalized = Math.min(Math.max(minutes, 0), 120) / 120
    return 8 + normalized * 14
  }

  const highDelayStart = 24
  const highDelayEnd = highDelayStart + delaySpan(data.Retard_Alarme_Haut)
  const highDelayMiddle = (highDelayStart + highDelayEnd) / 2
  const lowDelayStart = 68
  const lowDelayEnd = Math.min(90, lowDelayStart + delaySpan(data.Retard_Alarme_Bas))
  const lowDelayMiddle = (lowDelayStart + lowDelayEnd) / 2

  const points = [
    [6, baseline],
    [18, baseline],
    [highDelayStart, highAlarmLevel],
    [highDelayMiddle, highAlarmLevel + (highPeak - highAlarmLevel) * 0.18],
    [highDelayEnd, highAlarmLevel + (highPeak - highAlarmLevel) * 0.28],
    [54, highPeak],
    [62, baseline],
    [lowDelayStart, lowAlarmLevel],
    [lowDelayMiddle, lowAlarmLevel + (lowPeak - lowAlarmLevel) * 0.18],
    [lowDelayEnd, lowAlarmLevel + (lowPeak - lowAlarmLevel) * 0.28],
    [96, lowPeak],
  ] as const

  const path = points
    .map(([xValue, value], index) => `${index === 0 ? 'M' : 'L'} ${xValue} ${y(value)}`)
    .join(' ')

  const getLineStyle = (key: string) => {
    if (key.startsWith('critical')) return { stroke: 'currentColor', strokeWidth: 2.1, strokeDasharray: '3 3' }
    if (key.startsWith('normal')) return { stroke: 'currentColor', strokeWidth: 1.8, strokeDasharray: '6 4' }
    if (key.startsWith('pre')) return { stroke: 'currentColor', strokeWidth: 1.2, strokeDasharray: '2 5' }
    return { stroke: 'currentColor', strokeWidth: 1.6, strokeDasharray: '8 4' }
  }

  const transition = reduceMotion
    ? { duration: 0 }
    : { type: 'spring' as const, stiffness: 170, damping: 24, mass: 0.8 }

  return (
    <div className="rounded-xl border bg-linear-to-br from-muted/20 via-background to-primary/5 p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">{t('title')}</p>
          <p className="mt-1 text-xs text-muted-foreground">{t('description')}</p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border bg-background/80 px-2.5 py-1 text-xs text-muted-foreground">
          <TimerReset className="h-3.5 w-3.5" />
          {t('frequency', { value: data.Frequence ?? '-' })}
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-lg border bg-background/80 p-2">
        <svg
          viewBox="0 0 100 185"
          className="h-64 w-full overflow-visible"
          role="img"
          aria-label={t('chart_aria')}
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id={gradientId} x1="0" x2="1">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.45" />
              <stop offset="45%" stopColor="currentColor" stopOpacity="0.9" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0.55" />
            </linearGradient>
          </defs>

          {[36, 68, 100, 132, 164].map((gridY) => (
            <line
              key={gridY}
              x1="4"
              x2="98"
              y1={gridY}
              y2={gridY}
              className="stroke-border"
              strokeWidth="0.45"
            />
          ))}

          {normalHigh !== null ? (
            <m.rect
              initial={false}
              animate={{ x: highDelayStart, width: Math.max(0, highDelayEnd - highDelayStart) }}
              transition={transition}
              y="28"
              height="54"
              rx="1.5"
              fill="rgba(249, 115, 22, 0.08)"
              stroke="rgba(249, 115, 22, 0.45)"
              strokeWidth="0.5"
              strokeDasharray="2 2"
            />
          ) : null}
          {normalLow !== null ? (
            <m.rect
              initial={false}
              animate={{ x: lowDelayStart, width: Math.max(0, lowDelayEnd - lowDelayStart) }}
              transition={transition}
              y="108"
              height="54"
              rx="1.5"
              fill="rgba(249, 115, 22, 0.08)"
              stroke="rgba(249, 115, 22, 0.45)"
              strokeWidth="0.5"
              strokeDasharray="2 2"
            />
          ) : null}

          {lines.map((line) => {
            const lineY = y(line.value)
            return (
              <m.g
                key={line.key}
                initial={false}
                animate={{ opacity: 1 }}
                transition={transition}
                className={line.className}
              >
                <m.line
                  x1="4"
                  x2="98"
                  initial={false}
                  animate={{ y1: lineY, y2: lineY }}
                  transition={transition}
                  {...getLineStyle(line.key)}
                />
              </m.g>
            )
          })}

          <m.path
            initial={false}
            animate={{ d: path }}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.45, ease: 'easeOut' }}
            fill="none"
            stroke={`url(#${gradientId})`}
            className="text-primary"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />

          {points.map(([xValue, value], index) => (
            <m.circle
              key={index}
              initial={false}
              animate={{ cx: xValue, cy: y(value) }}
              transition={transition}
              r={index === 5 || index === 10 ? 2.2 : 1.2}
              className={index === 5 || index === 10 ? 'fill-destructive' : 'fill-primary'}
            />
          ))}

          {normalHigh !== null ? (
            <>
              <m.line
                initial={false}
                animate={{ x1: highDelayStart, x2: highDelayEnd }}
                transition={transition}
                y1="20"
                y2="20"
                className="stroke-orange-500"
                strokeWidth="0.8"
              />
              <m.line
                initial={false}
                animate={{ x1: highDelayStart, x2: highDelayStart }}
                transition={transition}
                y1="17"
                y2="23"
                className="stroke-orange-500"
                strokeWidth="0.8"
              />
              <m.line
                initial={false}
                animate={{ x1: highDelayEnd, x2: highDelayEnd }}
                transition={transition}
                y1="17"
                y2="23"
                className="stroke-orange-500"
                strokeWidth="0.8"
              />
              <m.text
                initial={false}
                animate={{ x: highDelayMiddle }}
                transition={transition}
                y="14"
                textAnchor="middle"
                className="fill-orange-600 text-[4px] dark:fill-orange-300"
              >
                {t('delay_window', { value: data.Retard_Alarme_Haut ?? 0 })}
              </m.text>
            </>
          ) : null}

          {normalLow !== null ? (
            <>
              <m.line
                initial={false}
                animate={{ x1: lowDelayStart, x2: lowDelayEnd }}
                transition={transition}
                y1="178"
                y2="178"
                className="stroke-orange-500"
                strokeWidth="0.8"
              />
              <m.line
                initial={false}
                animate={{ x1: lowDelayStart, x2: lowDelayStart }}
                transition={transition}
                y1="175"
                y2="181"
                className="stroke-orange-500"
                strokeWidth="0.8"
              />
              <m.line
                initial={false}
                animate={{ x1: lowDelayEnd, x2: lowDelayEnd }}
                transition={transition}
                y1="175"
                y2="181"
                className="stroke-orange-500"
                strokeWidth="0.8"
              />
              <m.text
                initial={false}
                animate={{ x: lowDelayMiddle }}
                transition={transition}
                y="174"
                textAnchor="middle"
                className="fill-orange-600 text-[4px] dark:fill-orange-300"
              >
                {t('delay_window', { value: data.Retard_Alarme_Bas ?? 0 })}
              </m.text>
            </>
          ) : null}
        </svg>
      </div>

      <TooltipProvider delayDuration={120}>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {lines.map((line) => (
            <Tooltip key={line.key}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="flex min-w-0 cursor-help items-center justify-between gap-3 rounded-md px-2 py-1.5 text-left text-xs transition-colors hover:bg-muted/60"
                >
                  <span className="flex min-w-0 items-center gap-1.5">
                    <CircleHelp className={`h-3.5 w-3.5 shrink-0 ${line.className}`} />
                    <span className="truncate border-b border-dotted border-current">{line.label}</span>
                  </span>
                  <span className={`shrink-0 font-semibold tabular-nums ${line.className}`}>
                    {formatValue(line.value)}
                  </span>
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="font-medium">{line.label}: {formatValue(line.value)}</p>
                <p className="mt-1 text-xs">{line.description}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>

      <div className="mt-4 grid gap-2 text-xs sm:grid-cols-2">
        <div className="flex items-start gap-2 rounded-md border border-orange-200 bg-orange-50/70 px-3 py-2 text-orange-950 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-100">
          <TimerReset className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{t('normal_behavior')}</p>
        </div>
        <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50/70 px-3 py-2 text-red-950 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-100">
          <Zap className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{t('critical_behavior')}</p>
        </div>
      </div>
    </div>
  )
}
