"use client"

import { m, useReducedMotion } from "motion/react"

const CYCLE = 2.6
const loop = (times: number[]) => ({
  duration: CYCLE,
  times,
  repeat: Infinity,
  ease: "easeOut" as const,
})

const curvePoints: Array<[number, number]> = [
  [18, 92],
  [54, 80],
  [90, 84],
  [126, 69],
  [162, 73],
  [198, 56],
  [234, 64],
  [270, 48],
  [306, 54],
  [342, 41],
]

const curvePath = curvePoints.map(([x, y], index) => `${index === 0 ? "M" : "L"}${x} ${y}`).join(" ")

export function MonitoringChartLoading({ className = "" }: { className?: string }) {
  const reduceMotion = useReducedMotion()

  return (
    <div className={`h-full w-full overflow-hidden rounded-md border border-border/45 bg-muted/15 ${className}`} aria-hidden="true">
      <svg viewBox="0 0 360 112" preserveAspectRatio="none" className="h-full w-full text-muted-foreground/55">
        <m.g
          animate={reduceMotion ? { opacity: 0.7 } : { opacity: [0, 1, 1, 0] }}
          transition={reduceMotion ? undefined : loop([0, 0.05, 0.9, 1])}
        >
          {[26, 56, 86].map((y, index) => (
            <m.line
              key={y}
              x1={12}
              x2={348}
              y1={y}
              y2={y}
              stroke="currentColor"
              strokeWidth={0.8}
              strokeDasharray="3 5"
              animate={reduceMotion ? { opacity: 0.28 } : { opacity: [0, 0, 0.28, 0.28] }}
              transition={reduceMotion ? undefined : loop([0, 0.12 + index * 0.05, 0.2 + index * 0.05, 1])}
            />
          ))}

          <m.path
            d={curvePath}
            fill="none"
            className="stroke-primary/65"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={false}
            animate={reduceMotion ? { pathLength: 1 } : { pathLength: [0, 0, 1, 1] }}
            transition={reduceMotion ? undefined : loop([0, 0.28, 0.68, 1])}
          />

          {curvePoints.filter((_, index) => index % 3 === 0).map(([x, y], index) => (
            <m.circle
              key={x}
              cx={x}
              cy={y}
              r={2.4}
              className="fill-background stroke-primary/65"
              strokeWidth={1.2}
              animate={reduceMotion ? { opacity: 1 } : { opacity: [0, 0, 1, 1] }}
              transition={reduceMotion ? undefined : loop([0, 0.62 + index * 0.03, 0.7 + index * 0.03, 1])}
            />
          ))}
        </m.g>
      </svg>
    </div>
  )
}


const detailCurve: Array<[number, number]> = [
  [44, 132],
  [92, 116],
  [140, 124],
  [188, 100],
  [236, 108],
  [284, 86],
  [332, 96],
  [380, 74],
  [428, 82],
  [468, 66],
]

const detailCurvePath = detailCurve
  .map(([x, y], index) => `${index === 0 ? "M" : "L"}${x} ${y}`)
  .join(" ")

export function MonitoringDetailChartLoading() {
  const reduceMotion = useReducedMotion()

  return (
    <div
      role="status"
      className="flex h-full w-full items-center justify-center overflow-hidden rounded-lg border border-border/60 bg-muted/10 text-muted-foreground/55"
    >
      <span className="sr-only">Loading measurement history</span>
      <svg viewBox="0 0 480 190" preserveAspectRatio="xMidYMid meet" aria-hidden className="h-full w-full">
        <m.g
          animate={reduceMotion ? { opacity: 0.65 } : { opacity: [0, 1, 1, 0] }}
          transition={reduceMotion ? undefined : { duration: 2.8, times: [0, 0.04, 0.9, 1], repeat: Infinity, ease: "easeOut" }}
        >
          <m.path
            d="M44 16 V172 H468"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.25}
            initial={false}
            animate={reduceMotion ? { pathLength: 1 } : { pathLength: [0, 1, 1, 1] }}
            transition={reduceMotion ? undefined : { duration: 2.8, times: [0, 0.16, 0.9, 1], repeat: Infinity, ease: "easeOut" }}
          />

          {[56, 96, 136].map((y, index) => (
            <m.line
              key={y}
              x1={44}
              x2={468}
              y1={y}
              y2={y}
              stroke="currentColor"
              strokeOpacity={0.35}
              strokeDasharray="3 4"
              animate={reduceMotion ? { opacity: 1 } : { opacity: [0, 0, 1, 1] }}
              transition={reduceMotion ? undefined : { duration: 2.8, times: [0, 0.14 + index * 0.05, 0.22 + index * 0.05, 1], repeat: Infinity, ease: "easeOut" }}
            />
          ))}

          <m.path
            d={detailCurvePath}
            fill="none"
            className="stroke-primary/65"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
            initial={false}
            animate={reduceMotion ? { pathLength: 1 } : { pathLength: [0, 0, 1, 1] }}
            transition={reduceMotion ? undefined : { duration: 2.8, times: [0, 0.34, 0.64, 1], repeat: Infinity, ease: "easeOut" }}
          />

          {detailCurve.filter((_, index) => index % 3 === 0).map(([x, y], index) => (
            <m.circle
              key={x}
              cx={x}
              cy={y}
              r={3}
              className="fill-background stroke-primary/65"
              strokeWidth={1.5}
              animate={reduceMotion ? { opacity: 1 } : { opacity: [0, 0, 1, 1] }}
              transition={reduceMotion ? undefined : { duration: 2.8, times: [0, 0.64 + index * 0.03, 0.7 + index * 0.03, 1], repeat: Infinity, ease: "easeOut" }}
            />
          ))}
        </m.g>
      </svg>
    </div>
  )
}
