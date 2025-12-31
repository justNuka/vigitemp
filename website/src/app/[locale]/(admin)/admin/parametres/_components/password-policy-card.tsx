'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PasswordRulesSettings } from '@/components/password-rules-settings';

export function PasswordPolicyCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Règles de mot de passe</CardTitle>
        <CardDescription>Configurer les exigences de sécurité pour les mots de passe</CardDescription>
      </CardHeader>
      <CardContent>
        <PasswordRulesSettings />
      </CardContent>
    </Card>
  );
}

