"use client";

import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useLicense } from "@/components/license/license-provider";
import { isStandardOrExpert } from "@/lib/license-access";

import { settingsApi } from "@/lib/api";
import { SMTPConfigModal } from "./smtp-config-modal";
import { AutoLockSettingsCard } from "./auto-lock-settings-card";
import { GeneralSettingsCard } from "./general-settings-card";
import { MessagingSettingsCard } from "./messaging-settings-card";
import { NotificationsSettingsCard } from "./notifications-settings-card";
import { PasswordPolicyCard } from "./password-policy-card";
import { SmtpSettingsCard } from "./smtp-settings-card";
import { TimezoneSettingsCard } from "./timezone-settings-card";

interface Setting {
  key: string;
  value: string;
  label: string;
}

interface Props {
  settings: Setting[];
}

export function SettingsClient({ settings: initialSettings }: Props) {
  const router = useRouter();
  const t = useTranslations("adminSettings");
  const { license } = useLicense();
  const canEditSurveillanceRefresh = isStandardOrExpert(license);
  const [smtpModalOpen, setSmtpModalOpen] = useState(false);

  const [settings, setSettings] = useState(initialSettings);

  useEffect(() => {
    setSettings(initialSettings);
  }, [initialSettings]);

  const updateMutation = useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) => settingsApi.update(key, value),
  });

  const [loadingKeys, setLoadingKeys] = useState<Set<string>>(new Set());

  const handleToggle = (key: string, currentValue: string) => {
    const newValue = currentValue === "true" ? "false" : "true";

    setSettings((prev) => prev.map((setting) => (setting.key === key ? { ...setting, value: newValue } : setting)));
    setLoadingKeys((prev) => new Set(prev).add(key));

    updateMutation.mutate(
      { key, value: newValue },
      {
        onSuccess: () => {
          setTimeout(() => {
            router.refresh();
          }, 100);
          toast.success(t("toast.update_success"));
        },
        onError: () => {
          setSettings((prev) => prev.map((setting) => (setting.key === key ? { ...setting, value: currentValue } : setting)));
          toast.error(t("toast.update_error"));
        },
        onSettled: () => {
          setLoadingKeys((prev) => {
            const next = new Set(prev);
            next.delete(key);
            return next;
          });
        },
      }
    );
  };

  const handleRefreshIntervalChange = (key: string, newValue: string) => {
    setSettings((prev) => prev.map((setting) => (setting.key === key ? { ...setting, value: newValue } : setting)));
    setLoadingKeys((prev) => new Set(prev).add(key));

    updateMutation.mutate(
      { key, value: newValue },
      {
        onSuccess: () => {
          setTimeout(() => {
            router.refresh();
          }, 100);

          const intervalLabel =
            newValue === "0"
              ? t("general.refresh_options.manual")
              : newValue === "5"
              ? t("general.refresh_options.5")
              : newValue === "10"
              ? t("general.refresh_options.10")
              : newValue === "15"
              ? t("general.refresh_options.15")
              : newValue === "30"
              ? t("general.refresh_options.30")
              : newValue === "60"
              ? t("general.refresh_options.60")
              : t("general.refresh_options.custom", { seconds: newValue });

          toast.success(t("toast.refresh_interval", { label: intervalLabel }));
          window.dispatchEvent(new Event("storage"));
        },
        onError: () => {
          const currentSetting = settings.find((s) => s.key === key);
          const currentValue = currentSetting?.value || "30";

          setSettings((prev) => prev.map((setting) => (setting.key === key ? { ...setting, value: currentValue } : setting)));
          toast.error(t("toast.update_error"));
        },
        onSettled: () => {
          setLoadingKeys((prev) => {
            const next = new Set(prev);
            next.delete(key);
            return next;
          });
        },
      }
    );
  };

  const handleSettingChange = (key: string, newValue: string) => {
    setSettings((prev) => prev.map((setting) => (setting.key === key ? { ...setting, value: newValue } : setting)));
    setLoadingKeys((prev) => new Set(prev).add(key));

    updateMutation.mutate(
      { key, value: newValue },
      {
        onSuccess: () => {
          setTimeout(() => {
            router.refresh();
          }, 100);
          toast.success(t("toast.update_success"));
        },
        onError: () => {
          const currentSetting = settings.find((s) => s.key === key);
          const currentValue = currentSetting?.value || "";
          setSettings((prev) => prev.map((setting) => (setting.key === key ? { ...setting, value: currentValue } : setting)));
          toast.error(t("toast.update_error"));
        },
        onSettled: () => {
          setLoadingKeys((prev) => {
            const next = new Set(prev);
            next.delete(key);
            return next;
          });
        },
      }
    );
  };

  const generalSettings = settings.filter((setting) => {
    const isNotificationSetting = ["notifications:email", "notifications:alarm_email_recipients", "notifications:alarm_email_acknowledged", "notifications:alarm_email_ended"].includes(setting.key)
    if (isNotificationSetting) return false
    if (setting.key === "messaging:enabled") return false
    if (!canEditSurveillanceRefresh && setting.key === "dashboard:surveillance_refresh") return false
    return true
  });

  const notificationSettings = settings.filter((setting) =>
    ["notifications:email", "notifications:alarm_email_recipients", "notifications:alarm_email_acknowledged", "notifications:alarm_email_ended"].includes(setting.key),
  );

  return (
    <main className="flex-1 p-4 md:p-6 space-y-6 animate-fade-in">
      <GeneralSettingsCard
        settings={generalSettings}
        loadingKeys={loadingKeys}
        onToggle={handleToggle}
        onRefreshIntervalChange={handleRefreshIntervalChange}
        onNumericSettingChange={handleSettingChange}
      />

      <TimezoneSettingsCard
        settings={settings}
        loadingKeys={loadingKeys}
        onTimezoneChange={handleSettingChange}
      />

      <AutoLockSettingsCard />

      <PasswordPolicyCard />

      <NotificationsSettingsCard
        settings={notificationSettings}
        loadingKeys={loadingKeys}
        onToggle={handleToggle}
        onSaveRecipients={handleSettingChange}
      />

      {isStandardOrExpert(license) && (
        <MessagingSettingsCard
          settings={settings.filter((s) => s.key === "messaging:enabled")}
          loadingKeys={loadingKeys}
          onToggle={handleToggle}
        />
      )}

      <SmtpSettingsCard onOpenSmtpModal={() => setSmtpModalOpen(true)} />

      <SMTPConfigModal open={smtpModalOpen} onOpenChange={setSmtpModalOpen} />
    </main>
  );
}


