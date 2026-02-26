/**
 * Types pour l'authentification et les autorisations
 */

export interface UserGroupInfo {
  id: number;
  name: string;
}

export interface UserSiteInfo {
  id: number;
  name: string;
}

export interface Authorization {
  id: number;
  code: string;
  libelle: string;
  admin: boolean;
  metrologie: boolean;
  surveillance: boolean;
  vigilog: boolean;
}

export interface CFR21Config {
  enabled: boolean;
  passwordMaxAgeDays: number;
  nonReuseable: boolean;
}

export interface CurrentUser {
  id: number;
  Login: string;
  Nom: string | null;
  Prenom: string | null;
  Adresse_Email: string | null;
  Profil_Utilisateur: string | null;
  Date_Creation: Date | null;
  profil: string | null;
  Date_Derniere_Modification_MDP: Date | null;
  Avatar_Utilisateur?: string | null;
  authorizations: Authorization[];
  cfr21: CFR21Config;
  groups?: UserGroupInfo[];
  sites?: UserSiteInfo[];
}

