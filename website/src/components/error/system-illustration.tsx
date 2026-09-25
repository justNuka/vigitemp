"use client"

import { m, useReducedMotion } from "motion/react"

export type SystemVariant = "not-found" | "forbidden" | "server-error" | "network" | "maintenance"

const EASE = [0.23, 1, 0.32, 1] as const

function Probe({ x = 40 }: { x?: number }) {
  return (
    <g transform={`translate(${x - 40} 0)`}>
      <path
        d="M34 30 h12 a3 3 0 0 1 3 3 v30 a11 11 0 1 1 -18 0 v-30 a3 3 0 0 1 3 -3 z"
        fill="none"
        className="stroke-muted-foreground"
        strokeWidth={1.75}
      />
      <line x1={40} x2={40} y1={40} y2={68} className="stroke-primary/50" strokeWidth={3} strokeLinecap="round" />
      <circle cx={40} cy={74} r={5} className="fill-primary" />
    </g>
  )
}

export function SystemIllustration({ variant }: { variant: SystemVariant }) {
  const reduced = Boolean(useReducedMotion())

  return (
    <svg viewBox="0 0 280 120" aria-hidden className="h-32 w-full max-w-[340px] overflow-visible">
      {[30, 60, 90].map((y, index) => (
        <m.line
          key={y}
          x1={20}
          x2={260}
          y1={y}
          y2={y}
          className="stroke-border"
          strokeDasharray="2 5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reduced ? 0 : 0.2, delay: reduced ? 0 : index * 0.05 }}
        />
      ))}
      {variant === "not-found" ? <NotFoundScene reduced={reduced} /> : null}
      {variant === "forbidden" ? <ForbiddenScene reduced={reduced} /> : null}
      {variant === "server-error" ? <ServerErrorScene reduced={reduced} /> : null}
      {variant === "network" ? <NetworkScene reduced={reduced} /> : null}
      {variant === "maintenance" ? <MaintenanceScene reduced={reduced} /> : null}
    </svg>
  )
}

