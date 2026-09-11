# Hotline — support TCP des anciennes sondes étalon SEF

Date : 09/09/2026

## Statut

- Branche : `feature/hotline-sef-tcp-support`
- PR vers `dev` : #110 — `feat(hotline): supporter les anciennes sondes étalon SEF en TCP`.
- Validation automatique : ✅ terminée.
- Validation terrain sur une vraie SEF : ⏳ à réaliser.

## Contexte

Certains clients conservent des anciennes sondes étalon VigiTemp de type `SEF`. Elles diffèrent des sondes série/GSP actuelles :

- le numéro utilisé côté VigiTemp (ex. `343`) est un repère logiciel et n'est pas présent dans la trame d'interrogation ;
- la communication passe par TCP/IP, sans port COM ;
- le convertisseur/équipement est joint directement par `IP:port`, avec `1470` comme port observé ;
- l'adresse protocole observée est `01`.

## Capture terrain de référence

Une capture réseau de l'ancien VigiTemp a permis d'identifier le contrat exact utilisé pour une lecture :

```text
TX ASCII : Q#01\r00000000
TX HEX   : 51 23 30 31 0D 30 30 30 30 30 30 30 30

RX ASCII : >+024.08\r
RX HEX   : 3E 2B 30 32 34 2E 30 38 0D
```

La réponse correspond à `+24,08 °C`.

Le repère historique `343` n'est donc pas un élément du protocole réseau : il reste uniquement facultatif dans Hotline pour faciliter le diagnostic opérateur.

## Implémentation

Le portail Hotline dispose d'un bloc dédié `SEF` afin de ne pas mélanger ce protocole TCP historique avec les overrides COM/GSP existants.

Paramètres :

- hôte du serveur d'interrogation VigiSensys + port API Hotline ;
- IP / hôte TCP de la SEF ;
- port TCP, `1470` par défaut ;
- adresse protocole, `01` par défaut ;
- repère sonde facultatif (ex. `343`) uniquement pour le diagnostic ;
- timeouts lecture/écriture.

Le serveur C# ouvre la socket TCP, envoie exactement la trame `Q#<adresse>\r00000000`, attend la réponse terminée par `CR`, parse le format `>+024.08\r` et renvoie la température ainsi que les échanges TX/RX.

Le chemin SEF :

- est sélectionné avant la recherche de sonde en base ;
- ne consulte donc pas la BDD pour réaliser la lecture ;
- ne requiert aucun port COM ;
- ne modifie pas le comportement GSP existant ;
- renvoie la commande, la réponse brute et les échanges TX/RX pour le diagnostic.

Le proxy Web `/api/hotline/sensor-test` exige une session Hotline valide avant de relayer la commande au serveur d'interrogation.

## Fichiers principaux

- `Vigitemp Serveur/Vigitemp Serveur/SefProtocol.cs` — contrat TCP, construction de trame, lecture et parsing ;
- `Vigitemp Serveur/Vigitemp Serveur/HotlineApiServer.cs` — branche d'exécution SEF dans le test de sonde Hotline ;
- `Vigitemp Serveur/Vigitemp Serveur/VigitempServeur.csproj` — inclusion du protocole ;
- `Vigitemp Serveur/scripts/Test-SefProtocol.ps1` — test reproductible du contrat et round-trip TCP local ;
- `website/src/app/api/hotline/sensor-test/route.ts` — validation/relai Web et garde de session Hotline ;
- `website/src/app/[locale]/(hotline)/hotline/[slug]/_components/dashboard/hotline-sef-test-panel.tsx` — panneau de test dédié ;
- `website/src/app/[locale]/(hotline)/hotline/[slug]/_components/hotline-dashboard.tsx` — intégration dans l'onglet de test ;
- `website/src/messages/supplements.ts` — textes FR/EN.

## Validation automatisée

Validation finale GitHub Actions :

```text
Run           : 34380274297
Commit testé  : 75e1417418deb8d8a888dac96d3f9c29b7c2d701
Résultat      : ✅ success
```

Contrôles réalisés :

