# Sondes IP — conversion platine historique

## Contexte

Les sondes `IP` sont des sondes platine de température. Leur trame de mesure transporte une valeur brute signée reconstruite à partir de deux octets :

```text
raw = highByte * 256 + lowByte - 2048
```

La PR #98 a corrigé la conservation des deux octets binaires (`0x00..0xFF`). Cette correction permet d'obtenir la bonne valeur brute, mais elle a aussi permis de mettre en évidence une seconde régression plus ancienne : la conversion métrologique spécifique aux sondes platine IP avait été remplacée par la formule linéaire générique `Coeff_X * raw + Coeff_Constant`.

## Sémantique historique des coefficients IP

Pour les ajustages historiques IP, `Coeff_X` et `Coeff_Constant` ne représentent pas directement une pente et une constante en °C.

Ils servent d'abord à convertir la valeur brute en rapport de résistance de la platine (`R/R0`). Vigitemp appliquait ensuite l'inversion de la relation utilisée pour la platine avec :

```text
A = 0.0039083
B = -0.0000005775

D = (A / (2B))² + (Coeff_X * raw + (Coeff_Constant - 1)) / B
T = -(A / (2B)) - sqrt(D)
```

Ce comportement existait encore dans `SensorIP.cs` avant le refactor de métrologie générique.

## Exemple terrain du 08/09/2026

Sonde : `IPPDIS`

Valeur brute reçue après correction binaire :

```text
raw = -1366
```

Ajustage en base :

```text
Coeff_X2       = 0
Coeff_X        = 0.00058
Coeff_Constant = 1.20238
```

Avec la formule linéaire générique, on obtient environ :

```text
0.00058 * -1366 + 1.20238 = 0.4101 °C
```

Ce résultat est manifestement incompatible avec la plage physique attendue (environ -150 °C).

Avec la conversion platine historique, la même raw donne environ :

```text
-147.71 °C
```

avant application éventuelle de l'offset sonde et de la correction de justesse.

Les anciens points d'ajustage observés sont également cohérents avec cette plage :

```text
Valeur_Brute1 = -928   pour environ -79.9 °C
Valeur_Brute2 = -1730  pour environ -195.9 °C
```

Une interpolation directe entre ces deux points place `raw=-1366` autour de `-143.25 °C`, ce qui confirme que la raw décodée est cohérente et que la régression se situe dans la conversion métrologique IP.

## Correctif

Branche : `fix/ip-platinum-temperature-conversion`

Le serveur :

- conserve le correctif binaire de la PR #98 ;
- détecte les coefficients historiques IP (pente de conversion `R/R0` très faible, `Coeff_X2=0`) ;
- restaure pour ces lignes la conversion platine historique ;
- applique ensuite l'offset et la correction de justesse de la même manière que le pipeline métrologique commun ;
- conserve le chemin linéaire générique pour une éventuelle ligne d'ajustage IP récente déjà enregistrée sous forme `°C = a*raw+b` ;
- journalise le modèle choisi dans `[SONDE][DONE]` : `model=platinum-legacy` ou `model=linear`.

## Validation terrain

- [ ] Rebuild Release du Serveur uniquement.
- [ ] Redémarrer le service Windows VigiSensys Serveur.
- [ ] Vérifier pour `IPPDIS` une ligne RX du type `high=... low=... resistance=-1366`.
- [ ] Vérifier la ligne DONE : `model=platinum-legacy`.
- [ ] Pour une raw autour de `-1366`, vérifier une température autour de `-150 °C` (selon offset/correction de justesse).
- [ ] Vérifier `Valeur_Brute` dans `tm_mesures` : elle doit rester la raw décodée, sans transformation.
- [ ] Comparer plusieurs points froids et chauds avec l'ancien logiciel ou un étalon de référence.
- [ ] Vérifier qu'une sonde IP sans coefficients historiques compatibles continue de prendre le chemin `model=linear`.

## Point à surveiller

Le workflow d'ajustage VigiSensys récent stocke actuellement des coefficients linéaires génériques. Il ne faut donc pas transformer tous les IP de manière inconditionnelle : le serveur garde une compatibilité avec les deux sémantiques. Si des ajustages IP sont réalisés directement avec le nouveau workflow, ils doivent faire l'objet d'une validation dédiée avant généralisation du modèle d'ajustage IP.
