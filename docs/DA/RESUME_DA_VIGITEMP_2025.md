# Vigitemp 2025 - Proposition DA

**Réunion** : Mardi • **Date** : 28/11/2025 • **Version** : 2.0

---

## 🎯 En Bref

Moderniser Vigitemp avec un **design glassmorphism professionnel**, aligné avec les standards actuels (Vercel, Linear, Stripe ou tout autre app de dashboard moderne, ou encore Windows 11 et MacOS/IOS) tout en conservant l'**identité MC2** (sobre, scientifique, bleu/blanc).

---

## 💡 Pourquoi Maintenant ?

### Le glassmorphism est devenu un standard (2022-2025)

**Adopté par** : Next.js, Tailwind UI, Shadcn/ui, Vercel Dashboard, Linear, Stripe, Windows 11, macOS Big Sur+

> Ce n'est plus un effet créatif, c'est le **langage visuel standard des interfaces professionnelles modernes**.

### Bénéfices Concrets pour Vigitemp

| Avantage | Impact |
|----------|--------|
| **Hiérarchie visuelle** | Alarmes ≠ infos ≠ stats (identification rapide) |
| **Confort utilisateur** | Moins de fatigue visuelle (sessions 8h+) |
| **Accessibilité renforcée** | WCAG AA, navigation clavier, mode sans blur |
| **Cohérence métier** | Évoque précision scientifique (verre, inox, labo) |
| **Différenciation** | Concurrence bloquée "années 2010" |
| **Future-proof** | Stack Next.js 15 + React 19 (5-10 ans) |

---

## 🎨 Direction Artistique

### Palette MC2 Modernisée

```
Fond : Bleu très foncé (#0B1220) → Dégradé sombre
Accents : Bleu MC2 (#1E88E5), Bleu clair (#90CAF9)
Glass : Surfaces translucides 5-10%, bordures subtiles
États : Rouge (alarme), Orange (pré-alarme), Vert (normal)
```

### Layout

```
┌────────────────────────────────────────────┐
│ HEADER (glass, 64px) - Logo | Nav | User   │
├──────────┬─────────────────────────────────┤
│ SIDEBAR  │ MAIN CONTENT                    │
│retractable                                 │
│ (glass)  │ ┌─────────────────────────────┐ │
│          │ │ Card Glass (Statut global)  │ │
│ Dashboard│ └─────────────────────────────┘ │
│ Mesures  │ ┌───────┬───────┬───────────┐   │
│ Carto    │ │ Card  │ Card  │ Card      │   │
│ Alarmes  │ │ Temp  │ RH    │ Alertes   │   │
│ Rapports │ └───────┴───────┴───────────┘   │
│ Admin    │                                 │
│          │  Autres cards de sondes         │
│          │                                 │
└──────────┴─────────────────────────────────┘
```

*Possibilité de mettre la navbar en bas plutôt qu'en haut*

---

## 📊 Comparaison Avant/Après

| Critère | Interface actuelle | Interface glass |
|---------|-------------------|-----------------|
| **Hiérarchie alarmes** | Couleur uniquement | Couleur + profondeur + contraste |
| **Fatigue visuelle 8h** | Forte (blanc) | Réduite (sombre/bleu) |
| **Densité info** | Surcharge possible | Aération naturelle |
| **Image produit** | Fonctionnel mais daté | Moderne et tech |

---

## 💬 Arguments Clés

### 1. Tendance actuelle
> « Glassmorphism = standard 2024-2025 pour dashboards SaaS pro. »

### 2. Alignement MC2
> « Palette bleu/blanc conservée, ambiance scientifique. Juste + de profondeur. »

### 3. ROI utilisateur
> « Meilleure lisibilité, hiérarchie claire, confort sessions longues. »

### 4. Différenciation
> « Concurrents = interfaces 2010. Nous = outil moderne tech de pointe. »

### 5. Zéro risque
> « Variante "solide" sans blur disponible. Même ergonomie. »

### 6. Accessibilité renforcée
> « WCAG AA respecté : contrastes validés, navigation clavier complète, lecteurs d'écran supportés. »

---

## ♿ Accessibilité (Focus Spécial)

**Engagements WCAG AA** :
- ✅ Contraste texte/fond ≥ 4.5:1 (noir/blanc sur glass foncé)
- ✅ Navigation clavier complète (Tab, Enter, Esc, Arrows)
- ✅ Attributs ARIA (labels, roles, live regions pour alarmes)
- ✅ Focus visible (ring-2 ring-blue-500)
- ✅ Mode sans blur activable (Settings → `prefers-reduced-transparency`)
- ✅ Textes alternatifs graphiques
- ✅ Tailles interactives ≥ 44x44px (touch-friendly)

**Tests prévus** :
- Lighthouse Accessibility Score > 95
- Validation VoiceOver (macOS) + NVDA (Windows)
- Test clavier uniquement (sans souris)
- Validation contrastes automatique (Axe DevTools)

---

## ❓ FAQ Rapide

**Q** : C'est pas trop moderne ?  
**R** : Codes MC2 conservés. Profondeur ajoutée = meilleure structure.

**Q** : Lisible sur écrans industriels ?  
**R** : Oui. Fallback sans blur si besoin.

**Q** : Quid de l'accessibilité ?  
**R** : WCAG AA garanti. Contraste 4.5:1, navigation clavier, lecteurs d'écran, mode sans blur activable.

**Q** : Performance ?  
**R** : Excellente. `backdrop-blur` = CSS natif (GPU), pas JS lourd.

**Q** : Maintenance ?  
**R** : Plus simple. Composants Tailwind standards, stack moderne.

---

## 🟦 Résumé 30 Secondes

✅ Style = standards modernes (Vercel, Linear, Stripe)  
✅ Glassmorphism maîtrisé = hiérarchie claire  
✅ Palette MC2 = bleus/blancs/scientifique  
✅ Composants propres = maintenables

**Résultat** :  
• Interface moderne  
• Plus lisible  
• Confort longues sessions  
• **Accessibilité WCAG AA garantie**  
• Différenciation concurrence  

**Durée** : 8 semaines • **Risque** : Faible • **A11y** : Score >95

---

## 📎 Références

**Sites MC2** : mc2lab.fr, vigitemp.fr  
**Inspirations** : vercel.com/dashboard, linear.app, dashboard.stripe.com  
**Stack** : Next.js 15, React 19, Tailwind CSS 3.4, HeroUI 2.7, Chart.js 4.4

**Document complet** : `docs/DA/PROPOSITION_DA_VIGITEMP_2025.md`

---

**Version** : 2.0 (Résumé) • **Mise à jour** : 28/11/2025 • **Statut** : ✅ Prêt
