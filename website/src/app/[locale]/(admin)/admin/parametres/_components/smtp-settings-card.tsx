'use client';

import { AlertTriangle, BookOpen, Mail } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslations } from 'next-intl';

type SmtpSettingsCardProps = {
  onOpenSmtpModal: () => void;
  onOpenSmtpGuide: () => void;
};

export function SmtpSettingsCard({ onOpenSmtpModal, onOpenSmtpGuide }: SmtpSettingsCardProps) {
  const t = useTranslations('adminSettings');

  return (
    <Card className="border-border/60 bg-white dark:bg-popover dark:text-popover-foreground mb-8">
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

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Button onClick={onOpenSmtpModal} variant="default" className="w-full sm:w-auto">
            <Mail className="mr-2 h-4 w-4" />
            {t('smtp.configure_button')}
          </Button>
          <Button onClick={onOpenSmtpGuide} variant="outline" className="w-full sm:w-auto">
            <BookOpen className="mr-2 h-4 w-4" />
            {t('smtp.guide_button')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
