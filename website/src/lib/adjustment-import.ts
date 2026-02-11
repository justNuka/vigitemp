import type { Prisma } from "@/generated/@prisma-db-main/client";
import { normalizeImportedGsoSerial } from "@/lib/sensor-naming";

export type AdjustmentImportSummary = {
  id?: number;
  file: string;
  sensor: string | null;
  date: Date | null;
  dateText: string | null;
  operator: string | null;
  coeffX: number | null;
  coeffConstant: number | null;
  measureEtalon1: number | null;
  measureEtalon2: number | null;
  unit: string | null;
};

export type ParsedAdjustment = {
  data: Prisma.t_ajustageCreateInput;
  summary: AdjustmentImportSummary;
  warnings: string[];
};

const TAG_SETS = {
  date: ["DATE_AJUSTAGE", "DATE_CALIBRAGE"],
  time: ["HEURE_AJUSTAGE", "HEURE_CALIBRAGE"],
  calibrationBlock: ["AJUSTAGE_SONDE", "CALIBRAGE_SONDE"],
};

const trimText = (value: string | null | undefined) => {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const getTagBlock = (xml: string, tag: string) => {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i");
  const match = xml.match(regex);
  return match ? trimText(match[1]) : null;
};

const getTagValue = (xml: string, tag: string) => trimText(getTagBlock(xml, tag));

const getTagValueAny = (xml: string, tags: string[]) => {
  for (const tag of tags) {
    const value = getTagValue(xml, tag);
    if (value) return value;
  }
  return null;
};

const parseNumber = (value: string | null) => {
  if (!value) return null;
  const normalized = value.replace(/,/g, ".").replace(/\s+/g, "");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
};

const parseDateParts = (value: string | null) => {
  if (!value) return null;
  const digits = value.replace(/\D/g, "");
  if (digits.length < 8) return null;
  const year = Number(digits.slice(0, 4));
  const month = Number(digits.slice(4, 6));
  const day = Number(digits.slice(6, 8));
  if (!year || !month || !day) return null;
  return { year, month, day };
};

const parseTimeParts = (value: string | null) => {
  if (!value) return { hours: 0, minutes: 0, seconds: 0 };
  const digits = value.replace(/\D/g, "");
  if (digits.length < 6) return { hours: 0, minutes: 0, seconds: 0 };
  return {
    hours: Number(digits.slice(0, 2)),
    minutes: Number(digits.slice(2, 4)),
    seconds: Number(digits.slice(4, 6)),
  };
};

const combineDateTime = (parts: { year: number; month: number; day: number } | null, timeValue: string | null) => {
  if (!parts) return null;
  const { hours, minutes, seconds } = parseTimeParts(timeValue);
  return new Date(parts.year, parts.month - 1, parts.day, hours, minutes, seconds);
};

const formatDateTimeText = (parts: { year: number; month: number; day: number } | null, timeValue: string | null) => {
  if (!parts) return null;
  const { hours, minutes, seconds } = parseTimeParts(timeValue);
  const yyyy = String(parts.year).padStart(4, "0");
  const mm = String(parts.month).padStart(2, "0");
  const dd = String(parts.day).padStart(2, "0");
  const hh = String(hours).padStart(2, "0");
  const min = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
};

export function parseAdjustmentXml(xml: string, fileName = ""): ParsedAdjustment {
  const warnings: string[] = [];
  const dateValue = getTagValueAny(xml, TAG_SETS.date);
  const timeValue = getTagValueAny(xml, TAG_SETS.time);
  const dateParts = parseDateParts(dateValue);
  const date = combineDateTime(dateParts, timeValue);
  const dateText = formatDateTimeText(dateParts, timeValue);

  const operator = getTagValue(xml, "OPERATEUR");
  const decimals = parseNumber(getTagValue(xml, "NB_DECIMALE"));

  const etalonBlock = getTagBlock(xml, "ETALON");
  const etalonNumero = etalonBlock ? getTagValue(etalonBlock, "NUM_SERIE") : null;
  const etalonOrganisme = etalonBlock ? getTagValue(etalonBlock, "ORGANISME") : null;
  const etalonDateCertif = etalonBlock
    ? combineDateTime(parseDateParts(getTagValue(etalonBlock, "DATE_CERTIFICAT")), null)
    : null;
  const etalonNumeroCertif = etalonBlock ? getTagValue(etalonBlock, "NUM_CERTIFICAT") : null;
  const unit = etalonBlock ? getTagValue(etalonBlock, "UNITE") : getTagValue(xml, "UNITE");

  const calibrationBlock = getTagValueAny(xml, TAG_SETS.calibrationBlock);
  const sensorNumberRaw = calibrationBlock
    ? getTagValue(calibrationBlock, "NUM_SONDE") ?? getTagValue(calibrationBlock, "ADRESSE_SONDE")
    : null;
  const sensorNumber = sensorNumberRaw ? normalizeImportedGsoSerial(sensorNumberRaw) : null;

  const coeffX = parseNumber(getTagValueAny(xml, ["COEFFX", "COEFF_X"]));
  const coeffConstant = parseNumber(getTagValueAny(xml, ["COEFFCONSTANT", "COEFF_CONSTANT"]));

  const mesureEtalon1 = parseNumber(calibrationBlock ? getTagValue(calibrationBlock, "MESURE_ETALON1") : null);
  const mesureEtalon2 = parseNumber(calibrationBlock ? getTagValue(calibrationBlock, "MESURE_ETALON2") : null);

  const valeurBrute1 = parseNumber(
    calibrationBlock ? getTagValueAny(calibrationBlock, ["VALEUR_BRUT1", "RESISTANCE_SONDE1"]) : null,
  );
  const valeurBrute2 = parseNumber(
    calibrationBlock ? getTagValueAny(calibrationBlock, ["VALEUR_BRUT2", "RESISTANCE_SONDE2"]) : null,
  );

  const temperatureLue1 = parseNumber(calibrationBlock ? getTagValue(calibrationBlock, "TEMPERATURELUE1") : null);
  const temperatureLue2 = parseNumber(calibrationBlock ? getTagValue(calibrationBlock, "TEMPERATURELUE2") : null);

  if (!sensorNumber) warnings.push("missing_sensor");
  if (!date) warnings.push("missing_date");

  const data: Prisma.t_ajustageCreateInput = {
    Date_Heure_Ajustage: date,
    Sonde_Numero_Serie: sensorNumber,
    Coeff_X2: 0,
    Coeff_X: coeffX,
    Coeff_Constant: coeffConstant,
    Unite: unit,
    Nb_Decimale: decimals ?? null,
    Operateur: operator,
    SE_Numero: etalonNumero,
    SE_Organisme: etalonOrganisme,
    SE_Date_Certif: etalonDateCertif,
    SE_Numero_Certif: etalonNumeroCertif,
    Mesure_Etalon1: mesureEtalon1,
    Mesure_Etalon2: mesureEtalon2,
    Valeur_Brute1: valeurBrute1,
    Valeur_Brute2: valeurBrute2,
    Ancienne_Mesure1: null,
    Ancienne_Mesure2: null,
    Nouvelle_Mesure1: temperatureLue1,
    Nouvelle_Mesure2: temperatureLue2,
  };

  return {
    data,
    summary: {
      file: fileName,
      sensor: sensorNumber,
      date,
      dateText,
      operator,
      coeffX,
      coeffConstant,
      measureEtalon1: mesureEtalon1,
      measureEtalon2: mesureEtalon2,
      unit,
    },
    warnings,
  };
}
