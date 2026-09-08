# Correction du décodage des mesures binaires IC / IP / IH — 08/09/2026

## Contexte

Un retour terrain sur des sondes CO2 de type I (`IC`) signale des valeurs qui restent autour de 2 à 2,5 % alors que la concentration réelle est plus élevée (exemple : environ 5 %).

Les sondes IC n'envoient pas la valeur brute sous forme de texte (`-1650`, `1746`, etc.). La mesure est encodée sur deux octets dans une trame hybride :

```text
R + suffixe série + R + [octet fort] + [octet faible] + '
```

Le serveur reconstruit ensuite la valeur brute avec la formule historique :

```text
raw = poidsFort * 256 + poidsFaible - 2048
```

Cette formule est correcte et reste inchangée.

## Cause du problème

`SensorIC`, `SensorIP` et `SensorIH` lisaient la trame avec `SerialPort.ReadExisting()` sans modifier l'encodage du port. Le `SerialPort` utilise alors l'encodage ASCII par défaut.

Or les deux octets de mesure sont binaires et peuvent prendre n'importe quelle valeur entre `0x00` et `0xFF`. En ASCII, les octets supérieurs à `0x7F` ne peuvent pas être représentés fidèlement et sont remplacés pendant la conversion en chaîne de caractères.

En plus, la regex historique n'acceptait explicitement que :

```text
[\x00-\x7F]{2}
```

Elle excluait donc la moitié de la plage possible pour chacun des deux octets de mesure.

Conséquence : certaines valeurs brutes pouvaient être rejetées ou reconstruire une valeur différente de celle réellement envoyée par la sonde. Plusieurs valeurs physiques différentes peuvent alors aboutir à une même valeur brute apparente, ce qui peut se manifester par des paliers ou une mesure qui semble « bloquée ».

### Exemple `-1650`

```text
raw réel = -1650
raw + 2048 = 398 = 0x018E

poidsFort   = 0x01
poidsFaible = 0x8E (142)
```

`0x8E` est supérieur à `0x7F`. Il doit être conservé comme l'octet `142`, sinon la valeur reconstruite n'est plus `-1650`.

### Exemple `1746`

```text
raw réel = 1746
raw + 2048 = 3794 = 0x0ED2

poidsFort   = 0x0E
poidsFaible = 0xD2 (210)
```

`0xD2` est lui aussi supérieur à `0x7F`.

## Correctif retenu

Le correctif reste volontairement local et réutilise un mécanisme déjà employé par `SensorEN` :

- `SensorIC`, `SensorIP` et `SensorIH` configurent maintenant le port en `ISO-8859-1` (Latin-1) ;
- Latin-1 conserve une correspondance 1:1 entre les octets `0x00..0xFF` et les caractères `U+0000..U+00FF` lors de `ReadExisting()` ;
- les regex de mesure acceptent maintenant `\x00..\xFF` pour chacun des deux octets ;
- la formule `poidsFort * 256 + poidsFaible - 2048` est inchangée ;
- les logs indiquent maintenant aussi les deux octets décodés en hexadécimal (`high=0x.. low=0x..`) pour faciliter la validation terrain.

Aucune modification n'est nécessaire pour `IN` / `IE`, dont la mesure est textuelle. `EN` préservait déjà les octets binaires avec un décodage Latin-1 explicite.

## Fichiers concernés

- `Vigitemp Serveur/Vigitemp Serveur/sensors/SensorIC.cs`
- `Vigitemp Serveur/Vigitemp Serveur/sensors/SensorIP.cs`
- `Vigitemp Serveur/Vigitemp Serveur/sensors/SensorIH.cs`

Branche : `fix/binary-sensor-raw-reading`

PR : #98 — `fix(server): préserver les octets binaires des sondes IC/IP/IH`

## Validation terrain

- [ ] compiler le Serveur en Release ;
- [ ] tester une sonde IC avec une valeur brute dont l'octet faible est <= `0x7F` (ex. raw `-144`) ;
- [ ] tester une valeur brute dont l'octet faible est > `0x7F` (ex. raw `-1650`, `-1643`, `1746` ou `1752`) ;
- [ ] vérifier dans les logs que `high` / `low` correspondent aux octets attendus ;
- [ ] vérifier que `Valeur_Brute` en BDD correspond exactement à la valeur brute envoyée par la sonde ;
- [ ] vérifier le calcul métrologique final `%CO2` avec les derniers coefficients d'ajustage ;
- [ ] confirmer sur le cas terrain à ~5 % CO2 que la valeur n'est plus artificiellement bloquée autour de 2–2,5 % ;
- [ ] vérifier une sonde IP (température) ;
- [ ] vérifier une sonde IH (humidité) ;
- [ ] vérifier qu'un marqueur batterie IP (`BAT` / `B`) reste détecté.

## Compatibilité

- aucune migration BDD ;
- aucune modification des coefficients d'ajustage ;
- aucune modification de la formule de conversion raw ;
- aucun changement Web ou Agent ;
- correction limitée au décodage série des protocoles IC / IP / IH.
