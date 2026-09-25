"use client"

import { useMemo } from "react"
import { m, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

export function SignalField({
  className,
  toneClassName = "fill-primary",
  cols = 22,
  rows = 12,
}: {
  className?: string
  toneClassName?: string
  cols?: number
  rows?: number
}) {
  const reduced = useReducedMotion()
  const dots = useMemo(
    () => Array.from({ length: cols * rows }, (_, index) => ({
      x: index % cols,
      y: Math.floor(index / cols),
    })),
    [cols, rows],
  )

  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${cols * 20} ${rows * 20}`}
      preserveAspectRatio="xMidYMid slice"
      className={cn("pointer-events-none", className)}
    >
      {dots.map((dot) => (
        <m.circle
          key={`${dot.x}-${dot.y}`}
          cx={dot.x * 20 + 10}
          cy={dot.y * 20 + 10}
          r={1.3}
          className={toneClassName}
          initial={{ opacity: 0.12 }}
          animate={
            reduced
              ? { opacity: 0.18 }
              : { opacity: [0.08, 0.38, 0.08] }
          }
          transition={
            reduced
              ? undefined
              : {
                  duration: 3.2,
                  repeat: Infinity,
                  delay: (dot.x + dot.y) * 0.09,
                  ease: "easeInOut",
                }
          }
        />
      ))}
    </svg>
  )
}