function NotFoundScene({ reduced }: { reduced: boolean }) {
  return (
    <>
      <Probe />
      {[0, 1, 2].map((index) => (
        <m.path
          key={index}
          d={`M${58 + index * 7} ${48 - index * 5} q${6 + index * 3} ${10 + index * 4} 0 ${20 + index * 10}`}
          fill="none"
          className="stroke-primary"
          strokeWidth={1.75}
          strokeLinecap="round"
          animate={reduced ? { opacity: 0.6 } : { opacity: [0.1, 0.9, 0.1] }}
          transition={reduced ? undefined : { duration: 1.8, delay: index * 0.22, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
      <path d="M96 60 H250" className="stroke-[hsl(var(--border-strong))]" strokeWidth={1.5} strokeDasharray="6 6" />
      <m.g
        animate={reduced ? { x: 70 } : { x: [0, 140, 0] }}
        transition={reduced ? undefined : { duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
      >
        <rect x={98} y={36} width={16} height={48} rx={3} className="fill-primary/10 stroke-primary/40" strokeWidth={1} />
        <line x1={106} x2={106} y1={36} y2={84} className="stroke-primary/70" strokeWidth={1.25} />
      </m.g>
      <m.text
        x={252}
        y={48}
        textAnchor="middle"
        className="fill-[hsl(var(--subtle-foreground))] text-[18px] font-semibold"
        animate={reduced ? undefined : { opacity: [0.25, 1, 0.25] }}
        transition={reduced ? undefined : { duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        ?
      </m.text>
    </>
  )
}

function ForbiddenScene({ reduced }: { reduced: boolean }) {
  return (
    <>
      <Probe />
      <path d="M62 60 H172" className="stroke-primary/30" strokeWidth={1.75} />
      <m.circle
        r={3.5}
        cy={60}
        className="fill-primary"
        animate={reduced ? { cx: 160 } : { cx: [64, 168], opacity: [0, 1, 1, 0] }}
        transition={reduced ? undefined : { duration: 1.6, repeat: Infinity, ease: "easeIn", times: [0, 0.1, 0.85, 1] }}
      />
      <path d="M210 60 H260" className="stroke-[hsl(var(--border-strong))]" strokeWidth={1.75} strokeDasharray="4 4" />
      <m.g
        style={{ transformOrigin: "190px 61px" }}
        animate={reduced ? undefined : { rotate: [0, -6, 5, -3, 0, 0] }}
        transition={reduced ? undefined : { duration: 1.6, repeat: Infinity, times: [0.82, 0.86, 0.9, 0.94, 0.98, 1] }}
      >
        <rect x={176} y={50} width={28} height={22} rx={5} className="fill-card stroke-muted-foreground" strokeWidth={1.75} />
        <path d="M183 50 v-6 a7 7 0 0 1 14 0 v6" fill="none" className="stroke-muted-foreground" strokeWidth={1.75} />
        <m.circle
          cx={190}
          cy={61}
          r={2.5}
          className="fill-[hsl(var(--status-warning))]"
          animate={reduced ? undefined : { opacity: [1, 0.3, 1] }}
          transition={reduced ? undefined : { duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        />
      </m.g>
    </>
  )
}

function ServerErrorScene({ reduced }: { reduced: boolean }) {
  return (
    <>
      <Probe />
      <m.path
        d="M62 66 L86 58 L108 64 L130 48 L150 56"
        fill="none"
        className="stroke-primary"
        strokeWidth={1.75}
        strokeLinejoin="round"
        initial={{ pathLength: reduced ? 1 : 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: reduced ? 0 : 0.3, ease: EASE }}
      />
      <m.path
        d="M186 40 L206 74 L220 52 L232 66 L260 60"
        fill="none"
        className="stroke-[hsl(var(--status-critical))]"
        strokeWidth={1.75}
        strokeLinejoin="round"
        strokeDasharray="4 4"
        animate={reduced ? { opacity: 1 } : { opacity: [1, 0.2, 1, 1, 0.4, 1], x: [0, 1.5, -1, 0, 0.5, 0] }}
        transition={reduced ? undefined : { duration: 2.4, repeat: Infinity, times: [0, 0.05, 0.1, 0.6, 0.65, 0.7] }}
      />
      <m.g
        animate={reduced ? undefined : { opacity: [1, 0.25, 1], scale: [1, 0.9, 1] }}
        style={{ transformOrigin: "168px 54px" }}
        transition={reduced ? undefined : { duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
      >
        <circle cx={168} cy={54} r={11} className="fill-[hsl(var(--status-critical)/0.10)]" />
        <path d="M162 48 l12 12 M174 48 l-12 12" className="stroke-[hsl(var(--status-critical))]" strokeWidth={2} strokeLinecap="round" />
      </m.g>
    </>
  )
}

function NetworkScene({ reduced }: { reduced: boolean }) {
  return (
    <>
      <Probe />
      <rect x={222} y={40} width={36} height={40} rx={5} className="fill-card stroke-muted-foreground" strokeWidth={1.75} />
      {[50, 60, 70].map((y) => (
        <line key={y} x1={229} x2={251} y1={y} y2={y} className="stroke-[hsl(var(--border-strong))]" strokeWidth={1.5} strokeLinecap="round" />
      ))}
      <m.circle cx={251} cy={46} r={1.8} className="fill-[hsl(var(--status-critical))]" animate={reduced ? undefined : { opacity: [1, 0.2, 1] }} transition={reduced ? undefined : { duration: 1.4, repeat: Infinity }} />
      <path d="M62 60 H142" className="stroke-primary/45" strokeWidth={1.75} />
      <path d="M174 60 H222" className="stroke-[hsl(var(--border-strong))]" strokeWidth={1.75} strokeDasharray="5 5" />
      <m.g animate={reduced ? undefined : { x: [0, 1.5, 0] }} transition={reduced ? undefined : { duration: 1.4, repeat: Infinity, ease: "easeInOut" }}>
        <path d="M160 52 l-6 8 l6 8" fill="none" className="stroke-[hsl(var(--status-critical))]" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" />
      </m.g>
      {[0, 1, 2].map((index) => (
        <m.circle
          key={index}
          cx={139 + index * 7}
          cy={86}
          r={2}
          className="fill-[hsl(var(--subtle-foreground))]"
          animate={reduced ? undefined : { opacity: [0.2, 1, 0.2] }}
          transition={reduced ? undefined : { duration: 1.2, delay: index * 0.2, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </>
  )
}

function MaintenanceScene({ reduced }: { reduced: boolean }) {
  return (
    <>
      <path d="M20 84 L60 80 L100 83 L140 79 L180 82 L220 80 L260 82" fill="none" className="stroke-primary/40" strokeWidth={1.5} strokeLinejoin="round" />
      <path d="M100 76 A40 40 0 0 1 180 76" fill="none" className="stroke-[hsl(var(--border-strong))]" strokeWidth={6} strokeLinecap="round" />
      <path d="M100 76 A40 40 0 0 1 124 41" fill="none" className="stroke-[hsl(var(--status-ok)/0.70)]" strokeWidth={6} strokeLinecap="round" />
      <path d="M156 41 A40 40 0 0 1 180 76" fill="none" className="stroke-[hsl(var(--status-warning)/0.70)]" strokeWidth={6} strokeLinecap="round" />
      <m.g
        style={{ transformOrigin: "140px 76px" }}
        animate={reduced ? { rotate: 0 } : { rotate: [-60, 50, -20, 30, -60] }}
        transition={reduced ? undefined : { duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <line x1={140} x2={140} y1={76} y2={44} className="stroke-foreground" strokeWidth={2} strokeLinecap="round" />
      </m.g>
      <circle cx={140} cy={76} r={4} className="fill-primary" />
    </>
  )
}
