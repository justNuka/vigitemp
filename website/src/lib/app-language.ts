import { cacheTag } from "next/cache";
import { prisma } from "@/lib/prisma";

export type AppLanguage = "fr" | "en";

const DEFAULT_APP_LANGUAGE: AppLanguage = "fr";

function normalizeLanguage(value?: string | null): AppLanguage {
  const normalized = (value ?? "").trim().toLowerCase();
  return normalized === "en" ? "en" : "fr";
}

export async function getGlobalAppLanguage(): Promise<AppLanguage> {
  "use cache";
  cacheTag("parametres-data");

  try {
    const setting = await prisma.t_parametre.findFirst({
      where: {
        OR: [
          { Section: "general", Mot_Cle: "global_language" },
          { Section: "GENERAL", Mot_Cle: "GLOBAL_LANGUAGE" },
        ],
      },
      select: { Valeur: true },
    });

    if (!setting?.Valeur) {
      return DEFAULT_APP_LANGUAGE;
    }

    return normalizeLanguage(setting.Valeur);
  } catch {
    return DEFAULT_APP_LANGUAGE;
  }
}
