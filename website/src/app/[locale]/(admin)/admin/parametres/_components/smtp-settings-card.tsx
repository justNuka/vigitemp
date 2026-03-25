'use client';

import { AlertTriangle, Mail } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslations } from 'next-intl';

type SmtpSettingsCardProps = {
  onOpenSmtpModal: () => void;
};

export function SmtpSettingsCard({ onOpenSmtpModal }: SmtpSettingsCardProps) {
  const t = useTranslations('adminSettings');

  return (
    <Card className="border-border/60 bg-white dark:bg-card mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          {t('smtp.title')}
        </CardTitle>
        <CardDescription>{t('smtp.description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="border-amber-200 bg-amber-50 text-amber-900">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription>
            <strong>{t('smtp.warning_label')}</strong> {t('smtp.warning_body')}
          </AlertDescription>
        </Alert>

        <Button onClick={onOpenSmtpModal} variant="default" className="w-full sm:w-auto">
          <Mail className="mr-2 h-4 w-4" />
          {t('smtp.configure_button')}
        </Button>
      </CardContent>
    </Card>
  );
}
