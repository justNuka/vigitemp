# Palette de Couleurs Replit - Vigitemp

## Couleurs principales

### Blue MC2 (Primaire)
- **HEX**: `#3B82F6`
- **HSL**: `217 91% 60%`
- **Utilisation**: Couleur primaire, boutons d'action, liens importants
- **Tailwind**: `bg-primary`, `text-primary`, `border-primary` ou `bg-replit-blue`

### Yellow (Accent)
- **HEX**: `#F59E0B`
- **HSL**: `38 92% 50%`
- **Utilisation**: Alertes, badges d'avertissement, statistiques importantes
- **Tailwind**: `bg-replit-yellow`, `text-replit-yellow`

### Teal (Accent secondaire)
- **HEX**: `#8BDED8`
- **HSL**: `174 58% 71%`
- **Utilisation**: Couleur d'accent, états de succès, graphiques
- **Tailwind**: `bg-accent`, `text-accent` ou `bg-replit-teal`

### Sage (Secondaire)
- **HEX**: `#DCE0BF`
- **HSL**: `72 39% 81%`
- **Utilisation**: Arrière-plans secondaires, éléments subtils
- **Tailwind**: `bg-secondary`, `text-secondary` ou `bg-replit-sage`

### Mauve (Destructive)
- **HEX**: `#AD7385`
- **HSL**: `340 26% 57%`
- **Utilisation**: Actions destructives, erreurs critiques
- **Tailwind**: `bg-destructive`, `text-destructive` ou `bg-replit-mauve`

## Exemples d'utilisation

### Boutons
```tsx
// Bouton primaire (Blue MC2)
<Button className="bg-primary hover:bg-primary/90">Action</Button>

// Bouton avec couleur Replit directe
<Button className="bg-replit-blue hover:bg-replit-blue/90">Action</Button>
```

### Cartes avec statuts
```tsx
// Statut OK (Teal)
<Card className="border-replit-teal">
  <Badge className="bg-replit-teal">OK</Badge>
</Card>

// Statut Warning (Yellow)
<Card className="border-replit-yellow">
  <Badge className="bg-replit-yellow">Avertissement</Badge>
</Card>

// Statut Critique (Mauve)
<Card className="border-replit-mauve">
  <Badge className="bg-replit-mauve">Critique</Badge>
</Card>
```

### Graphiques
Les couleurs sont automatiquement appliquées aux graphiques via les variables CSS :
- `--chart-1`: Blue MC2
- `--chart-2`: Yellow
- `--chart-3`: Teal
- `--chart-4`: Sage
- `--chart-5`: Mauve

## Mode Dark

La palette est automatiquement ajustée en mode dark avec des contrastes optimisés :
- Arrière-plan : HSL(217, 25%, 8%) - Bleu très foncé
- Couleurs légèrement éclaircies pour meilleure lisibilité
- Contraste WCAG AA maintenu pour l'accessibilité

## Variables CSS disponibles

### Couleurs système
```css
--background
--foreground
--card
--card-foreground
--primary
--primary-foreground
--secondary
--secondary-foreground
--muted
--muted-foreground
--accent
--accent-foreground
--destructive
--destructive-foreground
--border
--input
--ring
```

### Couleurs de graphiques
```css
--chart-1 /* Blue MC2 */
--chart-2 /* Yellow */
--chart-3 /* Teal */
--chart-4 /* Sage */
--chart-5 /* Mauve */
```
