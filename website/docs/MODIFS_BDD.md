* Base vigi_main :
 
- t_lieu :
  Ajout des colonnes/rubriques :
  Est_Lieu_Alarme_Termee_Non_Acquittee_T1
  Date_Heure_Dernier_Acquittement_En_Cours
  Date_Heure_Last_Update_EVT_GSO
 
  EVT_GSO_DERNIERVALEUR_LIEU -> recup derniere valeur connue
 
  TRG_GSO_BEF_DEL_ALARME -> 
 
  TRG_GSO_BEF_UPD_LIEU_ALARME -> gestion des alarmes
 
  v_tm_mesures_dernier -> pas besoin, garder en mémoire dans le serveur
 
 
* Base vigi_mesures :
 
  Ajout table tm_mesures_gso // gemsense one -> autonomes : parlent au serveur 
 
- tm_mesures :
  Ajout des colonnes/rubriques :
    Rssi
    Tension
 
  TRG_AFT_INS_MES_GSO -> table de mesures 
  
  TRG_BEF_INS_MES_GSO_GRAPH -> table de graphiques
  
  TRG_BEF_INS_MES_GSO_MES -> table de mesures classique
 
v_config_lieu_sonde -> garder en mémoire sur le serveur

ajouter une table alarme histo -> des qu'une alarme est acquittée (peu importe l'etat) supprime de t_alarme et l'envoie dans celle ci