import { z } from "zod"
import type { EmtMode } from "@/lib/emt"

export const planningRegleCreateSchema = z.object({
  Actif: z.boolean().default(true),
  Jour_Debut: z.number().int().min(1).max(7),
  Heure_Debut: z.string().regex(/^\d{2}:\d{2}$/, "Format HH:MM requis"),
  Jour_Fin: z.number().int().min(1).max(7),
  Heure_Fin: z.string().regex(/^\d{2}:\d{2}$/, "Format HH:MM requis"),
  Consigne: z.number().nullable().optional(),
  Consigne_Sup: z.number().nullable().optional(),
  Consigne_Inf: z.number().nullable().optional(),
  Priorite: z.number().int().default(0),
})

export const planningRegleUpdateSchema = planningRegleCreateSchema.partial()

export type PlanningRegleCreate = z.infer<typeof planningRegleCreateSchema>
export type PlanningRegleUpdate = z.infer<typeof planningRegleUpdateSchema>

export type PlanningRegleResponse = {
  Id_Regle: number
  Id_Lieu: number
  Actif: boolean
  Jour_Debut: number
  Heure_Debut: string   // "HH:MM" format
  Jour_Fin: number
  Heure_Fin: string     // "HH:MM" format
  Consigne: number | null
  Consigne_Sup: number | null
  Consigne_Inf: number | null
  Priorite: number
  Tolerance_Sup_Calc: number | null
  Tolerance_Inf_Calc: number | null
  Date_Creation: string
  Date_Maj: string | null
}

export type LieuEmtParams = {
  mode: EmtMode
  emtValue: number | null
  incertitude: number | null
  erreurJustesse: number | null
  derive: number | null
  includeDeriveInUncertainty: boolean
  correctAccuracyError: boolean
  isConsigneSupActive: boolean
  isConsigneInfActive: boolean
}

// Helper: checks if a time slot (day, time) falls within the rule's range
// day: 1=Mon .. 7=Sun (matches DB convention)
// time: "HH:MM"
export function isRegleActive(
  regle: Pick<PlanningRegleResponse, "Jour_Debut" | "Heure_Debut" | "Jour_Fin" | "Heure_Fin">,
  day: number,
  time: string
): boolean {
  const { Jour_Debut, Heure_Debut, Jour_Fin, Heure_Fin } = regle
  if (Jour_Debut <= Jour_Fin) {
    // Normal range (e.g., Mon -> Fri)
    if (day > Jour_Debut && day < Jour_Fin) return true
    if (day === Jour_Debut && time >= Heure_Debut) return true
    if (day === Jour_Fin && time < Heure_Fin) return true
    return false
  } else {
    // Cross-week range (e.g., Fri -> Mon)
    if (day === Jour_Debut && time >= Heure_Debut) return true
    if (day === Jour_Fin && time < Heure_Fin) return true
    if (day > Jour_Debut || day < Jour_Fin) return true
    return false
  }
}
