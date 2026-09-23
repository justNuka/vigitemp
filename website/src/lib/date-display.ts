export type DbDateInput = string | number | Date | null | undefined;

export type DateDisplayFormat =
  | "date"
  | "dateShort"
  | "time"
  | "timeSeconds"
  | "dateTime"
  | "dateTimeShort"
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
  /** @deprecated Prefer a named `format`. */
  withSeconds?: boolean;
  /** @deprecated Prefer `format: "dateShort" | "dateTimeShort"`, or `formatDbDateTimeIntl` for custom date parts. */
  withYear?: boolean;
  /** @deprecated Prefer `format: "date" | "dateShort"`. */
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
  dateShort: {
    includeDate: true,
    includeTime: false,
    includeSeconds: false,
    includeYear: false,
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
  dateTimeShort: {
    includeDate: true,
    includeTime: true,
    includeSeconds: false,
    includeYear: false,
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
 * Serializes UTC components from a Date wrapper.
 *
 * This is used for transported stored-DATETIME values and for providers such
 * as node-mssql that expose timezone-less DATETIME values with UTC semantics.
 * Server code reading a Date directly from Prisma must use the provider-aware
 * bridge from sql-provider.ts instead of assuming one Date representation.
 */
const serializeUtcDateComponents = (value: Date): string | null => {
  if (Number.isNaN(value.getTime())) return null;

  const year = value.getUTCFullYear();
  const month = pad2(value.getUTCMonth() + 1);
  const day = pad2(value.getUTCDate());
  const hours = pad2(value.getUTCHours());
  const minutes = pad2(value.getUTCMinutes());
  const seconds = pad2(value.getUTCSeconds());

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};

export function serializeStoredDbDateTime(value: DbDateInput): string | null {
  if (value instanceof Date) {
    return serializeUtcDateComponents(value);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;

    // A Prisma DATETIME may have crossed a JSON boundary and therefore arrive
    // with a Z / explicit offset. For a stored timezone-less DATETIME the
    // written calendar/time components are the source of truth: ignore the
    // transport timezone instead of converting the value as a real instant.
    const zonedStoredMatch = trimmed.match(
      /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}:\d{2})(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})$/i,
    );
    if (zonedStoredMatch) {
      return `${zonedStoredMatch[1]}T${zonedStoredMatch[2]}`;
    }
  }

  return serializeDbDateTime(value);
}

export function parseStoredDbDateTime(value: DbDateInput): Date | null {
  const serialized = serializeStoredDbDateTime(value);
  return serialized ? parseDbDateTime(serialized) : null;
}

export type StoredDbPrismaProvider = "mysql" | "mssql";

const toUtcWallClockWrapper = (date: Date): Date | null => {
  if (Number.isNaN(date.getTime())) return null;
  return new Date(
    Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds(),
      date.getMilliseconds(),
    ),
  );
};

/**
 * Serializes a timezone-less DATETIME Date wrapper returned by a Prisma driver.
 *
 * MariaDB's Node connector defaults to timezone=local and exposes DATETIME
 * values using local Date components. node-mssql defaults to useUTC=true.
 * The provider therefore has to be known at this server-side boundary.
 */
export function serializePrismaStoredDbDateTimeForProvider(
  value: DbDateInput,
  provider: StoredDbPrismaProvider,
): string | null {
  if (!(value instanceof Date)) {
    return serializeStoredDbDateTime(value);
  }

  return provider === "mssql"
    ? serializeUtcDateComponents(value)
    : serializeDbDateTime(value);
}

/**
 * Builds the Date wrapper expected by Prisma when filtering/writing a
 * timezone-less DATETIME.
 *
 * MySQL/MariaDB keeps the local Date components. SQL Server (node-mssql,
 * useUTC=true) needs a UTC wrapper whose UTC components equal the DB wall
 * clock components.
 */
export function toPrismaStoredDbDateTimeForProvider(
  value: DbDateInput,
  provider: StoredDbPrismaProvider,
): Date | null {
  if (value === null || value === undefined) return null;

  let wallClockDate: Date | null = null;

  if (value instanceof Date) {
    wallClockDate = Number.isNaN(value.getTime()) ? null : new Date(value.getTime());
  } else if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;

    const transportedStored = trimmed.match(
      /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?)(?:Z|[+-]\d{2}:?\d{2})$/i,
    );
    const wallClockValue = transportedStored?.[1] ?? trimmed;
    wallClockDate = parseLocalDateTimeParts(wallClockValue) ?? parseDbDateTime(wallClockValue);
  } else {
    wallClockDate = parseDbDateTime(value);
  }

  if (!wallClockDate || Number.isNaN(wallClockDate.getTime())) return null;

  return provider === "mssql"
    ? toUtcWallClockWrapper(wallClockDate)
    : new Date(wallClockDate.getTime());
}

export function formatStoredDbDateTime(
  value: DbDateInput,
  options: DateDisplayOptions = {},
): string {
  const serialized = serializeStoredDbDateTime(value);
  if (!serialized) return options.fallback ?? "-";

  // Stored DATETIME values already represent a local wall-clock value.
  // Never apply an additional timezone conversion while formatting them.
  return formatDbDateTime(
    serialized,
    options.timeZone ? { ...options, timeZone: undefined } : options,
  );
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
    const resolved = DATE_DISPLAY_FORMATS[options.format];
    if (resolved) return resolved;
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
