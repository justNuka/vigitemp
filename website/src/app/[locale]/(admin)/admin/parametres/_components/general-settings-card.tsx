'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { SwitchWithLoading } from '@/components/ui/switch-with-loading';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  return (
    <Card className="bg-white/50 dark:bg-card">
      <CardHeader>
        <CardTitle>Général</CardTitle>
        <CardDescription>Paramètres généraux de l'application</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {settings.map((setting) => (
          <div key={setting.key} className="flex items-center justify-between">
            <Label htmlFor={setting.key} className="flex-1">
              {setting.label}
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
                  <SelectItem value="5">5 secondes</SelectItem>
                  <SelectItem value="10">10 secondes</SelectItem>
                  <SelectItem value="30">30 secondes</SelectItem>
                  <SelectItem value="60">1 minute</SelectItem>
                  <SelectItem value="0">Manuel (désactivé)</SelectItem>
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
