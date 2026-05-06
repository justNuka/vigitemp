import {
  GSO_SENSOR_TYPE_CODE_SET,
  GSP_SENSOR_TYPE_CODE_SET,
  KNOWN_SENSOR_TYPE_CODES,
  getKnownSensorFamilyFromTypeCode,
  normalizeSensorTypeCode,
} from "@/lib/sensor-types";

const DUAL_GSO_TYPES = new Set(["SOIH", "SOEH"]);
const SINGLE_TEMPERATURE_GSO_TYPES = new Set(["SOIT", "SOET"]);
const PREFIX_STRIPPED_ADDRESS_TYPES = new Set(["IN", "IE", "IP", "IC", "IH", "EN"]);

const normalizeType = normalizeSensorTypeCode;
const normalizeSerial = (value: string) => value.trim().toUpperCase();

const normalizeKnownTypeCodes = (knownTypeCodes?: Iterable<string> | null) => {
  const source = knownTypeCodes ?? KNOWN_SENSOR_TYPE_CODES;
  return Array.from(
    new Set(
      Array.from(source)
        .map((value) => normalizeType(value))
        .filter((value) => value.length > 0),
    ),
  ).sort((a, b) => b.length - a.length);
};

export const isDualGsoType = (type: string) => DUAL_GSO_TYPES.has(normalizeType(type));

export const isGsoType = (type: string) => {
  const normalized = normalizeType(type);
  return normalized === "GSO" || GSO_SENSOR_TYPE_CODE_SET.has(normalized);
};

export const extractAddressFromSerial = (serial: string) => {
  const normalized = normalizeSerial(serial);
  const firstDash = normalized.indexOf("-");
  if (firstDash < 0) return normalized;
  return normalized.slice(firstDash + 1);
};

export const extractProbeAddressFromSerial = (serial: string, knownTypeCodes?: Iterable<string> | null) => {
  const normalized = normalizeSerial(serial);
  const gsoAddress = extractAddressFromSerial(normalized);
  const dashIndex = normalized.indexOf("-");
  const type =
    dashIndex >= 0
      ? normalizeType(normalized.slice(0, dashIndex))
      : extractTypeCodeFromSerial(normalized, knownTypeCodes);

  if (isGsoType(type)) {
    if (SINGLE_TEMPERATURE_GSO_TYPES.has(type)) {
      return stripGsoSuffix(gsoAddress);
    }
    if (isDualGsoType(type)) {
      return gsoAddress;
    }
    return stripGsoSuffix(gsoAddress);
  }

  if (dashIndex < 0 && normalized.length > type.length) {
    return normalized.slice(type.length);
  }

  if (PREFIX_STRIPPED_ADDRESS_TYPES.has(type) && normalized.length > type.length) {
    return normalized.slice(type.length);
  }

  return normalized;
};

const stripGsoSuffix = (value: string) => value.replace(/-(T|H)$/i, "");

export const normalizeImportedGsoSerial = (rawSerial: string) => {
  const serial = normalizeSerial(rawSerial);
  const match = serial.match(/^([A-Z0-9]+)-(.+)$/i);
  if (!match) return serial;

  const type = normalizeType(match[1]);
  const address = match[2].trim().toUpperCase();
  if (!isGsoType(type)) return serial;

  if (isDualGsoType(type)) {
    if (address.endsWith("-T") || address.endsWith("-H")) {
      return `${type}-${address}`;
    }
    return `${type}-${stripGsoSuffix(address)}-T`;
  }

  if (SINGLE_TEMPERATURE_GSO_TYPES.has(type)) {
    return `${type}-${stripGsoSuffix(address)}`;
  }

  return `${type}-${address}`;
};

export const expandRelatedGsoSerials = (serial: string) => {
  const normalized = normalizeSerial(serial);
  const match = normalized.match(/^(SOIH|SOEH)-(.+)$/i);
  if (!match) return [normalized];

  const type = normalizeType(match[1]);
  const address = stripGsoSuffix(match[2].trim().toUpperCase());
  return [`${type}-${address}-T`, `${type}-${address}-H`];
};

export const buildSensorSerialsFromInput = (rawType: string, rawSerieNum: string) => {
  const type = normalizeType(rawType);
  const serie = normalizeSerial(rawSerieNum);

  if (!isGsoType(type)) {
    return {
      type,
      isGso: false,
      serials: [`${type}${serie}`],
    };
  }

  let address = serie;
  const prefixedSerie = `${type}-`;
  if (serie.startsWith(prefixedSerie)) {
    address = serie.slice(prefixedSerie.length);
  }
  address = address.replace(/^-+/, "").replace(/-+$/, "");

  if (isDualGsoType(type)) {
    const baseAddress = stripGsoSuffix(address);
    return {
      type,
      isGso: true,
      serials: [`${type}-${baseAddress}-T`, `${type}-${baseAddress}-H`],
    };
  }

  if (SINGLE_TEMPERATURE_GSO_TYPES.has(type)) {
    return {
      type,
      isGso: true,
      serials: [`${type}-${stripGsoSuffix(address)}`],
    };
  }

  return {
    type,
    isGso: true,
    serials: [`${type}-${address}`],
  };
};


export const extractTypeCodeFromSerial = (serial: string, knownTypeCodes?: Iterable<string> | null) => {
  const normalized = normalizeSerial(serial);
  const dashIndex = normalized.indexOf("-");
  if (dashIndex > 0) return normalizeType(normalized.slice(0, dashIndex));

  const knownCodes = normalizeKnownTypeCodes(knownTypeCodes);
  const matchedKnownCode = knownCodes.find((code) => normalized.startsWith(code));
  if (matchedKnownCode) return matchedKnownCode;

  const alphaPrefix = normalized.match(/^[A-Z]+/)?.[0];
  if (alphaPrefix) return normalizeType(alphaPrefix);

  return normalizeType(normalized);
};

export const getSensorFamilyFromTypeCode = (rawType: string | null | undefined) => {
  if (!rawType) return "CLASSIC" as const;
  const type = normalizeType(rawType);
  if (type === "GSP" || GSP_SENSOR_TYPE_CODE_SET.has(type)) return "GSP" as const;
  return getKnownSensorFamilyFromTypeCode(type);
};

export const getSensorFamilyFromSerial = (serial: string | null | undefined) => {
  if (!serial) return "CLASSIC" as const;
  return getSensorFamilyFromTypeCode(extractTypeCodeFromSerial(serial));
};
