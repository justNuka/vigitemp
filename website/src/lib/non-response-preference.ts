import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export const NON_RESPONSE_COOKIE = "vigitemp_show_null_non_response";
export const NON_RESPONSE_DEFAULT = false;

const USER_SECTION = "USER_PREFERENCES";

function parseBoolean(value: string | null | undefined): boolean | null {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "off"].includes(normalized)) return false;
  return null;
}

function userPreferenceKey(userId: number): string {
  return `SHOW_NULL_NON_RESPONSE_USER_${userId}`;
}

export async function getGlobalNonResponseDefault(): Promise<boolean> {
  const setting = await prisma.t_parametre.findFirst({
    where: {
      OR: [
        { Section: "dashboard", Mot_Cle: "show_null_non_response" },
        { Section: "DASHBOARD", Mot_Cle: "SHOW_NULL_NON_RESPONSE" },
      ],
    },
    select: { Valeur: true },
  });

  const parsed = parseBoolean(setting?.Valeur);
  return parsed ?? NON_RESPONSE_DEFAULT;
}

export async function getUserNonResponsePreference(userId: number): Promise<boolean | null> {
  const key = userPreferenceKey(userId);
  const setting = await prisma.t_parametre.findFirst({
    where: {
      OR: [
        { Section: USER_SECTION, Mot_Cle: key },
        { Section: USER_SECTION.toLowerCase(), Mot_Cle: key.toLowerCase() },
      ],
    },
    select: { Valeur: true },
  });

  return parseBoolean(setting?.Valeur);
}

export async function setUserNonResponsePreference(userId: number, enabled: boolean): Promise<void> {
  const key = userPreferenceKey(userId);
  await prisma.t_parametre.upsert({
    where: {
      Section_Mot_Cle: {
        Section: USER_SECTION,
        Mot_Cle: key,
      },
    },
    update: {
      Valeur: enabled ? "1" : "0",
    },
    create: {
      Section: USER_SECTION,
      Mot_Cle: key,
      Valeur: enabled ? "1" : "0",
      Commentaire: "Preference utilisateur: affichage des non-reponses (valeurs null)",
    },
  });
}

export async function resolveNonResponsePreference(req: NextRequest, userId?: number): Promise<boolean> {
  const fromQuery = parseBoolean(req.nextUrl.searchParams.get("includeNullNonResponse"));
  if (fromQuery !== null) return fromQuery;

  if (typeof userId === "number" && Number.isFinite(userId)) {
    const userPref = await getUserNonResponsePreference(userId);
    if (userPref !== null) return userPref;
  }

  const fromCookie = parseBoolean(req.cookies.get(NON_RESPONSE_COOKIE)?.value);
  if (fromCookie !== null) return fromCookie;

  return getGlobalNonResponseDefault();
}
