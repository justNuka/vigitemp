export type DbDateInput = string | number | Date | null | undefined;

type FormatOptions = {
  withSeconds?: boolean;
  dateOnly?: boolean;
  timeOnly?: boolean;
  fallback?: string;
};

const pad2 = (value: number) => String(value).padStart(2, "0");

const toDate = (value: DbDateInput): Date | null => {
  if (value === null || value === undefined) return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const maybeAlreadyFormatted = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^\d{2}\/\d{2}\/\d{4}( \d{2}:\d{2}(:\d{2})?)?$/.test(trimmed)) return trimmed;
  if (/^\d{2}:\d{2}(:\d{2})?$/.test(trimmed)) return trimmed;
  return null;
};

export function formatDbDateTime(value: DbDateInput, options: FormatOptions = {}): string {
  const { withSeconds = true, dateOnly = false, timeOnly = false, fallback = "-" } = options;

  if (typeof value === "string") {
    const direct = maybeAlreadyFormatted(value);
    if (direct) return direct;
  }

  const date = toDate(value);
  if (!date) return fallback;

  const day = pad2(date.getUTCDate());
  const month = pad2(date.getUTCMonth() + 1);
  const year = date.getUTCFullYear();
  const hours = pad2(date.getUTCHours());
  const minutes = pad2(date.getUTCMinutes());
  const seconds = pad2(date.getUTCSeconds());

  if (dateOnly) return `${day}/${month}/${year}`;
  if (timeOnly) return withSeconds ? `${hours}:${minutes}:${seconds}` : `${hours}:${minutes}`;

  const time = withSeconds ? `${hours}:${minutes}:${seconds}` : `${hours}:${minutes}`;
  return `${day}/${month}/${year} ${time}`;
}
