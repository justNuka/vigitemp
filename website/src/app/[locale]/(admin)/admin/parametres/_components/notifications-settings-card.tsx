"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SwitchWithLoading } from "@/components/ui/switch-with-loading";
import { Textarea } from "@/components/ui/textarea";
import { useTranslations } from "next-intl";

type Setting = {
  key: string;
  value: string;
  label: string;
};

type NotificationsSettingsCardProps = {
  settings: Setting[];
  loadingKeys: Set<string>;
  onToggle: (key: string) => void;
  onRecipientsChange: (key: string, value: string) => void;
};

function normalizeRecipients(raw: string) {
  return raw
    .split(/[;,\n\r]+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .join("\n");
}

function sanitizePercent(raw: string) {
  const numeric = Number.parseInt(raw, 10)
  if (!Number.isFinite(numeric)) return null
  if (numeric < 1) return "1"
  if (numeric > 100) return "100"
  return String(numeric)
}

export function NotificationsSettingsCard({
  settings,
  loadingKeys,
  onToggle,
  onRecipientsChange,
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
  const fallbackToggle = useMemo(
    () => settings.find((setting) => setting.key === "notifications:alarm_email_fallback_to_system"),
    [settings],
  );
  const gspNotifyThresholdSetting = useMemo(
    () => settings.find((setting) => setting.key === "notifications:gsp_battery_notify_percent"),
    [settings],
  );
  const gspEmailThresholdSetting = useMemo(
    () => settings.find((setting) => setting.key === "notifications:gsp_battery_email_percent"),
    [settings],
  );

  const [recipients, setRecipients] = useState(() => normalizeRecipients(recipientsSetting?.value ?? ""));

  useEffect(() => {
    setRecipients(normalizeRecipients(recipientsSetting?.value ?? ""));
  }, [recipientsSetting?.value]);

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
              onCheckedChange={() => onToggle(emailToggle.key)}
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
              onCheckedChange={() => onToggle(acknowledgedToggle.key)}
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
              onCheckedChange={() => onToggle(endedToggle.key)}
              isLoading={loadingKeys.has(endedToggle.key)}
            />
          </div>
        ) : null}

        {fallbackToggle ? (
          <div className="flex items-center justify-between">
            <Label htmlFor={fallbackToggle.key} className="flex-1">
              {t("notifications.fallback_toggle")}
            </Label>
            <SwitchWithLoading
              id={fallbackToggle.key}
              checked={fallbackToggle.value === "true"}
              onCheckedChange={() => onToggle(fallbackToggle.key)}
              isLoading={loadingKeys.has(fallbackToggle.key)}
            />
          </div>
        ) : null}

        {recipientsSetting ? (
          <div className="space-y-2">
            <Label htmlFor="alarm-email-recipients">{t("notifications.cc_recipients_label")}</Label>
            <Textarea
              id="alarm-email-recipients"
              value={recipients}
              onChange={(event) => {
                const nextRecipients = event.target.value;
                setRecipients(nextRecipients);
                onRecipientsChange(recipientsSetting.key, normalizeRecipients(nextRecipients));
              }}
              rows={5}
              placeholder={t("notifications.cc_recipients_placeholder")}
              disabled={loadingKeys.has(recipientsSetting.key)}
            />
            <p className="text-xs text-muted-foreground">{t("notifications.cc_recipients_helper")}</p>
          </div>
        ) : null}

        {gspNotifyThresholdSetting ? (
          <div className="space-y-2">
            <Label htmlFor="gsp-battery-notify-threshold">{t("notifications.gsp_battery_notify_percent_label")}</Label>
            <Input
              id="gsp-battery-notify-threshold"
              type="number"
              min={1}
              max={100}
              value={gspNotifyThresholdSetting.value}
              disabled={loadingKeys.has(gspNotifyThresholdSetting.key)}
              onChange={(event) => {
                onRecipientsChange(gspNotifyThresholdSetting.key, event.target.value)
              }}
              onBlur={(event) => {
                const sanitized = sanitizePercent(event.target.value)
                if (!sanitized) return
                onRecipientsChange(gspNotifyThresholdSetting.key, sanitized)
              }}
              onKeyDown={(event) => {
                if (event.key !== "Enter") return
                const target = event.target as HTMLInputElement
                const sanitized = sanitizePercent(target.value)
                if (!sanitized) return
                onRecipientsChange(gspNotifyThresholdSetting.key, sanitized)
              }}
            />
            <p className="text-xs text-muted-foreground">{t("notifications.gsp_battery_notify_percent_helper")}</p>
          </div>
        ) : null}

        {gspEmailThresholdSetting ? (
          <div className="space-y-2">
            <Label htmlFor="gsp-battery-email-threshold">{t("notifications.gsp_battery_email_percent_label")}</Label>
            <Input
              id="gsp-battery-email-threshold"
              type="number"
              min={1}
              max={100}
              value={gspEmailThresholdSetting.value}
              disabled={loadingKeys.has(gspEmailThresholdSetting.key)}
              onChange={(event) => {
                onRecipientsChange(gspEmailThresholdSetting.key, event.target.value)
              }}
              onBlur={(event) => {
                const sanitized = sanitizePercent(event.target.value)
                if (!sanitized) return
                onRecipientsChange(gspEmailThresholdSetting.key, sanitized)
              }}
              onKeyDown={(event) => {
                if (event.key !== "Enter") return
                const target = event.target as HTMLInputElement
                const sanitized = sanitizePercent(target.value)
                if (!sanitized) return
                onRecipientsChange(gspEmailThresholdSetting.key, sanitized)
              }}
            />
            <p className="text-xs text-muted-foreground">{t("notifications.gsp_battery_email_percent_helper")}</p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
