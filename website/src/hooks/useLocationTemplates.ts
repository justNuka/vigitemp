'use client'

import { useQuery } from '@tanstack/react-query'
import { getJson, isUnauthorizedError } from '@/lib/http'

export interface LocationTemplateRow {
  Id_Lieu_Template: number
  Nom_Template: string
  Description?: string | null
  Est_Archive?: boolean | null
  Lieu_Etat?: string | null
  Frequence?: number | null
  Retard_Alarme_Haut?: number | null
  Retard_Alarme_Bas?: number | null
  Retard_Non_Reponse?: number | null
  Retard_Alarme_Changement_Consigne?: number | null
  Consigne?: number | null
  Consigne_Sup?: number | null
  Consigne_Inf?: number | null
  Tolerance_Surveillance_Sup?: number | null
  Tolerance_Surveillance_Inf?: number | null
  Consigne_Sup_Pre_Alarme?: number | null
  Consigne_Inf_Pre_Alarme?: number | null
  Est_Consigne_Sup_Active?: boolean | null
  Est_Consigne_Inf_Active?: boolean | null
  Est_Consigne_Sup_Pre_Alarme_Active?: boolean | null
  Est_Consigne_Inf_Pre_Alarme_Active?: boolean | null
  Est_Son_Alarme_Active?: boolean | null
  Est_Redeclenchement_Immediat?: boolean | null
  Nb_Mesures_Temporisation_Redeclenchement?: number | null
  Observations_Info?: string | null
}

async function fetchLocationTemplates(status: 'active' | 'archived' | 'all'): Promise<LocationTemplateRow[]> {
  return getJson<LocationTemplateRow[]>(`/api/lieux/templates?status=${status}`)
}

export function useLocationTemplates(enabled = true, status: 'active' | 'archived' | 'all' = 'active') {
  return useQuery({
    queryKey: ['location-templates', status],
    queryFn: () => fetchLocationTemplates(status),
    enabled,
    refetchInterval: (query) => (isUnauthorizedError(query.state.error) ? false : 60000),
  })
}
