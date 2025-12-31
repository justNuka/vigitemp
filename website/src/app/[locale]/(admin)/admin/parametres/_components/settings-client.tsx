"use client";

import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";

import { settingsApi } from "@/lib/api";
import { SMTPConfigModal } from "./smtp-config-modal";
import { AutoLockSettingsCard } from "./auto-lock-settings-card";
import { GeneralSettingsCard } from "./general-settings-card";
import { NotificationsSettingsCard } from "./notifications-settings-card";
import { PasswordPolicyCard } from "./password-policy-card";
import { SmtpSettingsCard } from "./smtp-settings-card";

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
          toast.success("Paramètre mis à jour");
        },
        onError: () => {
          setSettings((prev) => prev.map((setting) => (setting.key === key ? { ...setting, value: currentValue } : setting)));
          toast.error("Erreur lors de la mise à jour");
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
              ? "Manuel (désactivé)"
              : newValue === "5"
              ? "5 secondes"
              : newValue === "10"
              ? "10 secondes"
              : newValue === "30"
              ? "30 secondes"
              : newValue === "60"
              ? "1 minute"
              : `${newValue} secondes`;

          toast.success(`Intervalle de rafraîchissement: ${intervalLabel}`);
          window.dispatchEvent(new Event("storage"));
        },
        onError: () => {
          const currentSetting = settings.find((s) => s.key === key);
          const currentValue = currentSetting?.value || "30";

          setSettings((prev) => prev.map((setting) => (setting.key === key ? { ...setting, value: currentValue } : setting)));
          toast.error("Erreur lors de la mise à jour");
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

  return (
    <main className="flex-1 p-4 md:p-6 space-y-6 animate-fade-in">
      <GeneralSettingsCard
        settings={settings}
        loadingKeys={loadingKeys}
        onToggle={handleToggle}
        onRefreshIntervalChange={handleRefreshIntervalChange}
      />

      <AutoLockSettingsCard />

      <PasswordPolicyCard />

      <NotificationsSettingsCard />

      <SmtpSettingsCard onOpenSmtpModal={() => setSmtpModalOpen(true)} />

      <SMTPConfigModal open={smtpModalOpen} onOpenChange={setSmtpModalOpen} />
    </main>
  );
}

