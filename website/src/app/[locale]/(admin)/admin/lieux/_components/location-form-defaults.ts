import type { LocationFormData } from './location-form-types'

export function getDefaultLocationFormData(): LocationFormData {
  return {
    Nom_Lieu: '',
    Type_Lieu: '',
    Commentaire: '',
    Lieu_Etat: 'D',
    Id_Site: null,
    GroupIds: [],
    Sonde_Numero_Serie: null,

    Consigne: undefined,
    Frequence: undefined,
    Consigne_Sup: undefined,
    Est_Consigne_Sup_Active: false,
    Consigne_Sup_Pre_Alarme: undefined,
    Est_Consigne_Sup_Pre_Alarme_Active: false,
    Retard_Alarme_Haut: undefined,
    Consigne_Inf: undefined,
    Est_Consigne_Inf_Active: false,
    Consigne_Inf_Pre_Alarme: undefined,
    Est_Consigne_Inf_Pre_Alarme_Active: false,
    Retard_Alarme_Bas: undefined,

    Tolerance_Surveillance_Sup: undefined,
    Tolerance_Surveillance_Inf: undefined,

    Unite: '°C',
    Erreur_Justesse: undefined,
    Incertitude: undefined,
    Derive: undefined,
    EMT_Mode: 'sans-objet',
    EMT_Valeur: undefined,
    Corriger_Erreur_Justesse: false,
    Prendre_En_Compte_Derive: true,
  }
}
