'use client';

import { useQuery } from '@tanstack/react-query';
import { getJson, isUnauthorizedError } from "@/lib/http";

export interface LocationMailingContactRow {
  Id_Tel_Num?: number;
  Numero_Ordre: number;
  Id_Utilisateur: number | null;
  Est_Via_Telephone: boolean;
  Est_Via_Email: boolean;
}

export interface LocationRow {
  Id_Lieu: number;
  Nom_Lieu: string | null;
  Type_Lieu: string | null;
  Est_Archive?: boolean | null;
  GroupIds?: number[];
  Id_Site: number | null;
  Sonde_Numero_Serie: string | null;
  Id_Module?: number | null;
  Commentaire?: string | null;
  Observations_Info?: string | null;
  Consigne: number | null;
  Frequence: number | null;
  Consigne_Sup: number | null;
  Est_Consigne_Sup_Active: boolean | null;
  Consigne_Sup_Pre_Alarme: number | null;
  Est_Consigne_Sup_Pre_Alarme_Active: boolean | null;
  Seuil_Critique_Haut?: number | null;
  Est_Seuil_Critique_Haut_Active?: boolean | null;
  Retard_Alarme_Haut: number | null;
  Consigne_Inf: number | null;
  Est_Consigne_Inf_Active: boolean | null;
  Consigne_Inf_Pre_Alarme: number | null;
  Est_Consigne_Inf_Pre_Alarme_Active: boolean | null;
  Seuil_Critique_Bas?: number | null;
  Est_Seuil_Critique_Bas_Active?: boolean | null;
  Retard_Alarme_Bas: number | null;
  Retard_Non_Reponse?: number | null;
  Retard_Alarme_Changement_Consigne?: number | null;
  Nb_Mesures_Temporisation_Redeclenchement?: number | null;
  Lieu_Etat: string | null;
  Est_Lieu_GSO?: boolean | null;
  Notification_Active?: boolean | null;
  Est_Son_Alarme_Active?: boolean | null;
  Est_Redeclenchement_Immediat?: boolean | null;
  Date_Heure_Reactivation_Alarme?: string | null;
  Tolerance_Surveillance_Sup: number | null;
  Tolerance_Surveillance_Inf: number | null;
  Derniere_Date_Etalonnage?: string | null;
  Unite: string | null;
  Erreur_Justesse: number | null;
  Incertitude: number | null;
  Derive: number | null;
  Planning_Regles_Count?: number | null;
  EMT_Mode: string | null;
  EMT_Valeur: number | null;
  Corriger_Erreur_Justesse: boolean | null;
  Prendre_En_Compte_Derive: boolean | null;
  MailingContacts?: LocationMailingContactRow[];
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



