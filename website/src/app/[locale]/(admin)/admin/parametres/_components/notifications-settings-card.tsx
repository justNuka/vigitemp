"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { SwitchWithLoading } from "@/components/ui/switch-with-loading";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

type Setting = {
  key: string;
  value: string;
  label: string;
};

type NotificationsSettingsCardProps = {
  settings: Setting[];
  loadingKeys: Set<string>;
  onToggle: (key: string, currentValue: string) => void;
  onSaveRecipients: (key: string, value: string) => void;
};

function normalizeRecipients(raw: string) {
  return raw
    .split(/[;,\n\r]+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .join("\n");
}

export function NotificationsSettingsCard({
  settings,
  loadingKeys,
  onToggle,
  onSaveRecipients,
}: NotificationsSettingsCardProps) {
  const t = useTranslations("adminSettings");

  const emailToggle = useMemo(
    () => settings.find((setting) => setting.key === "notifications:email"),
    [settings],
  );
  const recipientsSetting = useMemo(
    () => settings.find((setting) => setting.key === "notifications:alarm_email_recipients"),
    [settings],
  );

  const [recipients, setRecipients] = useState(() => normalizeRecipients(recipientsSetting?.value ?? ""));


  useEffect(() => {
    setRecipients(normalizeRecipients(recipientsSetting?.value ?? ""));
  }, [recipientsSetting?.value]);
  const isSaving = recipientsSetting ? loadingKeys.has(recipientsSetting.key) : false;

  return (
    <Card className="bg-white/50 dark:bg-card">
      <CardHeader>
        <CardTitle>{t("notifications.title")}</CardTitle>
        <CardDescription>{t("notifications.description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {emailToggle ? (
          <div className="flex items-center justify-between">
            <Label htmlFor={emailToggle.key} className="flex-1">
              {t("notifications.email_toggle")}
            </Label>
            <SwitchWithLoading
              id={emailToggle.key}
              checked={emailToggle.value === "true"}
              onCheckedChange={() => onToggle(emailToggle.key, emailToggle.value)}
              isLoading={loadingKeys.has(emailToggle.key)}
            />
          </div>
        ) : null}

        {recipientsSetting ? (
          <div className="space-y-2">
            <Label htmlFor="alarm-email-recipients">{t("notifications.recipients_label")}</Label>
            <Textarea
              id="alarm-email-recipients"
              value={recipients}
              onChange={(event) => setRecipients(event.target.value)}
              rows={5}
              placeholder={t("notifications.recipients_placeholder")}
            />
            <p className="text-xs text-muted-foreground">{t("notifications.recipients_helper")}</p>
            <div className="flex justify-end">
              <Button
                type="button"
                disabled={isSaving}
                onClick={() => onSaveRecipients(recipientsSetting.key, normalizeRecipients(recipients))}
              >
                {t("notifications.save_button")}
              </Button>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