- restauration des packages C# : ✅ ;
- test du contrat SEF versionné `Vigitemp Serveur/scripts/Test-SefProtocol.ps1` : ✅ ;
- trame exacte `Q#01\r00000000` : ✅ ;
- normalisation de l'adresse `1 -> 01` : ✅ ;
- parsing `>+024.08\r -> 24.08 °C` : ✅ ;
- parsing d'une température négative : ✅ ;
- rejet d'une réponse invalide : ✅ ;
- round-trip TCP local avec une SEF simulée vérifiant les octets réellement reçus : ✅ ;
- build Release du serveur C# .NET Framework 4.8 : ✅ ;
- génération Prisma MySQL : ✅ ;
- garde de session Hotline sur le proxy Web : ✅ ;
- contrôle i18n : ✅ ;
- ESLint ciblé : ✅ ;
- TypeScript `tsc --noEmit` : ✅ ;
- build Next.js production : ✅.

Le workflow GitHub Actions temporaire utilisé pour cette validation a été retiré du diff final. Le script `Test-SefProtocol.ps1`, lui, reste versionné afin de pouvoir rejouer le contrat sans matériel.

## Checklist terrain

- [ ] depuis le serveur VigiSensys, exécuter `Test-NetConnection <ip-sef> -Port 1470` et obtenir `TcpTestSucceeded : True` ;
- [ ] ouvrir le portail Hotline puis l'onglet de test sonde ;
- [ ] dans le bloc `Ancienne sonde étalon SEF (TCP)`, renseigner l'IP / hôte de la SEF ;
- [ ] conserver le port `1470` et l'adresse protocole `01` sauf information terrain contraire ;
- [ ] le repère `343` peut être renseigné pour faciliter le diagnostic mais reste facultatif ;
- [ ] lancer `Lire la SEF` ;
- [ ] vérifier que la valeur affichée est cohérente avec l'ancien VigiTemp / l'afficheur étalon ;
- [ ] vérifier dans `Trames TX/RX` que le TX est `Q#01\r00000000` ;
- [ ] vérifier que le RX est au format `>+xxx.xx\r` ou `>-xxx.xx\r` ;
- [ ] comparer précisément la température affichée avec la valeur de référence ;
- [ ] tester une IP invalide ou un équipement débranché et vérifier qu'une erreur lisible est renvoyée sans bloquer le serveur ;
- [ ] effectuer ensuite un test GSP existant afin de confirmer la non-régression du chemin série.

## Critère de validation terrain

Le support SEF pourra être considéré comme validé lorsque :

1. la connexion TCP vers le port `1470` fonctionne depuis la machine serveur VigiSensys ;
2. la SEF répond à `Q#01\r00000000` avec le format attendu ;
3. la température affichée par Hotline correspond à la valeur de l'étalon ;
4. les erreurs réseau sont propres et non bloquantes ;
5. un test GSP classique reste fonctionnel.


## Validation terrain Sollae — 11/09/2026

Configuration observée sur le Sollae de test :

- IP : `192.168.63.69` ;
- MAC : `00:30:f9:11:b4:b9` ;
- mode réseau : `T2S - TCP Server` ;
- port local TCP : `1470` ;
- série physique : `RS-232`, `9600` bauds, parité `NONE`, `8` bits de données, `1` stop bit, flow control `NONE` ;
- ancien chemin logiciel : `COM69` virtuel créé par ezVSP.

Le poste serveur `192.168.63.189` avait une connexion `Established` de `ezVSP` vers `192.168.63.69:1470`. Tant qu'ezVSP conservait cette connexion, une seconde connexion TCP était refusée. Après fermeture d'ezVSP, `Test-NetConnection 192.168.63.69 -Port 1470` a renvoyé `TcpTestSucceeded : True`.

Lecture Hotline réelle réussie :

```text
TX : Q#01\r00000000
RX : 0030f911b4b9\r\n>+021.63\r
Valeur : 21,63 °C
```

Le préfixe `0030f911b4b9` correspond au MAC du Sollae sans séparateurs. Le parseur SEF accepte ce préfixe et recherche la trame température. La boucle de lecture a été renforcée pour attendre une trame température complète plutôt que de s'arrêter au premier `CR`, afin de rester correcte si le banner MAC et la température arrivent dans deux paquets TCP distincts.

Conclusion : VigiSensys communique directement avec le Sollae en TCP et n'a besoin ni de COM69 ni d'ezVSP.

## Intégration métrologie Ajustage / Étalonnage

