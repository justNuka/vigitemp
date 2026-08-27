# GSP — séquence `+++` reçue avant la réponse utile

## Référence

- Dépôt : `justNuka/vigitemp`
- Branche d’intégration : `dev`
- Branche du correctif : `agent/server-gsp-plus-response`
- Date du retour terrain : 27/08/2026
- Composant concerné : Serveur d’interrogation Windows
- Version produit Serveur visée : `0.90.2`

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

## Cause confirmée dans le code

`ReadGspResponse()` considérait toute donnée non vide après suppression de l’écho comme une donnée significative. `+++` démarrait donc le délai de silence de fin de réponse (`GspEndOfResponseSilenceMs`, 500 ms par défaut). Si la vraie trame n’arrivait pas avant ce délai, la fonction retournait `+++` et `PurgeAfterGspCommand()` récupérait ensuite la réponse utile.

Le log terrain correspond exactement à ce scénario : `RX=+++`, puis la trame complète dans `PURGE`.

## Correctif

Fichier principal :

- `Vigitemp Serveur/Vigitemp Serveur/HotlineApiServer.cs`

Le lecteur série applique désormais un filtrage de bruit de transport avant de décider qu’une donnée est significative :

- le token exact `+++` est ignoré lorsqu’il apparaît seul ou en tête du flux ;
- `+++` ne démarre donc plus le délai de silence de fin de réponse ;
- le lecteur continue d’attendre la vraie trame jusqu’à `END` ou jusqu’au timeout normal du port ;
- le même filtrage est appliqué à la valeur retournée au parseur ;
- le filtrage ne supprime jamais les signes `+` contenus dans les valeurs métier, par exemple `Alarm=F+D+E+LH+LB+RB+RH`.

Le parseur métier GSP et les formules de métrologie ne sont pas modifiés.

## Versioning

Conformément à `docs/versioning.md`, il s’agit d’un correctif compatible du Serveur :

- Serveur : `0.90.1 -> 0.90.2` via `AssemblyInformationalVersion` ;
- Installateur Serveur : `0.90.1 -> 0.90.2` ;
- Web et Agent : inchangés.

Aucune migration BDD ni modification de contrat API n’est nécessaire.

## Checklist de validation terrain

- [ ] reproduire une lecture où le module émet `+++` avant `ACK=TEMP` ;
- [ ] vérifier que le log `RX` contient désormais la vraie réponse exploitable et non `+++` seul ;
- [ ] vérifier que la valeur `Mesure` est bien remontée dans Ajustage ;
- [ ] vérifier plusieurs sondes successives sur le même port/module ;
- [ ] vérifier une lecture sans `+++` afin de confirmer l’absence de régression ;
- [ ] vérifier que `Alarm=F+D+E+LH+LB+RB+RH` reste intact ;
- [ ] vérifier Étalonnage, qui utilise le même lecteur série GSP ;
- [ ] vérifier une lecture Hotline GSP hors métrologie ;
- [ ] compiler le projet Serveur Windows ;
- [ ] compiler/publier l’installateur Serveur `0.90.2`.

## Limites

Le correctif traite `+++` comme une séquence de contrôle de transport et non comme une réponse métier. Il ne modifie pas les timings firmware/module et ne masque pas les autres réponses non reconnues : toute autre donnée inattendue continue d’être journalisée et traitée selon le comportement existant.
