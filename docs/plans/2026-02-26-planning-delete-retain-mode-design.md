# Design : Choix des consignes lors de la suppression d'une règle de planning

Date : 2026-02-26

## Contexte

Actuellement, supprimer une règle de planning supprime simplement la ligne. L'event MySQL restaure les valeurs de base au cycle suivant. L'utilisateur n'a aucun contrôle sur ce qui se passe avec les consignes de la règle.

## Objectif

Lors de la suppression d'une règle, demander à l'utilisateur s'il souhaite :
- Restaurer les consignes de base (comportement actuel)
- Appliquer les consignes de la règle comme nouvelles valeurs de base permanentes

## Design approuvé (Approche A)

### Section 1 — Backend : `DELETE ?retainMode=`

**Endpoint modifié :** `DELETE /api/lieux/[id]/planning/[regleId]`

Nouveau query param : `retainMode` (valeur: `'base'` | `'regle'`, défaut: `'base'`)

**`retainMode=base` (défaut, comportement inchangé):** Supprime la règle. 204.

**`retainMode=regle` :** Avant de supprimer la règle :
1. Charge la règle (Consigne, Consigne_Sup, Consigne_Inf, Tolerance_Sup_Calc, Tolerance_Inf_Calc)
2. Met à jour `t_lieu` :
   - Colonnes actives : `Consigne`, `Consigne_Sup`, `Consigne_Inf`, `Tolerance_Surveillance_Sup`, `Tolerance_Surveillance_Inf`
   - Colonnes base : `Consigne_Base`, `Consigne_Sup_Base`, `Consigne_Inf_Base`, `Tolerance_Surveillance_Sup_Base`, `Tolerance_Surveillance_Inf_Base`
   - Réinitialise planning : `Planning_Actif=0`, `Planning_Source_Regle_Id=NULL`, `Planning_Derniere_Maj=NOW()`
3. Supprime la règle. 204.

### Section 2 — Frontend : AlertDialog avec radio buttons

**Fichier modifié :** `location-form-tab-planning.tsx`

Nouveaux états :
```typescript
const [deleteConfirmRegle, setDeleteConfirmRegle] = useState<PlanningRegleResponse | null>(null)
const [retainMode, setRetainMode] = useState<'base' | 'regle'>('base')
```

Le bouton poubelle appelle `setDeleteConfirmRegle(regle)` au lieu de déclencher le delete directement.

Nouveau handler :
```typescript
const confirmDelete = async () => {
  if (!deleteConfirmRegle || !idLieu) return
  setDeletingId(deleteConfirmRegle.Id_Regle)
  try {
    const url = `/api/lieux/${idLieu}/planning/${deleteConfirmRegle.Id_Regle}?retainMode=${retainMode}`
    await fetch(url, { method: 'DELETE' })
    queryClient.invalidateQueries({ queryKey: ["planning-regles", idLieu] })
    queryClient.invalidateQueries({ queryKey: ["planning-preview", idLieu] })
  } finally {
    setDeletingId(null)
    setDeleteConfirmRegle(null)
    setRetainMode('base')
  }
}
```

AlertDialog (shadcn/ui) ouvert quand `deleteConfirmRegle !== null` :

```
Supprimer la règle

Que faire des consignes après suppression ?
○ Restaurer les consignes de base
● Appliquer les consignes de cette règle comme nouvelles valeurs de base
  Consigne: {regle.Consigne}  |  Sup: {regle.Consigne_Sup}  |  Inf: {regle.Consigne_Inf}

[Annuler]  [Supprimer]
```

Le radio group est géré via `retainMode` state. Reset à `'base'` à la fermeture.

### Section 3 — i18n

Nouvelles clés dans `lieux.planning.deleteConfirm` (fr.json + en.json) :
- `title` — "Supprimer la règle"
- `optionBase` — "Restaurer les consignes de base"
- `optionRegle` — "Appliquer les consignes de cette règle comme nouvelles valeurs de base"
- `ruleValues` — "Consigne: {consigne}  |  Sup: {sup}  |  Inf: {inf}"

## Fichiers impactés

| Fichier | Changement |
|---|---|
| `src/app/api/lieux/[id]/planning/[regleId]/route.ts` | DELETE handler — lire `retainMode`, si `regle` : update t_lieu + delete |
| `src/app/.../lieux/_components/location-form-tab-planning.tsx` | Remplacer delete direct par AlertDialog avec radio + confirmDelete |
| `src/messages/fr.json` | Nouvelles clés `lieux.planning.deleteConfirm` |
| `src/messages/en.json` | Nouvelles clés `lieux.planning.deleteConfirm` |
