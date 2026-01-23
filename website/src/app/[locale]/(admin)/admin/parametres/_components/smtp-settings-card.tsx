'use client';

import { AlertTriangle, Mail } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type SmtpSettingsCardProps = {
  onOpenSmtpModal: () => void;
};

export function SmtpSettingsCard({ onOpenSmtpModal }: SmtpSettingsCardProps) {
  return (
    <Card className="bg-white/50 dark:bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Configuration Email
        </CardTitle>
        <CardDescription>Configurer le serveur SMTP pour les notifications par email</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="border-amber-200 bg-amber-50 text-amber-900">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription>
            <strong>Attention:</strong> Une mauvaise configuration SMTP peut empêcher l&apos;envoi des notifications
            d&apos;alarme par email. Vérifiez les paramètres avec soin et testez après toute modification.
          </AlertDescription>
        </Alert>

        <Button onClick={onOpenSmtpModal} variant="default" className="w-full sm:w-auto">
          <Mail className="mr-2 h-4 w-4" />
          Configurer SMTP
        </Button>
      </CardContent>
    </Card>
  );
}
