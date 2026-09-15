import type { MessageCatalog } from "./supplements"

export const frAdjustmentImportSupplements: MessageCatalog = {
  sensorAdjustmentImport: {
    coefficient_sync: {
      label: "Envoyer les coefficients aux sondes à la prochaine interrogation de métrologie",
      description: "Les coefficients du XML sont enregistrés immédiatement. Cochez cette option pour programmer leur envoi aux GSP lors de la prochaine interrogation Ajustage/Étalonnage compatible ; l'import ne contacte pas directement les sondes.",
    },
    toast: {
      coefficients_queued: "Synchronisation des coefficients programmée pour {count} GSP.",
      coefficients_not_queued: "Synchronisation non programmée pour {count} GSP : vérifiez l'affectation du module ou que l'ajustage importé est bien le plus récent.",
    },
  },
}

export const enAdjustmentImportSupplements: MessageCatalog = {
  sensorAdjustmentImport: {
    coefficient_sync: {
      label: "Send coefficients to sensors on the next metrology polling cycle",
      description: "XML coefficients are stored immediately. Enable this option to queue their delivery to GSP sensors during the next compatible Adjustment/Calibration polling cycle; the import does not contact sensors directly.",
    },
    toast: {
      coefficients_queued: "Coefficient synchronization queued for {count} GSP sensor(s).",
      coefficients_not_queued: "Coefficient synchronization was not queued for {count} GSP sensor(s): check the module assignment or ensure the imported adjustment is the latest one.",
    },
  },
}

export function adjustmentImportSupplementForLocale(locale: string): MessageCatalog {
  return locale.toLowerCase().startsWith("fr")
    ? frAdjustmentImportSupplements
    : enAdjustmentImportSupplements
}
