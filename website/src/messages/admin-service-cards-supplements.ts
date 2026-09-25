import type { MessageCatalog } from "./supplements"

export const frAdminServiceCardsSupplements: MessageCatalog = {
  adminServiceCards: {
    status: {
      active: "Actif",
      inactive: "Désactivé",
      incomplete: "Configuration incomplète",
      error: "Indisponible",
      loading: "Chargement...",
    },
    configuration: {
      configured: "Configurée",
      incomplete: "À compléter",
    },
    actions: {
      open_settings: "Ouvrir les paramètres",
    },
    mailing: {
      title: "Mailing",
      description: "État de l'infrastructure globale d'envoi d'emails VigiSensys.",
      activation: "Envoi global",
      configuration: "Configuration SMTP",
      confirmation: "Validation SMTP",
      confirmed: "Confirmée",
      not_confirmed: "À valider",
    },
    telephony: {
      title: "Téléphonie",
      description: "État du service d'appels vocaux et du fournisseur configuré.",
      provider: "Fournisseur",
      configuration: "Configuration",
      license_required: "Option requise",
      license_locked_title: "Téléphonie non disponible avec cette licence",
      license_locked_description: "Ajoutez l'option Téléphonie à la licence VigiSensys pour configurer et utiliser les appels vocaux.",
      providers: {
        none: "Aucun",
        twilio: "Twilio",
        ovhcloud: "OVHcloud",
        keyyo: "Keyyo",
        asterisk: "Asterisk",
      },
    },
  },
}

export const enAdminServiceCardsSupplements: MessageCatalog = {
  adminServiceCards: {
    status: {
      active: "Active",
      inactive: "Disabled",
      incomplete: "Incomplete configuration",
      error: "Unavailable",
      loading: "Loading...",
    },
    configuration: {
      configured: "Configured",
      incomplete: "Needs configuration",
    },
    actions: {
      open_settings: "Open settings",
    },
    mailing: {
      title: "Mailing",
      description: "Status of the global VigiSensys email delivery infrastructure.",
      activation: "Global delivery",
      configuration: "SMTP configuration",
      confirmation: "SMTP verification",
      confirmed: "Confirmed",
      not_confirmed: "Needs verification",
    },
    telephony: {
      title: "Telephony",
      description: "Status of the voice call service and configured provider.",
      provider: "Provider",
      configuration: "Configuration",
      license_required: "Option required",
      license_locked_title: "Telephony is not available with this license",
      license_locked_description: "Add the Telephony option to the VigiSensys license to configure and use voice calls.",
      providers: {
        none: "None",
        twilio: "Twilio",
        ovhcloud: "OVHcloud",
        keyyo: "Keyyo",
        asterisk: "Asterisk",
      },
    },
  },
}

export function adminServiceCardsSupplementForLocale(locale: string): MessageCatalog {
  return locale === "en" ? enAdminServiceCardsSupplements : frAdminServiceCardsSupplements
}
