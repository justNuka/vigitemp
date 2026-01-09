# Modifs BDD a porter cote serveur C#

Ce document liste les logiques qui doivent etre gerees par le serveur C# au lieu de triggers SQL.

## Alarmes et etats (vigi_main)
- Calculer la derniere valeur connue (equivalent EVT_GSO_DERNIERVALEUR_LIEU).
- Gerer la suppression/archivage d'alarme (equivalent TRG_GSO_BEF_DEL_ALARME).
- Gerer les changements d'etat d'alarme sur t_lieu (equivalent TRG_GSO_BEF_UPD_LIEU_ALARME).
- v_tm_mesures_dernier : pas besoin, garder en memoire serveur.
- v_config_lieu_sonde : charger et garder en memoire serveur.

## Mesures GSO (vigi_mesures)
- Gerer le flux d'insertion des mesures GSO :
  - TRG_AFT_INS_MES_GSO (post insert)
  - TRG_BEF_INS_MES_GSO_GRAPH (graph)
  - TRG_BEF_INS_MES_GSO_MES (mesures classiques)

## Historique alarmes
- A l'acquittement d'une alarme : supprimer de `t_alarme`, inserer dans `t_alarme_histo`.
- S'assurer que la date d'acquittement est bien renseignee dans `t_alarme_histo`.
