import { formatDbDateTime } from "@/lib/date-display";

const DEFAULT_TIMEZONE = "Europe/Paris";
const DEFAULT_LOCALE = "fr-FR";

export function formatDateTimeFr(
  date: Date | null,
  timezone: string = DEFAULT_TIMEZONE,
  localeTag: string = DEFAULT_LOCALE,
) {
  void timezone;
  void localeTag;
  if (!date) return "-";
  return formatDbDateTime(date, { format: "dateTimeSeconds" });
}

export function formatDateFr(
  date: Date | null,
  timezone: string = DEFAULT_TIMEZONE,
  localeTag: string = DEFAULT_LOCALE,
) {
  void timezone;
  void localeTag;
  if (!date) return "-";
  return formatDbDateTime(date, { format: "date" });
}