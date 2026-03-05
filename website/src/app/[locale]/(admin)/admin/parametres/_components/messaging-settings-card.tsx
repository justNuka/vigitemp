'use client'

import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { SwitchWithLoading } from "@/components/ui/switch-with-loading";
import { useTranslations } from "next-intl";

type Setting = {
  key: string;
  value: string;
  label: string;
};

type MessagingSettingsCardProps = {
  settings: Setting[];
  loadingKeys: Set<string>;
  onToggle: (key: string, currentValue: string) => void;
};

export function MessagingSettingsCard({
  settings,
  loadingKeys,
  onToggle,
}: MessagingSettingsCardProps) {
  const t = useTranslations("adminSettings");

  const enabledSetting = useMemo(
    () => settings.find((s) => s.key === "messaging:enabled"),
    [settings],
  );

  if (!enabledSetting) return null;

  return (
    <Card className="border-sky-200 bg-[linear-gradient(180deg,rgba(14,165,233,0.08),rgba(255,255,255,0.92))] dark:bg-card">
      <CardHeader>
        <CardTitle>{t("messaging.title")}</CardTitle>
        <CardDescription>{t("messaging.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <Label htmlFor={enabledSetting.key} className="flex-1">
            {t("messaging.toggle_label")}
          </Label>
          <SwitchWithLoading
            id={enabledSetting.key}
            checked={enabledSetting.value === "true"}
            onCheckedChange={() => onToggle(enabledSetting.key, enabledSetting.value)}
            isLoading={loadingKeys.has(enabledSetting.key)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
