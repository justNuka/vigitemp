import type { MessageCatalog } from "./supplements"

export const frHelpSupportSupplements: MessageCatalog = {
  sidebar: {
    hotline_help: "Hotline & aide",
  },
  helpSupport: {
    meta: {
      title: "Hotline & aide - VigiSensys",
      description: "Guide utilisateur VigiSensys et coordonnées de la hotline MC2.",
    },
    header: {
      title: "Hotline & aide",
      description: "Comprendre VigiSensys, retrouver les actions courantes et contacter la hotline MC2.",
    },
    intro: {
      badge: "Guide utilisateur",
      title: "Une aide centrée sur l'utilisation quotidienne",
      description:
        "Cette page présente les principaux éléments de VigiSensys et les procédures les plus courantes pour utiliser l'application : comprendre l'organisation des sites, groupes, lieux et sondes, mettre une sonde en surveillance, traiter une alarme ou consulter un historique.",
      hotline:
        "Si le guide ne correspond pas à votre situation, si une erreur persiste ou si vous avez besoin d'une aide qui n'est pas expliquée ici, contactez le service hotline MC2 avec les coordonnées disponibles en bas de page.",
      contactCta: "Contacter la hotline",
    },
    concepts: {
      title: "Comprendre l'organisation de VigiSensys",
      description: "Les éléments ci-dessous permettent de comprendre comment une installation est structurée.",
      items: {
        sites: {
          title: "Sites",
          description:
            "Un site représente un établissement ou une implantation. Il sert à organiser les lieux surveillés par emplacement.",
        },
        groups: {
          title: "Groupes",
          description:
            "Les groupes permettent de regrouper plusieurs lieux selon votre organisation : service, secteur, usage ou toute autre logique métier.",
        },
        locations: {
          title: "Lieux",
          description:
            "Le lieu est l'élément réellement surveillé. Il porte le nom métier, la sonde associée, les consignes, retards, seuils, planning et paramètres de notification.",
        },
        sensors: {
          title: "Sondes",
          description:
            "Une sonde est l'équipement qui remonte les mesures. Pour apparaître dans la Surveillance, elle doit être associée à un lieu configuré.",
        },
        monitoring: {
          title: "Surveillance",
          description:
            "La page Surveillance centralise l'état des lieux, les dernières mesures, les alarmes, les graphiques et les actions disponibles pour l'opérateur.",
        },
        alarms: {
          title: "Alarmes",
          description:
            "Les alarmes signalent notamment un dépassement haut ou bas, une non-réponse ou un incident technique. Elles peuvent être analysées puis acquittées selon vos droits.",
        },
      },
    },
    actions: {
      title: "Actions courantes",
      description:
        "Ouvrez une procédure pour suivre les étapes directement dans VigiSensys.",
      items: {
        unassignedSensor: {
          title: "Mettre une sonde non affectée en surveillance",
          description:
            "Utilisez cette procédure lorsqu'une sonde existe déjà dans VigiSensys mais n'est encore associée à aucun lieu.",
          steps: {
            "1": "Ouvrez Administration > Lieux puis choisissez l'action permettant d'ajouter un nouveau lieu.",
            "2": "Dans l'onglet Général, donnez un nom clair au lieu puis sélectionnez son site et, si nécessaire, son ou ses groupes.",
            "3": "Sélectionnez la sonde dans la liste des sondes disponibles. Une sonde déjà affectée à un autre lieu ne doit pas être proposée comme sonde libre.",
            "4": "Renseignez la fréquence de mesure, la consigne et les seuils haut/bas nécessaires. Vérifiez également les retards d'alarme et le délai de non-réponse.",
            "5": "Si votre installation utilise les notifications, la métrologie ou un planning, complétez les onglets correspondants avant l'enregistrement.",
            "6": "Enregistrez le lieu. La sonde et sa configuration sont désormais liées à ce lieu.",
            "7": "Revenez dans Surveillance et vérifiez que le lieu apparaît. Si sa surveillance est désactivée, utilisez l'action de la card pour l'activer.",
          },
        },
        acknowledgeAlarm: {
          title: "Analyser et acquitter une alarme",
          description:
            "Le parcours d'acquittement conserve le contexte du lieu afin de vérifier les mesures avant de clôturer le traitement opérateur.",
          steps: {
            "1": "Depuis Surveillance ou la page Alarmes, ouvrez l'alarme du lieu concerné.",
            "2": "Consultez la période de l'alarme et le graphique afin de vérifier l'évolution des mesures et les autres alarmes éventuellement présentes sur le lieu.",
            "3": "Sélectionnez l'alarme ou les alarmes à traiter puis cliquez sur Acquitter.",
            "4": "Ajoutez le commentaire demandé par votre procédure interne puis confirmez. L'acquittement est tracé dans VigiSensys.",
          },
        },
        pauseMonitoring: {
          title: "Désactiver temporairement puis réactiver la surveillance",
          description:
            "Cette action est utile lors d'une intervention, d'une maintenance ou d'une situation où les alarmes ne doivent pas être générées temporairement.",
          steps: {
            "1": "Dans Surveillance, ouvrez l'action de gestion de la surveillance sur le lieu concerné.",
            "2": "Choisissez la durée de désactivation proposée ou le mode manuel selon le besoin, puis renseignez un commentaire si votre installation l'impose.",
            "3": "Validez la désactivation et vérifiez que la card indique clairement que la surveillance est coupée.",
            "4": "À la fin de l'intervention, réactivez la surveillance depuis la même action et contrôlez la reprise des mesures.",
          },
        },
        viewHistory: {
          title: "Consulter le graphique et l'historique d'un lieu",
          description:
            "Le détail d'un lieu permet de passer du suivi temps réel à une période historique sans modifier la configuration du lieu.",
          steps: {
            "1": "Depuis la card du lieu dans Surveillance, ouvrez le détail des mesures.",
            "2": "Utilisez l'onglet Graphique pour visualiser la courbe, les consignes et les événements disponibles.",
            "3": "Choisissez une période lorsque vous avez besoin d'analyser un historique plus ancien.",
            "4": "Utilisez l'onglet Tableau pour parcourir les mesures détaillées et les fonctions d'export lorsque votre besoin nécessite les valeurs ligne par ligne.",
          },
        },
      },
    },
    permissions: {
      title: "Les fonctions visibles dépendent de votre profil",
      description:
        "Certaines actions d'administration, de métrologie, de modification ou d'acquittement peuvent être absentes si votre profil ou votre licence ne les autorise pas. Dans ce cas, rapprochez-vous de votre administrateur VigiSensys ou de la hotline MC2.",
    },
    contact: {
      title: "Besoin d'une aide complémentaire ?",
      description:
        "Contactez la hotline MC2 si le guide ne couvre pas votre besoin ou si vous rencontrez un comportement anormal. Le bouton Nous écrire prépare un message avec les informations utiles au diagnostic.",
      emailLabel: "Email hotline",
      phoneLabel: "Téléphone hotline",
      write: "Nous écrire",
      mail: {
        subject: "[VigiSensys] Demande d'assistance",
        greeting: "Bonjour,",
        intro: "Je souhaite obtenir de l'aide concernant VigiSensys.",
        fields: {
          organization: "Société / établissement",
          contact: "Nom du contact",
          phone: "Téléphone",
          version: "Version Web VigiSensys",
          page: "Page / écran concerné",
          location: "Lieu concerné",
          sensor: "Sonde concernée",
          subject: "Objet de la demande",
          description: "Description du problème ou de la demande",
          steps: "Actions déjà effectuées / étapes pour reproduire",
          error: "Message d'erreur observé",
        },
        closing: "Merci.",
      },
    },
  },
}

