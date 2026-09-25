'use client'

import { useMemo, type ReactNode } from "react"
import { usePathname } from "next/navigation"
import { AnimatePresence, LazyMotion, domAnimation, m, useReducedMotion } from "motion/react"

type PageTransitionWrapperProps = {
  children: ReactNode
  /**
   * When false, disables transitions and renders children as-is.
   */
  isVisible?: boolean
  /**
   * Defaults to the current pathname (best for route transitions).
   */
  keyName?: string
  className?: string
}

export default function PageTransitionWrapper({
  isVisible = true,
  children,
  keyName,
  className,
}: PageTransitionWrapperProps) {
  const pathname = usePathname()
  const shouldReduceMotion = useReducedMotion()

  const resolvedKey = useMemo(() => keyName ?? pathname ?? "content", [keyName, pathname])

  if (!isVisible) return <>{children}</>

  const transition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: 0.18, ease: [0.23, 1, 0.32, 1] as const }
  const initial = shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 4 }
  const animate = { opacity: 1, y: 0 }
  const exit = shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: -2 }

  return (
    <LazyMotion features={domAnimation}>
      <AnimatePresence mode="wait" initial={false}>
        <m.div
          key={resolvedKey}
          className={className}
          initial={initial}
          animate={animate}
          exit={exit}
          transition={transition}
        >
          {children}
        </m.div>
      </AnimatePresence>
    </LazyMotion>
  )
}
