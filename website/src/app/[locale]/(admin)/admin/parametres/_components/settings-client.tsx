"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
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
  "notifications:alarm_email_fallback_to_system",
  "notifications:gsp_battery_notify_percent",
  "notifications:gsp_battery_email_percent",
]);

const MESSAGING_SETTING_KEY = "messaging:enabled";
const SURVEILLANCE_REFRESH_KEY = "dashboard:surveillance_refresh";

function getTranslatedLabel(t: ReturnType<typeof useTranslations>, setting: Setting) {
  const translatedLabels: Record<string, string> = {
    "general:timezone_enabled": t("timezone.enabled_label"),
    "general:timezone": t("timezone.label"),
    "general:global_language": t("general.labels.global_language"),
    "notifications:email": t("notifications.email_toggle"),
    "notifications:alarm_email_recipients": t("notifications.cc_recipients_label"),
    "notifications:alarm_email_acknowledged": t("notifications.acknowledged_toggle"),
    "notifications:alarm_email_ended": t("notifications.ended_toggle"),
    "notifications:alarm_email_fallback_to_system": t("notifications.fallback_toggle"),
    "notifications:gsp_battery_notify_percent": t("notifications.gsp_battery_notify_percent_label"),
    "notifications:gsp_battery_email_percent": t("notifications.gsp_battery_email_percent_label"),
    "alarms:sound": t("general.labels.alarms_sound"),
    "dashboard:refresh": t("general.labels.dashboard_refresh"),
    "dashboard:surveillance_refresh": t("general.labels.surveillance_refresh"),
    "dashboard:show_null_non_response": t("general.labels.show_null_non_response"),
    "dashboard:etalonnage_warning_days": t("general.labels.etalonnage_warning_days"),
    "dashboard:audit_graph_openings": t("general.labels.audit_graph_openings"),
    "dashboard:require_action_comment": t("general.labels.require_action_comment"),
    "messaging:enabled": t("messaging.toggle_label"),
  };

  return translatedLabels[setting.key] ?? setting.label;
}

export function SettingsClient({ settings: initialSettings }: Props) {
  const t = useTranslations("adminSettings");
  const { license } = useLicense();
  const canEditSurveillanceRefresh = isStandardOrExpert(license);
  const [smtpModalOpen, setSmtpModalOpen] = useState(false);
  const { settings, loadingKeys, hasPendingChanges, setDraftValue, toggleDraft, discardChanges, saveChanges } =
    useSettingsEditor(initialSettings);

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
      {hasPendingChanges ? (
        <div className="sticky top-4 z-20 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 shadow-sm backdrop-blur">
          <div>
            <p className="text-sm font-medium">{t("pending_changes.title")}</p>
            <p className="text-xs text-muted-foreground">{t("pending_changes.description")}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={discardChanges} disabled={loadingKeys.size > 0}>
              {t("pending_changes.cancel")}
            </Button>
            <Button type="button" onClick={saveChanges} disabled={loadingKeys.size > 0}>
              {t("pending_changes.save")}
            </Button>
          </div>
        </div>
      ) : null}

      <GeneralSettingsCard
        settings={generalSettings}
        loadingKeys={loadingKeys}
        onToggle={toggleDraft}
        onRefreshIntervalChange={setDraftValue}
        onNumericSettingChange={setDraftValue}
      />

      <TimezoneSettingsCard
        settings={localizedSettings}
        loadingKeys={loadingKeys}
        onTimezoneChange={setDraftValue}
      />

      <AutoLockSettingsCard />
      <PasswordPolicyCard />

      <NotificationsSettingsCard
        settings={notificationSettings}
        loadingKeys={loadingKeys}
        onToggle={toggleDraft}
        onRecipientsChange={setDraftValue}
      />

      {isStandardOrExpert(license) ? (
        <MessagingSettingsCard
          settings={messagingSettings}
          loadingKeys={loadingKeys}
          onToggle={toggleDraft}
        />
      ) : null}

      <SmtpSettingsCard onOpenSmtpModal={() => setSmtpModalOpen(true)} />
      <TelephonySettingsCard />
      <SMTPConfigModal open={smtpModalOpen} onOpenChange={setSmtpModalOpen} />
    </main>
  );
}
