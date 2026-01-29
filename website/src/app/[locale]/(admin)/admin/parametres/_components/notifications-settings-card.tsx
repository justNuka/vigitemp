'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslations } from 'next-intl';

export function NotificationsSettingsCard() {
  const t = useTranslations('adminSettings');

  return (
    <Card className="bg-white/50 dark:bg-card">
      <CardHeader>
        <CardTitle>{t('notifications.title')}</CardTitle>
        <CardDescription>{t('notifications.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{t('notifications.coming_soon')}</p>
      </CardContent>
    </Card>
  );
}
