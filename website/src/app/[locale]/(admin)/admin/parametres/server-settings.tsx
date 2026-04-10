"use cache";

import { cacheTag } from "next/cache";

import { log } from "@/lib/logger";
import { prisma } from "@/lib/prisma";

const DEFAULT_SETTINGS = [
  { key: "general:timezone_enabled", value: "true", label: "Enable timezone" },
  { key: "general:timezone", value: "Europe/Paris", label: "Timezone" },
  { key: "general:global_language", value: "fr", label: "Global language" },
  { key: "notifications:email", value: "true", label: "Email notifications" },
  { key: "notifications:alarm_email_recipients", value: "", label: "CC recipients" },
  { key: "notifications:alarm_email_acknowledged", value: "true", label: "Acknowledgement emails" },
  { key: "notifications:alarm_email_ended", value: "true", label: "Ended alarm emails" },
  { key: "notifications:alarm_email_fallback_to_system", value: "false", label: "Fallback to system recipients" },
  { key: "notifications:gsp_battery_notify_percent", value: "50", label: "GSP battery notify threshold (%)" },
  { key: "notifications:gsp_battery_email_percent", value: "25", label: "GSP battery email threshold (%)" },
  { key: "alarms:sound", value: "true", label: "Alarm sound" },
  { key: "dashboard:refresh", value: "30", label: "Dashboard refresh interval" },
  { key: "dashboard:surveillance_refresh", value: "15", label: "Surveillance refresh interval" },
  { key: "dashboard:show_null_non_response", value: "false", label: "Show null non-response" },
  { key: "dashboard:etalonnage_warning_days", value: "30", label: "Calibration warning days" },
  { key: "dashboard:audit_graph_openings", value: "false", label: "Audit trail on graph opening" },
  { key: "dashboard:require_action_comment", value: "false", label: "Require action comment for surveillance actions" },
  { key: "messaging:enabled", value: "true", label: "Internal messaging" },
];

/**
 * Server component that loads settings from the database.
 * Uses Next.js cache tags for performance.
 */
export async function ServerSettings() {
  "use cache";
  cacheTag("parametres-data");

  try {
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
      orderBy: [{ Section: "asc" }, { Mot_Cle: "asc" }],
    });

    const dbSettingsMap = new Map(
      dbSettings.map((setting) => [
        `${(setting.Section || "").toLowerCase()}:${(setting.Mot_Cle || "").toLowerCase()}`,
        setting.Valeur || "false",
      ]),
    );

    return DEFAULT_SETTINGS.map((defaultSetting) => ({
      ...defaultSetting,
      value: dbSettingsMap.get(defaultSetting.key) || defaultSetting.value,
    }));
  } catch (error) {
    log.error("settings/server", "settings_load_failed", { error });
    return DEFAULT_SETTINGS;
  }
}
