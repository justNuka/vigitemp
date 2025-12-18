import { Suspense } from "react";
import { notFound } from "next/navigation";
import { FEATURE_FLAGS } from "@/lib/feature-flags";
import { DevModeBadge } from "@/components/dev-mode-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
// import { ServerUsers } from "../../../(admin)/admin/utilisateurs/server-users";
import { Skeleton } from "@/components/ui/skeleton";
import { Shield, User as UserIcon } from "lucide-react";

export default function UsersPerfTestPage() {
  if (!FEATURE_FLAGS.enableTestPages) {
    notFound();
  }

  return (
    <div className="min-h-screen p-6 space-y-6">
      <DevModeBadge />
      
      <div className="max-w-4xl mx-auto">
        <div className="space-y-2 mb-8">
          <h1 className="text-3xl font-bold">Test de Performance - Utilisateurs</h1>
          <p className="text-muted-foreground">
            Page de test avec Cache Components pour mesurer les performances de la page /users
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
            <CardTitle>Utilisateurs (Cached)</CardTitle>
            <CardDescription>
              Cache tag: "users-data"
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<Skeleton className="h-40 w-full" />}>
              <UsersDisplay />
            </Suspense>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Cache Tags utilisés</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge>users-data</Badge>
              <span className="text-sm text-muted-foreground">
                Liste complète des utilisateurs avec leurs rôles
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

async function UsersDisplay() {
  const start = Date.now();
  // const users = await ServerUsers();
  const users: any[] = [];
  const duration = Date.now() - start;

  const adminCount = users.filter(u => u.role === "admin").length;
  const activeCount = users.filter(u => u.isActive).length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div className="text-center p-3 bg-muted rounded">
          <p className="text-muted-foreground mb-1">Total</p>
          <p className="text-2xl font-bold">{users.length}</p>
        </div>
        <div className="text-center p-3 bg-muted rounded">
          <p className="text-muted-foreground mb-1">Admins</p>
          <p className="text-2xl font-bold">{adminCount}</p>
        </div>
        <div className="text-center p-3 bg-muted rounded">
          <p className="text-muted-foreground mb-1">Actifs</p>
          <p className="text-2xl font-bold">{activeCount}</p>
        </div>
      </div>

      <div className="space-y-2">
        {users.slice(0, 6).map((user) => (
          <div key={user.id} className="flex items-center justify-between p-3 bg-muted rounded">
            <div className="flex-1">
              <p className="font-medium text-sm">{user.displayName}</p>
              <p className="text-xs text-muted-foreground">{user.username}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={user.role === "admin" ? "default" : "secondary"} className="gap-1">
                {user.role === "admin" ? <Shield className="h-3 w-3" /> : <UserIcon className="h-3 w-3" />}
                {user.role === "admin" ? "Admin" : "User"}
              </Badge>
              <Badge variant={user.isActive ? "default" : "secondary"}>
                {user.isActive ? "Actif" : "Inactif"}
              </Badge>
            </div>
          </div>
        ))}
        {users.length > 6 && (
          <p className="text-xs text-muted-foreground text-center pt-2">
            + {users.length - 6} autre{users.length - 6 > 1 ? "s" : ""}
          </p>
        )}
      </div>

      <p className="text-xs text-muted-foreground pt-4 border-t">
        {users.length} utilisateur{users.length > 1 ? "s" : ""} chargé{users.length > 1 ? "s" : ""} en <strong>{duration}ms</strong>
      </p>
    </div>
  );
}
