'use client';

import { useQuery } from '@tanstack/react-query';

export interface LieuRow {
  Id_Lieu: number;
  Nom_Lieu: string | null;
  Type_Lieu: string | null;
  Id_Groupe1: number | null;
  Id_Groupe2: number | null;
  Id_Site: number | null;
  Sonde_Numero_Serie: string | null;
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
  t_site?: { Libelle_Site: string | null } | null;
  t_sonde?: { Sonde_Numero_Serie: string | null } | null;
}

async function fetchLieux(): Promise<LieuRow[]> {
  const response = await fetch('/api/lieux');
  if (!response.ok) throw new Error('Failed to fetch lieux');
  return response.json();
}

export function useLieux(enabled = true) {
  return useQuery({
    queryKey: ['lieux'],
    queryFn: fetchLieux,
    enabled,
    refetchInterval: 60000, // 1 minute
  });
}
