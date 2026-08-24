import type { MessageCatalog } from "./supplements"

export const frMetrologyCalibrationSupplements: MessageCatalog = {
  metrologyAdmin: {
    adjustmentPage: {
      operationTimer: {
        movePanel: "Déplacer le panneau",
      },
    },
    calibrationPage: {
      operationTimer: {
        title: "Étalonnage en cours",
        sensorCount: "{count, plural, one {# sonde concernée} other {# sondes concernées}}",
        remaining: "Temps restant avant annulation automatique",
        movePanel: "Déplacer le panneau",
        stop: "Arrêter l'étalonnage",
        stopTitle: "Arrêter l'étalonnage ?",
        stopDescription: "L'étalonnage en cours sera arrêté et les sondes retrouveront leur état précédent.",
        cancel: "Continuer l'étalonnage",
        confirmStop: "Arrêter l'étalonnage",
        stopping: "Arrêt...",
        stopError: "Impossible d'arrêter l'étalonnage.",
      },
      workflow: {
        enhanced: {
          reference_title: "Référence et milieu",
          reference_description: "Sélectionnez l'étalon automatique et le milieu utilisés pour les calculs.",
          standard: "Étalon",
          standard_placeholder: "Sélectionner un étalon",
          standard_help: "Seuls les étalons SPET interrogés automatiquement et compatibles avec l'unité sélectionnée sont proposés.",
          medium: "Milieu",
          medium_placeholder: "Sélectionner un milieu",
          medium_help: "La stabilité et l'homogénéité du milieu sont utilisées dans le calcul d'incertitude.",
          phase_reading: "Lecture active",
          phase_acquiring: "Étalonnage en cours",
          phase_completed: "Étalonnage terminé",
          phase_ready: "Prêt",
          reading_queue_title: "Lecture en attente",
          reading_queue_description: "La demande est en file d'attente. La Surveillance reste prioritaire ; la lecture démarrera automatiquement dès que le serveur et le port série seront disponibles.",
          reading_active: "La lecture est lancée. L'étalonnage sera disponible dès qu'une valeur valide de l'étalon et de chaque sonde aura été reçue.",
          reading_required: "Démarrez d'abord la lecture et attendez une première valeur valide de l'étalon et de chaque sonde.",
          acquiring: "Acquisition des 10 mesures en cours",
          progress: "{count} / {target} mesures valides",
          last_reading_title: "Dernière mesure d'étalonnage",
          last_reading_description: "Dernière valeur reçue pour chaque sonde.",
          standard_latest: "Dernière mesure étalon",
          standard_samples_title: "Mesures de l'étalon",
          standard_samples_description: "Les 10 valeurs de référence retenues pour l'étalonnage.",
          all_samples_title: "Toutes les mesures d'étalonnage",
          all_samples_description: "Mesures appariées retenues pour les calculs. La colonne étalon est distinguée visuellement.",
          results_title: "Résultats de l'étalonnage",
          results_description: "Résultats calculés côté serveur après les 10 mesures valides.",
          sample_number: "N°",
          standard_column: "Étalon {serial}",
          measured_at: "Date / heure",
          no_samples: "Aucune mesure d'étalonnage enregistrée pour le moment.",
          mean_sensor: "Moyenne sonde",
          mean_standard: "Moyenne étalon",
          accuracy_error: "Erreur de justesse",
          uncertainty: "Incertitude",
          start_reading_hint: "Renseignez l'opérateur, l'étalon, le milieu et au moins une sonde pour démarrer la lecture.",
        },
      },
    },
  },
}

export const enMetrologyCalibrationSupplements: MessageCatalog = {
  metrologyAdmin: {
    adjustmentPage: {
      operationTimer: {
        movePanel: "Move panel",
      },
    },
    calibrationPage: {
      operationTimer: {
        title: "Calibration in progress",
        sensorCount: "{count, plural, one {# sensor} other {# sensors}}",
        remaining: "Time remaining before automatic cancellation",
        movePanel: "Move panel",
        stop: "Stop calibration",
        stopTitle: "Stop calibration?",
        stopDescription: "The current calibration will be stopped and the sensors will return to their previous state.",
        cancel: "Continue calibration",
        confirmStop: "Stop calibration",
        stopping: "Stopping...",
        stopError: "Unable to stop calibration.",
      },
      workflow: {
        enhanced: {
          reference_title: "Reference and medium",
          reference_description: "Select the automatic standard and medium used for calculations.",
          standard: "Standard",
          standard_placeholder: "Select a standard",
          standard_help: "Only automatically read SPET standards compatible with the selected unit are available.",
          medium: "Medium",
          medium_placeholder: "Select a medium",
          medium_help: "Medium stability and homogeneity are used in the uncertainty calculation.",
          phase_reading: "Reading active",
          phase_acquiring: "Calibration in progress",
          phase_completed: "Calibration completed",
          phase_ready: "Ready",
          reading_queue_title: "Reading queued",
          reading_queue_description: "The request is queued. Monitoring remains the priority; reading will start automatically as soon as the server and serial port are available.",
          reading_active: "Reading is active. Calibration becomes available once a valid value has been received from the standard and every sensor.",
          reading_required: "Start reading first and wait for a valid value from the standard and every sensor.",
          acquiring: "Acquiring the 10 measurements",
          progress: "{count} / {target} valid measurements",
          last_reading_title: "Latest calibration measurement",
          last_reading_description: "Latest value received for each sensor.",
          standard_latest: "Latest standard measurement",
          standard_samples_title: "Standard measurements",
          standard_samples_description: "The 10 reference values retained for calibration.",
          all_samples_title: "All calibration measurements",
          all_samples_description: "Paired measurements retained for calculations. The standard column is visually highlighted.",
          results_title: "Calibration results",
          results_description: "Results calculated server-side after 10 valid measurements.",
          sample_number: "No.",
          standard_column: "Standard {serial}",
          measured_at: "Date / time",
          no_samples: "No calibration measurement has been recorded yet.",
          mean_sensor: "Sensor average",
          mean_standard: "Standard average",
          accuracy_error: "Accuracy error",
          uncertainty: "Uncertainty",
          start_reading_hint: "Enter the operator, standard, medium and at least one sensor to start reading.",
        },
      },
    },
  },
}

export function metrologyCalibrationSupplementForLocale(locale: string): MessageCatalog {
  return locale.toLowerCase().startsWith("fr")
    ? frMetrologyCalibrationSupplements
    : enMetrologyCalibrationSupplements
}
