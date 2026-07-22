**Préparation**
Utilise une sonde de test, car l’opération enregistre réellement de nouveaux coefficients.

Il faut :

- Une licence Standard ou Expert.
- L’autorisation `ACCES_AJUSTAGE_ETALONNAGE`.
- Une sonde GSP associée à un module et un port COM.
- Une sonde étalon de type `SPET`, non externe, également associée à un module/port.
- Idéalement un milieu d’intercomparaison configuré.
- Le serveur C# et le site web démarrés.

Teste d’abord une commande `TEMP` depuis la hotline sur la GSP et la SPET pour confirmer qu’elles répondent.

**Test rapide**
1. Ouvre `/fr/admin/metrologie/realiser-ajustage`.
2. Sélectionne une seule GSP pour commencer.
3. Passe à l’étape d’ajustage.
4. Sélectionne la SPET.
5. Renseigne :
   - Durée du plateau : `1 minute`.
   - Écart maximal : `0,5` pour un premier test permissif.
   - Nombre de décimales : `2`.
6. Place la GSP et la SPET dans un environnement stable.
7. Clique sur `Démarrer l’ajustage`.

Le serveur interroge successivement l’étalon puis chaque GSP. Une nouvelle boucle commence environ 12 secondes après la fin de la précédente.

Pendant l’opération, vérifie :

```sql
SELECT
    Id_Sonde,
    Sonde_Numero_Serie,
    Surveillance_Etat,
    Etat_Sonde_N1,
    Metrologie_En_Cours,
    Metrologie_cmd_envoyee
FROM vigi_main.t_sonde
WHERE Sonde_Numero_Serie IN ('NUMERO_GSP');
```

Attendu :

- `Surveillance_Etat = 'A'`
- `Metrologie_En_Cours = 1`
- L’ancien état est conservé dans `Etat_Sonde_N1`

Pour le lieu :

```sql
SELECT
    Id_Lieu,
    Nom_Lieu,
    Lieu_Etat,
    Lieu_Etat_N1
FROM vigi_main.t_lieu
WHERE Sonde_Numero_Serie = 'NUMERO_GSP';
```

Attendu : `Lieu_Etat = 'A'`.

Les lectures doivent aussi apparaître ici :

```sql
SELECT *
FROM vigi_mesures.tm_mesures_ajustage
WHERE Sonde_Numero_Serie = 'NUMERO_GSP'
ORDER BY Date_Heure_Mesure DESC;

SELECT *
FROM vigi_mesures.tm_mesures_ajustage_etalon
ORDER BY Date_Heure_Mesure DESC;
```

**Validation des points**
1. Renseigne la valeur du premier point.
2. Clique sur `Valider`.
3. Pendant une minute, ne touche pas au bain.
4. Le point doit passer comme validé.
5. Change suffisamment la température du bain.
6. Attends sa stabilisation.
7. Valide le second point.

Après le second plateau, l’ajustage est automatiquement finalisé.

Contrôle le résultat :

```sql
SELECT
    Id_Ajustage,
    Date_Heure_Ajustage,
    Sonde_Numero_Serie,
    Coeff_X,
    Coeff_Constant,
    Mesure_Etalon1,
    Mesure_Etalon2,
    Valeur_Brute1,
    Valeur_Brute2,
    Operateur
FROM vigi_main.t_ajustage
WHERE Sonde_Numero_Serie = 'NUMERO_GSP'
ORDER BY Date_Heure_Ajustage DESC;
```

Les calculs attendus sont :

```text
Coeff_X = (MesureEtalon2 - MesureEtalon1)
          / (ValeurBrute2 - ValeurBrute1)

Coeff_Constant = MesureEtalon1
                 - (Coeff_X × ValeurBrute1)
```

Les états doivent ensuite revenir à leur valeur précédente :

- `Surveillance_Etat` restauré.
- `Lieu_Etat` restauré.
- `Metrologie_En_Cours = 0`.
- `Metrologie_cmd_envoyee = 0`.

Un bouton d’export XML doit apparaître pour chaque sonde ajustée.

**Tests d’erreur**
Tu peux ensuite vérifier :

1. Écart maximal réglé à `0,01` puis variation de l’étalon : le point courant doit être invalidé.
2. Arrêt en cours d’opération : confirmation puis suppression des résultats de la session.
3. Sélection de sondes avec des unités différentes : elles ne doivent pas pouvoir être regroupées.
4. Étalon externe : le démarrage doit être refusé.
5. Sonde non GSP ou étalon non SPET : refus explicite.
6. Sonde sans module ou port COM : refus au démarrage.
7. Deux GSP sélectionnées : chacune doit obtenir ses propres moyennes et coefficients.

**Point à surveiller**
Le workflow enregistre les coefficients dans `t_ajustage`, mais il n’envoie pas directement `ECAL` depuis la session web. Il faudra donc vérifier dans les logs du serveur que la synchronisation de configuration récupère ensuite les nouveaux coefficients et envoie :

```text
[SONDE][TX] ... cmd=ECAL...
```

Ne redémarre pas le site pendant le test : la session d’ajustage active est actuellement conservée en mémoire par le processus web.