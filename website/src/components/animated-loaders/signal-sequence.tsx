"use client"

import { m, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

const CYCLE = 2.6

const loop = (times: number[]) => ({
  duration: CYCLE,
  times,
  repeat: Infinity,
  ease: "easeOut" as const,
})

export function MonitoringSignalSequence({ className }: { className?: string }) {
  const reduceMotion = useReducedMotion()
  const probe = "M9 6 h6 a2 2 0 0 1 2 2 v15 a6 6 0 1 1 -10 0 v-15 a2 2 0 0 1 2 -2 z"
  const arcs = [0, 1, 2].map((index) => `M${27 + index * 5} ${15 - index * 3} q${4 + index * 2} ${5 + index * 3} 0 ${10 + index * 6}`)

  if (reduceMotion) {
    return (
      <svg viewBox="0 0 120 40" aria-hidden className={cn("opacity-60", className)}>
        <path d={probe} fill="none" stroke="currentColor" strokeWidth={1.5} />
        {arcs.map((d) => (
          <path key={d} d={d} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
        ))}
        <rect x={60} y={13} width={40} height={14} rx={3} fill="currentColor" opacity={0.32} />
        <rect x={104} y={19} width={10} height={8} rx={2} fill="currentColor" opacity={0.18} />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 120 40" aria-hidden className={className}>
      <m.g animate={{ opacity: [0, 1, 1, 0] }} transition={loop([0, 0.04, 0.9, 1])}>
        <m.path
          d={probe}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          initial={false}
          animate={{ pathLength: [0, 1, 1, 1] }}
          transition={loop([0, 0.2, 0.9, 1])}
        />
        <m.circle
          cx={12}
          cy={27}
          r={2.5}
          fill="currentColor"
          animate={{ opacity: [0, 0, 1, 1] }}
          transition={loop([0, 0.18, 0.24, 1])}
        />
        {arcs.map((d, index) => (
          <m.path
            key={d}
            d={d}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            animate={{ opacity: [0, 0, 1, 0.35, 0.35] }}
            transition={loop([0, 0.22 + index * 0.06, 0.3 + index * 0.06, 0.5 + index * 0.04, 1])}
          />
        ))}
        <m.rect
          x={60}
          y={13}
          height={14}
          rx={3}
          fill="currentColor"
          fillOpacity={0.32}
          animate={{ width: [0, 0, 40, 40] }}
          transition={loop([0, 0.46, 0.66, 1])}
        />
        <m.rect
          x={104}
          y={19}
          width={10}
          height={8}
          rx={2}
          fill="currentColor"
          fillOpacity={0.18}
          animate={{ opacity: [0, 0, 1, 1] }}
          transition={loop([0, 0.64, 0.72, 1])}
        />
      </m.g>
    </svg>
  )
}
