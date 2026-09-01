# GSP — `ECON` acquitté avec coefficient en overflow (`ovf`)

## Référence

- Dépôt : `justNuka/vigitemp`
- Branche d’intégration : `dev`
- Branche du correctif : `agent/gsp-surveillance-coefficients`
- Date du retour terrain : 27/08/2026
- Composants concernés : Serveur d’interrogation Windows + Web (métrologie)
- Versions visées : Serveur `0.90.3`, Web `0.90.2`

## Retour terrain

Un retour firmware GSP a été observé après un envoi `ECON` :

```text
ENDECONSPNB-26000102 1.0000000000a450000000.0000000000b0.0000000000
ACK=ECON
Serial=SPNB-26000102
A=1.000000000
B=ovf
END
```

Le point important est que la valeur anormale est déjà présente dans la trame sortante : le coefficient `B` vaut environ `450000000` avant que la sonde ne réponde. Le `B=ovf` firmware est donc un signal de dépassement explicite, et non la cause de la valeur envoyée.

## État vérifié dans le code

Les coefficients transmis à la GSP proviennent du dernier ajustage persisté (`t_ajustage`) :

- linéaire : `A = Coeff_X`, `B = Coeff_Constant`, `C = 0` ;
- multipoint : `A = Coeff_X2`, `B = Coeff_X`, `C = Coeff_Constant`.

Les helpers de formatage (`FormatCoefficient()` côté C#, `formatCoefficient()` côté Web) ne multiplient pas les coefficients : ils normalisent les très petites valeurs à zéro puis sérialisent sur 10 décimales. Une valeur `450000000` ne peut donc pas être créée par ce formatage.

Le calcul d’ajustage linéaire utilise la formule historique :

```text
Coeff_X = (MesureEtalon2 - MesureEtalon1) / (ValeurBrute2 - ValeurBrute1)
Coeff_Constant = MesureEtalon1 - Coeff_X * ValeurBrute1
```

Le moteur refuse le cas strict `ValeurBrute1 === ValeurBrute2`, mais une différence très faible et non nulle peut mathématiquement produire un coefficient très grand. La capture seule ne permet pas d’affirmer que c’est la source du `450000000` observé : il faut vérifier la dernière ligne `t_ajustage` de la sonde et les deux valeurs brutes ayant servi au calcul.

## Correctif du lot

### Serveur / Surveillance

`GspProtocol.IsAcknowledgementForTarget()` ne considère plus une réponse comme un acquittement valide lorsqu’un champ `*=ovf` est présent.

Exemple :

```text
ACK=ECON
Serial=SPNB-26000102
A=1.000000000
B=ovf
END
```

Cette réponse est maintenant traitée comme un échec de synchronisation de configuration, malgré la présence de `ACK=ECON`.

### Web / Ajustage / Étalonnage

Le chemin d’envoi des configurations GSP de métrologie inspecte également la réponse brute. Si un champ est en `ovf`, l’opération remonte une erreur explicite avec le nom du champ concerné au lieu de valider silencieusement l’ECON.

### Choix volontaire : aucune borne arbitraire

Le correctif ne clamp pas et ne remplace pas automatiquement les coefficients. Aucune plage numérique officielle du firmware n’est documentée dans le dépôt à ce jour ; imposer une limite arbitraire risquerait de modifier une configuration pourtant valide sur un autre modèle/firmware.

Le diagnostic de la valeur source reste donc nécessaire.

## Diagnostic terrain à effectuer pour `SPNB-26000102`

Vérifier la dernière ligne d’ajustage :

```sql
SELECT
  Id_Ajustage,
  Date_Heure_Ajustage,
  Sonde_Numero_Serie,
  Coeff_X2,
  Coeff_X,
  Coeff_Constant,
  Mesure_Etalon1,
  Mesure_Etalon2,
  Valeur_Brute1,
  Valeur_Brute2
FROM t_ajustage
WHERE Sonde_Numero_Serie = 'SPNB-26000102'
ORDER BY Date_Heure_Ajustage DESC, Id_Ajustage DESC
LIMIT 5;
```

Points à contrôler :

- le coefficient `450000000` est-il déjà présent dans `Coeff_X`, `Coeff_Constant` ou `Coeff_X2` ?
- les deux valeurs brutes du dernier ajustage sont-elles quasiment identiques ?
- la ligne provient-elle d’un ajustage automatique à deux points ou d’une modification manuelle A/B/C ?
- existe-t-il une ligne plus récente créée pendant la prélecture d’Étalonnage ?
- la sonde est-elle en mode linéaire (`Coeff_X2 = 0`) ou multipoint (`Coeff_X2 != 0`) ?

## Checklist de validation terrain

- [ ] provoquer/rejouer un `ECON` dont le firmware retourne `B=ovf` ;
- [ ] confirmer que la Surveillance ne considère plus cet `ACK=ECON` comme un succès ;
- [ ] confirmer que la métrologie Web affiche une erreur indiquant le champ `B` ;
- [ ] vérifier qu’un `ACK=ECON` normal sans `ovf` reste accepté ;
- [ ] tester `A=ovf`, `B=ovf` et `C=ovf` si le firmware permet de les reproduire ;
- [ ] vérifier la dernière ligne `t_ajustage` de `SPNB-26000102` ;
- [ ] comparer les valeurs de la DB à la trame `ECON` réellement journalisée ;
- [ ] vérifier un ajustage linéaire normal et un ajustage multipoint normal ;
- [ ] compiler le Serveur Windows ;
- [ ] lancer `pnpm lint`, `pnpm i18n:check` et `pnpm build` pour le Web.

## Compatibilité

- aucune migration BDD ;
- aucune modification de la formule métier ;
- aucun changement du mapping A/B/C ;
- Serveur `>= 0.90.3` requis pour rejeter `ovf` sur le chemin Surveillance ;
- Web `>= 0.90.2` requis pour remonter explicitement `ovf` sur les ECON de métrologie ;
- Agent Windows inchangé.
