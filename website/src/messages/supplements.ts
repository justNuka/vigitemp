export type MessageCatalog = Record<string, unknown>

export const frSupplements: MessageCatalog = {
  alarmAckHistoryPage: {
    table: { type: { disabled_since: "Surveillance désactivée depuis le {date}" } },
  },
  alarmsPage: {
    table: { results_with_total: "{visible} résultat(s) sur {total} dans cet onglet" },
    titles: { type_module: "Problème module" },
  },
  dashboard: {
    stats_descriptions: {
      total_locations: "Nombre total de lieux affichés",
      ok_locations: "Lieux sans alarme active",
      pre_alarm_locations: "Lieux en pré-alarme",
      ended_locations: "Lieux avec alarme terminée à acquitter",
      alert_locations: "Lieux en pré-alarme ou en alarme terminée à acquitter",
      critical_locations: "Lieux en alarme en cours",
    },
  },
  monitoringCard: {
    surveillance: {
      disabled_since_by: "Surveillance désactivée depuis le {date} par {user}",
    },
  },
  surveillance: {
    filters: {
      status: { badge_filter: "badge : {value}" },
      status_filters: {
        disabled: "désactivés",
        ok: "OK",
        preAlarm: "pré-alarmes",
        ended: "terminées",
        critical: "critiques",
      },
    },
    planning_value: "{count} règle{count, plural, one {} other {s}}",
    refresh: { error: "Échec de l'actualisation" },
  },
  locationsForm: {
    telephony: {
      apply_groups_title: "Appliquer ces contacts aux groupes sélectionnés",
      apply_groups_description: "La liste remplacera les contacts mail de tous les autres lieux appartenant aux groupes sélectionnés.",
      apply_groups_empty: "Sélectionnez au moins un groupe dans l'onglet Général.",
    },
  },
  adminSettings: {
    non_response_auto_ack: {
      title: "Acquittement automatique des non-réponses",
      description: "Une alarme de non-réponse terminée sera acquittée automatiquement pour les lieux activés.",
      search: "Rechercher un lieu ou une sonde",
      enabled_count: "{enabled} activé(s) sur {total}",
      check_all: "Tout cocher",
      uncheck_all: "Tout décocher",
      location: "Lieu",
      sensor: "Sonde",
      active: "Actif",
      empty: "Aucun lieu trouvé.",
      unassigned: "Non assignée",
      aria: "Acquittement automatique pour {location}",
      helper: "Ce réglage concerne uniquement les alarmes de non-réponse terminées. Les autres types d’alarme restent à acquitter manuellement.",
      load_error: "Impossible de charger les lieux",
      no_change: "Aucun changement nécessaire",
      updated: "{count} lieu(x) mis à jour",
      update_error: "Impossible de mettre à jour les lieux",
    },
  },
  dashboardClient: {
    trend_by_location: {
      legend: {
        title: "Légende :",
        alarm_count: "Nombre d'alarmes",
        alarm_durations: "Durées d'alarmes haute/basse",
        exceedances: "Dépassements sans alarme",
      },
    },
  },
  messaging: {
    thread: {
      typing: "{names} est en train d'écrire…",
    },
  },
  metrologyWorkspace: {
    title: "Métrologie",
    description: "Espace de travail métrologie. Les opérations d'ajustage et d'étalonnage seront accessibles ici.",
    notice: "Cette page est prête. Les opérations métrologiques visibles ici sont réservées aux profils disposant de l'autorisation métrologie.",
  },
}

export const enSupplements: MessageCatalog = {
  alarmsPage: {
    tabs: { results_with_total: "{visible} result(s) out of {total} in this tab" },
  },
  audit: {
    filters: {
      site: "Site",
      type: "Type",
      dateFrom: "Start date",
      dateTo: "End date",
      allSites: "All sites",
      allTypes: "All types",
      selected_range: "Selected range: {range}",
    },
  },
  dashboardClient: {
    table: { columns: { triggered_value: "Triggering value" } },
    trend_by_location: {
      legend: {
        title: "Legend:",
        alarm_count: "Alarm count",
        alarm_durations: "High/low alarm durations",
        exceedances: "Exceedances without alarm",
      },
    },
  },
  surveillance: {
    grid: { disabled_since: "Monitoring disabled since {date}" },
    open_details: "View details",
  },
  toolsTestConnection: {
    stats: {
      global_response_rate: "Global response rate",
      sensor_count: "{count, plural, one {{count} sensor} other {{count} sensors}}",
      measurement_count: "Measurement count",
      last_7days: "Last 7 days",
      selected_sensors: "Selected sensors",
      selected_over_total: "out of {total}",
    },
    table: {
      columns: {
        relay1: "Relay 1",
        relay2: "Relay 2",
        relay3: "Relay 3",
        relay4: "Relay 4",
      },
    },
  },
  locationsForm: {
    telephony: {
      apply_groups_title: "Apply these contacts to selected groups",
      apply_groups_description: "This list will replace the email contacts of all other locations belonging to the selected groups.",
      apply_groups_empty: "Select at least one group in the General tab.",
    },
  },
  adminSettings: {
    non_response_auto_ack: {
      title: "Automatic acknowledgment of no-response alarms",
      description: "An ended no-response alarm will be acknowledged automatically for enabled locations.",
      search: "Search a location or sensor",
      enabled_count: "{enabled} enabled out of {total}",
      check_all: "Check all",
      uncheck_all: "Uncheck all",
      location: "Location",
      sensor: "Sensor",
      active: "Active",
      empty: "No location found.",
      unassigned: "Unassigned",
      aria: "Automatic acknowledgment for {location}",
      helper: "This setting only applies to ended no-response alarms. Other alarm types still require manual acknowledgment.",
      load_error: "Unable to load locations",
      no_change: "No change required",
      updated: "{count} location(s) updated",
      update_error: "Unable to update locations",
    },
  },
  messaging: {
    thread: {
      typing: "{names} is typing…",
    },
  },
  metrologyWorkspace: {
    title: "Metrology",
    description: "Metrology workspace. Adjustment and calibration operations will be available here.",
    notice: "This page is ready. The metrology operations shown here are restricted to profiles with metrology permission.",
  },
}

function isRecord(value: unknown): value is MessageCatalog {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value)
}

export function mergeMessages(base: MessageCatalog, supplement: MessageCatalog): MessageCatalog {
  const result: MessageCatalog = { ...base }

  for (const [key, value] of Object.entries(supplement)) {
    if (isRecord(value) && isRecord(result[key])) {
      result[key] = mergeMessages(result[key] as MessageCatalog, value)
    } else {
      result[key] = value
    }
  }

  return result
}

export function supplementForLocale(locale: string): MessageCatalog {
  return locale.toLowerCase().startsWith("fr") ? frSupplements : enSupplements
}
