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
  onToggle: (key: string) => void;
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
    <Card className="border-border/60 bg-white dark:bg-popover dark:text-popover-foreground">
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
            onCheckedChange={() => onToggle(enabledSetting.key)}
            isLoading={loadingKeys.has(enabledSetting.key)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
