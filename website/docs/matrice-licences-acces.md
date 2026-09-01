# Matrice d'acces licences (V1)

## Regles appliquees

| Ecran / Route | Pack | One | Standard | Expert |
|---|---:|---:|---:|---:|
| `/admin` | Oui (dashboard simplifie) | Oui (dashboard simplifie) | Oui (dashboard standard cartes) | Oui (placeholder "en construction") |
| `/admin/etalons` | Non | Non | Oui | Oui |
| `/admin/sondes/etalonnage-import` | Non | Non | Oui | Oui |
| `/admin/sondes/ajustage-import` | Oui | Oui | Oui | Oui |

## API protegees (alignement matrice)

| API | Pack | One | Standard | Expert |
|---|---:|---:|---:|---:|
| `GET/POST /api/etalons` | Non | Non | Oui | Oui |
| `PATCH/DELETE /api/etalons/[id]` | Non | Non | Oui | Oui |
| `GET /api/etalons/types` | Non | Non | Oui | Oui |
| `POST /api/sondes/etalonnages/preview` | Non | Non | Oui | Oui |
| `POST /api/sondes/etalonnages/bulk` | Non | Non | Oui | Oui |
| `POST/PATCH /api/lieux` avec champs EMT | Non | Non | Oui | Oui |

## Notes
- L'import ajustage reste autorise pour toutes les licences (Pack/One inclus), comme demande.
- Le dashboard admin reste disponible pour toutes les licences.
