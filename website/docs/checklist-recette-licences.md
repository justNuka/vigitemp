# Checklist Recette Licences

## Pack
- [ ] `/admin` accessible (vue simplifiee)
- [ ] `/admin/etalons` bloque (message indisponible)
- [ ] `/admin/sondes/etalonnage-import` bloque (message indisponible)
- [ ] `/admin/sondes/ajustage-import` accessible
- [ ] Sidebar admin: pas de section Metrologie
- [ ] API `GET/POST /api/etalons*` retourne 403
- [ ] API `POST /api/sondes/etalonnages/preview` retourne 403
- [ ] API `POST /api/sondes/etalonnages/bulk` retourne 403
- [ ] API creation sonde respecte la limite Pack

## One
- [ ] `/admin` accessible (vue simplifiee)
- [ ] `/admin/etalons` bloque
- [ ] `/admin/sondes/etalonnage-import` bloque
- [ ] `/admin/sondes/ajustage-import` accessible
- [ ] Sidebar admin: pas de section Metrologie
- [ ] API `GET/POST /api/etalons*` retourne 403
- [ ] API `POST /api/sondes/etalonnages/preview` retourne 403
- [ ] API `POST /api/sondes/etalonnages/bulk` retourne 403

## Standard
- [ ] `/admin` accessible (vue cartes)
- [ ] `/admin/etalons` accessible
- [ ] `/admin/sondes/etalonnage-import` accessible
- [ ] `/admin/sondes/ajustage-import` accessible
- [ ] Sidebar admin: section Metrologie visible
- [ ] API `GET/POST /api/etalons*` retourne 200 selon droits auth
- [ ] API `POST /api/sondes/etalonnages/preview` fonctionne
- [ ] API `POST /api/sondes/etalonnages/bulk` fonctionne
- [ ] POST/PATCH `/api/lieux` avec champs EMT fonctionne

## Expert
- [ ] `/admin` accessible (placeholder expert)
- [ ] `/admin/etalons` accessible
- [ ] `/admin/sondes/etalonnage-import` accessible
- [ ] `/admin/sondes/ajustage-import` accessible
- [ ] Sidebar admin: section Metrologie visible
- [ ] API `GET/POST /api/etalons*` retourne 200 selon droits auth
- [ ] API `POST /api/sondes/etalonnages/preview` fonctionne
- [ ] API `POST /api/sondes/etalonnages/bulk` fonctionne
- [ ] POST/PATCH `/api/lieux` avec champs EMT fonctionne

## Controle EMT (anti-contournement)
- [ ] En Pack/One, POST `/api/lieux` avec `EMT_Mode` retourne 403
- [ ] En Pack/One, PATCH `/api/lieux/[id]` avec `EMT_Mode` retourne 403
- [ ] En Standard/Expert, ces memes appels passent
