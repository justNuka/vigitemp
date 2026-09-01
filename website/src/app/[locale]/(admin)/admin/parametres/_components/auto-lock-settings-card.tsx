'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { SwitchWithLoading } from '@/components/ui/switch-with-loading';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslations } from 'next-intl';
import { getJson, patchJson } from '@/lib/http';

type AutoLockConfig = {
  enabled: boolean;
  duration: number;
};

const DEFAULT_CONFIG: AutoLockConfig = { enabled: true, duration: 15 };
const DURATION_OPTIONS = [5, 10, 15, 20, 30, 60];
const AUTO_LOCK_CONFIG_EVENT = 'vigitemp:auto-lock-config-changed';

function readLocalConfig(): AutoLockConfig {
  try {
    if (typeof window === 'undefined') return DEFAULT_CONFIG;
    const stored = window.localStorage.getItem('autoLockConfig');
    if (!stored) return DEFAULT_CONFIG;
    const parsed = JSON.parse(stored) as Partial<AutoLockConfig>;
    return {
      enabled: typeof parsed.enabled === 'boolean' ? parsed.enabled : DEFAULT_CONFIG.enabled,
      duration: typeof parsed.duration === 'number' ? parsed.duration : DEFAULT_CONFIG.duration,
    };
  } catch (error) {
    console.error('Erreur lors du chargement de la config:', error);
    return DEFAULT_CONFIG;
  }
}

function persistLocalConfig(config: AutoLockConfig) {
  window.localStorage.setItem('autoLockConfig', JSON.stringify(config));
  window.dispatchEvent(new CustomEvent(AUTO_LOCK_CONFIG_EVENT, { detail: config }));
}

export function AutoLockSettingsCard() {
  const t = useTranslations('adminSettings');
  const [autoLockConfig, setAutoLockConfig] = useState<AutoLockConfig>(() => readLocalConfig());

  const autoLockEnabled = autoLockConfig.enabled;
  const autoLockDuration = autoLockConfig.duration;

  useEffect(() => {
    let cancelled = false;

    getJson<AutoLockConfig>('/api/parametres/auto-lock')
      .then((config) => {
        if (cancelled) return;
        setAutoLockConfig(config);
        persistLocalConfig(config);
      })
      .catch((error) => {
        console.error('Erreur lors du chargement de la config auto-lock:', error);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const saveAutoLockConfig = async (config: AutoLockConfig) => {
    const savedConfig = await patchJson<AutoLockConfig>('/api/parametres/auto-lock', config);
    setAutoLockConfig(savedConfig);
    persistLocalConfig(savedConfig);
    return savedConfig;
  };

  const handleAutoLockToggle = async (enabled: boolean) => {
    const config = { enabled, duration: autoLockDuration };
    setAutoLockConfig(config);
    try {
      const savedConfig = await saveAutoLockConfig(config);
      toast.success(
        savedConfig.enabled
          ? t('security.toast.enabled', { minutes: savedConfig.duration })
          : t('security.toast.disabled')
      );
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la config auto-lock:', error);
      setAutoLockConfig(autoLockConfig);
      toast.error(t('security.toast.update_error'));
    }
  };

  const handleAutoLockDurationChange = async (duration: string) => {
    const durationNum = parseInt(duration, 10);
    const config = { enabled: autoLockEnabled, duration: durationNum };
    setAutoLockConfig(config);
    try {
      const savedConfig = await saveAutoLockConfig(config);
      toast.success(t('security.toast.duration', { minutes: savedConfig.duration }));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la config auto-lock:', error);
      setAutoLockConfig(autoLockConfig);
      toast.error(t('security.toast.update_error'));
    }
  };

  return (
    <Card className="border-border/60 bg-white dark:bg-popover dark:text-popover-foreground">
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
                {DURATION_OPTIONS.map((minutes) => (
                  <SelectItem key={minutes} value={minutes.toString()}>
                    {t(`security.duration_options.${minutes}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
