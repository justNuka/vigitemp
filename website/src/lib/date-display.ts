export type DbDateInput = string | number | Date | null | undefined;

export type DateDisplayFormat =
  | "date"
  | "time"
  | "timeSeconds"
  | "dateTime"
  | "dateTimeSeconds";

export type DateDisplayOptions = {
  /**
   * Preferred display preset for new call sites.
   * When provided, it takes precedence over the legacy boolean options below.
   */
  format?: DateDisplayFormat;
  fallback?: string;
  locale?: string | string[];
  timeZone?: string;
  /** @deprecated Prefer `format: "timeSeconds" | "dateTimeSeconds"`. */
  withSeconds?: boolean;
  /** @deprecated Prefer a named `format`, or `formatDbDateTimeIntl` for custom date parts. */
  withYear?: boolean;
  /** @deprecated Prefer `format: "date"`. */
  dateOnly?: boolean;
  /** @deprecated Prefer `format: "time" | "timeSeconds"`. */
  timeOnly?: boolean;
};

export type DateDisplayIntlOptions = {
  intl: Intl.DateTimeFormatOptions;
  fallback?: string;
  locale?: string | string[];
  timeZone?: string;
};

type ResolvedDateDisplayFormat = {
  includeDate: boolean;
  includeTime: boolean;
  includeSeconds: boolean;
  includeYear: boolean;
};

const DATE_DISPLAY_FORMATS: Record<DateDisplayFormat, ResolvedDateDisplayFormat> = {
  date: {
    includeDate: true,
    includeTime: false,
    includeSeconds: false,
    includeYear: true,
  },
  time: {
    includeDate: false,
    includeTime: true,
    includeSeconds: false,
    includeYear: false,
  },
  timeSeconds: {
    includeDate: false,
    includeTime: true,
    includeSeconds: true,
    includeYear: false,
  },
  dateTime: {
    includeDate: true,
    includeTime: true,
    includeSeconds: false,
    includeYear: true,
  },
  dateTimeSeconds: {
    includeDate: true,
    includeTime: true,
    includeSeconds: true,
    includeYear: true,
  },
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

const resolveLegacyDisplayFormat = (options: DateDisplayOptions): ResolvedDateDisplayFormat => {
  const {
    withSeconds = true,
    withYear = true,
    dateOnly = false,
    timeOnly = false,
  } = options;

  // Keep the historical precedence: dateOnly wins when both flags are true.
  if (dateOnly) {
    return {
      includeDate: true,
      includeTime: false,
      includeSeconds: false,
      includeYear: withYear,
    };
  }

  if (timeOnly) {
    return {
      includeDate: false,
      includeTime: true,
      includeSeconds: withSeconds,
      includeYear: false,
    };
  }

  return {
    includeDate: true,
    includeTime: true,
    includeSeconds: withSeconds,
    includeYear: withYear,
  };
};

const resolveDisplayFormat = (options: DateDisplayOptions): ResolvedDateDisplayFormat => {
  if (options.format) {
    return DATE_DISPLAY_FORMATS[options.format];
  }

  return resolveLegacyDisplayFormat(options);
};

const buildIntlDateTimeOptions = (
  format: ResolvedDateDisplayFormat,
  timeZone?: string,
): Intl.DateTimeFormatOptions => {
  const options: Intl.DateTimeFormatOptions = {};

  if (format.includeDate) {
    options.day = "2-digit";
    options.month = "2-digit";
    if (format.includeYear) {
      options.year = "numeric";
    }
  }

  if (format.includeTime) {
    options.hour = "2-digit";
    options.minute = "2-digit";
    options.hour12 = false;
    if (format.includeSeconds) {
      options.second = "2-digit";
    }
  }

  if (timeZone) {
    options.timeZone = timeZone;
  }

  return options;
};

const formatLocalDateTime = (date: Date, format: ResolvedDateDisplayFormat): string => {
  const day = pad2(date.getDate());
  const month = pad2(date.getMonth() + 1);
  const year = date.getFullYear();
  const hours = pad2(date.getHours());
  const minutes = pad2(date.getMinutes());
  const seconds = pad2(date.getSeconds());

  const datePart = format.includeDate
    ? format.includeYear
      ? `${day}/${month}/${year}`
      : `${day}/${month}`
    : "";
  const timePart = format.includeTime
    ? format.includeSeconds
      ? `${hours}:${minutes}:${seconds}`
      : `${hours}:${minutes}`
    : "";

  if (datePart && timePart) return `${datePart} ${timePart}`;
  return datePart || timePart;
};

export function formatDbDateTime(value: DbDateInput, options: DateDisplayOptions = {}): string {
  const { fallback = "-", locale, timeZone } = options;

  if (typeof value === "string") {
    const direct = maybeAlreadyFormatted(value);
    if (direct) return direct;
  }

  const date = parseDbDateTime(value);
  if (!date) return fallback;

  const resolvedFormat = resolveDisplayFormat(options);

  if (locale || timeZone) {
    return new Intl.DateTimeFormat(
      locale,
      buildIntlDateTimeOptions(resolvedFormat, timeZone),
    ).format(date);
  }

  return formatLocalDateTime(date, resolvedFormat);
}

export function formatDbDateTimeIntl(value: DbDateInput, options: DateDisplayIntlOptions): string {
  const { intl, fallback = "-", locale, timeZone } = options;
  const date = parseDbDateTime(value);
  if (!date) return fallback;

  return new Intl.DateTimeFormat(locale, {
    ...intl,
    ...(timeZone ? { timeZone } : {}),
  }).format(date);
}
