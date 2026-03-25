'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslations } from 'next-intl';

interface Setting {
  key: string;
  value: string;
  label: string;
}

interface TimezoneSettingsCardProps {
  settings: Setting[];
  loadingKeys: Set<string>;
  onTimezoneChange: (key: string, newValue: string) => void;
}

const TIMEZONE_OPTIONS = [
  'Europe/Paris',
  'UTC',
  'Europe/London',
  'America/New_York',
  'America/Chicago',
  'America/Los_Angeles',
  'America/Montreal',
  'America/Sao_Paulo',
  'Asia/Dubai',
  'Asia/Tokyo',
  'Australia/Sydney',
];

export function TimezoneSettingsCard({
  settings,
  loadingKeys,
  onTimezoneChange,
}: TimezoneSettingsCardProps) {
  const t = useTranslations('adminSettings');
  const timezoneSetting = settings.find((setting) => setting.key === 'general:timezone');
  const value = timezoneSetting?.value || 'Europe/Paris';

  return (
    <Card className="border-border/60 bg-white dark:bg-card">
      <CardHeader>
        <CardTitle>{t('timezone.title')}</CardTitle>
        <CardDescription>{t('timezone.description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <Label htmlFor="general:timezone">{t('timezone.label')}</Label>
        <Select
          value={value}
          onValueChange={(newValue) => onTimezoneChange('general:timezone', newValue)}
          disabled={loadingKeys.has('general:timezone')}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TIMEZONE_OPTIONS.map((timezone) => (
              <SelectItem key={timezone} value={timezone}>
                {timezone}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">{t('timezone.helper')}</p>
      </CardContent>
    </Card>
  );
}
