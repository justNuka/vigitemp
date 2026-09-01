export type DbDateInput = string | number | Date | null | undefined;

type FormatOptions = {
  withSeconds?: boolean;
  withYear?: boolean;
  dateOnly?: boolean;
  timeOnly?: boolean;
  fallback?: string;
  locale?: string | string[];
  timeZone?: string;
};

type IntlFormatOptions = {
  intl: Intl.DateTimeFormatOptions;
  fallback?: string;
  locale?: string | string[];
  timeZone?: string;
};

const pad2 = (value: number) => String(value).padStart(2, "0");

const parseLocalDateTimeParts = (value: string): Date | null => {
  const match = value.match(
    /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?)?$/,
  );

  if (!match) return null;

  const [, year, month, day, hour = "00", minute = "00", second = "00", millisecond = "0"] = match;
  const parsed = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second),
    Number(millisecond.padEnd(3, "0")),
  );

  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const parseDbDateTime = (value: DbDateInput): Date | null => {
  if (value === null || value === undefined) return null;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : new Date(value.getTime());
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;

    const localDateTime = parseLocalDateTimeParts(trimmed);
    if (localDateTime) return localDateTime;

    const parsed = new Date(trimmed);
    if (Number.isNaN(parsed.getTime())) return null;

    return parsed;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export function serializeDbDateTime(value: DbDateInput): string | null {
  const date = parseDbDateTime(value);
  if (!date) return null;

  const year = date.getFullYear();
  const month = pad2(date.getMonth() + 1);
  const day = pad2(date.getDate());
  const hours = pad2(date.getHours());
  const minutes = pad2(date.getMinutes());
  const seconds = pad2(date.getSeconds());

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

/**
 * Serializes a timezone-less DATETIME returned by Prisma.
 *
 * Prisma exposes MySQL/MSSQL DATETIME columns as Date objects backed by UTC,
 * while the stored components already represent the local wall-clock value.
 * Reading UTC components prevents adding the browser/server timezone offset.
 */
export function serializeStoredDbDateTime(value: DbDateInput): string | null {
  if (!(value instanceof Date)) {
    return serializeDbDateTime(value);
  }

  if (Number.isNaN(value.getTime())) return null;

  const year = value.getUTCFullYear();
  const month = pad2(value.getUTCMonth() + 1);
  const day = pad2(value.getUTCDate());
  const hours = pad2(value.getUTCHours());
  const minutes = pad2(value.getUTCMinutes());
  const seconds = pad2(value.getUTCSeconds());

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

const maybeAlreadyFormatted = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^\d{2}\/\d{2}\/\d{4}( \d{2}:\d{2}(:\d{2})?)?$/.test(trimmed)) return trimmed;
  if (/^\d{2}:\d{2}(:\d{2})?$/.test(trimmed)) return trimmed;
  return null;
};

export function formatDbDateTime(value: DbDateInput, options: FormatOptions = {}): string {
  const {
    withSeconds = true,
    withYear = true,
    dateOnly = false,
    timeOnly = false,
    fallback = "-",
    locale,
    timeZone,
  } = options;

  if (typeof value === "string") {
    const direct = maybeAlreadyFormatted(value);
    if (direct) return direct;
  }

  const date = parseDbDateTime(value);
  if (!date) return fallback;

  const day = pad2(date.getDate());
  const month = pad2(date.getMonth() + 1);
  const year = date.getFullYear();
  const hours = pad2(date.getHours());
  const minutes = pad2(date.getMinutes());
  const seconds = pad2(date.getSeconds());

  if (locale || timeZone) {
    if (dateOnly) {
      const dateOptions: Intl.DateTimeFormatOptions = {
        day: "2-digit",
        month: "2-digit",
        ...(withYear ? { year: "numeric" as const } : {}),
      };

      if (timeZone) {
        dateOptions.timeZone = timeZone;
      }

      return new Intl.DateTimeFormat(locale, dateOptions).format(date);
    }

    if (timeOnly) {
      const timeOptions: Intl.DateTimeFormatOptions = {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      };

      if (withSeconds) {
        timeOptions.second = "2-digit";
      }

      if (timeZone) {
        timeOptions.timeZone = timeZone;
      }

      return new Intl.DateTimeFormat(locale, timeOptions).format(date);
    }

    const dateTimeOptions: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "2-digit",
      ...(withYear ? { year: "numeric" as const } : {}),
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    };

    if (withSeconds) {
      dateTimeOptions.second = "2-digit";
    }

    if (timeZone) {
      dateTimeOptions.timeZone = timeZone;
    }

    return new Intl.DateTimeFormat(locale, dateTimeOptions).format(date);
  }

  if (dateOnly) return withYear ? `${day}/${month}/${year}` : `${day}/${month}`;
  if (timeOnly) return withSeconds ? `${hours}:${minutes}:${seconds}` : `${hours}:${minutes}`;

  const time = withSeconds ? `${hours}:${minutes}:${seconds}` : `${hours}:${minutes}`;
  return withYear ? `${day}/${month}/${year} ${time}` : `${day}/${month} ${time}`;
}

export function formatDbDateTimeIntl(value: DbDateInput, options: IntlFormatOptions): string {
  const { intl, fallback = "-", locale, timeZone } = options;
  const date = parseDbDateTime(value);
  if (!date) return fallback;

  return new Intl.DateTimeFormat(locale, {
    ...intl,
    ...(timeZone ? { timeZone } : {}),
  }).format(date);
}
