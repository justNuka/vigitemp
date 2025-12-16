"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { AlertCircle, CheckCircle2, Mail } from "lucide-react";

interface SMTPConfig {
  host: string;
  port: string;
  user: string;
  password: string;
  from: string;
  enabled: boolean;
}

export default function SMTPSettingsPage() {
  const [config, setConfig] = useState<SMTPConfig>({
    host: "",
    port: "587",
    user: "",
    password: "",
    from: "noreply@vigitemp.com",
    enabled: false,
  });
  const [testEmail, setTestEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  // Load current settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/settings");
      if (!response.ok) throw new Error("Failed to load settings");

      const settings = await response.json();

      const emailSettings = settings.reduce(
        (acc: Record<string, string>, setting: any) => {
          if (setting.section === "SECURITE_EMAIL") {
            acc[setting.motCle] = setting.value;
          }
          return acc;
        },
        {}
      );

      setConfig({
        host: emailSettings.SMTP_SERVEUR || "",
        port: emailSettings.SMTP_PORT || "587",
        user: emailSettings.SMTP_UTILISATEUR || "",
        password: emailSettings.SMTP_MOT_DE_PASSE || "",
        from: emailSettings.SMTP_EXPEDITEUR || "noreply@vigitemp.com",
        enabled: emailSettings.SMTP_ACTIVATION === "1" || emailSettings.SMTP_ACTIVATION === "true",
      });
    } catch (error) {
      console.error("Failed to load settings:", error);
      toast.error("Impossible de charger les paramètres");
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setIsSaving(true);

      const updates = [
        { section: "SECURITE_EMAIL", motCle: "SMTP_SERVEUR", value: config.host },
        { section: "SECURITE_EMAIL", motCle: "SMTP_PORT", value: config.port },
        { section: "SECURITE_EMAIL", motCle: "SMTP_UTILISATEUR", value: config.user },
        { section: "SECURITE_EMAIL", motCle: "SMTP_MOT_DE_PASSE", value: config.password },
        { section: "SECURITE_EMAIL", motCle: "SMTP_EXPEDITEUR", value: config.from },
        { section: "SECURITE_EMAIL", motCle: "SMTP_ACTIVATION", value: config.enabled ? "true" : "false" },
      ];

      for (const update of updates) {
        const response = await fetch("/api/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(update),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to save setting");
        }
      }

      toast.success("Paramètres SMTP sauvegardés");
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error(error instanceof Error ? error.message : "Erreur lors de la sauvegarde");
    } finally {
      setIsSaving(false);
    }
  };

  const sendTestEmail = async () => {
    if (!testEmail) {
      toast.error("Veuillez entrer une adresse email");
      return;
    }

    try {
      setIsTesting(true);
      const response = await fetch("/api/email/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toEmail: testEmail }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to send test email");
      }

      toast.success("Email de test envoyé");
      setTestEmail("");
    } catch (error) {
      console.error("Failed to send test email:", error);
      toast.error(error instanceof Error ? error.message : "Erreur lors de l'envoi");
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-2xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Configuration SMTP</h1>
          <p className="text-muted-foreground">Configurez les paramètres email pour la réinitialisation de mot de passe</p>
        </div>

        {/* Current Configuration Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Statut Actuel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {config.enabled ? (
                <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-green-700">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>Email système: <strong>Activé</strong></span>
                </div>
              ) : (
                <div className="flex items-center gap-2 rounded-lg bg-yellow-50 p-3 text-yellow-700">
                  <AlertCircle className="h-5 w-5" />
                  <span>Email système: <strong>Désactivé</strong></span>
                </div>
              )}
              {config.host && config.user && config.password && (
                <div className="text-sm text-muted-foreground">
                  Serveur: <strong>{config.host}</strong> (port {config.port})
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* SMTP Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Paramètres SMTP</CardTitle>
            <CardDescription>
              Entrez les informations de votre serveur SMTP. Pour alwaysdata, utilisez smtp-[user].alwaysdata.net avec le port 587.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="host">Serveur SMTP</Label>
              <Input
                id="host"
                placeholder="smtp-randommail18473.alwaysdata.net"
                value={config.host}
                onChange={(e) => setConfig({ ...config, host: e.target.value })}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Exemple: smtp-randommail18473.alwaysdata.net
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="port">Port SMTP</Label>
              <Input
                id="port"
                placeholder="587"
                value={config.port}
                onChange={(e) => setConfig({ ...config, port: e.target.value })}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Utiliser 587 pour TLS (alwaysdata), 465 pour SSL
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="user">Utilisateur SMTP</Label>
              <Input
                id="user"
                placeholder="randommail18473@alwaysdata.net"
                value={config.user}
                onChange={(e) => setConfig({ ...config, user: e.target.value })}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe SMTP</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={config.password}
                onChange={(e) => setConfig({ ...config, password: e.target.value })}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="from">Adresse expéditeur</Label>
              <Input
                id="from"
                placeholder="noreply@vigitemp.com"
                value={config.from}
                onChange={(e) => setConfig({ ...config, from: e.target.value })}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Adresse email affichée comme expéditeur des messages
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  id="enabled"
                  type="checkbox"
                  checked={config.enabled}
                  onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
                  disabled={isLoading}
                  className="h-4 w-4"
                />
                <Label htmlFor="enabled" className="font-normal">
                  Activer l'envoi d'emails
                </Label>
              </div>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Les paramètres seront stockés de manière chiffrée dans la base de données. Testez la configuration avant de l'utiliser en production.
              </AlertDescription>
            </Alert>

            <Button
              onClick={saveSettings}
              disabled={isSaving || isLoading}
              className="w-full"
            >
              {isSaving ? "Sauvegarde..." : "Enregistrer les paramètres"}
            </Button>
          </CardContent>
        </Card>

        {/* Test Email */}
        <Card>
          <CardHeader>
            <CardTitle>Tester la Configuration</CardTitle>
            <CardDescription>
              Envoyez un email de test pour vérifier que la configuration SMTP est correcte
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="testEmail">Adresse email de test</Label>
              <Input
                id="testEmail"
                type="email"
                placeholder="votre@email.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                disabled={isTesting || isLoading}
              />
            </div>

            {!config.host || !config.user || !config.password ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Veuillez d'abord remplir tous les paramètres SMTP
                </AlertDescription>
              </Alert>
            ) : (
              <Button
                onClick={sendTestEmail}
                disabled={isTesting || isLoading || !testEmail}
                className="w-full"
              >
                {isTesting ? "Envoi..." : "Envoyer email de test"}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Quick Setup Guide */}
        <Card>
          <CardHeader>
            <CardTitle>Guide d'installation rapide (alwaysdata)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-semibold">1. Paramètres SMTP:</p>
                <ul className="mt-2 space-y-1 ml-4 list-disc">
                  <li><strong>Serveur:</strong> smtp-randommail18473.alwaysdata.net</li>
                  <li><strong>Port:</strong> 587</li>
                  <li><strong>Utilisateur:</strong> randommail18473@alwaysdata.net</li>
                  <li><strong>Mot de passe:</strong> Password-123</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold">2. Après configuration:</p>
                <ul className="mt-2 space-y-1 ml-4 list-disc">
                  <li>Cliquez sur "Enregistrer les paramètres"</li>
                  <li>Testez avec un email de test</li>
                  <li>Vérifiez que vous recevez l'email</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold">3. Lors de l'installation:</p>
                <ul className="mt-2 space-y-1 ml-4 list-disc">
                  <li>L'installateur demandera ces paramètres client</li>
                  <li>Sauvegardez-les de manière sécurisée</li>
                  <li>Les paramètres seront stockés dans la base de données</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
