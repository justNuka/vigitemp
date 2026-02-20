import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export const NON_RESPONSE_COOKIE = "vigitemp_show_null_non_response";
export const NON_RESPONSE_DEFAULT = false;

function parseBoolean(value: string | null | undefined): boolean | null {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "off"].includes(normalized)) return false;
  return null;
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

export async function resolveNonResponsePreference(req: NextRequest): Promise<boolean> {
  const fromQuery = parseBoolean(req.nextUrl.searchParams.get("includeNullNonResponse"));
  if (fromQuery !== null) return fromQuery;

  const fromCookie = parseBoolean(req.cookies.get(NON_RESPONSE_COOKIE)?.value);
  if (fromCookie !== null) return fromCookie;

  return getGlobalNonResponseDefault();
}