La lecture SEF est également utilisée par les parcours de métrologie :

- **Ajustage** : la lecture continue de l'étalon utilise le transport SEF/TCP lorsque le type d'étalon est `SEF` ;
- **Étalonnage** : la lecture de prévisualisation puis chaque lecture de la campagne utilisent le même transport ;
- les étalons `SPET` conservent leur chemin GSP/COM existant ;
- pour une SEF, l'hôte est lu depuis `t_module.Adresse_IP` sur le module associé à `t_etalon.Id_Module` ;
- le port réseau reste `1470` et l'adresse protocole `01` ;
- `Port_Serie`, un éventuel `COM69` et ezVSP ne sont jamais envoyés dans une requête SEF ;
- une erreur explicite est renvoyée si l'étalon SEF n'a pas de module associé avec `Adresse_IP` renseignée.

Le helper Web partagé `buildMetrologyStandardHotlineRequest` centralise le choix du transport afin d'éviter une divergence entre Ajustage et Étalonnage. Le test `website/scripts/test-metrology-sef-standard-reading.ts` verrouille notamment l'absence de `manualPort` pour une SEF.

### Validation terrain métrologie

- [ ] sélectionner un étalon SEF dont le module possède `Adresse_IP` ;
- [ ] en Ajustage, démarrer la séquence et vérifier que la valeur étalon se rafraîchit ;
- [ ] en Étalonnage, utiliser la lecture de prévisualisation puis démarrer la campagne ;
- [ ] confirmer dans les logs Hotline des requêtes `sensorType=SEF` et l'absence d'utilisation du COM virtuel ;
- [ ] vérifier qu'un étalon SPET continue à fonctionner sur son port série ;
- [ ] retirer temporairement `Adresse_IP` d'une SEF de test et vérifier qu'une erreur explicite est affichée sans tentative COM.

## Correctif terrain — association module SEF

Une installation migrée peut conserver l'ancien `Port_Serie` de l'étalon (`69` / `COM69`) sans avoir encore `t_etalon.Id_Module` renseigné. La résolution du module suit désormais cet ordre :

1. `t_etalon.Id_Module` lorsqu'il est renseigné ;
2. pour une SEF uniquement, recherche du module actif correspondant à l'ancien port série (`69` / `COM69`) ;
3. le fallback n'est accepté que lorsqu'un module réseau peut être déterminé sans ambiguïté ; sinon l'application demande une association explicite dans Administration > Étalons.

Les nouvelles installations doivent utiliser le type module `SEF` (`Id_Module_Type = 12`, « Passerelle Sollae pour sonde étalon SEF ») ajouté aux seeds MySQL et SQL Server. La lecture continue d'utiliser `Adresse_IP` et le port TCP `1470` ; le port COM historique ne sert qu'à retrouver une association legacy et n'est jamais utilisé pour communiquer avec la SEF.

L'interface Ajustage place également les boutons de lancement d'acquisition des premier et deuxième points sous les champs de valeur afin d'éviter la mise en page horizontale trop serrée.

## Confirmation avant démarrage Ajustage / Étalonnage

Après validation terrain, une erreur d'association a été identifiée côté configuration : la sonde étalon SEF était correctement configurée, ainsi que le module Sollae et son IP, mais `t_etalon.Id_Module` n'était pas renseigné. Le fallback legacy reste disponible pour les anciennes installations, mais une nouvelle configuration doit associer explicitement l'étalon à son module.

Avant de lancer la lecture, Ajustage et Étalonnage affichent désormais une fenêtre de confirmation récapitulant :

- l'opération et l'opérateur ;
- le milieu et l'intervalle de lecture ;
- les sondes sélectionnées ;
- le numéro et le type de l'étalon ;
- le module associé ;
- la connexion réellement utilisée pour l'étalon.

Pour une SEF, le récap affiche explicitement `IP Sollae:1470` et l'adresse protocole `01`. Si le module n'est pas associé ou si son `Adresse_IP` est absente, le problème est affiché avant le démarrage et la confirmation est désactivée. Pour un SPET, le port série utilisé reste affiché.

Le sélecteur d'étalon de l'Étalonnage accepte également `SEF` en plus de `SPET`, afin d'être cohérent avec le transport déjà supporté par le runtime.
