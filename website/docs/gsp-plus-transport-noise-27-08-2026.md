# GSP — séquence `+++` reçue avant la réponse utile

## Référence

- Dépôt : `justNuka/vigitemp`
- Branche d’intégration : `dev`
- Correctif initial : branche `agent/server-gsp-plus-response`, PR #61 — **mergée** le 27/08/2026, merge `2164f017a761a163a1a397a89afb7dbd17a42ece`.
- Correctif complémentaire Surveillance : branche `agent/gsp-surveillance-coefficients`.
- Date du retour terrain : 27/08/2026
- Composant concerné : Serveur d’interrogation Windows
- Version Serveur du correctif initial Hotline/Métrologie : `0.90.2`
- Version Serveur visée pour la couverture Surveillance : `0.90.3`

## Retour terrain

Lors de lectures GSP utilisées notamment en Ajustage, certaines interrogations reçoivent d’abord la séquence série `+++`, puis la vraie réponse GSP arrive juste après.

Exemple observé :

```text
RX[ascii]=+++
PURGE[ascii]=ACK=TEMP\r\nSerial=SPNB-26000103\r\nDateHeure=...\r\nMesure=37.06\r\n...\r\nEND
```

Le Serveur terminait la lecture dès `+++`, considérait cette séquence comme une réponse non exploitable, puis le mécanisme de purge consommait et jetait la trame `ACK=TEMP ... END` arrivée ensuite. L’opération remontait alors à tort :

```text
Aucune température exploitable pour la sonde demandée dans la réponse GSP.
```

## Cause confirmée — Hotline / métrologie

Dans `HotlineApiServer.ReadGspResponse()`, toute donnée non vide après suppression de l’écho était considérée comme significative. `+++` démarrait donc le délai de silence de fin de réponse (`GspEndOfResponseSilenceMs`, 500 ms par défaut). Si la vraie trame n’arrivait pas avant ce délai, la fonction retournait `+++` et `PurgeAfterGspCommand()` récupérait ensuite la réponse utile.

Le log terrain correspond exactement à ce scénario : `RX=+++`, puis la trame complète dans `PURGE`.

La PR #61 a corrigé ce chemin pour Hotline, Ajustage et Étalonnage.

## Complément confirmé — Surveillance

La Surveillance GSP n’utilise pas `HotlineApiServer` pour ses interrogations périodiques : elle passe par `SensorGSP` et le lecteur `ReadResponseAsync()`.

Dans ce lecteur :

- le délai avant la première donnée significative est de 2 secondes par défaut ;
- une fois une donnée considérée significative, le lecteur applique ses délais de réponse incomplète/completion ;
- avant ce complément, `+++` était lui aussi vu comme une première donnée significative.

Cela pouvait donc provoquer le même défaut en Surveillance si la vraie trame arrivait après le délai de silence appliqué à cette réponse incomplète.

## Correctif complémentaire

Fichier principal :

- `Vigitemp Serveur/Vigitemp Serveur/sensors/GspProtocol.cs`

Le filtrage du token exact `+++` est maintenant placé dans la couche protocolaire commune `GspProtocol.StripCommandEcho()` :

- `+++` seul devient une réponse vide/non significative ;
- `+++` en tête du flux est retiré ;
- une ligne dédiée `+++` est retirée ;
- le lecteur Surveillance continue donc d’attendre la vraie trame dans ses délais normaux ;
- Hotline/Métrologie continuent également de bénéficier du filtrage ;
- aucune temporisation Surveillance n’est augmentée ou diminuée par ce lot.

Le filtrage ne supprime jamais les signes `+` contenus dans les valeurs métier, par exemple :

```text
Alarm=F+D+E+LH+LB+RB+RH
```

## Versioning

- Serveur `0.90.2 -> 0.90.3` pour le complément Surveillance et les contrôles ECON associés au même lot ;
- Installateur Serveur `0.90.2 -> 0.90.3` ;
- le Web évolue séparément en `0.90.2` pour le contrôle des réponses ECON `ovf` documenté dans `gsp-econ-overflow-27-08-2026.md` ;
- Agent inchangé (`1.0.1`) ;
- aucune migration BDD.

## Checklist de validation terrain

### Hotline / Ajustage / Étalonnage

- [ ] reproduire une lecture où le module émet `+++` avant `ACK=TEMP` ;
- [ ] vérifier que le log `RX` contient la vraie réponse exploitable et non `+++` seul ;
- [ ] vérifier que la valeur `Mesure` est bien remontée dans Ajustage ;
- [ ] vérifier Étalonnage ;
- [ ] vérifier une lecture Hotline GSP hors métrologie.

### Surveillance

- [ ] placer une GSP en Surveillance sur le firmware/module qui peut produire `+++` ;
- [ ] provoquer ou observer `+++` avant la vraie trame `ACK=TEMP` ;
- [ ] confirmer qu’aucun timeout/parse error n’est généré uniquement à cause de `+++` ;
- [ ] confirmer que la vraie valeur `Mesure` est insérée ;
- [ ] vérifier plusieurs sondes successives sur le même port/module ;
- [ ] vérifier une lecture normale sans `+++` ;
- [ ] vérifier que `Alarm=F+D+E+LH+LB+RB+RH` reste intact.

### Build

- [ ] compiler le projet Serveur Windows ;
- [ ] compiler/publier l’installateur Serveur `0.90.3`.

## Limites

Le correctif traite uniquement le token exact `+++` comme séquence de contrôle de transport. Il ne modifie pas les timings firmware/module et ne masque pas les autres réponses non reconnues : toute autre donnée inattendue continue d’être journalisée et traitée selon le comportement existant.
