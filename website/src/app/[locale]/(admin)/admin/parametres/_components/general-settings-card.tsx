'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { SwitchWithLoading } from '@/components/ui/switch-with-loading';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useTranslations } from 'next-intl';
import { Settings2 } from 'lucide-react';

type Setting = {
  key: string;
  value: string;
  label: string;
};

type GeneralSettingsCardProps = {
  settings: Setting[];
  loadingKeys: Set<string>;
  onToggle: (key: string, currentValue: string) => void;
  onRefreshIntervalChange: (key: string, newValue: string) => void;
  onNumericSettingChange: (key: string, newValue: string) => void;
};

export function GeneralSettingsCard({
  settings,
  loadingKeys,
  onToggle,
  onRefreshIntervalChange,
  onNumericSettingChange,
}: GeneralSettingsCardProps) {
  const t = useTranslations('adminSettings');
  const labelMap: Record<string, string> = {
    'notifications:email': t('general.labels.notifications_email'),
    'notifications:sms': t('general.labels.notifications_sms'),
    'alarms:sound': t('general.labels.alarms_sound'),
    'dashboard:refresh': t('general.labels.dashboard_refresh'),
    'dashboard:surveillance_refresh': t('general.labels.surveillance_refresh'),
    'dashboard:show_null_non_response': t('general.labels.show_null_non_response'),
    'dashboard:etalonnage_warning_days': t('general.labels.etalonnage_warning_days'),
    'general:global_language': t('general.labels.global_language'),
  };

  return (
    <Card className="border-border/60 bg-white dark:bg-card">
      <CardHeader className="bg-background border-b border-border/40">
        <CardTitle className="flex items-center gap-2 text-base">
          <Settings2 className="h-4 w-4 text-primary" />
          {t('general.title')}
        </CardTitle>
        <CardDescription>{t('general.description')}</CardDescription>
      </CardHeader>
      <CardContent className="divide-y divide-border/40">
        {settings.map((setting) => (
          <div key={setting.key} className="flex items-center justify-between py-4">
            <Label htmlFor={setting.key} className="flex-1">
              {labelMap[setting.key] ?? setting.label}
            </Label>

            {setting.key === 'dashboard:refresh' || setting.key === 'dashboard:surveillance_refresh' ? (
              <Select
                value={setting.value}
                onValueChange={(value) => onRefreshIntervalChange(setting.key, value)}
                disabled={loadingKeys.has(setting.key)}
              >
                <SelectTrigger className="w-45">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">{t('general.refresh_options.5')}</SelectItem>
                  <SelectItem value="10">{t('general.refresh_options.10')}</SelectItem>
                  <SelectItem value="15">{t('general.refresh_options.15')}</SelectItem>
                  <SelectItem value="30">{t('general.refresh_options.30')}</SelectItem>
                  <SelectItem value="60">{t('general.refresh_options.60')}</SelectItem>
                  {setting.key === "dashboard:refresh" ? (
                    <SelectItem value="0">{t('general.refresh_options.manual')}</SelectItem>
                  ) : null}
                </SelectContent>
              </Select>
            ) : setting.key === 'general:global_language' ? (
              <Select
                value={setting.value || 'fr'}
                onValueChange={(value) => onNumericSettingChange(setting.key, value)}
                disabled={loadingKeys.has(setting.key)}
              >
                <SelectTrigger className="w-45">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fr">{t('general.language_options.fr')}</SelectItem>
                  <SelectItem value="en">{t('general.language_options.en')}</SelectItem>
                </SelectContent>
              </Select>
            ) : setting.key === 'dashboard:etalonnage_warning_days' ? (
              <div className="flex items-center gap-2">
                <Select
                  value={["7", "15", "30", "45", "60", "90"].includes(setting.value) ? setting.value : "custom"}
                  onValueChange={(value) => {
                    if (value !== "custom") onNumericSettingChange(setting.key, value);
                  }}
                  disabled={loadingKeys.has(setting.key)}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">{t('general.warning_days_options.7')}</SelectItem>
                    <SelectItem value="15">{t('general.warning_days_options.15')}</SelectItem>
                    <SelectItem value="30">{t('general.warning_days_options.30')}</SelectItem>
                    <SelectItem value="45">{t('general.warning_days_options.45')}</SelectItem>
                    <SelectItem value="60">{t('general.warning_days_options.60')}</SelectItem>
                    <SelectItem value="90">{t('general.warning_days_options.90')}</SelectItem>
                    <SelectItem value="custom">{t('general.warning_days_options.custom')}</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  min={1}
                  className="w-28"
                  defaultValue={setting.value}
                  disabled={loadingKeys.has(setting.key)}
                  onBlur={(event) => {
                    const value = Number(event.target.value);
                    if (!Number.isFinite(value) || value <= 0) return;
                    onNumericSettingChange(setting.key, String(Math.trunc(value)));
                  }}
                  onKeyDown={(event) => {
                    if (event.key !== 'Enter') return;
                    const target = event.target as HTMLInputElement;
                    const value = Number(target.value);
                    if (!Number.isFinite(value) || value <= 0) return;
                    onNumericSettingChange(setting.key, String(Math.trunc(value)));
                  }}
                />
              </div>
            ) : (
              <SwitchWithLoading
                id={setting.key}
                checked={setting.value === 'true'}
                onCheckedChange={() => onToggle(setting.key, setting.value)}
                isLoading={loadingKeys.has(setting.key)}
              />
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
