# IA on-premise pour la licence Expert de VigiSensys

## 1. Contexte

Dans la licence Expert de VigiSensys, l’objectif est d’intégrer de l’intelligence artificielle pour deux usages principaux :

1. **Assistant conversationnel / chat**
   - aider les utilisateurs à poser des questions sur le produit ;
   - assister au troubleshooting ;
   - répondre sur les fonctionnalités, alarmes, sondes, configurations, licences, procédures, etc.

2. **Analyse avancée et prévention**
   - détecter des dérives ;
   - anticiper des sorties de tolérance ;
   - identifier des comportements anormaux ;
   - mettre en avant des zones ou capteurs à surveiller ;
   - produire des résumés intelligents compréhensibles par l’utilisateur.

Le produit étant **déployé on-premise chez les clients**, avec la possibilité que certains environnements soient **coupés d’Internet**, l’architecture IA doit être pensée pour fonctionner **localement**, de manière **autonome**, **robuste** et **maintenable**. Ollama, par exemple, expose une API locale par défaut sur `http://localhost:11434/api`, fonctionne sur Windows, Linux et macOS, et sur Windows il tourne comme une application native avec support GPU NVIDIA et AMD Radeon. :contentReference[oaicite:0]{index=0}

---

## 2. Recommandation générale

La recommandation principale est la suivante :

**Ne pas construire “une seule IA” qui ferait tout.**

Il faut au contraire séparer le besoin en **deux briques complémentaires** :

### 2.1. Brique A — Assistant conversationnel local
Cette brique sert à :
- répondre aux questions ;
- guider l’utilisateur ;
- retrouver des procédures ;
- assister le support ;
- reformuler clairement des informations internes.

### 2.2. Brique B — Moteur d’analyse / prévention
Cette brique sert à :
- analyser les mesures issues des sondes ;
- détecter des dérives ;
- anticiper un risque de dépassement ;
- identifier des anomalies ;
- remonter des insights structurés.

### 2.3. Pourquoi séparer les deux
Un grand modèle de langage est très bon pour :
- comprendre une question ;
- reformuler une réponse ;
- résumer ;
- expliquer un résultat.

En revanche, il ne doit pas être considéré comme le moteur principal de :
- calcul métier ;
- détection de seuil ;
- règles critiques ;
- prévision de séries temporelles.

La bonne architecture est donc :

- **moteur analytique** pour calculer les risques et les anomalies ;
- **LLM local** pour expliquer ces résultats à l’utilisateur.

---

## 3. Ce qu’il ne faut pas faire

### 3.1. Ne pas entraîner un modèle from scratch
Ce serait beaucoup trop coûteux, trop complexe et inutile pour ce cas d’usage.

### 3.2. Ne pas compter uniquement sur un énorme fichier `.md` ou `.txt`
Mettre toute la connaissance produit dans un seul gros document puis l’injecter “tel quel” dans le prompt n’est pas une bonne solution :
- difficile à maintenir ;
- peu scalable ;
- faible traçabilité ;
- moins bon rappel des bonnes informations ;
- impossible à exploiter proprement à mesure que la documentation grossit.

### 3.3. Ne pas confier la logique métier critique au LLM
Les calculs de dérive, de risque, d’anomalie, de sortie de tolérance doivent rester :
- déterministes ;
- audités ;
- traçables ;
- validables par l’équipe métier.

---

## 4. Architecture cible recommandée

## 4.1. Vue d’ensemble

Architecture recommandée sur le serveur client :

