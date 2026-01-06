# Auth / permissions / licence — stratégie de “gating” (UX + architecture)

Ce document compare :
- la recommandation (type SaaS) que tu as reçue
- et ce que je recommande pour Vigitemp (Next.js App Router + TanStack Query + sidebars persistantes).

L’objectif : une UX “logiciel” (AppShell stable, pas de flash), sans tomber dans l’excès inverse (ne jamais re-vérifier).

---

## TL;DR (position)

Oui : **ne pas bloquer l’écran à chaque navigation**.  
Oui : faire un **gating “hard”** au chargement initial (auth + licence + rôle global).  
Oui : faire des **gates “soft” par page** (accès refusé inline, masquer actions).  
Mais : garder une “source de vérité” unique côté serveur et **revalider intelligemment** (focus / interval / changement de contexte / 401).

---

## Définitions (terminologie)

- **Hard gate** : bloque le rendu tant que l’app ne sait pas si l’utilisateur a le droit d’être là.
  - Ex: session inconnue, licence inconnue, rôle global inconnu.
- **Soft gate** : l’app est “ready”, mais une zone/page/action peut être refusée.
  - Ex: page admin -> “Accès refusé”, boutons désactivés, ou redirection silencieuse.
- **Revalidation** : on rafraîchit session/perms/licence **en arrière-plan** à un moment choisi.

---

## Pourquoi “bloquer partout” est une mauvaise UX

Bloquer à chaque route donne :
- “flash” visuel / page qui clignote,
- sidebar/header qui semblent “redémarrer”,
- impression d’instabilité (même si techniquement correct).

Pour une app type dashboard (Vigitemp), le bon pattern est une **AppShell persistante** + un état d’accès en cache.

---

## Pourquoi “ne jamais re-vérifier” est risqué

Même en web “app-like”, il faut revalider parce que :
- token/cookie peut expirer,
- droits peuvent changer (admin -> user),
- licence peut expirer/être renouvelée,
- changement de site/client/projet (si un jour multi-tenant),
- retour après inactivité longue.

Le compromis : **revalidation intelligente**, pas à chaque clic.

---

## Le pattern SaaS recommandé (et mon avis)

### 1) Un hard gate au niveau “app” (une fois)

Ce que ChatGPT décrit est très standard et bon :
- au 1er chargement (ou refresh F5), on fait un check global : auth/licence/rôle global
- loader plein écran uniquement à ce moment
- ensuite on se base sur le cache client tant qu’il est “valide”

Mon avis : 100% OK, et c’est cohérent avec notre doc `website/docs/LOADING_CONVENTIONS.md`.

### 2) Soft gate par page / feature

Très bon aussi :
- afficher “Accès refusé” inline
- masquer actions non permises
- redirection silencieuse dans certains cas (ex: /admin)

Mon avis : OK, mais **attention** :
- “soft” côté UI n’est pas une sécurité : les API doivent rester protégées côté serveur.

### 3) Re-vérifier seulement quand ça a du sens

Je suis d’accord. Pour Vigitemp, les bons triggers :
- focus tab (retour sur onglet)
- interval (toutes les 5–15 min)
- 401 sur une requête (signal fort : session expirée)
- changement de contexte (plus tard : site/client)

---

## Recommandation Vigitemp (adaptée à notre code actuel)

### A) Créer un endpoint “session” unique (source de vérité)

But : 1 appel qui renvoie tout ce qui est nécessaire au gating :

- user (id, username, profile, etc.)
- rôle global (admin/user)
- licence (valid, tier, expiresAt… quand ça existera)
- permissions “flat” (strings), ou structure claire
- `version` de session (pour invalider le cache si besoin)

Exemple (snippet, non intégré) :

```ts
// app/api/session/route.ts
import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth.server";

export async function GET(req: Request) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ ok: false, reason: "UNAUTHENTICATED" }, { status: 401 });
  }

  return NextResponse.json({
    ok: true,
    version: session.version,
    user: session.user,
    license: session.license,
    perms: session.perms ?? [],
  });
}
```

Note : aujourd’hui vous avez `/api/me`. À terme, `/api/session` peut remplacer `/api/me` (ou `/api/me` devient un sous-ensemble).

### B) Stocker la session côté client via TanStack Query

On a déjà TanStack Query dans le projet, donc inutile de recréer un store maison.

Exemple (snippet, non intégré) :

```tsx
// hooks/useSession.ts
import { useQuery } from "@tanstack/react-query";
import { getJson, isUnauthorizedError } from "@/lib/http";

export type SessionDto = {
  version: number | string;
  user: any;
  license: any;
  perms: string[];
};

export function useSession() {
  return useQuery({
    queryKey: ["session"],
    queryFn: () => getJson<SessionDto>("/api/session"),
    retry: false,
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: true,
    refetchInterval: (q) => (isUnauthorizedError(q.state.error) ? false : 10 * 60_000),
  });
}
```

### C) Hard gate au niveau layout “AppShell”

Principe : le layout qui monte la sidebar/header (AppShell) fait le hard gate une fois.

Pseudo :
- `session.status === loading` -> loader plein écran
- `401` -> redirection vers `/login`
- `ready` -> rendu normal

Important : “app-like” = sidebar/header restent montés et stables, on ne les démonte pas à chaque route.

### D) Soft gate par page

Exemple admin :
- si pas admin -> soit “Accès refusé” inline, soit redirect vers `/`.
- pas de loader plein écran (session déjà connue).

### E) Revalidation et “anti-spam 401”

Règle :
- si une requête retourne 401, on marque la session “invalid” et on stoppe les pollings.

Dans Vigitemp, on a déjà commencé ce travail :
- les `refetchInterval` stoppent sur 401
- le SSE `/api/alarmes/stream` ne démarre pas sur routes publiques et se coupe au 1er `error`

Ce qu’il restera à faire plus tard :
- un mécanisme central “session invalidated” (ex: `queryClient.setQueryData(["session"], ...)` + navigation vers login)

---

## “LazyMotion” existe encore ?

Oui dans `motion/react` (Motion v12) : on l’utilise déjà dans `PageTransitionWrapper`.

Position recommandée :
- **oui** à `LazyMotion` (bundle/features plus légères),
- **oui** à un wrapper (centralise le pattern et évite la duplication).

---

## Sécurité : point essentiel à ne pas confondre

- Soft gate UI = UX + ergonomie.
- La vraie sécurité = **serveur** :
  - chaque route API sensible doit vérifier auth + droits.
  - ne jamais se baser sur le client.

---

## Proposition de roadmap (pragmatique)

1) Introduire `/api/session` (auth + rôle global) en gardant `/api/me` temporairement.
2) Remplacer les usages multiples de `/api/me` par `useSession()` (TanStack Query).
3) Ajouter un `AuthGate` dans les layouts AppShell (dashboard + admin) :
   - loader plein écran uniquement si `session` inconnue au démarrage
   - redirect login si 401
4) Définir un format de permissions (liste de strings stable) + conventions (naming, scopes).
5) Ajouter licence plus tard sans casser l’API (champ `license`).

