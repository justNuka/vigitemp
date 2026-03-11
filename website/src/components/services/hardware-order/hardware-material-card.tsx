"use client"

import type { ReactNode } from "react"
import { Cable, Cpu, Radio, Ruler, Server } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { QuantityStepper } from "./quantity-stepper"

type HardwareMaterial = {
  Id_Materiel: number
  Ref_Commercial: string
  Designation: string
  Descriptif: string
  Gamme: string
  Type: string
  Chemin_Image: string | null
}

type HardwareMaterialCardProps = {
  material: HardwareMaterial
  quantity: number
  gammeLabel: ReactNode
  typeLabel: string
  addLabel: string
  quantityLabel: string
  anchorId?: string
  onQuantityChange: (quantity: number) => void
}

function getMaterialIcon(type: string) {
  switch (type) {
    case "RADIO":
      return Radio
    case "ETHERNET":
      return Server
    case "ETALON":
      return Ruler
    case "FILAIRE":
      return Cable
    default:
      return Cpu
  }
}

function normalizeImagePath(path: string | null) {
  if (!path) return null
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("/")) {
    return path
  }
  return `/${path.replace(/^\.?\/*/, "")}`
}

export function HardwareMaterialCard({
  material,
  quantity,
  gammeLabel,
  typeLabel,
  addLabel,
  quantityLabel,
  anchorId,
  onQuantityChange,
}: HardwareMaterialCardProps) {
  const Icon = getMaterialIcon(material.Type)
  const imageSrc = normalizeImagePath(material.Chemin_Image)
  const descriptionLines = material.Descriptif.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)

  return (
    <article className="group overflow-hidden rounded-3xl border border-border/60 bg-card/90 shadow-[0_18px_70px_-50px_rgba(15,23,42,0.45)] transition-transform duration-200 hover:-translate-y-0.5 dark:border-slate-800 dark:bg-slate-900/90 dark:shadow-[0_18px_90px_-55px_rgba(2,6,23,0.95)]">
      <div id={anchorId} className="scroll-mt-28" />
      <div className="flex flex-col lg:flex-row">
        <div className="relative flex min-h-52 w-full items-center justify-center overflow-hidden bg-[linear-gradient(180deg,rgba(25,145,201,0.14),rgba(15,23,42,0.02))] dark:bg-[linear-gradient(180deg,rgba(25,145,201,0.16),rgba(15,23,42,0.38))] lg:w-56">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(25,145,201,0.22),transparent_55%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_58%)]" />
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={material.Designation}
              className="relative z-10 h-full max-h-44 w-auto object-contain p-6"
            />
          ) : (
            <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-3xl bg-white/80 text-primary shadow-sm dark:bg-slate-950/70 dark:text-cyan-300 dark:shadow-[0_12px_30px_-20px_rgba(8,47,73,0.9)]">
              <Icon className="h-10 w-10" />
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-5 p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-primary/10 text-primary hover:bg-primary/10 dark:bg-cyan-500/15 dark:text-cyan-300 dark:hover:bg-cyan-500/15">{gammeLabel}</Badge>
                <Badge variant="secondary" className="dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100">{typeLabel}</Badge>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                  {material.Ref_Commercial}
                </p>
                <h3 className="mt-1 text-xl font-semibold text-foreground">{material.Designation}</h3>
              </div>
            </div>
          </div>

          <div className="grid gap-4 text-sm text-muted-foreground lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
            <div className="space-y-2">
              {descriptionLines.length > 0 ? (
                descriptionLines.slice(0, 6).map((line) => (
                  <p key={`${material.Id_Materiel}-${line}`} className="leading-relaxed">
                    {line}
                  </p>
                ))
              ) : (
                <p className="leading-relaxed">—</p>
              )}
            </div>
            <div className="flex min-w-[180px] flex-col items-stretch gap-2 rounded-2xl border border-border/60 bg-muted/30 px-4 py-4 dark:border-slate-700 dark:bg-slate-800/55">
              <p className="text-center text-xs uppercase tracking-[0.18em] text-muted-foreground">
                {quantityLabel}
              </p>
              <QuantityStepper value={quantity} min={0} onChange={onQuantityChange} className="w-full justify-between" />
              <Button
                variant="ghost"
                className="h-8 text-xs text-primary hover:text-primary"
                onClick={() => onQuantityChange(Math.max(1, quantity || 1))}
              >
                {addLabel}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}
