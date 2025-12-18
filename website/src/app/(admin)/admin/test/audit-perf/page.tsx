import { Suspense } from "react";
import { notFound } from "next/navigation";
import { FEATURE_FLAGS } from "@/lib/feature-flags";
import { DevModeBadge } from "@/components/dev-mode-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
// import { ServerAuditLogs, ServerAuditStats } from "../../audit/server-audit-logs";
import { Skeleton } from "@/components/ui/skeleton";

export default function AuditPerfTestPage() {
  if (!FEATURE_FLAGS.enableTestPages) {
    notFound();
  }

  return (
    <div className="min-h-screen p-6 space-y-6">
      <DevModeBadge />
      
      <div className="max-w-4xl mx-auto">
        <div className="space-y-2 mb-8">
          <h1 className="text-3xl font-bold">Test de Performance - Audit</h1>
          <p className="text-muted-foreground">
            Page de test avec Cache Components pour mesurer les performances de la page /audit
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
                Cache tag: "audit-stats"
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<Skeleton className="h-20 w-full" />}>
                <AuditStatsDisplay />
              </Suspense>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Logs récents (Cached)</CardTitle>
              <CardDescription>
                Cache tag: "audit-logs"
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<Skeleton className="h-20 w-full" />}>
                <AuditLogsDisplay />
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
              <Badge>audit-logs</Badge>
              <span className="text-sm text-muted-foreground">
                Journal d'audit complet (100 derniers événements)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Badge>audit-stats</Badge>
              <span className="text-sm text-muted-foreground">
                Statistiques (total, dernières 24h)
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

async function AuditStatsDisplay() {
  const start = Date.now();
  // const stats = await ServerAuditStats();
  const stats = { total: 0, last24h: 0 };
  const duration = Date.now() - start;

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-muted-foreground">Total événements</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Dernières 24h</p>
          <p className="text-2xl font-bold text-primary">{stats.last24h}</p>
        </div>
      </div>
      <p className="text-xs text-muted-foreground pt-4 border-t">
        Chargé en <strong>{duration}ms</strong>
      </p>
    </div>
  );
}

async function AuditLogsDisplay() {
  const start = Date.now();
  // const logs = await ServerAuditLogs(10);
  const logs: any[] = [];
  const duration = Date.now() - start;

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">
        {logs.length} événement{logs.length > 1 ? "s" : ""} récent{logs.length > 1 ? "s" : ""}
      </p>
      <div className="space-y-1 max-h-40 overflow-y-auto">
        {logs.map((log) => (
          <div key={log.id} className="text-xs p-2 bg-muted rounded">
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium">{log.action}</span>
              <span className="text-muted-foreground">
                {log.userId || "Système"}
              </span>
            </div>
            {log.details && (
              <p className="text-muted-foreground truncate">{log.details}</p>
            )}
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground pt-4 border-t">
        Chargé en <strong>{duration}ms</strong>
      </p>
    </div>
  );
}
