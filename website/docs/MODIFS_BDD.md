# Modifications BDD a appliquer

Objectif : appliquer les changements de schema dans Prisma, puis pousser en base.
Les triggers/vues historiques doivent etre geres cote serveur C#.

## Base vigi_main

### t_lieu (ajouts)
- Est_Lieu_Alarme_Termee_Non_Acquittee_T1 (TinyInt)
- Date_Heure_Dernier_Acquittement_En_Cours (DateTime)
- Date_Heure_Last_Update_EVT_GSO (DateTime)

Statut : schema Prisma mis a jour dans `website/prisma/db-main/schema.prisma`.

### t_alarme_histo (nouvelle table)
Objectif : archiver une alarme acquittee (suppression de `t_alarme` et insertion dans l'historique).

Schema : colonnes identiques a `t_alarme`.

Statut : schema Prisma ajoute dans `website/prisma/db-main/schema.prisma`.
Remarque : le serveur C# doit gerer le transfert vers cette table.

## Base vigi_mesures

### tm_mesures (ajouts)
- Rssi (Int)
- Tension (Float)

Statut : schema Prisma mis a jour dans `website/prisma/db-mesure/schema.prisma`.

### tm_mesures_gso (nouvelle table)
Table pour mesures GSO (sondes autonomes qui poussent vers le serveur).

Schema : conforme au SQL fourni (id_capteur + date_mesure en cle primaire).

Statut : schema Prisma ajoute dans `website/prisma/db-mesure/schema.prisma`.

## Rappels serveur C#

Ne pas creer de triggers SQL, la logique doit etre geree dans le serveur :
- EVT_GSO_DERNIERVALEUR_LIEU : recuperation derniere valeur connue
- TRG_GSO_BEF_DEL_ALARME : gestion suppression/archivage
- TRG_GSO_BEF_UPD_LIEU_ALARME : gestion des alarmes
- v_tm_mesures_dernier : inutile (memoire serveur)
- v_config_lieu_sonde : memoire serveur
- TRG_AFT_INS_MES_GSO / TRG_BEF_INS_MES_GSO_GRAPH / TRG_BEF_INS_MES_GSO_MES : a implementer cote serveur
