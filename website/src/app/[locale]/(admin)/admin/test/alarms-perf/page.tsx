import { Suspense } from "react";
import { notFound } from "next/navigation";
import { FEATURE_FLAGS } from "@/lib/feature-flags";
import { DevModeBadge } from "@/components/dev-mode-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
// import { ServerAlarms, ServerAlarmStats } from "../../alarmes/server-alarms";
import { Skeleton } from "@/components/ui/skeleton";

export default function AlarmsPerfTestPage() {
  if (!FEATURE_FLAGS.enableTestPages) {
    notFound();
  }

  return (
    <div className="min-h-screen p-6 space-y-6">
      <DevModeBadge />
      
      <div className="max-w-4xl mx-auto">
        <div className="space-y-2 mb-8">
          <h1 className="text-3xl font-bold">Test de Performance - Alarmes</h1>
          <p className="text-muted-foreground">
            Page de test avec Cache Components pour mesurer les performances de la page /alarms
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

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Statistiques (Cached)</CardTitle>
              <CardDescription>
                Cache tag: "alarms-stats"
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<Skeleton className="h-20 w-full" />}>
                <AlarmStatsDisplay />
              </Suspense>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Liste d'alarmes (Cached)</CardTitle>
              <CardDescription>
                Cache tag: "alarms-data"
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<Skeleton className="h-20 w-full" />}>
                <AlarmsListDisplay />
              </Suspense>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Cache Tags utilisés</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge>alarms-data</Badge>
              <span className="text-sm text-muted-foreground">
                Liste complète des alarmes
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Badge>alarms-stats</Badge>
              <span className="text-sm text-muted-foreground">
                Statistiques agrégées (compteurs)
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

async function AlarmStatsDisplay() {
  // const stats = await ServerAlarmStats();
  const stats = { active: 0, acknowledged: 0, resolved: 0, total: 0 };
  const duration = 0;

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-muted-foreground">Actives</p>
          <p className="text-2xl font-bold text-destructive">{stats.active}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Acquittées</p>
          <p className="text-2xl font-bold">{stats.acknowledged}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Résolues</p>
          <p className="text-2xl font-bold text-success">{stats.resolved}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Total</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
      </div>
      <p className="text-xs text-muted-foreground pt-4 border-t">
        Chargé en <strong>{duration}ms</strong>
      </p>
    </div>
  );
}

async function AlarmsListDisplay() {
  // const alarms = await ServerAlarms();
  const alarms: any[] = [];
  const duration = 0;

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">
        {alarms.length} alarme{alarms.length > 1 ? "s" : ""} chargée{alarms.length > 1 ? "s" : ""}
      </p>
      <div className="space-y-1 max-h-40 overflow-y-auto">
        {alarms.slice(0, 5).map((alarm) => (
          <div key={alarm.id} className="text-xs p-2 bg-muted rounded flex items-center justify-between">
            <span className="font-medium">{alarm.sensor.name}</span>
            <Badge variant={alarm.status === "active" ? "destructive" : "secondary"} className="text-xs">
              {alarm.status}
            </Badge>
          </div>
        ))}
        {alarms.length > 5 && (
          <p className="text-xs text-muted-foreground text-center pt-2">
            + {alarms.length - 5} autres
          </p>
        )}
      </div>
      <p className="text-xs text-muted-foreground pt-4 border-t">
        Chargé en <strong>{duration}ms</strong>
      </p>
    </div>
  );
}
