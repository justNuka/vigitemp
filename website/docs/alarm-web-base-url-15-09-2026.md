# Dispatch alarmes Web — URL absolue — 15/09/2026

## Contexte

Pendant une installation client, le Serveur C# journalisait :

`An invalid request URI was provided. The request URI must either be an absolute URI or BaseAddress must be set.`

La valeur installée dans `VigiSensysServeur.exe.config` était `10.44.0.21:3000`, sans schéma HTTP. Le SMTP n'était donc pas encore impliqué : le Serveur échouait avant d'atteindre l'API Next.js `/api/alarmes/dispatch`.

## Cause

`AlarmWebNotifier` utilise `VigiSensys.WebsiteBaseUrl` / `Vigi.WebsiteBaseUrl` pour construire les appels serveur -> Web. L'installateur serveur vérifiait uniquement que le champ n'était pas vide et acceptait donc une valeur `IP:port` non absolue.

## Correctif

Branche : `fix/alarm-web-base-url-validation`.

- l'installateur GUI normalise automatiquement `10.44.0.21:3000` en `http://10.44.0.21:3000` ;
- le script PowerShell applique la même normalisation ;
- seules les URL HTTP/HTTPS absolues avec hôte sont acceptées ;
- `AlarmWebNotifier` normalise aussi les anciennes configurations dépourvues de schéma afin de rendre les mises à jour tolérantes ;
- une URL réellement invalide est désormais journalisée comme `issue=invalid-base-url` plutôt que d'échouer plus tard dans `HttpClient`.

Le chemin d'installation disque n'est pas utilisé comme URL. Toutefois, sur une installation hors `ProgramData`, il faut toujours modifier/inspecter le `VigiSensysServeur.exe.config` situé à côté de l'exécutable réellement lancé par le service Windows.

## Validation terrain

- [ ] installer avec `10.44.0.21:3000` et vérifier que la config contient `http://10.44.0.21:3000` ;
- [ ] redémarrer le service et vérifier `[ALARM][WEB] status=config-ok baseUrl=http://...` ;
- [ ] déclencher puis terminer une alarme et vérifier `status=sent code=2xx` ;
- [ ] vérifier ensuite les logs Web/SMTP séparément ;
- [ ] tester une URL `https://...` ;
- [ ] vérifier qu'un schéma non HTTP(S) est refusé ;
- [ ] tester l'installateur GUI et le script PowerShell.
