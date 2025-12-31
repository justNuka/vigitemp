"use cache";

import { cacheTag } from "next/cache";
import { prisma } from "@/lib/prisma";

/**
 * Composant serveur pour charger les paramètres depuis la base de données
 * Utilise le cache Next.js 16 pour optimiser les performances
 */
export async function ServerSettings() {
  "use cache";
  cacheTag("parametres-data");

  try {
    // Charger TOUS les paramètres depuis la base de données
    const dbSettings = await prisma.t_parametre.findMany({
      where: {
        Section: {
          in: ["notifications", "alarms", "dashboard"],
        },
      },
      select: {
        Section: true,
        Mot_Cle: true,
        Valeur: true,
        Commentaire: true,
      },
      orderBy: [
        { Section: "asc" },
        { Mot_Cle: "asc" },
      ],
    });

    // Définir les paramètres par défaut (toujours affichés)
    const defaultSettings = [
      { key: "notifications:email", value: "true", label: "Notifications par email" },
      { key: "notifications:sms", value: "false", label: "Notifications SMS" },
      { key: "alarms:sound", value: "true", label: "Son des alarmes" },
      { key: "dashboard:refresh", value: "30", label: "Intervalle de rafraîchissement (s)" },
    ];

    // Créer un Map des valeurs de la DB pour un accès rapide
    const dbSettingsMap = new Map(
      dbSettings.map((setting) => [
        `${setting.Section}:${setting.Mot_Cle}`,
        setting.Valeur || "false",
      ])
    );

    // Fusionner les valeurs par défaut avec celles de la DB
    const settings = defaultSettings.map((defaultSetting) => ({
      ...defaultSetting,
      // Remplacer par la valeur DB si elle existe, sinon garder la valeur par défaut
      value: dbSettingsMap.get(defaultSetting.key) || defaultSetting.value,
    }));

    return settings;
  } catch (error) {
    console.error("Erreur lors du chargement des paramètres:", error);
    // Fallback sur les valeurs par défaut en cas d'erreur
    return [
      { key: "notifications:email", value: "true", label: "Notifications par email" },
      { key: "notifications:sms", value: "false", label: "Notifications SMS" },
      { key: "alarms:sound", value: "true", label: "Son des alarmes" },
      { key: "dashboard:refresh", value: "30", label: "Intervalle de rafraîchissement (s)" },
    ];
  }
}
