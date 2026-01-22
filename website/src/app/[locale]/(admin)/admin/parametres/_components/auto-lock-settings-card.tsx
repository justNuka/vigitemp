'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { SwitchWithLoading } from '@/components/ui/switch-with-loading';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function AutoLockSettingsCard() {
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
      enabled ? `Verrouillage automatique activé (${autoLockDuration} min)` : 'Verrouillage automatique désactivé'
    );
    window.dispatchEvent(new Event('storage'));
  };

  const handleAutoLockDurationChange = (duration: string) => {
    const durationNum = parseInt(duration, 10);
    const config = { enabled: autoLockEnabled, duration: durationNum };
    setAutoLockConfig(config);
    localStorage.setItem('autoLockConfig', JSON.stringify(config));
    toast.success(`Durée d'inactivité définie à ${durationNum} minutes`);
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <Card className="bg-white/60 dark:bg-card">
      <CardHeader>
        <CardTitle>Sécurité</CardTitle>
        <CardDescription>Paramètres de sécurité et de session</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <Label htmlFor="autoLock" className="font-medium">
              Verrouillage automatique
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              Déconnexion automatique après une période d&apos;inactivité
            </p>
          </div>
          <SwitchWithLoading id="autoLock" checked={autoLockEnabled} onCheckedChange={handleAutoLockToggle} />
        </div>

        {autoLockEnabled && (
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Label htmlFor="autoLockDuration" className="font-medium">
                Durée d&apos;inactivité
              </Label>
              <p className="text-sm text-muted-foreground mt-1">Temps avant déconnexion automatique</p>
            </div>
            <Select value={autoLockDuration.toString()} onValueChange={handleAutoLockDurationChange}>
              <SelectTrigger className="w-45">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 minutes</SelectItem>
                <SelectItem value="10">10 minutes</SelectItem>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">1 heure</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
