import fs from "node:fs"
import path from "node:path"

import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"

import { formatDbDateTime } from "@/lib/date-display"
import { formatNumber } from "@/lib/number-display"
import { prisma } from "@/lib/prisma"

export type CalibrationReportMeasure = {
  order: number
  sensorValue: number | null
  standardValue: number | null
}

export type CalibrationReportInput = {
  calibrationId: number
  calibratedAt: Date | string | null
  sensorSerial: string | null
  operator: string | null
  unit: string | null
  standardSerial: string | null
  standardOrganization: string | null
  standardCertificateNumber: string | null
  standardCertificateDate: Date | string | null
  uncertainty: string | number | null
  meanStandard: number | null
  meanSensor: number | null
  accuracyError: number | null
  standardDeviation: string | number | null
  measures: CalibrationReportMeasure[]
}

function readPublicLogo(fileName: string) {
  const candidates = [
    path.join(process.cwd(), "public", "logos", fileName),
    path.join(process.cwd(), ".next", "standalone", "public", "logos", fileName),
  ]
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return `data:image/png;base64,${fs.readFileSync(candidate).toString("base64")}`
  }
  return null
}

function readPublicFont(fileName: string) {
  const candidates = [
    path.join(process.cwd(), "public", "fonts", "poppins", fileName),
    path.join(process.cwd(), ".next", "standalone", "public", "fonts", "poppins", fileName),
  ]
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return fs.readFileSync(candidate).toString("base64")
  }
  return null
}

function asNumber(value: string | number | null | undefined) {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (value == null || value === "") return null
  const parsed = Number(String(value).replace(",", "."))
  return Number.isFinite(parsed) ? parsed : null
}

function displayNumber(value: string | number | null | undefined, decimals = 6) {
  return formatNumber(asNumber(value), {
    locale: "fr-FR",
    minimumDecimals: 0,
    maximumDecimals: decimals,
    fallback: "-",
  })
}

function drawLabelValue(doc: jsPDF, font: string, label: string, value: string, x: number, y: number, offset = 42) {
  doc.setFont(font, "bold")
  doc.setTextColor(55, 65, 81)
  doc.text(label, x, y)
  doc.setFont(font, "normal")
  doc.setTextColor(15, 23, 42)
  doc.text(value || "-", x + offset, y)
}

export async function loadCalibrationReportInputs(ids: number[]) {
  const uniqueIds = Array.from(new Set(ids.filter((id) => Number.isInteger(id) && id > 0)))
  if (uniqueIds.length === 0) return []

  const [calibrations, measures] = await Promise.all([
    prisma.t_etalonnage.findMany({
      where: { Id_Etalonnage: { in: uniqueIds } },
      select: {
        Id_Etalonnage: true,
        Date_Heure_Etalonnage: true,
        Sonde_Numero_Serie: true,
        Operateur: true,
        Etalon_Numero_Serie: true,
        Date_Certif: true,
        Organisme: true,
        Num_Certif: true,
        Unite: true,
        Incertitude: true,
        Moyenne_Etalon: true,
        Moyenne_Sonde: true,
        Repetabilite: true,
        Err_Justesse: true,
      },
    }),
    prisma.t_etalonnage_mesure.findMany({
      where: { Id_Etalonnage: { in: uniqueIds } },
      orderBy: [{ Id_Etalonnage: "asc" }, { Numero_Ordre: "asc" }],
      select: {
        Id_Etalonnage: true,
        Numero_Ordre: true,
        Mesure_Sonde: true,
        Mesure_Etalon: true,
      },
    }),
  ])

  const measuresByCalibration = new Map<number, CalibrationReportMeasure[]>()
  for (const measure of measures) {
    const list = measuresByCalibration.get(measure.Id_Etalonnage) ?? []
    list.push({
      order: measure.Numero_Ordre,
      sensorValue: measure.Mesure_Sonde,
      standardValue: measure.Mesure_Etalon,
    })
    measuresByCalibration.set(measure.Id_Etalonnage, list)
  }

  const calibrationById = new Map(calibrations.map((row) => [row.Id_Etalonnage, row]))
  return uniqueIds.flatMap((id): CalibrationReportInput[] => {
    const row = calibrationById.get(id)
    if (!row) return []
    return [{
      calibrationId: row.Id_Etalonnage,
      calibratedAt: row.Date_Heure_Etalonnage,
      sensorSerial: row.Sonde_Numero_Serie,
      operator: row.Operateur,
      unit: row.Unite,
      standardSerial: row.Etalon_Numero_Serie,
      standardOrganization: row.Organisme,
      standardCertificateNumber: row.Num_Certif,
      standardCertificateDate: row.Date_Certif,
      uncertainty: row.Incertitude,
      meanStandard: row.Moyenne_Etalon,
      meanSensor: row.Moyenne_Sonde,
      accuracyError: row.Err_Justesse,
      standardDeviation: row.Repetabilite,
      measures: measuresByCalibration.get(row.Id_Etalonnage) ?? [],
    }]
  })
}

