import type { MessageCatalog } from "./supplements"

export const frAuthResetSupplements: MessageCatalog = {
  login: {
    reset_modal: {
      success_message:
        "Demande prise en compte. Si un compte existe avec cet email et que le service d’envoi est disponible, vous recevrez un lien de réinitialisation.",
    },
    toasts: {
      reset_email_sent: {
        title: "Demande prise en compte",
        description:
          "Si un compte existe avec cet email et que le service d’envoi est disponible, vous recevrez un lien de réinitialisation.",
      },
    },
  },
}

export const enAuthResetSupplements: MessageCatalog = {
  login: {
    reset_modal: {
      success_message:
        "Request received. If an account exists for this email and email delivery is available, you will receive a reset link.",
    },
    toasts: {
      reset_email_sent: {
        title: "Request received",
        description:
          "If an account exists for this email and email delivery is available, you will receive a reset link.",
      },
    },
  },
}

export function authResetSupplementForLocale(locale: string): MessageCatalog {
  return locale.toLowerCase().startsWith("fr") ? frAuthResetSupplements : enAuthResetSupplements
}
