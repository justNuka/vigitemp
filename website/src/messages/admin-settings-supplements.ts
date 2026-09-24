import type { MessageCatalog } from "./supplements"

export const frAdminSettingsSupplements: MessageCatalog = {
  adminSettings: {
    tabs: {
      general: "Général",
      security: "Sécurité",
      alerts: "Alarmes & notifications",
      services: "Services",
    },
    smtp: {
      activation_label: "Envoi global",
      activation_on: "Activé",
      activation_off: "Désactivé",
      activation_enabled: "Envoi d'emails activé.",
      activation_disabled: "Envoi d'emails désactivé.",
      activation_error: "Impossible de modifier l'activation des emails.",
      confirmed: "Configuration confirmée",
      not_confirmed: "Configuration à valider",
      not_configured: "Configuration incomplète",
      warning_label: "Attention :",
      warning_body:
        "Une configuration SMTP incorrecte bloque les emails VigiSensys, notamment les notifications d'alarme. Toute modification doit être validée par le code reçu avec la nouvelle configuration.",
    },
    smtp_modal: {
      activation: {
        label: "Activer l'envoi d'emails",
        helper:
          "Interrupteur global pour tous les emails VigiSensys (alarmes, réinitialisation de mot de passe et notifications automatiques). La configuration SMTP peut rester enregistrée lorsque l'envoi est désactivé.",
      },
      verification: {
        currently_confirmed:
          "Cette configuration SMTP a déjà été confirmée. Toute modification réelle demandera une nouvelle validation.",
        currently_unconfirmed:
          "Cette configuration n'est pas encore confirmée. Les emails métier restent bloqués jusqu'à validation du code.",
        recipient_title: "Adresse de validation",
        recipient_description:
          "Le code sera envoyé via les paramètres SMTP que vous êtes en train d'enregistrer. Sa réception confirme que le serveur, les identifiants et l'expéditeur fonctionnent réellement.",
        save_and_send: "Enregistrer et envoyer le code",
        code_sent:
          "Code envoyé à {email}. Il reste valable {minutes} minutes.",
        enter_code:
          "Un code à 6 chiffres a été envoyé à {email}. Saisissez-le pour rendre cette configuration utilisable par VigiSensys.",
        code_label: "Code de validation",
        code_invalid: "Le code doit contenir exactement 6 chiffres.",
        confirmed: "Configuration SMTP confirmée.",
        confirm_error: "Impossible de valider le code SMTP.",
        confirm_button: "Valider la configuration",
        resend: "Renvoyer le code",
        edit_configuration: "Modifier les paramètres",
      },
      toasts: {
        verification_send_error:
          "La configuration a été enregistrée mais le code n'a pas pu être envoyé. Corrigez les paramètres puis réessayez.",
      },
    },
  },
}

export const enAdminSettingsSupplements: MessageCatalog = {
  adminSettings: {
    tabs: {
      general: "General",
      security: "Security",
      alerts: "Alarms & notifications",
      services: "Services",
    },
    smtp: {
      activation_label: "Global delivery",
      activation_on: "Enabled",
      activation_off: "Disabled",
      activation_enabled: "Email delivery enabled.",
      activation_disabled: "Email delivery disabled.",
      activation_error: "Could not change email delivery state.",
      confirmed: "Configuration confirmed",
      not_confirmed: "Configuration needs verification",
      not_configured: "Incomplete configuration",
      warning_label: "Warning:",
      warning_body:
        "Incorrect SMTP settings block VigiSensys emails, including alarm notifications. Every real configuration change must be verified with the code received through the new settings.",
    },
    smtp_modal: {
      activation: {
        label: "Enable email sending",
        helper:
          "Global switch for all VigiSensys emails (alarms, password resets and automated notifications). SMTP settings remain saved when email sending is disabled.",
      },
      verification: {
        currently_confirmed:
          "This SMTP configuration has already been confirmed. Any real change will require a new verification.",
        currently_unconfirmed:
          "This configuration has not been confirmed yet. Business emails remain blocked until the code is verified.",
        recipient_title: "Verification address",
        recipient_description:
          "The code is sent using the SMTP settings you are saving. Receiving it proves that the server, credentials and sender can actually deliver email.",
        save_and_send: "Save and send code",
        code_sent:
          "Code sent to {email}. It remains valid for {minutes} minutes.",
        enter_code:
          "A 6-digit code was sent to {email}. Enter it to allow VigiSensys to use this SMTP configuration.",
        code_label: "Verification code",
        code_invalid: "The code must contain exactly 6 digits.",
        confirmed: "SMTP configuration confirmed.",
        confirm_error: "Could not verify the SMTP code.",
        confirm_button: "Confirm configuration",
        resend: "Resend code",
        edit_configuration: "Edit settings",
      },
      toasts: {
        verification_send_error:
          "The configuration was saved but the code could not be sent. Fix the settings and try again.",
      },
    },
  },
}

export function adminSettingsSupplementForLocale(locale: string): MessageCatalog {
  return locale.toLowerCase().startsWith("fr")
    ? frAdminSettingsSupplements
    : enAdminSettingsSupplements
}
