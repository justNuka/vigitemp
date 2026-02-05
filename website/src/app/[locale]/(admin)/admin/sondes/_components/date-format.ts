const DEFAULT_TIMEZONE = 'Europe/Paris';
const DEFAULT_LOCALE = 'fr-FR';

export function formatDateTimeFr(
  date: Date | null,
  timezone: string = DEFAULT_TIMEZONE,
  localeTag: string = DEFAULT_LOCALE,
) {
  if (!date) return '-';
  return new Date(date).toLocaleString(localeTag, {
    timeZone: timezone,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function formatDateFr(
  date: Date | null,
  timezone: string = DEFAULT_TIMEZONE,
  localeTag: string = DEFAULT_LOCALE,
) {
  if (!date) return '-';
  return new Date(date).toLocaleDateString(localeTag, {
    timeZone: timezone,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

