"use client";

import { useState } from "react";
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

export function SettingsClient({ settings: initialSettings }: Props) {
  const t = useTranslations("adminSettings");
  const { license } = useLicense();
  const canEditSurveillanceRefresh = isStandardOrExpert(license);
  const [smtpModalOpen, setSmtpModalOpen] = useState(false);
  const { settings, loadingKeys, persist, toggle } = useSettingsEditor(initialSettings);

  const generalSettings = settings.filter((setting) => {
    if (NOTIFICATION_SETTING_KEYS.has(setting.key)) return false;
    if (setting.key === MESSAGING_SETTING_KEY) return false;
    if (!canEditSurveillanceRefresh && setting.key === SURVEILLANCE_REFRESH_KEY) return false;
    return true;
  });

  const notificationSettings = settings.filter((setting) => NOTIFICATION_SETTING_KEYS.has(setting.key));
  const messagingSettings = settings.filter((setting) => setting.key === MESSAGING_SETTING_KEY);

  return (
    <main className="flex-1 p-4 md:p-6 space-y-6 animate-fade-in">
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
        settings={settings}
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

      {isStandardOrExpert(license) && (
        <MessagingSettingsCard
          settings={messagingSettings}
          loadingKeys={loadingKeys}
          onToggle={(key) => toggle(key)}
        />
      )}

      <SmtpSettingsCard onOpenSmtpModal={() => setSmtpModalOpen(true)} />
      <TelephonySettingsCard />
      <SMTPConfigModal open={smtpModalOpen} onOpenChange={setSmtpModalOpen} />
    </main>
  );
}
