## 🎯 Objectif

Traiter **jusqu’à ~1000 mesures en même temps**, détecter les **dépassements de seuils avec retard**, et insérer **mesures + alarmes** efficacement, sans surcharger MySQL.

---

## 🧠 Principe général

👉 **Toute la logique d’alarme se fait côté serveur C#**
👉 **MySQL sert au stockage + état minimal**, pas au calcul temps réel

---

## 🧩 Architecture recommandée

### 1️⃣ Côté serveur C# (cœur du système)

* Le serveur reçoit un batch de mesures (ex: 1000 sondes)
* Il garde **en mémoire** :

  * les consignes par sonde (seuil bas / haut, retard)
  * l’état courant d’alarme (depuis quand ça dépasse, état actif ou non)

👉 Tout le calcul se fait **en RAM** (rapide, scalable)

---

### 2️⃣ Cache mémoire

**Deux caches distincts :**

#### 🔹 Cache de configuration (statique / peu fréquent)

Par sonde :

* `seuilBas`
* `seuilHaut`
* `retardAlarme`
* (optionnel) hysteresis, enabled…

Chargement :

* au démarrage
* * refresh périodique (ex: toutes les 1–5 min)
* ou à la modif via l’admin

➡️ Pas besoin d’aller en BDD à chaque mesure

---

#### 🔹 Cache d’état d’alarme (runtime)

Par sonde :

* `isOutOfRange`
* `outOfRangeSince`
* `isAlarmActive`
* `lastValue`
* `lastTimestamp`

➡️ Sert à gérer le **retard d’alarme** et les **transitions**

⚠️ Optionnel mais recommandé : persister cet état en BDD pour survivre aux redémarrages

---

### 3️⃣ Logique d’alarme (simplifiée)

Pour chaque mesure :

1. vérifier si la valeur est hors seuil
2. si oui :

   * démarrer / continuer le timer `outOfRangeSince`
   * déclencher l’alarme **seulement si** `retard dépassé`
3. si retour à la normale :

   * clôturer l’alarme si elle était active

👉 **Une alarme = une transition**, pas une par mesure

---

### 4️⃣ Écritures en base (performant)

À la fin du batch :

* `INSERT` **bulk** des mesures
* `INSERT` **bulk** des événements d’alarme (entrées / sorties)
* (optionnel) `UPSERT` de l’état courant d’alarme

➡️ 1 transaction, peu d’I/O, pas de triggers lourds

---

## 🚫 Ce qu’on évite volontairement

❌ Triggers MySQL pour la logique d’alarme
❌ Calcul métier dans la base
❌ Un insert / select / insert par mesure
❌ Spam d’alarmes à chaque point hors seuil

---

## ✅ Bénéfices

* ultra performant (RAM + bulk insert)
* logique claire et testable en C#
* MySQL reste stable et scalable
* facile à faire évoluer (nouveaux seuils, règles, anti-spam)
* supporte très bien des gros volumes de sondes

---

## 🧠 En une phrase

> **Le serveur C# décide, la base de données enregistre.**
