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
export const isSingleTemperatureGsoType = (type: string) => SINGLE_TEMPERATURE_GSO_TYPES.has(normalizeType(type));

export const isGsoType = (type: string) => {
  const normalized = normalizeType(type);
  return normalized === "GSO" || GSO_SENSOR_TYPE_CODE_SET.has(normalized);
};

export const isGspType = (type: string) => {
  const normalized = normalizeType(type);
  return normalized === "GSP" || GSP_SENSOR_TYPE_CODE_SET.has(normalized);
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

const getGsoTypedParts = (value: string) => {
  const normalized = normalizeSerial(value);
  const match = normalized.match(/^(SOIT|SOIH|SOET|SOEH)-?(.+)$/i);
  if (!match) return null;
  return {
    typeCode: normalizeType(match[1]),
    address: match[2].trim().toUpperCase().replace(/^-+/, ""),
  };
};

const inferGsoTypedSerialFromFileName = (rawSerial: string, fileName: string) => {
  const serial = normalizeSerial(rawSerial);
  if (!fileName.trim()) return null;

  const escapedSerial = serial.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const escapedBase = stripGsoSuffix(serial).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const file = fileName.trim().toUpperCase();
  const match = file.match(
    new RegExp(
      `(?:^|[^A-Z0-9])(SOIT|SOIH|SOET|SOEH)-?(${escapedSerial}|${escapedBase}(?:-[TH])?)(?:$|[^A-Z0-9])`,
      "i",
    ),
  );

  return match ? `${normalizeType(match[1])}-${match[2].toUpperCase()}` : null;
};

const inferUntypedGsoTypeFromFileName = (rawSerial: string, fileName: string) => {
  const serial = normalizeSerial(rawSerial);
  const file = normalizeSerial(fileName);
  if (!serial || !file) return null;

  const escapedSerial = serial.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const fileContainsSerial = new RegExp(`(?:^|[^A-Z0-9])${escapedSerial}(?:$|[^A-Z0-9])`, "i").test(file);
  if (!fileContainsSerial) return null;

  const suffix = serial.match(/-(T|H)$/i)?.[1]?.toUpperCase();
  if (!suffix) return null;

  return suffix === "H" ? "SOIH" : "SOIT";
};

export type ImportedSensorIdentity = {
  serial: string;
  typeCode: string;
  isGso: boolean;
};

export type ImportedSensorStorageIdentity = {
  serial: string;
  address: string;
};

export const buildImportedSensorStorageIdentity = (
  identity: ImportedSensorIdentity,
  knownTypeCodes?: Iterable<string> | null,
): ImportedSensorStorageIdentity => {
  const typeCode = normalizeType(identity.typeCode);

  if (SINGLE_TEMPERATURE_GSO_TYPES.has(typeCode)) {
    const typedParts = getGsoTypedParts(identity.serial);
    const baseAddress = stripGsoSuffix((typedParts?.address ?? identity.serial).replace(/^-+/, ""));
    return {
      serial: `${typeCode}-${baseAddress}`,
      address: `${baseAddress}-T`,
    };
  }

  if (identity.isGso || isGsoType(typeCode)) {
    return {
      serial: identity.serial,
      address: identity.serial,
    };
  }

  return {
    serial: identity.serial,
    address: extractProbeAddressFromSerial(identity.serial, knownTypeCodes),
  };
};

export const resolveImportedSensorIdentity = (
  rawSerial: string,
  fileName = "",
  knownTypeCodes?: Iterable<string> | null,
): ImportedSensorIdentity => {
  const serial = normalizeSerial(rawSerial);
  const inferredTypedSerial =
    inferGsoTypedSerialFromFileName(serial, fileName) ??
    (() => {
      const inferredType = inferUntypedGsoTypeFromFileName(serial, fileName);
      return inferredType ? `${inferredType}-${serial}` : null;
    })();
  const gsoParts = getGsoTypedParts(serial) ?? getGsoTypedParts(inferredTypedSerial ?? "");

  if (gsoParts && isGsoType(gsoParts.typeCode)) {
    const address = gsoParts.address;
    if (isDualGsoType(gsoParts.typeCode)) {
      const suffix = address.match(/-(T|H)$/i)?.[1]?.toUpperCase() ?? "T";
      return {
        serial: `${stripGsoSuffix(address)}-${suffix}`,
        typeCode: gsoParts.typeCode,
        isGso: true,
      };
    }

    if (SINGLE_TEMPERATURE_GSO_TYPES.has(gsoParts.typeCode)) {
      return {
        serial: stripGsoSuffix(address),
        typeCode: gsoParts.typeCode,
        isGso: true,
      };
    }

    return {
      serial: address,
      typeCode: gsoParts.typeCode,
      isGso: true,
    };
  }

  const normalized = normalizeImportedGsoSerial(serial);
  return {
    serial: normalized,
    typeCode: extractTypeCodeFromSerial(normalized, knownTypeCodes),
    isGso: false,
  };
};

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
  if (!match) {
    const untypedDualMatch = normalized.match(/^(.+)-(T|H)$/i);
    if (!untypedDualMatch) return [normalized];
    const address = stripGsoSuffix(normalized);
    return [`${address}-T`, `${address}-H`];
  }

  const address = stripGsoSuffix(match[2].trim().toUpperCase());
  return [`${address}-T`, `${address}-H`];
};

