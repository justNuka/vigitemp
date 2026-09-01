# Recap des interrogations de sondes

Ce document resume le comportement actuel du serveur C# pour l'interrogation des sondes.

Sources principales :
- `Vigitemp Serveur/Vigitemp Serveur/ThreadServeur.cs`
- `Vigitemp Serveur/Vigitemp Serveur/Sensor.cs`
- `Vigitemp Serveur/Vigitemp Serveur/sensors/*.cs`

## 1. Selection du protocole

La selection du protocole se fait dans `ThreadServeur.ResolveSensorType(...)`.

Ordre actuel :
1. si `Famille_Sonde = GSP` ou si le numero ressemble a un serial GSP, alors protocole `GSP`
2. sinon, si le prefixe du numero de serie est `EN` ou `HN`, on utilise directement `EN` ou `HN`
3. sinon, si `Sonde_Type = E` et `Type_Module = 3` (`BTR`), on mappe vers `EN`
4. sinon, si `Sonde_Type = H` et `Type_Module = 6` (`MRH`), on mappe vers `HN`
5. sinon, on retombe sur `Sonde_Type`
6. sinon, dernier fallback : prefixe du numero de serie

## 2. Pipeline commun apres lecture

La plupart des sondes suivent ce schema :
1. ouverture du port serie
2. envoi d'une commande
3. attente d'une reponse avec timeout
4. extraction d'une valeur brute a partir de la trame
5. application de la metrologie via `Sensor.ApplyMetrology(...)`
6. arrondi a 2 decimales via `RoundMeasure(...)`
7. insertion avec :
   - valeur corrigee
   - unite
   - `raw` = valeur brute avant correction
8. comparaison aux consignes / alarmes

Ordre d'application de la metrologie :
1. ajustage : `coeffX * raw + coeffC`
2. offset
3. correction de justesse si active

Les logs detailles de metrologie sont emis par `Sensor.ApplyMetrology(...)` quand `Vigitemp.Metrology.LogDetailed=true`.

## 3. Types de protocoles actuellement implementes

### 3.1 IN

Fichier : `sensors/SensorIN.cs`

Commande :
```txt
SM{Adresse_Sonde}0000000000000000
```

Format de reponse attendu :
```txt
R....TEMPxx.xx'C
```

Extraction :
- regex : `R[A-Z0-9]{4}TEMP-?[0-9]{1,3}.[0-9]{2}'C`
- la valeur est lue directement apres `TEMP`
- exemple : `TEMP23.45'C` -> raw `23.45`

Unite stockee :
- `°C`

Notes :
- pour ces sondes ASCII, si `Adresse_Sonde` contient par erreur le serial complet, `Sensor.NormalizeSensorAddress(...)` conserve les 4 derniers caracteres

### 3.2 IE

Fichier : `sensors/SensorIE.cs`

Commande :
```txt
SM{Adresse_Sonde}0000000000000000
```

Specificite :
- la commande est envoyee 2 fois a 100 ms d'intervalle
- detection possible d'un marqueur batterie dans la reponse : `BAT` ou `B`

Format de reponse mesure :
```txt
R....TEMPxx.xx'C
```

Extraction :
- meme logique que `IN`
- raw = temperature lue directement dans la trame

Unite stockee :
- `°C`

Specificite alarme :
- si le payload indique `BAT` / `B`, le serveur leve une alarme de coupure secteur / alimentation via `HandleSensorPowerAlarm(...)`

### 3.3 IP

Fichier : `sensors/SensorIP.cs`

Commande :
```txt
SM{Adresse_Sonde}0000000000000000
```

Format de reponse attendu :
- regex construite sur les 4 derniers caracteres du serial
- forme cible : `R{suffixe}R..'`

Extraction :
- lecture des caracteres 6 et 7 de la reponse
- ces 2 octets sont interpretes comme :
```txt
raw = poidsFort * 256 + poidsFaible - 2048
```

Unite stockee :
- `°C`

Specificite alarme :
- detection possible d'un marqueur batterie `BAT` / `B`

### 3.4 IC

Fichier : `sensors/SensorIC.cs`

Commande :
```txt
SM{Adresse_Sonde}0000000000000000
```

Format de reponse attendu :
- meme famille de trame que `IP`
- regex basee sur les 4 derniers caracteres du serial

Extraction :
```txt
raw = poidsFort * 256 + poidsFaible - 2048
```

Unite stockee :
- `%CO2`

### 3.5 IH

Fichier : `sensors/SensorIH.cs`

Commande :
```txt
SM{Adresse_Sonde}0000000000000000
```

Format de reponse attendu :
- meme famille de trame que `IP` / `IC`

Extraction :
```txt
raw = poidsFort * 256 + poidsFaible - 2048
```

Unite stockee :
- `%HR`

### 3.6 EN

Fichier : `sensors/SensorEN.cs`

Type de trame :
- binaire, 14 octets emis
- l'adresse est numerique et doit tenir sur 1 octet (`0..255`)

Commande envoyee :
```txt
51 AA AA AA AA AA 30 AA AA AA AA AA 30 30
```
avec `AA = Adresse_Sonde` sur 1 octet.

Exemple reel :
- adresse `3`
- commande : `51-03-03-03-03-03-30-03-03-03-03-03-30-30`

Format de reponse attendu :
- 14 octets

Extraction :
- conversion de la trame en hex
- lecture des 2 derniers octets utiles : positions 12 et 13 de la trame
- calcul :
```txt
raw = poidsFort * 256 + poidsFaible - 2048
```

