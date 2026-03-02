import { prisma } from "@/lib/prisma";

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
        { Section: "DASHBOARD", Mot_Cle: "SHOW_NULL_NON_REPONSE" },
        { Section: "dashboard", Mot_Cle: "show_null_non_reponse" },
        { Section: "DASHBOARD", Mot_Cle: "SHOW_NULL_NON_RESPONSE" },
        { Section: "dashboard", Mot_Cle: "show_null_non_response" },
      ],
    },
    select: { Valeur: true },
  });

  const parsed = parseBoolean(setting?.Valeur);
  return parsed ?? NON_RESPONSE_DEFAULT;
}
