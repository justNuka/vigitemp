"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

import { useLicense } from "@/components/license/license-provider";
import { isStandardOrExpert } from "@/lib/license-access";

import { AutoLockSettingsCard } from "./auto-lock-settings-card";
import { GeneralSettingsCard } from "./general-settings-card";
import { MessagingSettingsCard } from "./messaging-settings-card";
import { NotificationsSettingsCard } from "./notifications-settings-card";
import { PasswordPolicyCard } from "./password-policy-card";
import { SMTPConfigModal } from "./smtp-config-modal";
import { SmtpSettingsCard } from "./smtp-settings-card";
import { TelephonySettingsCard } from "./telephony-settings-card";
import { TimezoneSettingsCard } from "./timezone-settings-card";
import { useSettingsEditor } from "./use-settings-editor";

interface Setting {
  key: string;
  value: string;
  label: string;
}

interface Props {
  settings: Setting[];
}

const NOTIFICATION_SETTING_KEYS = new Set([
  "notifications:email",
  "notifications:alarm_email_recipients",
  "notifications:alarm_email_acknowledged",
  "notifications:alarm_email_ended",
]);

const MESSAGING_SETTING_KEY = "messaging:enabled";
const SURVEILLANCE_REFRESH_KEY = "dashboard:surveillance_refresh";

function getRefreshIntervalLabel(t: ReturnType<typeof useTranslations>, value: string) {
  switch (value) {
    case "0":
      return t("general.refresh_options.manual");
    case "5":
      return t("general.refresh_options.5");
    case "10":
      return t("general.refresh_options.10");
    case "15":
      return t("general.refresh_options.15");
    case "30":
      return t("general.refresh_options.30");
    case "60":
      return t("general.refresh_options.60");
    default:
      return t("general.refresh_options.custom", { seconds: value });
  }
}

function getTranslatedLabel(t: ReturnType<typeof useTranslations>, setting: Setting) {
  const translatedLabels: Record<string, string> = {
    "general:timezone": t("timezone.label"),
    "general:global_language": t("general.labels.global_language"),
    "notifications:email": t("notifications.email_toggle"),
    "notifications:alarm_email_recipients": t("notifications.cc_recipients_label"),
    "notifications:alarm_email_acknowledged": t("notifications.acknowledged_toggle"),
    "notifications:alarm_email_ended": t("notifications.ended_toggle"),
    "alarms:sound": t("general.labels.alarms_sound"),
    "dashboard:refresh": t("general.labels.dashboard_refresh"),
    "dashboard:surveillance_refresh": t("general.labels.surveillance_refresh"),
    "dashboard:show_null_non_response": t("general.labels.show_null_non_response"),
    "dashboard:etalonnage_warning_days": t("general.labels.etalonnage_warning_days"),
    "messaging:enabled": t("messaging.toggle_label"),
  };

  return translatedLabels[setting.key] ?? setting.label;
}

export function SettingsClient({ settings: initialSettings }: Props) {
  const t = useTranslations("adminSettings");
  const { license } = useLicense();
  const canEditSurveillanceRefresh = isStandardOrExpert(license);
  const [smtpModalOpen, setSmtpModalOpen] = useState(false);
  const { settings, loadingKeys, persist, toggle } = useSettingsEditor(initialSettings);

  const localizedSettings = useMemo(
    () => settings.map((setting) => ({ ...setting, label: getTranslatedLabel(t, setting) })),
    [settings, t],
  );

  const generalSettings = localizedSettings.filter((setting) => {
    if (NOTIFICATION_SETTING_KEYS.has(setting.key)) return false;
    if (setting.key === MESSAGING_SETTING_KEY) return false;
    if (!canEditSurveillanceRefresh && setting.key === SURVEILLANCE_REFRESH_KEY) return false;
    return true;
  });

  const notificationSettings = localizedSettings.filter((setting) => NOTIFICATION_SETTING_KEYS.has(setting.key));
  const messagingSettings = localizedSettings.filter((setting) => setting.key === MESSAGING_SETTING_KEY);

  return (
    <main className="flex-1 space-y-6 p-4 md:p-6 animate-fade-in">
      <GeneralSettingsCard
        settings={generalSettings}
        loadingKeys={loadingKeys}
        onToggle={(key) => toggle(key)}
        onRefreshIntervalChange={(key, value) =>
          persist(key, value, {
            successMessage: t("toast.refresh_interval", { label: getRefreshIntervalLabel(t, value) }),
            fallbackValue: "30",
            notifyStorage: true,
          })
        }
        onNumericSettingChange={(key, value) => persist(key, value)}
      />

      <TimezoneSettingsCard
        settings={localizedSettings}
        loadingKeys={loadingKeys}
        onTimezoneChange={(key, value) => persist(key, value)}
      />

      <AutoLockSettingsCard />
      <PasswordPolicyCard />

      <NotificationsSettingsCard
        settings={notificationSettings}
        loadingKeys={loadingKeys}
        onToggle={(key) => toggle(key)}
        onSaveRecipients={(key, value) => persist(key, value)}
      />

      {isStandardOrExpert(license) ? (
        <MessagingSettingsCard
          settings={messagingSettings}
          loadingKeys={loadingKeys}
          onToggle={(key) => toggle(key)}
        />
      ) : null}

      <SmtpSettingsCard onOpenSmtpModal={() => setSmtpModalOpen(true)} />
      <TelephonySettingsCard />
      <SMTPConfigModal open={smtpModalOpen} onOpenChange={setSmtpModalOpen} />
    </main>
  );
}
