function pluralizeFr(count: number, singular: string, plural: string) {
  return count > 1 ? plural : singular
}

export function formatSondes(count: number) {
  return `${count} ${pluralizeFr(count, "sonde", "sondes")}`
}

export function formatGroupes(count: number) {
  return `${count} ${pluralizeFr(count, "groupe", "groupes")}`
}

export function formatAlarmes(count: number) {
  return `${count} ${pluralizeFr(count, "alarme", "alarmes")}`
}

export function formatPreAlarmes(count: number) {
  return `${count} ${pluralizeFr(count, "pre-alarme", "pre-alarmes")}`
}

export function formatAlarmesTerminees(count: number) {
  return `${count} ${pluralizeFr(count, "alarme terminee", "alarmes terminees")}`
}
