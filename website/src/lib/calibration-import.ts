import type { Prisma } from "@/generated/@prisma-db-main/client";

export type CalibrationMeasureData = {
  Numero_Ordre: number;
  Mesure_Sonde: number | null;
  Mesure_Etalon: number | null;
};

export type CalibrationImportSummary = {
  id?: number;
  file: string;
  sensor: string | null;
  date: Date | null;
  dateText: string | null;
  operator: string | null;
  dateValidity: Date | null;
  dateValidityText: string | null;
  uncertainty: string | null;
  unit: string | null;
};

export type ParsedCalibration = {
  data: Prisma.t_etalonnageCreateInput;
  measures: CalibrationMeasureData[];
  summary: CalibrationImportSummary;
  warnings: string[];
};

const TAG_SETS = {
  date: ["DATE_ETALONNAGE", "DATE_ETALONAGE", "DATE_CALIBRAGE"],
  time: ["HEURE_ETALONNAGE", "HEURE_ETALONAGE", "HEURE_CALIBRAGE"],
  dateValidity: ["DATE_VALIDITE", "DATE_VALIDITY"],
  sensor: ["NUM_SONDE", "SONDE_NUMERO_SERIE", "SONDE", "ADRESSE_SONDE"],
  block: ["ETALONNAGE_SONDE", "CALIBRAGE_SONDE", "AJUSTAGE_SONDE"],
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

const combineDateOnly = (parts: { year: number; month: number; day: number } | null) => {
  if (!parts) return null;
  return new Date(parts.year, parts.month - 1, parts.day, 0, 0, 0);
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

const formatDateText = (parts: { year: number; month: number; day: number } | null) => {
  if (!parts) return null;
  const yyyy = String(parts.year).padStart(4, "0");
  const mm = String(parts.month).padStart(2, "0");
  const dd = String(parts.day).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const parseMeasureSeries = (block: string | null): CalibrationMeasureData[] => {
  if (!block) return [];

  const measures: CalibrationMeasureData[] = [];
  for (let i = 1; i <= 10; i += 1) {
    const etalon = parseNumber(getTagValue(block, `MESURE_ETALON${i}`));
    const sonde = parseNumber(getTagValue(block, `MESURE_SONDE${i}`));

    if (etalon === null && sonde === null) continue;

    measures.push({
      Numero_Ordre: i,
      Mesure_Etalon: etalon,
      Mesure_Sonde: sonde,
    });
  }

  return measures;
};

export function parseCalibrationXml(xml: string, fileName = ""): ParsedCalibration {
  const warnings: string[] = [];

  const dateValue = getTagValueAny(xml, TAG_SETS.date);
  const timeValue = getTagValueAny(xml, TAG_SETS.time);
  const dateParts = parseDateParts(dateValue);
  const date = combineDateTime(dateParts, timeValue);
  const dateText = formatDateTimeText(dateParts, timeValue);

  const dateValidityValue = getTagValueAny(xml, TAG_SETS.dateValidity);
  const dateValidityParts = parseDateParts(dateValidityValue);
  const dateValidity = combineDateOnly(dateValidityParts);
  const dateValidityText = formatDateText(dateValidityParts);

  const operator = getTagValue(xml, "OPERATEUR");

  const etalonBlock = getTagBlock(xml, "ETALON");
  const etalonNumero = etalonBlock ? getTagValue(etalonBlock, "NUM_SERIE") : null;
  const organisme = etalonBlock ? getTagValue(etalonBlock, "ORGANISME") : null;
  const dateCertif = etalonBlock ? combineDateOnly(parseDateParts(getTagValue(etalonBlock, "DATE_CERTIFICAT"))) : null;
  const numCertif = etalonBlock ? getTagValue(etalonBlock, "NUM_CERTIFICAT") : null;
  const unit = etalonBlock ? getTagValue(etalonBlock, "UNITE") : getTagValue(xml, "UNITE");

  const calibrationBlock = getTagValueAny(xml, TAG_SETS.block);
  const uncertaintyRaw = (calibrationBlock ? getTagValue(calibrationBlock, "INCERTITUDE") : null) ?? (etalonBlock ? getTagValue(etalonBlock, "INCERTITUDE") : null) ?? getTagValue(xml, "INCERTITUDE");
  const uncertainty = parseNumber(uncertaintyRaw);
  const sensorNumber = calibrationBlock
    ? getTagValueAny(calibrationBlock, TAG_SETS.sensor)
    : getTagValueAny(xml, TAG_SETS.sensor);

  const moyenneEtalon = parseNumber(getTagValueAny(xml, ["MOYENNE_ETALON", "MOY_ETALON"]));
  const moyenneSonde = parseNumber(getTagValueAny(xml, ["MOYENNE_SONDE", "MOY_SONDE"]));
  const repetabilite = getTagValueAny(xml, ["REPETABILITE", "RPTBL"]);
  const errJustesse = parseNumber(getTagValueAny(xml, ["ERREUR_JUSTESSE", "ERR_JUSTESSE", "ERRJUSTESSE"]));
  const idMilieu = parseNumber(getTagValueAny(xml, ["ID_MILIEU", "ID_BAIN"]));
  const measures = parseMeasureSeries(calibrationBlock);

  if (!sensorNumber) warnings.push("missing_sensor");
  if (!date) warnings.push("missing_date");

  const data: Prisma.t_etalonnageCreateInput = {
    Date_Heure_Etalonnage: date,
    Sonde_Numero_Serie: sensorNumber,
    Date_Validite: dateValidity,
    Operateur: operator,
    Etalon_Numero_Serie: etalonNumero,
    Date_Certif: dateCertif,
    Organisme: organisme,
    Num_Certif: numCertif,
    Unite: unit,
    Incertitude: uncertainty,
    Moyenne_Etalon: moyenneEtalon,
    Moyenne_Sonde: moyenneSonde,
    Repetabilite: repetabilite,
    Err_Justesse: errJustesse,
    // Id_Milieu: idMilieu,
  };

  return {
    data,
    measures,
    summary: {
      file: fileName,
      sensor: sensorNumber,
      date,
      dateText,
      operator,
      dateValidity,
      dateValidityText,
      uncertainty: uncertaintyRaw,
      unit,
    },
    warnings,
  };
}



