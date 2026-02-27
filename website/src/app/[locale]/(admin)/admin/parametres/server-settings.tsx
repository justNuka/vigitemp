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
          in: ["general", "notifications", "alarms", "dashboard", "messaging", "GENERAL", "NOTIFICATIONS", "ALARMS", "DASHBOARD", "MESSAGING"],
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
      { key: "general:timezone", value: "Europe/Paris", label: "Fuseau horaire" },
      { key: "general:global_language", value: "fr", label: "Langue globale (emails)" },
      { key: "notifications:email", value: "true", label: "Notifications par email" },
      { key: "notifications:alarm_email_recipients", value: "", label: "Emails en copie (tous les emails systeme)" },
      { key: "notifications:alarm_email_acknowledged", value: "true", label: "Recevoir les emails d'acquittement" },
      { key: "notifications:alarm_email_ended", value: "true", label: "Recevoir les emails d'alarme terminee" },
      { key: "notifications:sms", value: "false", label: "Notifications SMS" },
      { key: "alarms:sound", value: "true", label: "Son des alarmes" },
      { key: "dashboard:refresh", value: "30", label: "Intervalle de rafraîchissement (s)" },
      { key: "dashboard:surveillance_refresh", value: "15", label: "Rafraichissement surveillance (s)" },
      { key: "dashboard:show_null_non_response", value: "false", label: "Afficher les non-reponses" },
      { key: "dashboard:etalonnage_warning_days", value: "30", label: "Alerte validite etalonnage (jours)" },
      { key: "messaging:enabled", value: "true", label: "Messagerie interne" },
    ];

    // Créer un Map des valeurs de la DB pour un accès rapide
    const dbSettingsMap = new Map(
      dbSettings.map((setting) => [
        `${(setting.Section || "").toLowerCase()}:${(setting.Mot_Cle || "").toLowerCase()}`,
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
      { key: "general:timezone", value: "Europe/Paris", label: "Fuseau horaire" },
      { key: "general:global_language", value: "fr", label: "Langue globale (emails)" },
      { key: "notifications:email", value: "true", label: "Notifications par email" },
      { key: "notifications:alarm_email_recipients", value: "", label: "Emails en copie (tous les emails systeme)" },
      { key: "notifications:alarm_email_acknowledged", value: "true", label: "Recevoir les emails d'acquittement" },
      { key: "notifications:alarm_email_ended", value: "true", label: "Recevoir les emails d'alarme terminee" },
      { key: "notifications:sms", value: "false", label: "Notifications SMS" },
      { key: "alarms:sound", value: "true", label: "Son des alarmes" },
      { key: "dashboard:refresh", value: "30", label: "Intervalle de rafraîchissement (s)" },
      { key: "dashboard:surveillance_refresh", value: "15", label: "Rafraichissement surveillance (s)" },
      { key: "dashboard:show_null_non_response", value: "false", label: "Afficher les non-reponses" },
      { key: "dashboard:etalonnage_warning_days", value: "30", label: "Alerte validite etalonnage (jours)" },
      { key: "messaging:enabled", value: "true", label: "Messagerie interne" },
    ];
  }
}
