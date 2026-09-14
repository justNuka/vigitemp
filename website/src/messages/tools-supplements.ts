import type { MessageCatalog } from "./supplements"

export const frToolsSupplements: MessageCatalog = {
  toolsTestConnection: {
    real_test: {
      title: "Test basé sur les interrogations réelles",
      description: "VigiSensys observe les mesures réellement produites par le service d'interrogation pendant la durée choisie. Le test n'envoie pas de commandes parallèles et n'interrompt pas la surveillance normale.",
      no_attempt_title: "Aucune interrogation observée",
      no_attempt_description: "Aucune interrogation de la sélection n'a été enregistrée pendant cette fenêtre. Vérifiez que le service d'interrogation fonctionne et choisissez une durée couvrant la fréquence des sondes concernées.",
      completed_title: "Test terminé",
      completed_description: "Les résultats affichés proviennent des interrogations réellement enregistrées pendant la fenêtre de test.",
    },
    table: {
      columns: {
        attempts: "Reçues / total",
        status: "État du test",
      },
    },
    status: {
      idle: "Non testé",
      waiting: "En attente",
      success: "Répond",
      partial: "Réponse partielle",
      failed: "Aucune réponse",
      no_data: "Non interrogée",
    },
    stats: {
      test_progress: "Progression du test",
      ready: "Prêt",
      completed: "Terminé",
      global_response_rate: "Taux de réponse global",
      received_attempts: "Interrogations reçues",
      real_measurements: "mesures réelles enregistrées",
      responding_sensors: "Sondes ayant répondu",
      selected_sensors: "sur la sélection testée",
    },
    launch_dialog: {
      description_real: "Lancer un test réel sur {count} sonde(s) sélectionnée(s). Les résultats seront calculés à partir des interrogations enregistrées pendant la fenêtre choisie.",
      duration_help: "Choisissez une durée suffisamment longue pour couvrir la fréquence normale d'interrogation. Une sonde non interrogée pendant cette fenêtre sera indiquée comme telle, sans être déclarée à tort en panne.",
    },
    errors: {
      catalog_title: "Chargement impossible",
      catalog: "Impossible de charger les sondes disponibles.",
      test_title: "Test interrompu",
    },
  },
}

export const enToolsSupplements: MessageCatalog = {
  toolsTestConnection: {
    real_test: {
      title: "Test based on real polling",
      description: "VigiSensys observes the measurements actually produced by the polling service during the selected duration. The test does not send parallel commands and does not interrupt normal monitoring.",
      no_attempt_title: "No polling attempt observed",
      no_attempt_description: "No polling attempt for the selected sensors was recorded during this window. Check that the polling service is running and choose a duration that covers the sensors' polling frequency.",
      completed_title: "Test completed",
      completed_description: "The displayed results come from polling attempts actually recorded during the test window.",
    },
    table: {
      columns: {
        attempts: "Received / total",
        status: "Test status",
      },
    },
    status: {
      idle: "Not tested",
      waiting: "Waiting",
      success: "Responding",
      partial: "Partial response",
      failed: "No response",
      no_data: "Not polled",
    },
    stats: {
      test_progress: "Test progress",
      ready: "Ready",
      completed: "Completed",
      global_response_rate: "Overall response rate",
      received_attempts: "Received polls",
      real_measurements: "real measurements recorded",
      responding_sensors: "Sensors responding",
      selected_sensors: "of the tested selection",
    },
    launch_dialog: {
      description_real: "Run a real test on {count} selected sensor(s). Results will be calculated from polling attempts recorded during the selected window.",
      duration_help: "Choose a duration long enough to cover the normal polling frequency. A sensor that is not polled during this window will be reported as such instead of being incorrectly marked as failed.",
    },
    errors: {
      catalog_title: "Unable to load",
      catalog: "Unable to load the available sensors.",
      test_title: "Test interrupted",
    },
  },
}

export function toolsSupplementForLocale(locale: string): MessageCatalog {
  return locale.toLowerCase().startsWith("fr") ? frToolsSupplements : enToolsSupplements
}
