'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { SwitchWithLoading } from '@/components/ui/switch-with-loading';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslations } from 'next-intl';

export function AutoLockSettingsCard() {
  const t = useTranslations('adminSettings');
  const [autoLockConfig, setAutoLockConfig] = useState(() => {
    const defaultConfig = { enabled: true, duration: 15 };
    try {
      if (typeof window === 'undefined') return defaultConfig;
      const stored = window.localStorage.getItem('autoLockConfig');
      if (!stored) return defaultConfig;
      const parsed = JSON.parse(stored) as { enabled?: boolean; duration?: number };
      return {
        enabled: typeof parsed.enabled === 'boolean' ? parsed.enabled : defaultConfig.enabled,
        duration: typeof parsed.duration === 'number' ? parsed.duration : defaultConfig.duration,
      };
    } catch (error) {
      console.error('Erreur lors du chargement de la config:', error);
      return defaultConfig;
    }
  });

  const autoLockEnabled = autoLockConfig.enabled;
  const autoLockDuration = autoLockConfig.duration;

  const handleAutoLockToggle = (enabled: boolean) => {
    const config = { enabled, duration: autoLockDuration };
    setAutoLockConfig(config);
    localStorage.setItem('autoLockConfig', JSON.stringify(config));
    toast.success(
      enabled
        ? t('security.toast.enabled', { minutes: autoLockDuration })
        : t('security.toast.disabled')
    );
    window.dispatchEvent(new Event('storage'));
  };

  const handleAutoLockDurationChange = (duration: string) => {
    const durationNum = parseInt(duration, 10);
    const config = { enabled: autoLockEnabled, duration: durationNum };
    setAutoLockConfig(config);
    localStorage.setItem('autoLockConfig', JSON.stringify(config));
    toast.success(t('security.toast.duration', { minutes: durationNum }));
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <Card className="border-border/60 bg-white dark:bg-card">
      <CardHeader>
        <CardTitle>{t('security.title')}</CardTitle>
        <CardDescription>{t('security.description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <Label htmlFor="autoLock" className="font-medium">
              {t('security.auto_lock.label')}
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              {t('security.auto_lock.helper')}
            </p>
          </div>
          <SwitchWithLoading id="autoLock" checked={autoLockEnabled} onCheckedChange={handleAutoLockToggle} />
        </div>

        {autoLockEnabled && (
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Label htmlFor="autoLockDuration" className="font-medium">
                {t('security.inactivity.label')}
              </Label>
              <p className="text-sm text-muted-foreground mt-1">{t('security.inactivity.helper')}</p>
            </div>
            <Select value={autoLockDuration.toString()} onValueChange={handleAutoLockDurationChange}>
              <SelectTrigger className="w-45">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">{t('security.duration_options.5')}</SelectItem>
                <SelectItem value="10">{t('security.duration_options.10')}</SelectItem>
                <SelectItem value="15">{t('security.duration_options.15')}</SelectItem>
                <SelectItem value="30">{t('security.duration_options.30')}</SelectItem>
                <SelectItem value="60">{t('security.duration_options.60')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
