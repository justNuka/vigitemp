import type { LocationFormData } from './location-form-types'

export function getDefaultLocationFormData(): LocationFormData {
  return {
    Nom_Lieu: '',
    Type_Lieu: '',
    Commentaire: '',
    Lieu_Etat: null,
    Id_Site: null,
    GroupIds: [],
    Sonde_Numero_Serie: null,
    Id_Module: null,
    MailingContacts: [],
    Est_Son_Alarme_Active: true,

    Consigne: undefined,
    Frequence: 15,
    Consigne_Sup: undefined,
    Est_Consigne_Sup_Active: false,
    Consigne_Sup_Pre_Alarme: undefined,
    Est_Consigne_Sup_Pre_Alarme_Active: false,
    Retard_Alarme_Haut: 60,
    Consigne_Inf: undefined,
    Est_Consigne_Inf_Active: false,
    Consigne_Inf_Pre_Alarme: undefined,
    Est_Consigne_Inf_Pre_Alarme_Active: false,
    Retard_Alarme_Bas: 60,
    Nb_Mesures_Temporisation_Redeclenchement: 0,

    Tolerance_Surveillance_Sup: undefined,
    Tolerance_Surveillance_Inf: undefined,

    Unite: '\u00b0C',
    Erreur_Justesse: undefined,
    Incertitude: undefined,
    Derive: undefined,
    EMT_Mode: 'sans-objet',
    EMT_Valeur: undefined,
    Corriger_Erreur_Justesse: false,
    Prendre_En_Compte_Derive: false,
  }
}

