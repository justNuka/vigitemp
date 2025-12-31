import { Suspense } from "react";
import { notFound } from "next/navigation";
import { FEATURE_FLAGS } from "@/lib/feature-flags";
import { DevModeBadge } from "@/components/dev-mode-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
// import { ServerSettings } from "../../../(admin)/admin/parametres/server-settings";
import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsPerfTestPage() {
  if (!FEATURE_FLAGS.enableTestPages) {
    notFound();
  }

  return (
    <div className="min-h-screen p-6 space-y-6">
      <DevModeBadge />
      
      <div className="max-w-4xl mx-auto">
        <div className="space-y-2 mb-8">
          <h1 className="text-3xl font-bold">Test de Performance - Paramètres</h1>
          <p className="text-muted-foreground">
            Page de test avec Cache Components pour mesurer les performances de la page /settings
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Instructions de test</CardTitle>
            <CardDescription>
              Comment tester les performances avec Cache Components
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">1. Première charge (Cold Cache)</h3>
              <p className="text-sm text-muted-foreground">
                Ouvrir DevTools Network, vider le cache (Ctrl+Shift+Del), recharger la page.
                Noter le temps de chargement.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">2. Rechargements suivants (Warm Cache)</h3>
              <p className="text-sm text-muted-foreground">
                Recharger la page plusieurs fois (F5). Les données sont servies depuis le cache Next.js 16.
                Le temps devrait être 50-100x plus rapide (~20-60ms).
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">3. Comparer avec l'ancienne version</h3>
              <p className="text-sm text-muted-foreground">
                Renommer temporairement page.tsx et page-old.tsx pour tester la version client-only
                et comparer les performances.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Paramètres (Cached)</CardTitle>
            <CardDescription>
              Cache tag: "parametres-data"
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<Skeleton className="h-40 w-full" />}>
              <SettingsDisplay />
            </Suspense>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Cache Tags utilisés</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge>parametres-data</Badge>
              <span className="text-sm text-muted-foreground">
                Configuration complète de l'application
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

async function SettingsDisplay() {
  // const settings = await ServerSettings();
  const settings: any[] = [];
  const duration = 0;

  return (
    <div className="space-y-2">
      <div className="space-y-3">
        {settings.map((setting) => (
          <div key={setting.key} className="flex items-center justify-between p-3 bg-muted rounded">
            <div className="flex-1">
              <p className="font-medium text-sm">{setting.label}</p>
              <p className="text-xs text-muted-foreground">{setting.key}</p>
            </div>
            <Badge variant={setting.value === "true" ? "default" : "secondary"}>
              {setting.value === "true" ? "Activé" : setting.value === "false" ? "Désactivé" : setting.value}
            </Badge>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground pt-4 border-t">
        {settings.length} paramètre{settings.length > 1 ? "s" : ""} chargé{settings.length > 1 ? "s" : ""} en <strong>{duration}ms</strong>
      </p>
    </div>
  );
}
