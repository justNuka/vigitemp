'use client';

import { useQuery } from '@tanstack/react-query';
import { getJson, isUnauthorizedError } from "@/lib/http";

export interface LocationRow {
  Id_Lieu: number;
  Nom_Lieu: string | null;
  Type_Lieu: string | null;
  Id_Groupe1: number | null;
  Id_Groupe2: number | null;
  GroupIds?: number[];
  Id_Site: number | null;
  Sonde_Numero_Serie: string | null;
  Commentaire?: string | null;
  Observations_Info?: string | null;
  Consigne: number | null;
  Frequence: number | null;
  Consigne_Sup: number | null;
  Est_Consigne_Sup_Active: boolean | null;
  Consigne_Sup_Pre_Alarme: number | null;
  Est_Consigne_Sup_Pre_Alarme_Active: boolean | null;
  Retard_Alarme_Haut: number | null;
  Consigne_Inf: number | null;
  Est_Consigne_Inf_Active: boolean | null;
  Consigne_Inf_Pre_Alarme: number | null;
  Est_Consigne_Inf_Pre_Alarme_Active: boolean | null;
  Retard_Alarme_Bas: number | null;
  Lieu_Etat: string | null;
  Est_Lieu_GSO?: boolean | null;
  Notification_Active?: boolean | null;
  Date_Heure_Reactivation_Alarme?: string | null;
  Tolerance_Surveillance_Sup: number | null;
  Tolerance_Surveillance_Inf: number | null;
  Unite: string | null;
  Erreur_Justesse: number | null;
  Incertitude: number | null;
  Derive: number | null;
  EMT_Mode: string | null;
  EMT_Valeur: number | null;
  Corriger_Erreur_Justesse: boolean | null;
  Prendre_En_Compte_Derive: boolean | null;
  t_groupe1?: { Nom_Groupe: string | null } | null;
  t_groupe2?: { Nom_Groupe: string | null } | null;
  t_lieu_groupe?: {
    Id_Groupe: number;
    t_groupe?: {
      Id_Groupe: number;
      Nom_Groupe: string | null;
      Numero_Regroupement: string | null;
    } | null;
  }[];
  t_site?: { Libelle_Site: string | null } | null;
  t_sonde?: { Sonde_Numero_Serie: string | null } | null;
}

async function fetchLocations(): Promise<LocationRow[]> {
  return getJson<LocationRow[]>('/api/lieux');
}

export function useLocations(enabled = true) {
  return useQuery({
    queryKey: ['locations'],
    queryFn: fetchLocations,
    enabled,
    refetchInterval: (query) => (isUnauthorizedError(query.state.error) ? false : 60000),
  });
}