Exemple reel :
- reponse : `51030303030303030303030306c2`
- `poidsFort = 0x06 = 6`
- `poidsFaible = 0xC2 = 194`
- `raw = 6 * 256 + 194 - 2048 = -318`

La temperature finale n'est donc pas envoyee directement.
Elle est obtenue apres metrologie.

Exemple de conversion metrologique :
```txt
value = coeffX * raw + coeffC
```

Avec :
- `raw = -318`
- `coeffX = 0.0520317`
- `coeffC = 38.2381`

On obtient :
```txt
value = 21.6920194 -> 21.69°C
```

Unite stockee :
- `C`

Point d'attention :
- `Adresse_Sonde` doit etre la vraie adresse de polling courte, pas le numero de serie complet
- exemple correct : `2`, `3`
- exemple incorrect : `02461`

### 3.7 HN

Fichier : `sensors/SensorHN.cs`

Type de trame :
- binaire, 19 octets emis
- utilise a la fois :
  - `Adresse_Sonde` sur 4 caracteres hex
  - `Module_Numero_Serie` sur 4 caracteres hex

Commande envoyee :
- code `54`
- saut `01`
- 2 octets adresse sonde
- 2 octets adresse module
- 11 octets a zero
- 2 octets checksum

Structure :
```txt
54 01 AS1 AS2 MS1 MS2 00 00 00 00 00 00 00 00 00 00 00 CK1 CK2
```

Exemple reel :
- sonde `0414`
- module `0632`
- trame :
```txt
54 01 04 14 06 32 00 00 00 00 00 00 00 00 00 00 00 CK1 CK2
```

Reponse attendue :
- 19 octets

Extraction :
- conversion en hex
- lecture de 3 octets de mesure dans la reponse
- ces 3 octets sont transformes en binaire sur 24 bits
- conversion :
```txt
tmp_temperature_int = valeur binaire sur 24 bits
raw = (1 - tmp_temperature_int / 2^20 - 0.32) / 0.0047
```

Ensuite :
```txt
value = metrologie(raw)
```

Unite stockee :
- `C`

Etat au 15/04/2026 :
- le dispatch HN est bien selectionne
- la trame part bien
- le retry port a ete corrige
- mais aucune reponse n'est encore recue sur les HN de test
- le probleme restant est donc a priori protocolaire ou de donnees (`Adresse_Sonde`, `Module_Numero_Serie`, trame attendue par le materiel)

### 3.8 GSP

Fichiers :
- `sensors/SensorGSP.cs`
- `sensors/GspProtocol.cs`

Type de trame :
- protocole ASCII ligne par ligne
- target de commande = serial normalise sans prefixe produit

Exemples de commandes :
```txt
TEMP{target}
FTEM{target}
MEMO{target} {count}x{offset}o
ED-H{target} yy,MM,dd,HH,mm,ss,
ECAL{target} ...
ECON{target} ...
```

Lecture principale :
1. `TEMP`
2. si timeout : retry `TEMP` apres 10 s
3. si encore timeout : fallback `FTEM`

Extraction principale :
- parser ligne `Temperature=...`
- parser aussi :
  - `Serial=...`
  - `DateHeure=...`
  - `Batterie=...`
  - `RSSI=...`

Specificites :
- la temperature est envoyee directement dans le payload ASCII
- `ShouldApplyMetrology = false` pour GSP
- le serveur peut synchroniser une configuration :
  - horloge
  - calibrage
  - consignes
  - frequence
- lecture memoire disponible via `MEMO`

Unite stockee :
- `C`

## 4. Champs BDD critiques par famille

### IN / IE / IP / IC / IH
- `Sonde_Numero_Serie` : serial metier
- `Adresse_Sonde` : adresse courte ASCII, souvent les 4 derniers caracteres
- `Port_Serie` : port du module / cle / boitier

### EN
- `Sonde_Numero_Serie` : serial metier
- `Adresse_Sonde` : adresse numerique courte (`byte`)
- ne pas stocker le serial complet dans `Adresse_Sonde`

### HN
- `Sonde_Numero_Serie` : serial metier
- `Adresse_Sonde` : adresse sonde sur 4 caracteres hex
- `Module_Numero_Serie` : adresse module sur 4 caracteres hex

### GSP
- `Sonde_Numero_Serie` : serial metier
- `Adresse_Sonde` : cible de commande si differente du serial
- `Famille_Sonde` : `GSP`

## 5. Timeouts principaux

Valeurs codees actuellement :
- `IN` : 5 s
- `IE` : 2 s
- `IP` : 2 s
- `IC` : 2 s
- `IH` : 2 s
- `EN` : 2 s
- `HN` : retry apres 1 s, timeout final apres 2 s supplementaires
- `GSP` : timeouts dedies dans `SensorGSP.cs` selon la commande

## 6. Remarques utiles

- `IQ` apparait dans le `switch` mais n'a pas d'implementation active cote capteur.
- Les types historiques `E` et `H` ne sont pas interroges directement comme tels :
  - `E + module BTR` -> `EN`
  - `H + module MRH` -> `HN`
- Les types `GSO` / `GSP` de haut niveau en base ne doivent pas etre proposes tels quels a la creation quand un sous-type concret existe deja.
- Pour les protocoles binaires, les logs `raw=` peuvent contenir des caracteres de controle et donc paraitre etranges. Le log `hex=` est la representation fiable a analyser.
