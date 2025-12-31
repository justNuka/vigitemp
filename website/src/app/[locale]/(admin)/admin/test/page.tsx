import { notFound } from "next/navigation";
import { FEATURE_FLAGS } from "@/lib/feature-flags";
import { DevModeBadge } from "@/components/dev-mode-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Beaker, Zap, Database, Clock } from "lucide-react";
import { Link } from "@/i18n/navigation";

export default function TestIndexPage() {
  // Page de test uniquement disponible en dev
  if (!FEATURE_FLAGS.enableTestPages) {
    notFound();
  }

  const perfTests = [
    {
      title: "Surveillance",
      description: "Capteurs et statistiques",
      href: "/admin/test/surveillance-perf",
      tags: ["sensors-data", "surveillance-stats"],
    },
    {
      title: "Alarmes",
      description: "Liste et statistiques d'alarmes",
      href: "/admin/test/alarms-perf",
      tags: ["alarms-data", "alarms-stats"],
    },
    {
      title: "Audit",
      description: "Journal et événements",
      href: "/admin/test/audit-perf",
      tags: ["audit-logs", "audit-stats"],
    },
    {
      title: "Paramètres",
      description: "Configuration système",
      href: "/admin/test/settings-perf",
      tags: ["parametres-data"],
    },
    {
      title: "Utilisateurs",
      description: "Gestion des utilisateurs",
      href: "/admin/test/users-perf",
      tags: ["users-data"],
    },
  ];

  const apiTools = [
    {
      title: "API Revalidate",
      description: "Endpoint pour invalider manuellement le cache",
      href: "/api/revalidate",
      icon: Database,
      features: [
        "GET : Invalide tous les caches dashboard",
        "POST : Invalide un tag spécifique",
        "Disponible uniquement en dev",
      ],
    },
  ];

  return (
    <div className="flex flex-col min-h-full p-4 md:p-6 space-y-8">
      <DevModeBadge />

      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <Beaker className="h-8 w-8 text-warning" />
          <h1 className="text-3xl font-bold tracking-tight">Pages de Test</h1>
        </div>
        <p className="text-muted-foreground">
          Outils de développement et tests de performance - Désactivés automatiquement en production
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            Tests de Performance
          </h2>
          <p className="text-muted-foreground mb-4">
            Pages de test pour mesurer l'impact du cache Next.js 16 sur chaque section.
            Comparez les temps avant/après optimisation (~20-50ms vs ~1000-2000ms).
          </p>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {perfTests.map((test) => (
              <Card key={test.href}>
                <CardHeader>
                  <CardTitle className="text-base">{test.title}</CardTitle>
                  <CardDescription className="text-xs">{test.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-1">
                    {test.tags.map((tag) => (
                      <span key={tag} className="text-xs px-2 py-1 bg-muted rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <Link href={test.href}>
                    <Button className="w-full" size="sm">
                      <Zap className="mr-2 h-4 w-4" />
                      Tester
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <Database className="h-6 w-6 text-primary" />
            Outils API
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {apiTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Card key={tool.href} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icon className="h-5 w-5 text-primary" />
                      {tool.title}
                    </CardTitle>
                    <CardDescription>{tool.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-2 text-sm">
                      {tool.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Link href={tool.href}>
                      <Button className="w-full">
                        Accéder à {tool.title}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      <Card className="border-warning/50 bg-warning/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-warning">
            <Clock className="h-5 w-5" />
            Comment utiliser les tests de performance ?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <h4 className="font-semibold mb-1">1. Mesurer Cold Cache (première charge)</h4>
            <p className="text-muted-foreground">
              Ouvrir DevTools → Network, vider le cache (Ctrl+Shift+Del), recharger.
              Noter le temps (~1000-2000ms sans cache).
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">2. Mesurer Warm Cache (cache actif)</h4>
            <p className="text-muted-foreground">
              Recharger plusieurs fois (F5). Le cache Next.js 16 sert les données instantanément (~20-50ms).
              Amélioration de 50-100x.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">3. Comparer avec l'ancienne version</h4>
            <p className="text-muted-foreground">
              Dans chaque dossier de page, renommer page.tsx et page-old.tsx pour tester
              la version client-only (sans optimisation).
            </p>
          </div>
          <div className="pt-2 border-t">
            <h4 className="font-semibold mb-1">Build test complet</h4>
            <code className="block bg-muted p-2 rounded mt-1">
              npm run build:test && npm run start:test
            </code>
            <p className="text-muted-foreground mt-1">
              Mesurer les temps réels de production (~5-15ms avec cache).
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
