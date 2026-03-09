// Shared motion/react variants for consistent animations across the app.
// Uses LazyMotion-compatible plain objects (no `motion` import needed here).

export const fadeInUp = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const },
  },
}

export const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.055,
      delayChildren: 0.05,
    },
  },
}

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] as const },
  },
}
