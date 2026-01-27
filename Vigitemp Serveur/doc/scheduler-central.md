# Scheduler central (proposition)

## Objectif
Réduire le nombre de timers et lisser la charge d’interrogation des sondes, tout en respectant les fréquences et en tenant compte des changements de paramètres (consignes, retards, etc.).

## Principe général
- Un seul scheduler global (timer unique) qui tourne toutes les 5–10 secondes.
- Chaque sonde/lieu actif est représenté en mémoire avec sa "prochaine date d’interrogation".
- Le scheduler déclenche uniquement les sondes arrivées à échéance.

## Cycle de vie

### 1) Initialisation
- Charger les sondes/lieux actifs depuis la BDD (par serveur):
  - Identifiants (Id_Lieu, Id_Sonde), Numéro de série, Adresse_Sonde, Port_Serie
  - Fréquence (t_lieu.Frequence)
  - Consignes/retards (Consigne_Inf, Consigne_Sup, Retard_Alarme_*)
  - Etat (Lieu_Etat, Etat_Sonde)
- Pour chaque sonde, calculer la première échéance:
  - `nextRun = now + frequence` (ou `Derniere_Date_Heure + frequence` si disponible)

### 2) Scheduler global
- Un timer global (ex: toutes les 5–10s).
- À chaque tick:
  - Sélectionner les sondes où `nextRun <= now`.
  - Interroger les sondes une par une (ou par port si on souhaite paralléliser par port).
  - Après interrogation:
    - Insérer la mesure (tm_mesures + tm_graphique)
    - Mettre à jour `t_lieu.Derniere_Date_Heure`
    - Mettre à jour `t_lieu.Date_Heure_Derniere_Reponse_Recue_OK`
    - Recalculer `nextRun = now + frequence` (ou `Derniere_Date_Heure + frequence`)

### 3) Paramètres modifiés
- Ajouter un flag en base (ex: `Infos_Modifiees_Depuis_Derniere_Mesure`)
- À chaque interrogation:
  - Si flag = true, recharger les paramètres du lieu/sonde et remettre flag à false.

## Structures en mémoire (exemple)
```
class ScheduledProbe {
  int IdLieu;
  int IdSonde;
  string NumeroSerie;
  string AdresseSonde;
  string PortSerie;
  int FrequenceMinutes;
  DateTime NextRun;
  LieuAlarmSettings SettingsCache;
}
```

## Stratégies d’exécution possibles
- **Séquentiel strict** : une sonde à la fois (simple, sûr pour ports séries).
- **Par port série** : un worker par port pour paralléliser sans collisions.
- **Avec limite de concurrence** : éviter un pic CPU/IO (ex: 2–4 sondes max en parallèle).

## Avantages
- Moins de timers (1 seul)
- Charge lissée
- Contrôle total sur l’ordre et la cadence
- Facile d’ajouter des priorités ou des exceptions

## Limites
- Si beaucoup de sondes dues en même temps, certaines partiront avec un léger retard.
- Exige un bon système de gestion de concurrence si parallélisé.

## Recommandations
- Garder une tolérance (ex: 1–2 minutes) acceptable pour les clients.
- Si besoin, répartir les sondes sur plusieurs serveurs C# grâce au champ `Id_Serveur`.

---
Document conceptuel, pas encore implémenté.
