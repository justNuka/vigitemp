import type { MessageCatalog } from "./supplements"

export const frAdminSettingsSupplements: MessageCatalog = {
  adminSettings: {
    smtp_modal: {
      activation: {
        label: "Activer l'envoi d'emails",
        helper:
          "Interrupteur global pour tous les emails VigiSensys (alarmes, réinitialisation de mot de passe et emails système). La configuration SMTP peut rester enregistrée lorsque l'envoi est désactivé.",
      },
    },
  },
}

export const enAdminSettingsSupplements: MessageCatalog = {
  adminSettings: {
    smtp_modal: {
      activation: {
        label: "Enable email sending",
        helper:
          "Global switch for all VigiSensys emails (alarms, password resets and system emails). SMTP settings remain saved when email sending is disabled.",
      },
    },
  },
}

export function adminSettingsSupplementForLocale(locale: string): MessageCatalog {
  return locale.toLowerCase().startsWith("fr")
    ? frAdminSettingsSupplements
    : enAdminSettingsSupplements
}
