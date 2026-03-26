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
  const acknowledgedToggle = useMemo(
    () => settings.find((setting) => setting.key === "notifications:alarm_email_acknowledged"),
    [settings],
  );
  const endedToggle = useMemo(
    () => settings.find((setting) => setting.key === "notifications:alarm_email_ended"),
    [settings],
  );

  const [recipients, setRecipients] = useState(() => normalizeRecipients(recipientsSetting?.value ?? ""));

  useEffect(() => {
    setRecipients(normalizeRecipients(recipientsSetting?.value ?? ""));
  }, [recipientsSetting?.value]);

  const isSavingRecipients = recipientsSetting ? loadingKeys.has(recipientsSetting.key) : false;

  return (
    <Card className="border-border/60 bg-white dark:bg-popover dark:text-popover-foreground">
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

        {acknowledgedToggle ? (
          <div className="flex items-center justify-between">
            <Label htmlFor={acknowledgedToggle.key} className="flex-1">
              {t("notifications.acknowledged_toggle")}
            </Label>
            <SwitchWithLoading
              id={acknowledgedToggle.key}
              checked={acknowledgedToggle.value === "true"}
              onCheckedChange={() => onToggle(acknowledgedToggle.key, acknowledgedToggle.value)}
              isLoading={loadingKeys.has(acknowledgedToggle.key)}
            />
          </div>
        ) : null}

        {endedToggle ? (
          <div className="flex items-center justify-between">
            <Label htmlFor={endedToggle.key} className="flex-1">
              {t("notifications.ended_toggle")}
            </Label>
            <SwitchWithLoading
              id={endedToggle.key}
              checked={endedToggle.value === "true"}
              onCheckedChange={() => onToggle(endedToggle.key, endedToggle.value)}
              isLoading={loadingKeys.has(endedToggle.key)}
            />
          </div>
        ) : null}

        {recipientsSetting ? (
          <div className="space-y-2">
            <Label htmlFor="alarm-email-recipients">{t("notifications.cc_recipients_label")}</Label>
            <Textarea
              id="alarm-email-recipients"
              value={recipients}
              onChange={(event) => setRecipients(event.target.value)}
              rows={5}
              placeholder={t("notifications.cc_recipients_placeholder")}
            />
            <p className="text-xs text-muted-foreground">{t("notifications.cc_recipients_helper")}</p>
            <div className="flex justify-end">
              <Button
                type="button"
                disabled={isSavingRecipients}
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
