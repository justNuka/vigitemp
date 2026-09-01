# Sondes (table t_sonde_type) :

## Colonnes : Id_Sonde_Type | Sonde_Type | Libelle_Sonde_Type |Est_Gestion_Relais(bool)

1	E	Sonde radio relais type E	1
2	G	Sonde radio relais type G	1
3	H	Sonde radio relais type H	1
4	I	Sonde radio de type I	0
5	R	Sonde radio	0
6	V	Sonde filaire	0
9	SOIT	Gemsense One Température interne	0
10	SOIH	Gemsense One Température & humidité interne	0 -> double capteurs
11	SOET	Gemsense One Température externe	0
12	SOEH	Gemsense One Température & humidité externe	0 -> double capteurs
13	SPNB	Gemsense Pro Numérique blanc	0
14	SPNG	Gemsense Pro Numérique gris	0
15	SPPS	Gemsense Pro platine	0
16	SPAL	Gemsense Pro platine alimentaire	0
17	SPPC	Gemsense Pro platine contact	0
18	SPAU	Gemsense Pro platine autoclave	0
19	SPCF	Gemsense Pro platine chambre froide	0
20	SPMI	Gemsense Pro platine micro-capteur	0
21	SPCO	Gemsense Pro CO2	0
22	SPHY	Gemsense Pro hygrométrie	0
23	SPTH	Gemsense Pro thermocouple	0
24	SPDI	Gemsense Pro pression différentielle	0
25	SPAT	Gemsense Pro pression atmosphérique	0
26	SPLU	Gemsense Pro lumière	0
27	SP01	Gemsense Pro 0-1 Volt	0
28	SP42	Gemsense Pro 4-20 mA	0
29	SPOF	Gemsense Pro NO NF	0
30	SPXB	Gemsense Pro Ethernet numérique blanc	0
31	SPXG	Gemsense Pro Ethernet numérique GRIS	0
32	SPXP	Gemsense Pro Ethernet platine	0
33	SPFB	Gemsense Pro filaire numérique blanc	0
34	SPFG	Gemsense Pro filaire numérique GRIS	0
35	SPFP	Gemsense Pro filaire platine	0


# Étalons (table t_etalon_type) :

## Colonnes : Type_Etalon | Nom | Descriptif | Est_Saisie_Module | Est_Sonde_Externe | Resolution

ES	VigiTemp Type ES	Sonde talon radio type E	1	0	0.05
EX	Externe	Sonde externe	1	1	0
SEF	VigiTemp Type SEF	Sonde talon filaire ou filaire/radio avec prise RJ45	1	0	0.02


# Modules :

## Colonnes (table t_module_type) : Id_Module_Type | Libelle_Type_Module | Libelle_Module | Est_Flag_Affiche_Plan

1	BIN	Boitier filaire avec prise DB9 (port serie)	0
3	BTR	Boitier radio avec prise DB9 (port serie)	0
6	MRH	Boitier MRH	0
7	IUSB	CLE USB RADIO SONDES I	0
8	IETH	Module Ethernet	0
9	GSO-U	Module GSO USB	0
10	GSO-E	Module GSO Ethernet	0
11	BINX	Boitier filaire Ethernet	0


# Anciens types sondes :

## Colonnes : Id_Sonde_Type | Sonde_Type | Libelle_Sonde_Type |Est_Gestion_Relais(bool)

1	E	Sonde radio relais type E	1
2	G	Sonde radio relais type G	1
3	H	Sonde radio relais type H	1
4	I	Sonde radio de type I	0
5	R	Sonde radio	0
6	V	Sonde filaire	0
7	GSO	GemSenseOne	0
8	GSP	GemSensePro	0