import type { LocationTemplateRow } from '@/hooks/useLocationTemplates'
import type { LocationFormData } from './location-form-types'

const TEMPLATE_FORM_FIELDS: Array<keyof LocationFormData> = [
  'Lieu_Etat',
  'Frequence',
  'Retard_Alarme_Haut',
  'Retard_Alarme_Bas',
  'Retard_Non_Reponse',
  'Retard_Alarme_Changement_Consigne',
  'Consigne',
  'Consigne_Sup',
  'Consigne_Inf',
  'Tolerance_Surveillance_Sup',
  'Tolerance_Surveillance_Inf',
  'Consigne_Sup_Pre_Alarme',
  'Consigne_Inf_Pre_Alarme',
  'Seuil_Critique_Haut',
  'Seuil_Critique_Bas',
  'Est_Consigne_Sup_Active',
  'Est_Consigne_Inf_Active',
  'Est_Consigne_Sup_Pre_Alarme_Active',
  'Est_Consigne_Inf_Pre_Alarme_Active',
  'Est_Seuil_Critique_Haut_Active',
  'Est_Seuil_Critique_Bas_Active',
  'Est_Son_Alarme_Active',
  'Est_Redeclenchement_Immediat',
  'Nb_Mesures_Temporisation_Redeclenchement',
]

export function buildFormPatchFromTemplate(template: LocationTemplateRow): Partial<LocationFormData> {
  const patch: Partial<LocationFormData> = {}

  for (const field of TEMPLATE_FORM_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(template, field)) {
      patch[field] = template[field as keyof LocationTemplateRow] as any
    }
  }

  if (Object.prototype.hasOwnProperty.call(template, 'Observations_Info')) {
    patch.Commentaire = template.Observations_Info ?? null
    patch.Observations_Info = template.Observations_Info ?? null
  }

  return patch
}

export function buildTemplatePayloadFromForm(
  values: LocationFormData,
  name: string,
  description: string,
) {
  return {
    Nom_Template: name.trim(),
    Description: description.trim() || null,
    Lieu_Etat: values.Lieu_Etat ?? 'D',
    Frequence: values.Frequence ?? null,
    Retard_Alarme_Haut: values.Retard_Alarme_Haut ?? null,
    Retard_Alarme_Bas: values.Retard_Alarme_Bas ?? null,
    Retard_Non_Reponse: values.Retard_Non_Reponse ?? null,
    Retard_Alarme_Changement_Consigne: values.Retard_Alarme_Changement_Consigne ?? null,
    Consigne: values.Consigne ?? null,
    Consigne_Sup: values.Consigne_Sup ?? null,
    Consigne_Inf: values.Consigne_Inf ?? null,
    Tolerance_Surveillance_Sup: values.Tolerance_Surveillance_Sup ?? null,
    Tolerance_Surveillance_Inf: values.Tolerance_Surveillance_Inf ?? null,
    Consigne_Sup_Pre_Alarme: values.Consigne_Sup_Pre_Alarme ?? null,
    Consigne_Inf_Pre_Alarme: values.Consigne_Inf_Pre_Alarme ?? null,
    Seuil_Critique_Haut: values.Seuil_Critique_Haut ?? null,
    Seuil_Critique_Bas: values.Seuil_Critique_Bas ?? null,
    Est_Consigne_Sup_Active: values.Est_Consigne_Sup_Active ?? false,
    Est_Consigne_Inf_Active: values.Est_Consigne_Inf_Active ?? false,
    Est_Consigne_Sup_Pre_Alarme_Active: values.Est_Consigne_Sup_Pre_Alarme_Active ?? false,
    Est_Consigne_Inf_Pre_Alarme_Active: values.Est_Consigne_Inf_Pre_Alarme_Active ?? false,
    Est_Seuil_Critique_Haut_Active: values.Est_Seuil_Critique_Haut_Active ?? false,
    Est_Seuil_Critique_Bas_Active: values.Est_Seuil_Critique_Bas_Active ?? false,
    Est_Son_Alarme_Active: values.Est_Son_Alarme_Active ?? true,
    Est_Redeclenchement_Immediat: values.Est_Redeclenchement_Immediat ?? false,
    Nb_Mesures_Temporisation_Redeclenchement: values.Nb_Mesures_Temporisation_Redeclenchement ?? 0,
    Observations_Info: values.Observations_Info ?? values.Commentaire ?? null,
  }
}

