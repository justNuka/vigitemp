const DUAL_GSO_TYPES = new Set(["SOIH", "SOEH"]);

const normalizeType = (value: string) => value.trim().toUpperCase().replace(/-+$/g, "");
const normalizeSerial = (value: string) => value.trim().toUpperCase();

export const isDualGsoType = (type: string) => DUAL_GSO_TYPES.has(normalizeType(type));

export const isGsoType = (type: string) => {
  const normalized = normalizeType(type);
  return normalized.startsWith("GSO") || normalized.startsWith("SOI") || normalized.startsWith("SOE");
};

export const extractAddressFromSerial = (serial: string) => {
  const normalized = normalizeSerial(serial);
  const firstDash = normalized.indexOf("-");
  if (firstDash < 0) return normalized;
  return normalized.slice(firstDash + 1);
};

const stripGsoSuffix = (value: string) => value.replace(/-(T|H)$/i, "");

export const normalizeImportedGsoSerial = (rawSerial: string) => {
  const serial = normalizeSerial(rawSerial);
  const match = serial.match(/^(SOIH|SOEH)-(.+)$/i);
  if (!match) return serial;

  const type = normalizeType(match[1]);
  const address = match[2].trim().toUpperCase();
  if (address.endsWith("-T") || address.endsWith("-H")) {
    return `${type}-${address}`;
  }
  return `${type}-${address}-T`;
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
  const firstDash = serie.indexOf("-");
  if (firstDash >= 0) {
    address = serie.slice(firstDash + 1);
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

  return {
    type,
    isGso: true,
    serials: [`${type}-${address}`],
  };
};
