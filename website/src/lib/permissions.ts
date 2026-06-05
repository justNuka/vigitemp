import type { Authorization, CurrentUser } from "@/lib/types";

export type AppPermission =
  | "DASHBOARD_USER_ACCESS"
  | "SURVEILLANCE_VIEW_ACCESS"
  | "DASHBOARD_ADMIN_ACCESS"
  | "GENERAL_SETTINGS_ACCESS"
  | "ALARM_ACK_ACCESS"
  | "LOCATION_DISABLE_ACCESS"
  | "LOCATION_CONFIG_ACCESS"
  | "HARDWARE_CONFIG_ACCESS"
  | "CONVERSATION_ACCESS"
  | "METROLOGY_ACCESS"
  | "METROLOGY_OPERATION_ACCESS"
  | "METROLOGY_WORK_ACCESS";

type PermissionRule = {
  aliases: string[];
};

const ADMIN_PROFILES = new Set(["administrateurs", "administrateur", "admin"]);

const RULES: Record<AppPermission, PermissionRule> = {
  DASHBOARD_USER_ACCESS: {
    aliases: ["ACCES_DASHBOARD_UTILISATEUR", "ACCES_TABLEAU_BORD_UTILISATEUR", "ACCES_DASHBOARD_USER"],
  },
  SURVEILLANCE_VIEW_ACCESS: {
    aliases: ["ACCES_SURVEILLANCE", "SURVEILLANCE_ACCESS", "LIEU_VISUALISER"],
  },
  DASHBOARD_ADMIN_ACCESS: {
    aliases: ["ACCES_DASHBOARD_ADMIN", "ACCES_TABLEAU_BORD_ADMIN", "ACCES_ADMIN"],
  },
  GENERAL_SETTINGS_ACCESS: {
    aliases: ["ACCES_PARAMETRAGE_GENERAL", "PARAMETRAGE_GENERAL", "PARAMETRES_GERER"],
  },
  ALARM_ACK_ACCESS: {
    aliases: ["ACQUITTER_ALARME", "ACCES_ACQUITTEMENT_ALARME"],
  },
  LOCATION_DISABLE_ACCESS: {
    aliases: ["DESACTIVER_LIEU", "ACCES_DESACTIVATION_LIEU", "LIEU_ACTIV_DESACT"],
  },
  LOCATION_CONFIG_ACCESS: {
    aliases: ["PARAMETRER_LIEU", "ACCES_PARAMETRAGE_LIEU", "LIEU_GERER"],
  },
  HARDWARE_CONFIG_ACCESS: {
    aliases: [
      "PARAMETRAGE_MATERIEL",
      "ACCES_PARAMETRAGE_MATERIEL",
      "MATERIEL_MESURE_GERER",
      "MATERIEL_METROLOGIE_GERER",
    ],
  },
  CONVERSATION_ACCESS: {
    aliases: ["ACCES_CONVERSATION", "MODULE_CONVERSATION"],
  },
  METROLOGY_ACCESS: {
    aliases: ["ACCES_METROLOGIE", "METROLOGIE_ACCESS", "METROLOGIE_VISUALISER"],
  },
  METROLOGY_OPERATION_ACCESS: {
    aliases: ["REALISER_AJUSTAGE_ETALONNAGE", "ACCES_AJUSTAGE_ETALONNAGE", "METROLOGIE_REALISER"],
  },
  METROLOGY_WORK_ACCESS: {
    aliases: [
      "ACCES_METROLOGIE",
      "METROLOGIE_ACCESS",
      "METROLOGIE_VISUALISER",
      "REALISER_AJUSTAGE_ETALONNAGE",
      "ACCES_AJUSTAGE_ETALONNAGE",
      "METROLOGIE_REALISER",
    ],
  },
};

function normalizeCode(code: string | null | undefined): string {
  return (code ?? "").trim().toUpperCase();
}

function isAdminProfile(profile: string | null | undefined): boolean {
  return ADMIN_PROFILES.has((profile ?? "").trim().toLowerCase());
}

export function hasAuthorizationCode(
  user: Pick<CurrentUser, "authorizations" | "Profil_Utilisateur" | "profil"> | null | undefined,
  codes: readonly string[],
): boolean {
  if (!user) return false;
  if (isAdminProfile(user.profil ?? user.Profil_Utilisateur)) return true;

  const normalizedRequested = new Set(codes.map((c) => normalizeCode(c)).filter(Boolean));
  if (normalizedRequested.size === 0) return false;

  return (user.authorizations ?? []).some((a) => normalizedRequested.has(normalizeCode(a.code)));
}

export function hasPermission(
  user: Pick<CurrentUser, "authorizations" | "Profil_Utilisateur" | "profil"> | null | undefined,
  permission: AppPermission,
): boolean {
  if (!user) return false;
  if (isAdminProfile(user.profil ?? user.Profil_Utilisateur)) return true;

  const rule = RULES[permission];
  if (!rule) return false;

  return hasAuthorizationCode(user, rule.aliases);
}

export function getPermissionAliases(permission: AppPermission): readonly string[] {
  return RULES[permission]?.aliases ?? [];
}
