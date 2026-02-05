import { cache } from "react";
import { prisma } from "@/lib/prisma";

const DEFAULT_TIMEZONE = "Europe/Paris";

export const getAppTimezone = cache(async (): Promise<string> => {
  try {
    const setting = await prisma.t_parametre.findUnique({
      where: {
        Section_Mot_Cle: {
          Section: "general",
          Mot_Cle: "timezone",
        },
      },
      select: { Valeur: true },
    });

    const value = setting?.Valeur?.trim();
    return value || DEFAULT_TIMEZONE;
  } catch {
    return DEFAULT_TIMEZONE;
  }
});
