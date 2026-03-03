import type { z } from "zod"

import type { LieuEmtParams, PlanningRegleCreate, PlanningRegleResponse } from "@/lib/planning-regle-schema"
import { planningRegleCreateSchema } from "@/lib/planning-regle-schema"

export type PlanningRegleFormValues = z.input<typeof planningRegleCreateSchema>

export interface JourOption {
  value: number
  label: string
}

export function getDefaultPlanningRuleValues(): PlanningRegleFormValues {
  return {
    Actif: true,
    Jour_Debut: 1,
    Heure_Debut: "08:00",
    Jour_Fin: 5,
    Heure_Fin: "18:00",
    Consigne: null,
    Consigne_Sup: null,
    Consigne_Inf: null,
    Priorite: 0,
    Retard_Alarme_Changement_Consigne: null,
  }
}

export function mapPlanningRuleToFormValues(editRegle: PlanningRegleResponse): PlanningRegleFormValues {
  return {
    Actif: editRegle.Actif,
    Jour_Debut: editRegle.Jour_Debut,
    Heure_Debut: editRegle.Heure_Debut,
    Jour_Fin: editRegle.Jour_Fin,
    Heure_Fin: editRegle.Heure_Fin,
    Consigne: editRegle.Consigne ?? null,
    Consigne_Sup: editRegle.Consigne_Sup ?? null,
    Consigne_Inf: editRegle.Consigne_Inf ?? null,
    Priorite: editRegle.Priorite,
    Retard_Alarme_Changement_Consigne: editRegle.Retard_Alarme_Changement_Consigne ?? null,
  }
}

export function createEmtModeLabels(tDialog: (key: string) => string): Record<string, string> {
  return {
    quart: tDialog("emtModeQuart"),
    manuel: tDialog("emtModeManuel"),
    uncertainties: tDialog("emtModeUncertainties"),
    "sans-objet": tDialog("emtModeSansObjet"),
  }
}

export function buildDayOptions(tDialog: (key: string) => string): JourOption[] {
  return [
    { value: 1, label: tDialog("days.1") },
    { value: 2, label: tDialog("days.2") },
    { value: 3, label: tDialog("days.3") },
    { value: 4, label: tDialog("days.4") },
    { value: 5, label: tDialog("days.5") },
    { value: 6, label: tDialog("days.6") },
    { value: 7, label: tDialog("days.7") },
  ]
}

export async function submitPlanningRule({
  isEdit,
  editRegle,
  idLieu,
  data,
}: {
  isEdit: boolean
  editRegle?: PlanningRegleResponse | null
  idLieu: number
  data: PlanningRegleCreate
}) {
  const url = isEdit ? `/api/lieux/${idLieu}/planning/${editRegle!.Id_Regle}` : `/api/lieux/${idLieu}/planning`
  const method = isEdit ? "PATCH" : "POST"

  return fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
}
