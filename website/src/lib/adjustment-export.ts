import { extractProbeAddressFromSerial } from "@/lib/sensor-naming"

type AdjustmentExportInput = {
  adjustedAt: Date | string | null
  operator: string | null
  displayDecimals: number | null
  standardSerial: string | null
  standardOrganization: string | null
  standardCertificateDate: Date | string | null
  standardCertificateNumber: string | null
  standardUnit: string | null
  standardPort: string | null
  standardIsExternal: boolean
  standardUncertainty: number | null
  standardResolution: string | number | null
  standardDecimals: number | null
  sensorSerial: string | null
  sensorAddress: string | null
  standardMeasure1: number | null
  standardMeasure2: number | null
  sensorRawValue1: number | null
  sensorRawValue2: number | null
  coeffX: number | null
  coeffConstant: number | null
  correctedValue1: number | null
  correctedValue2: number | null
}

function toDate(value: Date | string | null | undefined) {
  if (!value) return null
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function pad(value: number, size = 2) {
  return String(value).padStart(size, "0")
}

function formatXmlDate(value: Date | string | null | undefined) {
  const date = toDate(value)
  if (!date) return ""
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`
}

function formatXmlTime(value: Date | string | null | undefined) {
  const date = toDate(value)
  if (!date) return ""
  return `${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}000`
}

function formatNumber(value: string | number | null | undefined, maxDecimals = 12) {
  if (value == null || value === "") return ""
  if (typeof value === "string") {
    const normalized = value.trim().replace(",", ".")
    if (!normalized) return ""
    const asNumber = Number(normalized)
    if (!Number.isFinite(asNumber)) {
      return normalized
    }
    return asNumber.toFixed(maxDecimals).replace(/\.?0+$/, "")
  }

  if (!Number.isFinite(value)) return ""
  return value.toFixed(maxDecimals).replace(/\.?0+$/, "")
}

function escapeXml(value: string | null | undefined) {
  if (!value) return ""
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

function xmlTag(tag: string, value: string | null | undefined) {
  if (!value) return `<${tag}/>`
  return `<${tag}>${escapeXml(value)}</${tag}>`
}

function normalizeUnit(value: string | null | undefined) {
  const unit = value?.trim() ?? ""
  return unit
    .replace(/\uFFFD\s*C/gi, "°C")
    .replace(/Â°\s*C/gi, "°C")
}

export function buildAdjustmentXml(input: AdjustmentExportInput) {
  const adjustedAt = toDate(input.adjustedAt) ?? new Date()
  const sensorSerial = (input.sensorSerial ?? "").trim()
  const sensorAddress = (input.sensorAddress ?? "").trim() || extractProbeAddressFromSerial(sensorSerial)

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    "<CALIBRAGE>",
    xmlTag("VERSION", "10.0"),
    xmlTag("DATE_CALIBRAGE", formatXmlDate(adjustedAt)),
    xmlTag("HEURE_CALIBRAGE", formatXmlTime(adjustedAt)),
    xmlTag("OPERATEUR", input.operator?.trim() || ""),
    xmlTag("NB_DECIMALE", input.displayDecimals == null ? "" : String(input.displayDecimals)),
    "<ETALON>",
    xmlTag("NUM_SERIE", input.standardSerial?.trim() || ""),
    xmlTag("ORGANISME", input.standardOrganization?.trim() || ""),
    xmlTag("DATE_CERTIFICAT", formatXmlDate(input.standardCertificateDate)),
    xmlTag("NUM_CERTIFICAT", input.standardCertificateNumber?.trim() || ""),
    xmlTag("UNITE", normalizeUnit(input.standardUnit)),
    xmlTag("PORT_SERIE", (input.standardPort?.trim() || "-1").toUpperCase()),
    xmlTag("SONDE_EXTERNE", input.standardIsExternal ? "1" : "0"),
    xmlTag("INCERTITUDE", formatNumber(input.standardUncertainty)),
    xmlTag("RESOLUTION", formatNumber(input.standardResolution)),
    xmlTag("NB_DECIMALE_ETALON", input.standardDecimals == null ? "" : String(input.standardDecimals)),
    "</ETALON>",
    "<CALIBRAGE_SONDE>",
    xmlTag("NUM_SONDE", sensorSerial),
    xmlTag("ADRESSE_SONDE", sensorAddress),
    xmlTag("MESURE_ETALON1", formatNumber(input.standardMeasure1)),
    "<MESURE_SONDE1/>",
    xmlTag("RESISTANCE_SONDE1", formatNumber(input.sensorRawValue1)),
    xmlTag("MESURE_ETALON2", formatNumber(input.standardMeasure2)),
    "<MESURE_SONDE2/>",
    xmlTag("RESISTANCE_SONDE2", formatNumber(input.sensorRawValue2)),
    xmlTag("COEFFX", formatNumber(input.coeffX)),
    xmlTag("COEFFCONSTANT", formatNumber(input.coeffConstant)),
    xmlTag("TEMPERATURELUE1", formatNumber(input.correctedValue1)),
    xmlTag("TEMPERATURELUE2", formatNumber(input.correctedValue2)),
    "</CALIBRAGE_SONDE>",
    "</CALIBRAGE>",
  ].join("")

  return Buffer.from(xml, "utf8")
}

export function buildAdjustmentExportFileName(serial: string | null | undefined, adjustedAt: Date | string | null | undefined) {
  const safeSerial = (serial ?? "sonde").trim() || "sonde"
  const date = toDate(adjustedAt) ?? new Date()
  const stamp = `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}${pad(date.getMilliseconds(), 3)}`
  return `Calibrage_${safeSerial}_${stamp}.xml`
}
