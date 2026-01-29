'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { SwitchWithLoading } from '@/components/ui/switch-with-loading';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslations } from 'next-intl';

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
};

export function GeneralSettingsCard({
  settings,
  loadingKeys,
  onToggle,
  onRefreshIntervalChange,
}: GeneralSettingsCardProps) {
  const t = useTranslations('adminSettings');
  const labelMap: Record<string, string> = {
    'notifications:email': t('general.labels.notifications_email'),
    'notifications:sms': t('general.labels.notifications_sms'),
    'alarms:sound': t('general.labels.alarms_sound'),
    'dashboard:refresh': t('general.labels.dashboard_refresh'),
  };

  return (
    <Card className="bg-white/50 dark:bg-card">
      <CardHeader>
        <CardTitle>{t('general.title')}</CardTitle>
        <CardDescription>{t('general.description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {settings.map((setting) => (
          <div key={setting.key} className="flex items-center justify-between">
            <Label htmlFor={setting.key} className="flex-1">
              {labelMap[setting.key] ?? setting.label}
            </Label>

            {setting.key === 'dashboard:refresh' ? (
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
                  <SelectItem value="30">{t('general.refresh_options.30')}</SelectItem>
                  <SelectItem value="60">{t('general.refresh_options.60')}</SelectItem>
                  <SelectItem value="0">{t('general.refresh_options.manual')}</SelectItem>
                </SelectContent>
              </Select>
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
