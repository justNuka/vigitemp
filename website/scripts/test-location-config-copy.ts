import assert from 'node:assert/strict'

import type { LocationRow } from '../src/hooks/useLocations'
import { buildLocationConfigCopy } from '../src/app/[locale]/(admin)/admin/lieux/_components/location-config-copy'

const source: LocationRow = {
  Id_Lieu: 42,
  Nom_Lieu: 'Chambre froide A',
  Type_Lieu: 'CF',
  Est_Archive: true,
  Id_Site: 7,
  Sonde_Numero_Serie: 'SONT-1234567',
  Id_Module: 9,
  Commentaire: 'Commentaire source',
  Observations_Info: 'Observation source',
  Consigne: 4,
  Frequence: 15,
  Consigne_Sup: 8,
  Est_Consigne_Sup_Active: true,
  Consigne_Sup_Pre_Alarme: 7,
  Est_Consigne_Sup_Pre_Alarme_Active: true,
  Retard_Alarme_Haut: 30,
  Consigne_Inf: 2,
  Est_Consigne_Inf_Active: true,
  Consigne_Inf_Pre_Alarme: 3,
  Est_Consigne_Inf_Pre_Alarme_Active: true,
  Retard_Alarme_Bas: 45,
  Retard_Non_Reponse: 60,
  Retard_Alarme_Changement_Consigne: 5,
  Nb_Mesures_Temporisation_Redeclenchement: 2,
  Lieu_Etat: 'S',
  Est_Lieu_GSO: true,
  Notification_Active: true,
  Est_Son_Alarme_Active: false,
  Tolerance_Surveillance_Sup: 7.5,
  Tolerance_Surveillance_Inf: 2.5,
  Derniere_Date_Etalonnage: '2026-09-12 10:30:00',
  Unite: '°C',
  Erreur_Justesse: 0.12,
  Incertitude: 0.2,
  Derive: 0.03,
  Planning_Regles_Count: 3,
  EMT_Mode: 'manuel',
  EMT_Valeur: 1.5,
  Corriger_Erreur_Justesse: true,
  Prendre_En_Compte_Derive: true,
  MailingContacts: [
    {
      Id_Tel_Num: 99,
      Numero_Ordre: 1,
      Id_Utilisateur: 5,
      Est_Via_Telephone: true,
      Est_Via_Email: true,
    },
  ],
  t_lieu_groupe: [
    { Id_Groupe: 11, t_groupe: { Id_Groupe: 11, Nom_Groupe: 'Froid', Numero_Regroupement: 'G1' } },
    { Id_Groupe: 12, t_groupe: { Id_Groupe: 12, Nom_Groupe: 'Stockage', Numero_Regroupement: 'G2' } },
  ],
  t_site: { Libelle_Site: 'Site A' },
  t_sonde: { Sonde_Numero_Serie: 'SONT-1234567' },
}

const duplicate = buildLocationConfigCopy(source)

assert.equal(duplicate.Id_Lieu, undefined)
assert.equal(duplicate.Nom_Lieu, '')
assert.equal(duplicate.Sonde_Numero_Serie, null)
assert.equal(duplicate.Id_Module, null)
assert.equal(duplicate.Lieu_Etat, 'D')
assert.equal(duplicate.Est_Archive, false)

assert.equal(duplicate.Id_Site, 7)
assert.deepEqual(duplicate.GroupIds, [11, 12])
assert.equal(duplicate.Consigne, 4)
assert.equal(duplicate.Consigne_Sup, 8)
assert.equal(duplicate.Consigne_Inf, 2)
assert.equal(duplicate.Retard_Alarme_Haut, 30)
assert.equal(duplicate.Retard_Alarme_Bas, 45)
assert.equal(duplicate.EMT_Mode, 'manuel')
assert.equal(duplicate.EMT_Valeur, 1.5)
assert.equal(duplicate.Est_Son_Alarme_Active, false)
assert.equal(duplicate.Observations_Info, 'Observation source')

assert.deepEqual(duplicate.MailingContacts, [
  {
    Numero_Ordre: 1,
    Id_Utilisateur: 5,
    Est_Via_Telephone: true,
    Est_Via_Email: true,
  },
])
assert.equal(
  Object.prototype.hasOwnProperty.call(duplicate.MailingContacts?.[0] ?? {}, 'Id_Tel_Num'),
  false,
)

assert.equal(duplicate.Derniere_Date_Etalonnage, undefined)
assert.equal(duplicate.Applied_Etalonnage_Id, undefined)
assert.equal(duplicate.Erreur_Justesse, undefined)
assert.equal(duplicate.Incertitude, undefined)
assert.equal(duplicate.Derive, undefined)

const namedCopy = buildLocationConfigCopy(source, { name: 'Nouvelle chambre' })
assert.equal(namedCopy.Nom_Lieu, 'Nouvelle chambre')
assert.equal(namedCopy.Sonde_Numero_Serie, null)
assert.equal(namedCopy.Lieu_Etat, 'D')

assert.equal(source.Nom_Lieu, 'Chambre froide A')
assert.equal(source.Sonde_Numero_Serie, 'SONT-1234567')
assert.equal(source.MailingContacts?.[0]?.Id_Tel_Num, 99)

console.log('location-config-copy: OK')
