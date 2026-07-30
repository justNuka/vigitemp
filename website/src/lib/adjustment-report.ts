import fs from "node:fs"
import path from "node:path"

import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"

import { formatDbDateTime } from "@/lib/date-display"

export type AdjustmentReportInput = {
  adjustmentId: number
  adjustedAt: Date | string | null
  sensorSerial: string | null
  sensorType: string | null
  operator: string | null
  displayDecimals: number | null
  unit: string | null
  standardSerial: string | null
  standardOrganization: string | null
  standardCertificateNumber: string | null
  standardCertificateDate: Date | string | null
  standardMeasure1: number | null
  standardMeasure2: number | null
  previousMeasure1: number | null
  previousMeasure2: number | null
  correctedMeasure1: number | null
  correctedMeasure2: number | null
  rawValue1: number | null
  rawValue2: number | null
  coeffX2: number | null
  coeffX: number | null
  coeffConstant: number | null
}

function formatNumber(value: number | null, decimals = 6) {
  if (value == null || !Number.isFinite(value)) return "-"
  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: Math.max(0, decimals),
  }).format(value)
}

function formatMeasure(value: number | null, decimals: number | null) {
  return formatNumber(value, Math.min(Math.max(decimals ?? 2, 0), 12))
}

function readPublicLogo(fileName: string) {
  const candidates = [
    path.join(process.cwd(), "public", "logos", fileName),
    path.join(process.cwd(), ".next", "standalone", "public", "logos", fileName),
  ]

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return `data:image/png;base64,${fs.readFileSync(candidate).toString("base64")}`
    }
  }

  return null
}

function readPublicFont(fileName: string) {
  const candidates = [
    path.join(process.cwd(), "public", "fonts", "poppins", fileName),
    path.join(process.cwd(), ".next", "standalone", "public", "fonts", "poppins", fileName),
  ]

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return fs.readFileSync(candidate).toString("base64")
    }
  }

  return null
}

function drawLabelValue(
  doc: jsPDF,
  fontFamily: string,
  label: string,
  value: string,
  x: number,
  y: number,
  width: number,
) {
  doc.setFont(fontFamily, "bold")
  doc.setTextColor(55, 65, 81)
  doc.text(label, x, y)
  doc.setFont(fontFamily, "normal")
  doc.setTextColor(15, 23, 42)
  doc.text(value || "-", x + width, y)
}

