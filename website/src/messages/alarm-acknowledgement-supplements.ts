import type { MessageCatalog } from "./supplements"

export const frAlarmAcknowledgementSupplements: MessageCatalog = {
  alarmsPage: {
    dialog: {
      focused_alarm_label: "Alarme sélectionnée #{id}",
      other_alarms_title: "Autres alarmes du lieu ({count})",
      other_alarms_show: "Afficher",
      other_alarms_hide: "Replier",
    },
    analysis: {
      backToAcknowledgement: "Fermer et revenir à l’acquittement",
      otherLocationAlarms: "Autres alarmes du lieu ({count})",
      otherAlarmsShow: "Afficher",
      otherAlarmsHide: "Replier",
    },
  },
}

export const enAlarmAcknowledgementSupplements: MessageCatalog = {
  alarmsPage: {
    dialog: {
      focused_alarm_label: "Selected alarm #{id}",
      other_alarms_title: "Other alarms for this location ({count})",
      other_alarms_show: "Show",
      other_alarms_hide: "Collapse",
    },
    analysis: {
      backToAcknowledgement: "Close and return to acknowledgement",
      otherLocationAlarms: "Other alarms for this location ({count})",
      otherAlarmsShow: "Show",
      otherAlarmsHide: "Collapse",
    },
  },
}

export function alarmAcknowledgementSupplementForLocale(locale: string): MessageCatalog {
  return locale.toLowerCase().startsWith("fr")
    ? frAlarmAcknowledgementSupplements
    : enAlarmAcknowledgementSupplements
}
