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

function hasAnyAuthorization(
  authorizations: readonly Authorization[] | null | undefined,
  codes: readonly string[],
): boolean {
  const normalizedRequested = new Set(codes.map((code) => normalizeCode(code)).filter(Boolean));
  if (normalizedRequested.size === 0) return false;

  return (authorizations ?? []).some((authorization) =>
    normalizedRequested.has(normalizeCode(authorization.code)),
  );
}

export function hasAdminAuthorization(
  user: Pick<CurrentUser, "authorizations"> | null | undefined,
): boolean {
  if (!user) return false;
  return hasAnyAuthorization(user.authorizations, RULES.DASHBOARD_ADMIN_ACCESS.aliases);
}

export function hasAuthorizationCode(
  user: Pick<CurrentUser, "authorizations" | "Profil_Utilisateur" | "profil"> | null | undefined,
  codes: readonly string[],
): boolean {
  if (!user) return false;
  if (hasAdminAuthorization(user)) return true;

  return hasAnyAuthorization(user.authorizations, codes);
}

export function hasPermission(
  user: Pick<CurrentUser, "authorizations" | "Profil_Utilisateur" | "profil"> | null | undefined,
  permission: AppPermission,
): boolean {
  if (!user) return false;
  if (hasAdminAuthorization(user)) return true;

  const rule = RULES[permission];
  if (!rule) return false;

  return hasAnyAuthorization(user.authorizations, rule.aliases);
}

export function getPermissionAliases(permission: AppPermission): readonly string[] {
  return RULES[permission]?.aliases ?? [];
}
