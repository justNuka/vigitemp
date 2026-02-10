import { cacheTag } from "next/cache";
import { prisma } from "@/lib/prisma";

const DEFAULT_TIMEZONE = "Europe/Paris";

export async function getAppTimezone(): Promise<string> {
  "use cache";
  cacheTag("app-timezone");

  try {
    const setting = await prisma.t_parametre.findFirst({
      where: {
        OR: [
          { Section: "GENERAL", Mot_Cle: "TIMEZONE" },
          { Section: "general", Mot_Cle: "timezone" },
        ],
      },
      select: { Valeur: true },
    });

    const value = setting?.Valeur?.trim();
    return value || DEFAULT_TIMEZONE;
  } catch {
    return DEFAULT_TIMEZONE;
  }
}
