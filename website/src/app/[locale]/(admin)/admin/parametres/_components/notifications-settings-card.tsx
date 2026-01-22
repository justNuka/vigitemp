'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function NotificationsSettingsCard() {
  return (
    <Card className="bg-white/50 dark:bg-card">
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>Gérer les préférences de notifications</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">Configuration avancée des notifications à venir</p>
      </CardContent>
    </Card>
  );
}
