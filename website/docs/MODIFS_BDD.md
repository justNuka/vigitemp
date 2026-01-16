# Modifs BDD (web)

## Bases cibles
- `vigi_main`
- `vigi_mesures`

## Alarmes
- `t_alarme_histo` doit avoir les memes colonnes que `t_alarme`.
- A l'acquittement : supprimer de `t_alarme`, inserer dans `t_alarme_histo`.

## Table `tm_mesures_gso`
Schema de reference :

```
CREATE TABLE IF NOT EXISTS `tm_mesures_gso` (
  `Id_mesures_gso` int NOT NULL AUTO_INCREMENT,
  `id_capteur` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `tep` float DEFAULT NULL,
  `unite` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '',
  `date_mesure` datetime NOT NULL,
  `rssi` varchar(10) CHARACTER SET latin1 COLLATE latin1_swedish_ci DEFAULT NULL,
  `tension` varchar(10) CHARACTER SET latin1 COLLATE latin1_swedish_ci DEFAULT NULL,
  PRIMARY KEY (`id_capteur`,`date_mesure`) USING BTREE,
  KEY `Id_mesures_gso` (`Id_mesures_gso`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## Table `tm_mesures`
Ajouter :
- `Est_Valeur_Memoire` tinyint not null default 0

## Seeds
- Garder permissions, parametres, types.
- Inserer un user admin par defaut (`admin`), mdp hashe + changement force.