export function buildAdjustmentReportPdf(input: AdjustmentReportInput) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
  const regularFont = readPublicFont("Poppins-Regular.ttf")
  const boldFont = readPublicFont("Poppins-Bold.ttf")
  const fontFamily = regularFont && boldFont ? "Poppins" : "helvetica"
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
  const editionDate = formatDbDateTime(new Date(), {
    dateOnly: true,
    locale: "fr-FR",
    timeZone,
  })
  const adjustmentDate = formatDbDateTime(input.adjustedAt, {
    locale: "fr-FR",
    timeZone,
  })
  const certificateDate = formatDbDateTime(input.standardCertificateDate, {
    dateOnly: true,
    locale: "fr-FR",
    timeZone,
  })
  const reportNumber = `AJ-${String(input.adjustmentId).padStart(8, "0")}`

  doc.setFillColor(15, 23, 42)
  doc.roundedRect(margin, 15, contentWidth, 23, 3, 3, "F")
  doc.setTextColor(255, 255, 255)
  doc.setFont(fontFamily, "bold")
  doc.setFontSize(16)
  doc.text(`Rapport d'ajustage ${reportNumber}`, margin + 7, 27)
  doc.setFontSize(8)
  doc.setFont(fontFamily, "normal")
  doc.text("Date d'édition", pageWidth - margin - 35, 23)
  doc.setFont(fontFamily, "bold")
  doc.text(editionDate, pageWidth - margin - 35, 29)

  doc.setFillColor(235, 246, 252)
  doc.setDrawColor(14, 165, 233)
  doc.roundedRect(margin, 44, contentWidth, 17, 2, 2, "FD")
  doc.setTextColor(3, 105, 161)
  doc.setFont(fontFamily, "bold")
  doc.setFontSize(9)
  doc.text("SONDE", margin + 6, 54.5)
  doc.setTextColor(15, 23, 42)
  doc.setFontSize(13)
  doc.text(input.sensorSerial || "-", margin + 33, 54.5)

  doc.setFontSize(9)
  drawLabelValue(doc, fontFamily, "Date et heure de l'ajustage :", adjustmentDate, margin, 73, 48)
  drawLabelValue(doc, fontFamily, "Opérateur :", input.operator || "-", margin, 81, 48)
  drawLabelValue(doc, fontFamily, "Nature de la sonde :", input.sensorType || "-", margin, 89, 48)
  drawLabelValue(doc, fontFamily, "Décimale(s) :", input.displayDecimals == null ? "-" : String(input.displayDecimals), margin, 97, 48)
  drawLabelValue(doc, fontFamily, "Unité de mesure :", input.unit || "-", margin + 92, 97, 38)

  autoTable(doc, {
    startY: 108,
    margin: { left: margin, right: margin },
    theme: "grid",
    head: [["", "Valeur étalon", "Valeur avant ajustage", "Valeur après ajustage", "Point numérique"]],
    body: [
      [
        "Premier point",
        formatMeasure(input.standardMeasure1, input.displayDecimals),
        formatMeasure(input.previousMeasure1, input.displayDecimals),
        formatMeasure(input.correctedMeasure1, input.displayDecimals),
        formatMeasure(input.rawValue1, input.displayDecimals),
      ],
      [
        "Deuxieme point",
        formatMeasure(input.standardMeasure2, input.displayDecimals),
        formatMeasure(input.previousMeasure2, input.displayDecimals),
        formatMeasure(input.correctedMeasure2, input.displayDecimals),
        formatMeasure(input.rawValue2, input.displayDecimals),
      ],
    ],
    styles: { font: fontFamily, fontSize: 8, cellPadding: 2.2, halign: "right" },
    headStyles: { fillColor: [51, 65, 85], textColor: 255, fontStyle: "bold", halign: "center" },
    columnStyles: { 0: { fillColor: [51, 65, 85], textColor: 255, fontStyle: "bold", halign: "left" } },
  })

  const tableEnd =
    (doc as jsPDF & { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?? 133
  let y = tableEnd + 11

  doc.setFillColor(51, 65, 85)
  doc.rect(margin, y, contentWidth, 8, "F")
  doc.setTextColor(255, 255, 255)
  doc.setFont(fontFamily, "bold")
  doc.setFontSize(9)
  doc.text("Coefficients de l'ajustage", margin + 4, y + 5.5)
  y += 14

  const hasQuadraticCoefficient = Math.abs(input.coeffX2 ?? 0) > Number.EPSILON
  doc.setTextColor(15, 23, 42)
  doc.setFont(fontFamily, "normal")
  doc.setFontSize(8)
  doc.text(
    hasQuadraticCoefficient
      ? "Coefficients utilisés selon la formule Y = A x X2 + B x X + C"
      : "Coefficients utilisés selon la formule Y = A x X + B",
    margin,
    y,
  )
  y += 7
  if (hasQuadraticCoefficient) {
    drawLabelValue(doc, fontFamily, "Coefficient A :", formatNumber(input.coeffX2, 12), margin, y, 27)
    drawLabelValue(doc, fontFamily, "Coefficient B :", formatNumber(input.coeffX, 12), margin + 63, y, 27)
    drawLabelValue(doc, fontFamily, "Coefficient C :", formatNumber(input.coeffConstant, 12), margin + 126, y, 27)
  } else {
    drawLabelValue(doc, fontFamily, "Coefficient A :", formatNumber(input.coeffX, 12), margin, y, 27)
    drawLabelValue(doc, fontFamily, "Coefficient B :", formatNumber(input.coeffConstant, 12), margin + 87, y, 27)
  }
  y += 12

  doc.setFillColor(51, 65, 85)
  doc.rect(margin, y, contentWidth, 8, "F")
  doc.setTextColor(255, 255, 255)
  doc.setFont(fontFamily, "bold")
  doc.text("Étalon utilisé", margin + 4, y + 5.5)
  y += 14
  drawLabelValue(doc, fontFamily, "Numéro :", input.standardSerial || "-", margin, y, 30)
  y += 7
  drawLabelValue(doc, fontFamily, "Organisme :", input.standardOrganization || "-", margin, y, 30)
  y += 7
  drawLabelValue(doc, fontFamily, "Certificat n° :", input.standardCertificateNumber || "-", margin, y, 30)
  y += 7
  drawLabelValue(doc, fontFamily, "Date :", certificateDate, margin, y, 30)
  y += 18

  doc.setFont(fontFamily, "bold")
  doc.setTextColor(15, 23, 42)
  doc.text("Le responsable métrologie :", margin, y)
  doc.setDrawColor(51, 65, 85)
  doc.line(margin + 55, y + 1, pageWidth - margin, y + 1)

  const vigiLogo = readPublicLogo("Icone-VigiSensys-report.png")
  const mc2Logo = readPublicLogo("Icone-MC2.png")
  const footerY = 270
  doc.setDrawColor(148, 163, 184)
  doc.roundedRect(margin, footerY, contentWidth, 14, 2, 2, "S")
  if (vigiLogo) {
    doc.addImage(vigiLogo, "PNG", margin + 4, footerY + 2, 13, 10)
  }
  doc.setFont(fontFamily, "bold")
  doc.setTextColor(15, 23, 42)
  doc.setFontSize(12)
  doc.text("VigiSensys", margin + 20, footerY + 9)
  if (mc2Logo) {
    doc.addImage(mc2Logo, "PNG", pageWidth - margin - 30, footerY + 2.5, 25, 9)
  } else {
    doc.text("MC2", pageWidth - margin - 20, footerY + 9)
  }

  return Buffer.from(doc.output("arraybuffer"))
}

export function buildAdjustmentReportFileName(
  serial: string | null | undefined,
  adjustedAt: Date | string | null | undefined,
) {
  const safeSerial = (serial || "sonde").replace(/[^a-zA-Z0-9_-]+/g, "_")
  const date = adjustedAt ? new Date(adjustedAt) : new Date()
  const safeDate = Number.isNaN(date.getTime())
    ? "date-inconnue"
    : `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`
  return `Rapport_ajustage_${safeSerial}_${safeDate}.pdf`
}