export const buildMetrologyLookupSerials = (serial: string | null | undefined) => {
  if (!serial) return [];

  const normalized = normalizeSerial(serial);
  if (!normalized) return [];

  const variants = new Set<string>([normalized]);
  const gsoParts = getGsoTypedParts(normalized);

  if (gsoParts && isGsoType(gsoParts.typeCode)) {
    const address = gsoParts.address;
    const baseAddress = stripGsoSuffix(address);
    variants.add(address);
    variants.add(baseAddress);

    if (isDualGsoType(gsoParts.typeCode)) {
      const suffix = address.match(/-(T|H)$/i)?.[1]?.toUpperCase();
      if (suffix) {
        variants.add(`${baseAddress}-${suffix}`);
        variants.add(`${gsoParts.typeCode}-${baseAddress}-${suffix}`);
      } else {
        variants.add(`${baseAddress}-T`);
        variants.add(`${baseAddress}-H`);
      }
    } else if (SINGLE_TEMPERATURE_GSO_TYPES.has(gsoParts.typeCode)) {
      variants.add(`${gsoParts.typeCode}-${baseAddress}`);
    }
  } else {
    const untypedDualMatch = normalized.match(/^(.+)-(T|H)$/i);
    if (untypedDualMatch) {
      const baseAddress = stripGsoSuffix(normalized);
      const suffix = untypedDualMatch[2].toUpperCase();
      variants.add(baseAddress);
      for (const type of DUAL_GSO_TYPES) {
        variants.add(`${type}-${baseAddress}-${suffix}`);
      }
    } else if (/^\d+$/.test(normalized)) {
      for (const type of SINGLE_TEMPERATURE_GSO_TYPES) {
        variants.add(`${type}-${normalized}`);
      }
    }
  }

  return Array.from(variants);
};

export const buildSensorSerialsFromInput = (rawType: string, rawSerieNum: string) => {
  const type = normalizeType(rawType);
  const serie = normalizeSerial(rawSerieNum);

  if (isGspType(type)) {
    const prefixedSerie = `${type}-`;
    const compactPrefixedSerie = type;
    let address = serie;

    if (address.startsWith(prefixedSerie)) {
      address = address.slice(prefixedSerie.length);
    } else if (address.startsWith(compactPrefixedSerie) && address.length > compactPrefixedSerie.length) {
      address = address.slice(compactPrefixedSerie.length);
    }

    address = address.replace(/^-+/, "").replace(/-+$/, "");

    return {
      type,
      isGso: false,
      serials: [`${type}-${address}`],
    };
  }

  if (!isGsoType(type)) {
    return {
      type,
      isGso: false,
      serials: [`${type}${serie}`],
    };
  }

  let address = getGsoTypedParts(serie)?.address ?? serie;
  const prefixedSerie = `${type}-`;
  if (address.startsWith(prefixedSerie)) {
    address = address.slice(prefixedSerie.length);
  }
  address = address.replace(/^-+/, "").replace(/-+$/, "");

  if (isDualGsoType(type)) {
    const baseAddress = stripGsoSuffix(address);
    return {
      type,
      isGso: true,
      serials: [`${baseAddress}-T`, `${baseAddress}-H`],
    };
  }

  if (SINGLE_TEMPERATURE_GSO_TYPES.has(type)) {
    return {
      type,
      isGso: true,
      serials: [stripGsoSuffix(address)],
    };
  }

  return {
    type,
    isGso: true,
    serials: [address],
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