export function buildCalibrationReportPdf(input: CalibrationReportInput) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
  const regularFont = readPublicFont("Poppins-Regular.ttf")
  const boldFont = readPublicFont("Poppins-Bold.ttf")
  const font = regularFont && boldFont ? "Poppins" : "helvetica"
  if (regularFont && boldFont) {
    doc.addFileToVFS("Poppins-Regular.ttf", regularFont)
    doc.addFont("Poppins-Regular.ttf", "Poppins", "normal")
    doc.addFileToVFS("Poppins-Bold.ttf", boldFont)
    doc.addFont("Poppins-Bold.ttf", "Poppins", "bold")
  }

  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 18
  const contentWidth = pageWidth - margin * 2
  const timeZone = process.env.VIGISENSYS_EMAIL_TIMEZONE || process.env.VIGITEMP_EMAIL_TIMEZONE || "Europe/Paris"
  const editionDate = formatDbDateTime(new Date(), { format: "date", locale: "fr-FR", timeZone })
  const calibrationDate = formatDbDateTime(input.calibratedAt, { format: "dateTimeSeconds", locale: "fr-FR", timeZone })
  const certificateDate = formatDbDateTime(input.standardCertificateDate, { format: "date", locale: "fr-FR", timeZone })
  const reportNumber = `ET-${String(input.calibrationId).padStart(8, "0")}`

  doc.setFillColor(15, 23, 42)
  doc.roundedRect(margin, 15, contentWidth, 23, 3, 3, "F")
  doc.setTextColor(255, 255, 255)
  doc.setFont(font, "bold")
  doc.setFontSize(16)
  doc.text(`Rapport d'étalonnage ${reportNumber}`, margin + 7, 27)
  doc.setFontSize(8)
  doc.setFont(font, "normal")
  doc.text("Date d'édition", pageWidth - margin - 35, 23)
  doc.setFont(font, "bold")
  doc.text(editionDate, pageWidth - margin - 35, 29)

  doc.setFillColor(236, 253, 245)
  doc.setDrawColor(16, 185, 129)
  doc.roundedRect(margin, 44, contentWidth, 17, 2, 2, "FD")
  doc.setTextColor(4, 120, 87)
  doc.setFont(font, "bold")
  doc.setFontSize(9)
  doc.text("SONDE", margin + 6, 54.5)
  doc.setTextColor(15, 23, 42)
  doc.setFontSize(13)
  doc.text(input.sensorSerial || "-", margin + 33, 54.5)

  doc.setFontSize(9)
  drawLabelValue(doc, font, "Date et heure :", calibrationDate, margin, 73)
  drawLabelValue(doc, font, "Opérateur :", input.operator || "-", margin, 81)
  drawLabelValue(doc, font, "Unité :", input.unit || "-", margin, 89)

  autoTable(doc, {
    startY: 100,
    margin: { left: margin, right: margin },
    theme: "grid",
    head: [["Résultat", "Valeur"]],
    body: [
      ["Moyenne étalon", displayNumber(input.meanStandard)],
      ["Moyenne sonde", displayNumber(input.meanSensor)],
      ["Erreur de justesse", displayNumber(input.accuracyError)],
      ["Écart-type / répétabilité", displayNumber(input.standardDeviation)],
      ["Incertitude", displayNumber(input.uncertainty)],
    ],
    styles: { font, fontSize: 8, cellPadding: 2.1 },
    headStyles: { fillColor: [6, 78, 59], textColor: 255, fontStyle: "bold" },
  })

  const resultEnd = (doc as jsPDF & { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?? 132
  autoTable(doc, {
    startY: resultEnd + 8,
    margin: { left: margin, right: margin },
    theme: "grid",
    head: [["Mesure", "Étalon", "Sonde", "Écart sonde - étalon"]],
    body: input.measures.map((measure) => [
      String(measure.order),
      displayNumber(measure.standardValue),
      displayNumber(measure.sensorValue),
      measure.sensorValue != null && measure.standardValue != null
        ? displayNumber(measure.sensorValue - measure.standardValue)
        : "-",
    ]),
    styles: { font, fontSize: 7.5, cellPadding: 1.8, halign: "right" },
    headStyles: { fillColor: [51, 65, 85], textColor: 255, fontStyle: "bold", halign: "center" },
    columnStyles: { 0: { halign: "center", fontStyle: "bold" } },
  })

  let y = (doc as jsPDF & { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?? 205
  y += 9
  if (y > 236) {
    doc.addPage()
    y = 24
  }
  doc.setFillColor(51, 65, 85)
  doc.rect(margin, y, contentWidth, 8, "F")
  doc.setTextColor(255, 255, 255)
  doc.setFont(font, "bold")
  doc.setFontSize(9)
  doc.text("Étalon utilisé", margin + 4, y + 5.5)
  y += 14
  drawLabelValue(doc, font, "Numéro :", input.standardSerial || "-", margin, y, 30)
  y += 7
  drawLabelValue(doc, font, "Organisme :", input.standardOrganization || "-", margin, y, 30)
  y += 7
  drawLabelValue(doc, font, "Certificat n° :", input.standardCertificateNumber || "-", margin, y, 30)
  y += 7
  drawLabelValue(doc, font, "Date certificat :", certificateDate, margin, y, 30)

  const footerY = 270
  if (doc.internal.pageSize.getHeight() - y > 25) {
    const vigiLogo = readPublicLogo("Icone-VigiSensys-report.png")
    const mc2Logo = readPublicLogo("Icone-MC2.png")
    doc.setDrawColor(148, 163, 184)
    doc.roundedRect(margin, footerY, contentWidth, 14, 2, 2, "S")
    if (vigiLogo) doc.addImage(vigiLogo, "PNG", margin + 4, footerY + 2, 13, 10)
    doc.setFont(font, "bold")
    doc.setTextColor(15, 23, 42)
    doc.setFontSize(12)
    doc.text("VigiSensys", margin + 20, footerY + 9)
    if (mc2Logo) doc.addImage(mc2Logo, "PNG", pageWidth - margin - 30, footerY + 2.5, 25, 9)
    else doc.text("MC2", pageWidth - margin - 20, footerY + 9)
  }

  return Buffer.from(doc.output("arraybuffer"))
}

export function buildCalibrationReportFileName(serial: string | null | undefined, calibratedAt: Date | string | null | undefined) {
  const safeSerial = (serial || "sonde").replace(/[^a-zA-Z0-9_-]+/g, "_")
  const date = calibratedAt ? new Date(calibratedAt) : new Date()
  const safeDate = Number.isNaN(date.getTime())
    ? "date-inconnue"
    : `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`
  return `Rapport_etalonnage_${safeSerial}_${safeDate}.pdf`
}
