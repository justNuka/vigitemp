# Domaines de test HTTPS (local)

## Objectif
Tester les cookies securises et le multi-domaine en local.

## Etapes (Windows)
1. Ajouter un host local dans `C:\Windows\System32\drivers\etc\hosts`.
2. Generer un certificat local (mkcert).
3. Lier le certificat au domaine local.

## Exemple
- Domaine : `vigitemp.local`
- Host : `127.0.0.1 vigitemp.local`

## Notes
- Garder les domaines de test isoles.
- Ne jamais pousser ces settings en prod.
