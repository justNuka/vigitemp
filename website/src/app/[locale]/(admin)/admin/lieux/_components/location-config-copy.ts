import type { LocationRow } from '@/hooks/useLocations'
import { getDefaultLocationFormData } from './location-form-defaults'
import { mapLocationToFormData } from './location-form-mappers'
import type { LocationFormData } from './location-form-types'

const COPIED_FORM_FIELDS: Array<keyof LocationFormData> = [
  'Type_Lieu',
  'Commentaire',
  'Observations_Info',
  'Id_Site',
  'Frequence',
  'Consigne',
  'Consigne_Sup',
  'Consigne_Inf',
  'Tolerance_Surveillance_Sup',
  'Tolerance_Surveillance_Inf',
  'Est_Consigne_Sup_Active',
  'Est_Consigne_Inf_Active',
  'Consigne_Sup_Pre_Alarme',
  'Consigne_Inf_Pre_Alarme',
  'Est_Consigne_Sup_Pre_Alarme_Active',
  'Est_Consigne_Inf_Pre_Alarme_Active',
  'Retard_Alarme_Haut',
  'Retard_Alarme_Bas',
  'Retard_Non_Reponse',
  'Retard_Alarme_Changement_Consigne',
  'Nb_Mesures_Temporisation_Redeclenchement',
  'EMT_Mode',
  'EMT_Valeur',
  'Corriger_Erreur_Justesse',
  'Prendre_En_Compte_Derive',
  'Est_Son_Alarme_Active',
]

export type BuildLocationConfigCopyOptions = {
  name?: string | null
}

export function buildLocationConfigCopy(
  source: LocationRow,
  options: BuildLocationConfigCopyOptions = {},
): LocationFormData {
  const defaults = getDefaultLocationFormData()
  const sourceForm = mapLocationToFormData(source)
  const copied: LocationFormData = {
    ...defaults,
    Nom_Lieu: options.name ?? '',
    Lieu_Etat: 'D',
    Sonde_Numero_Serie: null,
    Id_Module: null,
    GroupIds: [...(sourceForm.GroupIds ?? [])],
    MailingContacts: (sourceForm.MailingContacts ?? []).map((contact, index) => ({
      Numero_Ordre: contact.Numero_Ordre ?? index + 1,
      Id_Utilisateur: contact.Id_Utilisateur ?? null,
      Est_Via_Telephone: Boolean(contact.Est_Via_Telephone),
      Est_Via_Email: Boolean(contact.Est_Via_Email),
    })),
    Apply_Mailing_To_Groups: false,
    Applied_Etalonnage_Id: undefined,
    Derniere_Date_Etalonnage: undefined,
    Erreur_Justesse: undefined,
    Incertitude: undefined,
    Derive: undefined,
  }

  for (const field of COPIED_FORM_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(sourceForm, field)) {
      copied[field] = sourceForm[field] as never
    }
  }

  // Identity, hardware assignment and runtime/history state must never leak from
  // the source location into a newly created one.
  copied.Id_Lieu = undefined
  copied.Nom_Lieu = options.name ?? ''
  copied.Sonde_Numero_Serie = null
  copied.Id_Module = null
  copied.Lieu_Etat = 'D'
  copied.Est_Archive = false

  return copied
}
