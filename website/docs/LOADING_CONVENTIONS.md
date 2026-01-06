# Conventions de chargement (UI/UX)

## Idée générale (à garder en tête)

- **Loader** = “Est-ce que j’ai le droit d’être ici / est-ce que l’app est prête ?”
- **Skeleton** = “Je charge des données que je vais afficher ici.”

Objectif : éviter les pages qui “clignotent”, réduire la charge cognitive, et rendre le comportement prévisible.

---

## 1) Auth / permissions / licence (gating)

**Loader bloquant obligatoire (plein écran / overlay)** quand on doit décider :

- authentification (session expirée, token absent)
- permissions / rôles (à venir)
- licence (à venir)

Règles :
- **pas de skeleton** (car on ne sait pas encore si on affichera la page)
- **aucun contenu sensible** ne doit être visible avant la décision
- loader sobre (spinner discret + texte optionnel : “Vérification des accès…”)

### Convention côté code (bases, même si pas final)

- Les effets globaux (SSE, polling, push, etc.) ne doivent **pas démarrer** sur les routes publiques (`/login`, `/reset-password`, `/force-password-change`).
- Les requêtes périodiques (React Query `refetchInterval`) doivent **s’arrêter** automatiquement si on reçoit une **401** (déconnecté).
- Les composants “page” doivent pouvoir être “gated” par un wrapper type `AuthGate` plus tard (permissions/licence).

---

## 2) Chargement initial d’une page

**Skeletons** au premier chargement pour :
- tables
- listes
- cards
- widgets KPI

Règles :
- le skeleton doit **reproduire la structure** réelle (ex: colonnes de table, layout de cards)
- animation légère (shimmer léger) ou statique
- éviter le “gros spinner au milieu” si le layout de la page est connu

---

## 3) Tables de données

Deux cas à distinguer :

### 3.1 Premier chargement
- skeleton de table (lignes + colonnes)
- pas d’état “page vide + spinner” si on peut afficher un cadre de table

### 3.2 Refetch / auto-refresh
- garder les données visibles
- indicateur discret (icône refresh, badge “mise à jour…”, ou spinner dans toolbar)
- **ne jamais ré-afficher un skeleton** sur un refetch

---

## 4) Cards / widgets KPI

- skeleton simple (barres, chiffres factices)
- pas d’animation lourde
- si refresh fréquent : garder l’ancienne valeur + petit indicateur

---

## 5) Listes (logs, messages, items)

- skeleton au premier load
- pagination / scroll infini :
  - skeleton **en bas de liste** uniquement
  - pas sur toute la page

---

## 6) CRUD (create / update / delete)

**Spinner local** uniquement :
- dans le bouton (ou sur le composant concerné)
- bouton désactivé
- si > 1s : texte clair (“Enregistrement…”, “Suppression…”)

Règles :
- pas de skeleton
- pas de loader global

---

## 7) Export / import / impression

### 7.1 Export (CSV / Excel / PDF)
- feedback obligatoire (bouton bloqué + texte)
- si > 2–3s : feedback explicite (“Génération du PDF…”, “Export en cours…”)

### 7.2 Impression
- **imprimer la table uniquement**, pas la page entière
- l’impression doit être lisible (header, colonnes visibles, styles simples)

---

## 8) Refresh manuel

- données visibles
- indicateur discret (icône / badge)
- pas de skeleton
- pas de clignotement

---

## 9) Changement de route / contexte global

Un loader plein écran peut être acceptable si :
- changement de client/projet
- reset de permissions/licence
- rechargement massif

Contraintes :
- rapide, sobre, rare

---

## Anti-patterns à éviter

- spinner au milieu d’une page vide alors que la structure est connue
- skeleton qui revient à chaque refetch
- skeleton affiché avant une redirection (inutile + “flicker”)
- loader global pour une action locale
- trop d’animations (fatigue visuelle)

---

## Pattern idéal (résumé)

1) **Loader global** → auth / permissions / licence  
2) **Skeletons** → structure de la page (premier chargement)  
3) **Données réelles** → affichage normal  
4) **Spinners locaux** → actions utilisateur + refresh manuel

---

## Mon avis sur ces conventions (et ajustements)

Globalement c’est une très bonne base : la séparation **“gating” (loader)** vs **“data fetching” (skeleton)** est la bonne règle mentale et évite la majorité des incohérences UI.

Points à préciser pour éviter les 401 et le bruit réseau :
- Formaliser une règle “**no network when logged out**” (pas seulement un “stop refetch”), surtout pour SSE/polling : le composant ne doit pas démarrer tant qu’on n’a pas une session valide.
- Côté React Query, standardiser :
  - `retry: false` pour les requêtes d’auth
  - `refetchInterval: (q) => 401 ? false : interval` pour les pollings
  - garder l’UI stable sur refetch (`keepPreviousData`/affichage inchangé + indicateur)

Points à anticiper pour permissions/licence :
- le “gating” doit décider **avant** de monter les composants qui déclenchent du fetch (évite les cascades d’erreurs).
- prévoir des états distincts : `loading`, `unauthorized`, `forbidden`, `licenseExpired`, `ready`.

---

# Backlog UX/UI (reste à faire)

## Objectif

Lister les améliorations UX/UI “faible risque” et les chantiers de chargement à traiter ensuite.

## Fait (implémenté)

- Stopper le spam de requêtes quand déconnecté (arrêt des pollings après 401 + SSE non démarré sur routes publiques).
- Skeleton loaders sur les tables (au lieu d’un spinner global).
- Exports table (CSV / Excel / PDF) + impression “table uniquement” dans le composant `TanStackTable`.
- Sidebar mobile : fermeture automatique après navigation.

## À faire ensuite (chargements, hors skeleton)

- Standardiser une stratégie “auth-first” :
  - un `AuthGate` commun (dashboard/admin) qui bloque le rendu tant que l’état auth n’est pas connu
  - un état “logged out” qui coupe SSE + pollings dès la première 401 (et nettoie les listeners)
- Standardiser les erreurs réseau :
  - toast unique (dedupe) + affichage d’erreur contextualisé (table vide vs erreur)
  - éviter le spam de logs côté client
- Harmoniser les “refetch” :
  - indicateur discret (badge/icone) au lieu de re-rendre toute la section
  - éviter les revalidations inutiles sur pages statiques
- Performance :
  - vérifier que les tables exportent le “bon scope” (filtré/trié) de façon cohérente sur toutes les pages
  - vérifier que la virtualisation (surveillance) conserve la priorité alarmes/pré-alarmes sans “jumping”

---

## Surveillance : éviter le refetch global (push + cache)

Problème : sur un parc avec des centaines de sondes, **refetch périodique** de toute la liste (ou de toutes les pages) est trop coûteux.

Pattern recommandé :
- Chargement initial : `/api/capteurs/paginated` (liste paginée)
- Temps réel : **push de deltas** (une mesure = un événement) → mise à jour du cache client
- Retour sur la page : réutiliser le cache + ne récupérer que le “manquant” (ou revalider par delta)

Implémentation “base” disponible :
- SSE client : `GET /api/surveillance/stream`
- Dispatch machine : `POST /api/surveillance/dispatch` (protégé par header `x-vigitemp-secret`)
- Client : applique les deltas dans le cache React Query (pas de refetch global)

Env var à prévoir :
- `VIGITEMP_SURVEILLANCE_DISPATCH_SECRET` (secret partagé serveur C# → Next)
