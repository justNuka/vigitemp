import type { MessageCatalog } from "./supplements"

export const frSmtpGuideSupplements: MessageCatalog = {
  adminSettings: {
    smtp: { guide_button: "Guide SMTP" },
    smtp_guide: {
      title: "Guide de configuration SMTP",
      description: "Choisissez le fournisseur du client puis recopiez les paramètres dans VigiSensys.",
      compatibility_title: "Compatibilité VigiSensys",
      compatibility_body: "VigiSensys prend actuellement en charge SMTP avec authentification par utilisateur et mot de passe. Un fournisseur imposant uniquement OAuth2 / Modern Auth nécessite un relais SMTP compatible.",
      host: "Serveur SMTP",
      port: "Port",
      security: "Sécurité",
      user: "Utilisateur",
      password: "Mot de passe",
      sender: "Expéditeur",
      full_email: "Adresse email complète",
      same_email: "Même adresse que l'utilisateur SMTP",
      documentation: "Documentation officielle",
      google: {
        title: "Google / Gmail",
        summary: "Pour un compte Gmail dédié aux alertes.",
        password: "Mot de passe d'application Google (16 caractères), pas le mot de passe normal du compte.",
        steps: "Activer la validation en deux étapes, créer un mot de passe d'application dans la sécurité du compte Google, puis utiliser l'adresse Gmail complète comme utilisateur et expéditeur. Enregistrer la configuration puis valider le code reçu par email.",
        warning: "Erreur 535 5.7.8 : Google refuse les identifiants. Vérifier l'adresse et recréer un mot de passe d'application.",
      },
      microsoft: {
        title: "Microsoft 365 / Outlook",
        summary: "Microsoft 365 peut utiliser smtp.office365.com:587 en STARTTLS si SMTP AUTH est autorisé pour la boîte aux lettres.",
        outlook: "Outlook.com personnel : smtp-mail.outlook.com:587 en STARTTLS, avec OAuth2 / Modern Auth requis officiellement.",
        checks: "Faire vérifier par la DSI que SMTP AUTH est autorisé, que la boîte peut envoyer avec l'adresse expéditeur et que les politiques du tenant n'interdisent pas l'authentification SMTP classique.",
        oauth_warning: "VigiSensys ne gère pas encore OAuth2 pour SMTP. Si Microsoft refuse utilisateur/mot de passe, utiliser un relais SMTP validé par la DSI ou Alwaysdata.",
      },
      alwaysdata: {
        title: "Aucun SMTP disponible : Alwaysdata",
        summary: "Créer une boîte SMTP dédiée lorsque le client ne fournit pas de relais exploitable.",
        password: "Mot de passe de l'adresse email Alwaysdata",
        steps: "Créer/utiliser un compte Alwaysdata, puis dans Emails > Adresses créer une adresse dédiée à VigiSensys. Remplacer [compte] par le nom du compte Alwaysdata et utiliser l'adresse complète comme utilisateur et expéditeur.",
        ports: "Port 465 : SSL/TLS direct. Port 587 : STARTTLS alternatif.",
      },
      generic: {
        title: "Autre serveur SMTP",
        summary: "Demander à la DSI : nom DNS du serveur, port, mode TLS, utilisateur/mot de passe, adresse expéditeur autorisée et ouverture réseau sortante depuis le serveur VigiSensys.",
      },
      test_title: "Toujours terminer par la validation du code",
      test_body: "Après chaque modification SMTP, VigiSensys envoie un code avec la nouvelle configuration. La réception puis la saisie de ce code valident les paramètres. Une erreur 535 indique un refus d'authentification ; un timeout ou une erreur de connexion pointe plutôt vers le réseau, le port, le DNS ou TLS.",
      close: "Fermer",
    },
  },
}

export const enSmtpGuideSupplements: MessageCatalog = {
  adminSettings: {
    smtp: { guide_button: "SMTP guide" },
    smtp_guide: {
      title: "SMTP configuration guide",
      description: "Choose the customer's provider and copy the matching settings into VigiSensys.",
      compatibility_title: "VigiSensys compatibility",
      compatibility_body: "VigiSensys currently supports SMTP authentication with a username and password. Providers enforcing OAuth2 / Modern Auth only require a compatible SMTP relay.",
      host: "SMTP server",
      port: "Port",
      security: "Security",
      user: "Username",
      password: "Password",
      sender: "Sender",
      full_email: "Full email address",
      same_email: "Same address as the SMTP user",
      documentation: "Official documentation",
      google: {
        title: "Google / Gmail",
        summary: "For a dedicated Gmail alert account.",
        password: "Google app password (16 characters), not the normal account password.",
        steps: "Enable 2-Step Verification, create an app password in Google Account security, then use the full Gmail address as username and sender. Save the configuration and verify the code received by email.",
        warning: "535 5.7.8 error: Google rejected the credentials. Check the address and create a fresh app password.",
      },
      microsoft: {
        title: "Microsoft 365 / Outlook",
        summary: "Microsoft 365 can use smtp.office365.com:587 with STARTTLS when SMTP AUTH is enabled for the mailbox.",
        outlook: "Personal Outlook.com: smtp-mail.outlook.com:587 with STARTTLS; OAuth2 / Modern Auth is officially required.",
        checks: "Ask IT to verify SMTP AUTH is enabled, the mailbox can send as the configured sender, and tenant policies do not block classic SMTP authentication.",
        oauth_warning: "VigiSensys does not yet support OAuth2 for SMTP. If Microsoft rejects username/password authentication, use an IT-approved SMTP relay or Alwaysdata.",
      },
      alwaysdata: {
        title: "No SMTP available: Alwaysdata",
        summary: "Create a dedicated SMTP mailbox when the customer has no usable relay.",
        password: "Password of the Alwaysdata email address",
        steps: "Create/use an Alwaysdata account, then create a dedicated VigiSensys address under Emails > Addresses. Replace [account] with the Alwaysdata account name and use the full address as username and sender.",
        ports: "Port 465: direct SSL/TLS. Port 587: alternative STARTTLS.",
      },
      generic: {
        title: "Other SMTP server",
        summary: "Ask IT for the server DNS name, port, TLS mode, username/password, allowed sender address and outbound network access from the VigiSensys server.",
      },
      test_title: "Always finish by verifying the code",
      test_body: "After every SMTP change, VigiSensys sends a code using the new configuration. Receiving and entering that code validates the settings. A 535 error means authentication was rejected; a timeout or connection error usually points to networking, port, DNS or TLS.",
      close: "Close",
    },
  },
}

export function smtpGuideSupplementForLocale(locale: string): MessageCatalog {
  return locale.toLowerCase().startsWith("fr") ? frSmtpGuideSupplements : enSmtpGuideSupplements
}
