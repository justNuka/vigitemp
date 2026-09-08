'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
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

function sameConfig(left: AutoLockConfig, right: AutoLockConfig) {
  return left.enabled === right.enabled && left.duration === right.duration;
}

export function AutoLockSettingsCard() {
  const t = useTranslations('adminSettings');
  const initialConfig = readLocalConfig();
  const [savedConfig, setSavedConfig] = useState<AutoLockConfig>(initialConfig);
  const [draftConfig, setDraftConfig] = useState<AutoLockConfig>(initialConfig);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    getJson<AutoLockConfig>('/api/parametres/auto-lock')
      .then((config) => {
        if (cancelled) return;
        setSavedConfig(config);
        setDraftConfig(config);
        persistLocalConfig(config);
      })
      .catch((error) => {
        console.error('Erreur lors du chargement de la config auto-lock:', error);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const hasChanges = !sameConfig(savedConfig, draftConfig);

  const handleSave = async () => {
    if (!hasChanges || isSaving) return;
    setIsSaving(true);
    try {
      const saved = await patchJson<AutoLockConfig>('/api/parametres/auto-lock', draftConfig);
      setSavedConfig(saved);
      setDraftConfig(saved);
      persistLocalConfig(saved);
      toast.success(
        saved.enabled
          ? t('security.toast.enabled', { minutes: saved.duration })
          : t('security.toast.disabled')
      );
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la config auto-lock:', error);
      toast.error(t('security.toast.update_error'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setDraftConfig(savedConfig);
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
          <SwitchWithLoading
            id="autoLock"
            checked={draftConfig.enabled}
            onCheckedChange={(enabled) => setDraftConfig((current) => ({ ...current, enabled }))}
            isLoading={isLoading || isSaving}
          />
        </div>

        {draftConfig.enabled && (
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Label htmlFor="autoLockDuration" className="font-medium">
                {t('security.inactivity.label')}
              </Label>
              <p className="text-sm text-muted-foreground mt-1">{t('security.inactivity.helper')}</p>
            </div>
            <Select
              value={draftConfig.duration.toString()}
              onValueChange={(duration) =>
                setDraftConfig((current) => ({ ...current, duration: parseInt(duration, 10) }))
              }
              disabled={isLoading || isSaving}
            >
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

        {hasChanges ? (
          <div className="flex justify-end gap-2 border-t pt-4">
            <Button type="button" variant="outline" onClick={handleCancel} disabled={isSaving}>
              {t('pending_changes.cancel')}
            </Button>
            <Button type="button" onClick={handleSave} disabled={isSaving}>
              {t('pending_changes.save')}
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