export const enHelpSupportSupplements: MessageCatalog = {
  sidebar: {
    hotline_help: "Hotline & help",
  },
  helpSupport: {
    meta: {
      title: "Hotline & help - VigiSensys",
      description: "VigiSensys user guide and MC2 hotline contact details.",
    },
    header: {
      title: "Hotline & help",
      description: "Understand VigiSensys, review common actions and contact the MC2 hotline.",
    },
    intro: {
      badge: "User guide",
      title: "Help focused on everyday use",
      description:
        "This page explains the main VigiSensys concepts and the most common procedures: understanding sites, groups, locations and probes, putting a probe under monitoring, handling an alarm or reviewing history.",
      hotline:
        "If the guide does not match your situation, an error persists or you need help that is not covered here, contact the MC2 hotline using the details at the bottom of the page.",
      contactCta: "Contact the hotline",
    },
    concepts: {
      title: "Understand the VigiSensys structure",
      description: "The items below explain how an installation is organized.",
      items: {
        sites: {
          title: "Sites",
          description:
            "A site represents a facility or physical location. It is used to organize monitored locations by deployment site.",
        },
        groups: {
          title: "Groups",
          description:
            "Groups let you organize several locations by department, area, use case or any other business rule.",
        },
        locations: {
          title: "Locations",
          description:
            "A location is the item actually monitored. It carries the business name, assigned probe, setpoints, delays, thresholds, schedule and notification settings.",
        },
        sensors: {
          title: "Probes",
          description:
            "A probe is the device reporting measurements. To appear in Monitoring, it must be assigned to a configured location.",
        },
        monitoring: {
          title: "Monitoring",
          description:
            "The Monitoring page centralizes location status, latest readings, alarms, charts and the actions available to operators.",
        },
        alarms: {
          title: "Alarms",
          description:
            "Alarms can report high or low threshold breaches, no-response conditions or technical issues. They can be reviewed and acknowledged depending on your permissions.",
        },
      },
    },
    actions: {
      title: "Common actions",
      description: "Open a procedure to follow the steps directly in VigiSensys.",
      items: {
        unassignedSensor: {
          title: "Put an unassigned probe under monitoring",
          description:
            "Use this procedure when a probe already exists in VigiSensys but is not assigned to any location yet.",
          steps: {
            "1": "Open Administration > Locations and choose the action to add a new location.",
            "2": "In the General tab, give the location a clear name, then select its site and, when needed, its group or groups.",
            "3": "Select the probe from the available-probes list. A probe already assigned to another location should not be offered as a free probe.",
            "4": "Set the measurement frequency, setpoint and required high/low thresholds. Also check the alarm delays and no-response delay.",
            "5": "If your installation uses notifications, metrology or schedules, complete the corresponding tabs before saving.",
            "6": "Save the location. The probe and its configuration are now linked to this location.",
            "7": "Return to Monitoring and make sure the location is visible. If monitoring is disabled, use the card action to enable it.",
          },
        },
        acknowledgeAlarm: {
          title: "Review and acknowledge an alarm",
          description:
            "The acknowledgement flow keeps the location context so measurements can be reviewed before the operator closes the event.",
          steps: {
            "1": "From Monitoring or the Alarms page, open the alarm for the affected location.",
            "2": "Review the alarm period and chart to check how measurements changed and whether other alarms exist on the same location.",
            "3": "Select the alarm or alarms to process and click Acknowledge.",
            "4": "Add the comment required by your internal procedure and confirm. The acknowledgement is recorded in VigiSensys.",
          },
        },
        pauseMonitoring: {
          title: "Temporarily disable and then restore monitoring",
          description:
            "This is useful during maintenance or any situation where alarms should temporarily not be generated.",
          steps: {
            "1": "In Monitoring, open the monitoring management action for the affected location.",
            "2": "Choose one of the proposed disable durations or manual mode, then add a comment when required by your installation.",
            "3": "Confirm and make sure the card clearly shows that monitoring is disabled.",
            "4": "At the end of the intervention, enable monitoring again from the same action and confirm that measurements resume.",
          },
        },
        viewHistory: {
          title: "Review a location chart and history",
          description:
            "Location details let you move from live monitoring to a historical period without changing the location configuration.",
          steps: {
            "1": "From the location card in Monitoring, open measurement details.",
            "2": "Use the Chart tab to review the curve, thresholds and available events.",
            "3": "Select a period when you need to analyze older history.",
            "4": "Use the Table tab to browse detailed measurements and export functions when you need row-level values.",
          },
        },
      },
    },
    permissions: {
      title: "Visible features depend on your profile",
      description:
        "Some administration, metrology, editing or acknowledgement actions may be hidden when your profile or license does not allow them. Contact your VigiSensys administrator or the MC2 hotline in that case.",
    },
    contact: {
      title: "Need additional help?",
      description:
        "Contact the MC2 hotline if the guide does not cover your need or if you encounter unexpected behavior. The Write to us button prepares a message with useful diagnostic information.",
      emailLabel: "Hotline email",
      phoneLabel: "Hotline phone",
      write: "Write to us",
      mail: {
        subject: "[VigiSensys] Support request",
        greeting: "Hello,",
        intro: "I need assistance with VigiSensys.",
        fields: {
          organization: "Company / facility",
          contact: "Contact name",
          phone: "Phone",
          version: "VigiSensys Web version",
          page: "Affected page / screen",
          location: "Affected location",
          sensor: "Affected probe",
          subject: "Request subject",
          description: "Problem or request description",
          steps: "Actions already taken / reproduction steps",
          error: "Observed error message",
        },
        closing: "Thank you.",
      },
    },
  },
}

export function helpSupportSupplementForLocale(locale: string): MessageCatalog {
  return locale === "fr" ? frHelpSupportSupplements : enHelpSupportSupplements
}
