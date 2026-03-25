'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PasswordRulesSettings } from '@/components/password-rules-settings';
import { useTranslations } from 'next-intl';

export function PasswordPolicyCard() {
  const t = useTranslations('adminSettings');

  return (
    <Card className="border-border/60 bg-white dark:bg-card">
      <CardHeader>
        <CardTitle>{t('password_policy.title')}</CardTitle>
        <CardDescription>{t('password_policy.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <PasswordRulesSettings />
      </CardContent>
    </Card>
  );
}
