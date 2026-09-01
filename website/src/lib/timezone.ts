import { cacheTag } from "next/cache";

const DEFAULT_TIMEZONE = "Europe/Paris";

export async function getAppTimezone(): Promise<string> {
  "use cache";
  cacheTag("app-timezone");

  try {
    const { prisma } = await import("@/lib/prisma");
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