- **Application web VigiSensys** (Next.js)
- **Serveur métier / interrogation** (C#)
- **Base de données** (mesures, configuration, alarmes, etc.)
- **Service IA local** séparé
  - moteur LLM local ;
  - moteur RAG ;
  - base vectorielle ;
  - moteur d’analyse / prévention.

### 4.2. Pourquoi un service IA séparé
Il est préférable d’avoir un service distinct pour :
- isoler les dépendances IA ;
- pouvoir l’installer ou non selon la licence / machine ;
- faciliter les mises à jour ;
- séparer clairement la logique métier de la couche IA ;
- pouvoir adapter le module selon CPU-only ou GPU.

---

## 5. Partie 1 — Chat / assistant conversationnel

## 5.1. Approche recommandée : RAG

Pour l’assistant, l’approche recommandée est le **RAG** (Retrieval-Augmented Generation).

Principe :
1. l’utilisateur pose une question ;
2. le système recherche les extraits les plus pertinents dans une base documentaire indexée ;
3. ces extraits sont transmis au modèle ;
4. le modèle répond à partir de ces sources.

Cette approche est préférable à un entraînement spécifique dans la majorité des cas :
- plus simple à maintenir ;
- plus rapide à mettre en place ;
- meilleure traçabilité ;
- plus simple à mettre à jour ;
- plus fiable quand la documentation évolue.

Qdrant est une base vectorielle open source conçue pour la recherche sémantique, avec un mode local et même un stockage on-disk persistant en local. :contentReference[oaicite:1]{index=1}

## 5.2. Sources documentaires à indexer
L’assistant peut s’appuyer sur :
- documentation fonctionnelle ;
- documentation technique ;
- procédures d’installation ;
- procédures de maintenance ;
- FAQ support ;
- procédures hotline ;
- explications des alarmes ;
- guides d’utilisation des modules ;
- documentation des sondes ;
- documentation des GSO ;
- notes métier internes ;
- comptes rendus de tickets support résolus ;
- procédures de calibration / étalonnage ;
- descriptions des licences et limitations.

## 5.3. Fonctionnement détaillé
Flux typique :

1. question utilisateur ;
2. nettoyage / reformulation éventuelle ;
3. génération d’embedding ;
4. recherche vectorielle dans la base documentaire ;
5. récupération des meilleurs extraits ;
6. construction du prompt final :
   - consignes système ;
   - contexte documentaire ;
   - éventuellement contexte applicatif courant ;
7. réponse générée ;
8. affichage avec, idéalement, mention des sources utilisées.

## 5.4. Bénéfices
- réponses contextualisées ;
- mise à jour simple de la base de connaissance ;
- possibilité de citer les documents sources ;
- réduction des hallucinations ;
- meilleure exploitabilité en environnement métier.

---

## 6. Partie 2 — Analyse avancée / prévention

## 6.1. Approche recommandée
La prévention ne doit pas être pilotée directement par le LLM.

Il faut un **moteur analytique dédié** capable de produire :
- scores de risque ;
- détections d’anomalies ;
- estimations de tendance ;
- prévisions à court terme ;
- alertes “préventives” ;
- résumés structurés.

Ensuite, le LLM peut transformer ces résultats techniques en phrases compréhensibles.

## 6.2. Cas d’usage V1 recommandés
Pour une première version réaliste et utile :

### a. Dérive progressive
Exemple :
- une température reste dans la plage autorisée ;
- mais sa pente montre une dérive continue vers la borne haute ;
- le moteur indique qu’il faut surveiller.

### b. Risque de sortie de tolérance à court terme
Exemple :
- si la tendance continue, un dépassement est probable dans 1h, 2h ou 4h.

### c. Comportement inhabituel
Exemple :
- une pièce a un comportement anormal par rapport à son historique habituel ;
- ou un capteur dévie du comportement des autres capteurs du même lieu.

### d. Instabilité anormale
Exemple :
- oscillations plus importantes qu’à l’habitude ;
- micro-décrochages ;
- phases instables.

### e. Résumé intelligent quotidien
Exemple :
- “3 lieux à surveiller aujourd’hui” ;
- “2 capteurs montrent une dérive positive depuis ce matin”.

## 6.3. Données à exploiter
Le moteur d’analyse peut utiliser :
- historique de mesures ;
- seuils et tolérances ;
- type de sonde ;
- lieu / salle / équipement ;
- fréquence de mesure ;
- horaires ;
- jours ouvrés / week-end ;
- alarmes passées ;
- événements de maintenance ;
- recalibrages ;
- pertes de communication ;
- éventuels événements d’ouverture / fermeture si disponibles.

## 6.4. Technologies analytiques possibles
### V1 simple et robuste
- règles métier ;
- statistiques descriptives ;
- pentes / dérivées ;
- seuils dynamiques ;
- comparaison à l’historique ;
- détection d’anomalies simple.

### V2 plus avancée
- modèles de forecast time series ;
- modèles d’anomalie plus élaborés ;
- scoring probabiliste ;
- corrélation entre plusieurs capteurs.

TimesFM de Google Research est justement un foundation model préentraîné pour la prévision de séries temporelles. Cela peut être intéressant à étudier pour une V2 ou pour des POC ciblés, mais pas forcément indispensable à la première version. :contentReference[oaicite:2]{index=2}

---

## 7. Choix technologiques recommandés

## 7.1. Runtime LLM local

### Option recommandée V1 : Ollama
Pourquoi :
- installation relativement simple ;
- API locale ;
- adapté aux modèles locaux ;
- fonctionne sur Windows ;
- supporte le tool calling ;
- bien adapté à un service local sur machine client.

Ollama expose une API locale, supporte le tool calling, et fonctionne sur Windows avec support GPU NVIDIA et AMD Radeon. :contentReference[oaicite:3]{index=3}

### Option alternative : llama.cpp
Très bon choix si l’objectif est :
- une solution très légère ;
- un meilleur contrôle ;
- une exécution CPU-friendly ;
- l’utilisation de modèles GGUF.

### Option plus “serveur IA” : vLLM
Très puissant pour du serving haute performance, avec un serveur compatible OpenAI, mais l’OS recommandé dans la documentation quickstart est Linux. Pour un environnement client Windows on-prem classique, ce n’est généralement pas le premier choix. :contentReference[oaicite:4]{index=4}

## 7.2. Base vectorielle
### Recommandation : Qdrant
Pourquoi :
- open source ;
- orienté recherche vectorielle ;
- bien adapté au RAG ;
- peut être exécuté localement ;
- possibilité de mode local / on-disk selon les usages. :contentReference[oaicite:5]{index=5}

## 7.3. Moteur d’analyse
Deux approches possibles :
- **Python** pour bénéficier rapidement d’un écosystème data/ML vaste ;
- **C#** si l’on veut rester au plus proche du socle métier existant.

Recommandation pragmatique :
- V1 analytique simple en C# ou Python ;
- si besoin de modèles plus avancés ensuite, Python sera souvent plus pratique.

---

## 8. Choix de modèles

## 8.1. Modèle de chat
Pour le chat documentaire local, viser un modèle :
- instruct ;
- assez bon en compréhension ;
- raisonnable en taille ;
- exploitable sur machine cliente.

Des familles comme **Qwen 3** sont intéressantes pour ce type d’usage, avec de bonnes capacités d’instruction, multilingues et plusieurs tailles disponibles. :contentReference[oaicite:6]{index=6}

### Taille conseillée
- **4B** : acceptable pour petite machine / FAQ simples ;
- **7B / 8B** : très bon compromis pour une V1 sérieuse ;
- **14B+** : plus qualitatif, mais plus exigeant.

### Recommandation
Pour une V1 :
- **7B ou 8B instruct quantized**.

## 8.2. Modèle d’embeddings
Il faut utiliser un modèle dédié aux embeddings, pas le LLM principal. La série **Qwen3 Embedding** existe justement pour les tâches d’embedding et de ranking. :contentReference[oaicite:7]{index=7}

## 8.3. Faut-il un modèle multimodal ?
Pas nécessaire dans un premier temps pour le chat et la prévention sur données capteurs.

Un modèle vision pourrait devenir utile plus tard pour :
- interpréter des captures d’écran ;
- assister sur des interfaces complexes ;
- analyser des schémas ou rapports visuels.

Mais ce n’est pas indispensable pour la V1.

---

## 9. Déploiement on-premise

## 9.1. Faut-il embarquer le modèle dans le package d’installation ?
### Réponse courte
**Pas dans le package principal de l’application.**

### Pourquoi
Les modèles sont volumineux :
- package plus lourd ;
- installation plus longue ;
- mise à jour plus complexe ;
- besoin de variantes selon la machine ;
- problématique si plusieurs modèles sont nécessaires.

## 9.2. Recommandation
Créer un **module IA séparé** :
- package principal VigiSensys ;
- package IA optionnel ;
- variantes selon le profil matériel.

Exemple :
- **package app standard**
- **package IA CPU**
- **package IA GPU**
- **package IA avancé**

## 9.3. Cas des environnements sans Internet
Dans les environnements air-gapped :
- ne pas dépendre d’un téléchargement de modèle à l’installation ;
- prévoir un mécanisme d’import offline ;
- livrer les poids ou les artefacts sur support contrôlé ;
- versionner précisément les modèles installés.

---

## 10. Préconisations matérielles

Les besoins exacts dépendent :
- du modèle choisi ;
- de sa quantization ;
- du nombre d’utilisateurs simultanés ;
- du niveau de latence attendu ;
- de la présence ou non d’un GPU.

## 10.1. Profil minimal acceptable
Pour une expérience basique :
- CPU moderne 8 à 12 cœurs ;
- 32 Go RAM ;
- SSD NVMe ;
- pas de GPU obligatoire.

Usage cible :
- petit modèle local ;
- chat simple ;
- un ou peu d’utilisateurs simultanés.

## 10.2. Profil recommandé
Pour un usage professionnel confortable :
- CPU moderne ;
- 64 Go RAM ;
- SSD NVMe ;
- GPU dédié recommandé.

## 10.3. Profil conseillé pour une vraie expérience premium
- 64 Go RAM ;
- GPU 12 à 16 Go VRAM minimum ;
- idéalement plus pour monter en taille de modèle et en réactivité.

## 10.4. Conclusion matérielle
- **CPU only** : faisable ;
- **GPU** : préférable pour une vraie expérience utilisateur.

---

## 11. Données d’apprentissage et préparation des connaissances

## 11.1. Faut-il “entraîner” le modèle avec un énorme document ?
Pas au sens classique du terme.

Il faut distinguer :

### a. la connaissance documentaire
Elle doit aller dans une base RAG.

### b. le comportement de réponse
Il peut être piloté par :
- prompt système ;
- consignes ;
- exemples ciblés ;
- éventuellement fine-tuning plus tard.

### c. les analyses métier
Elles doivent venir du moteur analytique, pas du LLM.

## 11.2. Corpus documentaire recommandé
Préparer un corpus propre et versionné :
- docs utilisateur ;
- docs admin ;
- docs installation ;
- docs capteurs ;
- docs alarmes ;
- docs licence ;
- procédures support ;
- cas fréquents de dépannage ;
- tickets résolus anonymisés si utile ;
- notes métier validées.

## 11.3. Structuration documentaire
Il faudra :
- découper les documents en chunks cohérents ;
- conserver les métadonnées :
  - type de document ;
  - version ;
  - langue ;
  - module concerné ;
  - niveau de criticité ;
  - date de mise à jour.

---

## 12. Faut-il préparer des centaines de questions / réponses ?

### Oui, mais pas comme source principale de connaissance
Il est pertinent de préparer un jeu de Q/R pour :

### 12.1. Validation
Tester si le système répond correctement aux questions réelles.

### 12.2. Qualité
Comparer les résultats entre plusieurs modèles ou plusieurs prompts.

### 12.3. Few-shot
Guider le style de réponse avec quelques exemples.

### 12.4. Future évolution
Préparer un éventuel fine-tuning plus tard.

### Recommandation
Créer un dataset interne de test avec :
- 100 à 500 questions réalistes ;
- plusieurs formulations par question ;
- réponses attendues ;
- niveau de criticité ;
- sources de vérité.

---

## 13. Fine-tuning ou pas ?

## 13.1. Recommandation V1
**Pas de fine-tuning au départ.**

Commencer par :
- bon modèle local ;
- bon prompt système ;
- bon pipeline RAG ;
- bonnes sources documentaires ;
- bon moteur analytique.

## 13.2. Quand envisager un fine-tuning
Seulement si :
- le comportement attendu est très spécifique ;
- la terminologie métier est trop particulière ;
- le volume de cas réels est suffisant ;
- le retour sur investissement est clair.

---

## 14. Prompting et garde-fous

## 14.1. Prompt système recommandé
Le système doit explicitement imposer :
- ne pas inventer ;
- préférer répondre à partir des sources ;
- dire clairement quand l’information n’est pas disponible ;
- différencier hypothèse et certitude ;
- ne pas proposer d’action critique sans validation humaine ;
- mentionner le document source si possible ;
- adopter un ton professionnel et clair.

## 14.2. Garde-fous nécessaires
- limitation des hallucinations ;
- journalisation des requêtes ;
- journalisation des sources utilisées ;
- possibilité de désactiver certaines capacités ;
- filtrage de certaines actions ou réponses sensibles ;
- séparation stricte entre assistance et décision automatisée.

---

## 15. Exemples de flux fonctionnels

## 15.1. Flux “chat documentaire”
1. l’utilisateur demande :  
   “Pourquoi cette sonde n’envoie plus de données ?”
2. le système interroge la base vectorielle ;
3. il récupère :
   - procédure de diagnostic ;
   - doc de la sonde ;
   - FAQ support ;
4. le modèle répond :
   - hypothèses probables ;
   - étapes de vérification ;
   - renvoi vers la procédure.

## 15.2. Flux “prévention”
1. le moteur analytique détecte une dérive sur un lieu ;
2. il calcule un risque de dépassement ;
3. il stocke un insight structuré ;
4. le front l’affiche ;
5. le LLM peut reformuler :
   “Le lieu X présente une dérive positive continue depuis 6 heures. Si cette tendance se maintient, un dépassement de la borne haute est possible à court terme. Une surveillance renforcée est recommandée.”

## 15.3. Flux “résumé quotidien”
1. le moteur analytique calcule les zones à surveiller ;
2. il synthétise les résultats ;
3. le LLM génère un résumé lisible.

---

## 16. Intégration avec VigiSensys

## 16.1. Intégration côté backend
Le backend applicatif peut :
- appeler le service IA local via HTTP ;
- transmettre contexte utilisateur ;
- transmettre contexte de page ;
- transmettre identifiant de lieu / sonde / alarme ;
- récupérer la réponse prête à afficher.

## 16.2. Intégration côté interface
Le front peut proposer :
- une fenêtre de chat ;
- un panneau “insights IA” ;
- une carte “risques à surveiller” ;
- un résumé de situation ;
- une explication contextuelle sur certaines pages.

## 16.3. Intégration avec les données métier
Le service IA peut recevoir :
- état du système ;
- alarmes actives ;
- configuration du capteur ;
- historique court des mesures ;
- statut de communication ;
- données de calibration si utile.

---

## 17. Roadmap recommandée

## 17.1. V1 — MVP utile et réaliste
Objectif :
- assistant documentaire local ;
- premiers insights de prévention simples.

Contenu :
- LLM local ;
- RAG ;
- corpus documentaire propre ;
- Qdrant local ;
- moteur analytique simple ;
- affichage d’insights ;
- quelques cas d’usage concrets de prévention.

## 17.2. V2 — montée en valeur
Objectif :
- meilleure précision ;
- meilleurs résumés ;
- plus de cas d’usage analytiques.

Contenu :
- enrichissement corpus ;
- dataset de validation plus riche ;
- forecast plus avancé ;
- meilleure priorisation des alertes ;
- tableaux de bord IA.

## 17.3. V3 — version premium avancée
Objectif :
- expérience IA plus poussée.

Contenu possible :
- modèles plus gros selon machine ;
- meilleures capacités de raisonnement ;
- moteur analytique plus avancé ;
- corrélations multi-capteurs ;
- synthèses plus intelligentes ;
- outils internes pour enrichir la base documentaire.

---

## 18. Recommandation finale

## 18.1. Ce qu’il faut faire
Pour VigiSensys Expert, la meilleure approche est :

### A. Assistant conversationnel
- LLM local ;
- RAG ;
- base documentaire versionnée ;
- réponses traçables.

### B. Prévention / analyse
- moteur analytique dédié ;
- règles métier + statistiques + éventuellement forecast ;
- LLM uniquement pour expliquer et résumer.

## 18.2. Stack conseillée pour une V1
- **runtime local** : Ollama ou llama.cpp ;
- **LLM chat** : modèle instruct 7B/8B ;
- **embeddings** : modèle dédié embeddings ;
- **vector store** : Qdrant local ;
- **moteur analytique** : C# ou Python ;
- **intégration** : service IA local appelé par l’app.

Ollama est particulièrement cohérent pour une V1 on-prem grâce à son API locale, son support Windows et son support GPU Windows. Qdrant est adapté au RAG et dispose de modes locaux. vLLM reste très intéressant mais vise surtout un serving Linux plus orienté infra IA. :contentReference[oaicite:8]{index=8}

## 18.3. Packaging recommandé
- application principale séparée ;
- module IA séparé ;
- variantes CPU / GPU ;
- support d’installation offline.

## 18.4. Positionnement produit
Le plus pertinent n’est pas de vendre “une IA générique”, mais :
- **un assistant local documenté** ;
- **un moteur de prévention intelligent**.

C’est plus crédible, plus robuste, plus maintenable, et beaucoup plus adapté à un produit on-premise industriel.

---

## 19. Synthèse courte

### Oui, c’est faisable en on-premise.
### Non, il ne faut pas entraîner un gros modèle maison from scratch.
### Non, il ne faut pas mettre toute la logique dans un chatbot unique.
### Oui, il faut séparer :
- le chat documentaire ;
- l’analyse / prévention.

### La meilleure stratégie V1 :
- modèle local ;
- RAG ;
- moteur analytique dédié ;
- packaging IA séparé ;
- fonctionnement offline prévu dès le départ.

---

## 20. Annexe — décisions recommandées

### Décision 1
Mettre en place un **service IA local séparé**.

### Décision 2
Construire le **chat avec RAG**, pas avec entraînement spécifique initial.

### Décision 3
Garder la **prévention dans un moteur analytique métier**.

### Décision 4
Prévoir un **package IA distinct** du setup principal.

### Décision 5
Préparer :
- corpus documentaire ;
- dataset de questions de test ;
- cas d’usage prioritaires.

### Décision 6
Viser une **V1 pragmatique** :
- utile ;
- maintenable ;
- traçable ;
- acceptable sur des machines clientes variées.