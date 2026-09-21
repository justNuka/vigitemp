type ExcelCell = string | number | boolean | Date | null | undefined

type PresentationRow = {
  label: ExcelCell
  value: ExcelCell
}

type StyledExcelExportOptions = {
  fileName: string
  title: string
  presentationSheetName: string
  dataSheetName: string
  presentationHeaders: [string, string]
  presentationRows: PresentationRow[]
  presentationImage?: {
    dataUrl: string
    title?: string
    width?: number
    height?: number
  } | null
  dataHeaders: string[]
  dataRows: ExcelCell[][]
}

const HEADER_COLOR = "FF101722"
const ACCENT_COLOR = "FF17A9E5"
const LIGHT_ACCENT_COLOR = "FFE8F7FD"

function safeSheetName(value: string, fallback: string) {
  const sanitized = value.replace(/[\\/*?:[\]]/g, " ").trim()
  return (sanitized || fallback).slice(0, 31)
}

async function loadLogoDataUrl() {
  try {
    const response = await fetch("/logos/Icone-VigiSensys.png", { cache: "force-cache" })
    if (!response.ok) return null

    const blob = await response.blob()
    return await new Promise<string | null>((resolve) => {
      const reader = new FileReader()
      reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : null)
      reader.onerror = () => resolve(null)
      reader.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}

function downloadWorkbook(buffer: ArrayBuffer, fileName: string) {
  const blob = new Blob([new Uint8Array(buffer)], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = fileName.toLowerCase().endsWith(".xlsx") ? fileName : `${fileName}.xlsx`
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

export async function exportStyledExcel(options: StyledExcelExportOptions) {
  const excelModule = await import("exceljs/dist/exceljs.min.js")
  const ExcelJS = excelModule.default
  const workbook = new ExcelJS.Workbook()
  workbook.creator = "VigiSensys"
  workbook.created = new Date()

  const presentationSheet = workbook.addWorksheet(
    safeSheetName(options.presentationSheetName, "Presentation"),
    { views: [{ showGridLines: false }] },
  )
  presentationSheet.columns = [{ width: 30 }, { width: 58 }]

  const logoDataUrl = await loadLogoDataUrl()
  if (logoDataUrl) {
    const logoId = workbook.addImage({ base64: logoDataUrl, extension: "png" })
    presentationSheet.addImage(logoId, {
      tl: { col: 0, row: 0 },
      ext: { width: 230, height: 65 },
    })
  }

  presentationSheet.mergeCells("A5:B5")
  const titleCell = presentationSheet.getCell("A5")
  titleCell.value = options.title
  titleCell.font = { bold: true, size: 18, color: { argb: HEADER_COLOR } }
  titleCell.alignment = { vertical: "middle" }
  presentationSheet.getRow(5).height = 28

  const presentationHeader = presentationSheet.addRow(options.presentationHeaders)
  presentationHeader.font = { bold: true, color: { argb: "FFFFFFFF" } }
  presentationHeader.fill = { type: "pattern", pattern: "solid", fgColor: { argb: HEADER_COLOR } }
  presentationHeader.alignment = { vertical: "middle" }
  presentationHeader.height = 22

  options.presentationRows.forEach((item, index) => {
    const row = presentationSheet.addRow([item.label ?? "", item.value ?? ""])
    row.getCell(1).font = { bold: true, color: { argb: HEADER_COLOR } }
    if (index % 2 === 0) {
      row.fill = { type: "pattern", pattern: "solid", fgColor: { argb: LIGHT_ACCENT_COLOR } }
    }
    row.alignment = { vertical: "top", wrapText: true }
  })

  if (options.presentationImage?.dataUrl) {
    presentationSheet.addRow([])
    const imageTitleRow = presentationSheet.addRow([])
    presentationSheet.mergeCells(`A${imageTitleRow.number}:B${imageTitleRow.number}`)
    const imageTitleCell = presentationSheet.getCell(`A${imageTitleRow.number}`)
    imageTitleCell.value = options.presentationImage.title ?? "Graphique"
    imageTitleCell.font = { bold: true, size: 13, color: { argb: HEADER_COLOR } }

    const imageId = workbook.addImage({
      base64: options.presentationImage.dataUrl,
      extension: "png",
    })
    const imageStartRow = imageTitleRow.number + 1
    const imageHeight = options.presentationImage.height ?? 420
    presentationSheet.addImage(imageId, {
      tl: { col: 0, row: imageStartRow - 1 },
      ext: {
        width: options.presentationImage.width ?? 900,
        height: imageHeight,
      },
    })

    const reservedRows = Math.max(18, Math.ceil(imageHeight / 20))
    for (let rowNumber = imageStartRow; rowNumber < imageStartRow + reservedRows; rowNumber += 1) {
      presentationSheet.getRow(rowNumber).height = 15
    }
  }

  const dataSheet = workbook.addWorksheet(safeSheetName(options.dataSheetName, "Donnees"), {
    views: [{ state: "frozen", ySplit: 1 }],
  })
  const dataHeader = dataSheet.addRow(options.dataHeaders)
  dataHeader.font = { bold: true, color: { argb: "FFFFFFFF" } }
  dataHeader.fill = { type: "pattern", pattern: "solid", fgColor: { argb: HEADER_COLOR } }
  dataHeader.alignment = { vertical: "middle", horizontal: "center", wrapText: true }
  dataHeader.height = 28

  options.dataRows.forEach((values, index) => {
    const row = dataSheet.addRow(values.map((value) => value ?? ""))
    if (index % 2 === 1) {
      row.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF4F7FA" } }
    }
    row.alignment = { vertical: "top", wrapText: true }
  })

  if (options.dataHeaders.length > 0) {
    dataSheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: Math.max(1, options.dataRows.length + 1), column: options.dataHeaders.length },
    }
  }
  dataSheet.columns = options.dataHeaders.map((header, columnIndex) => ({
    width: Math.min(
      48,
      Math.max(
        12,
        String(header).length + 2,
        ...options.dataRows
          .slice(0, 250)
          .map((row) => String(row[columnIndex] ?? "").length + 2),
      ),
    ),
  }))
  dataSheet.getRow(1).eachCell((cell) => {
    cell.border = { bottom: { style: "medium", color: { argb: ACCENT_COLOR } } }
  })

  const buffer = await workbook.xlsx.writeBuffer()
  downloadWorkbook(buffer as ArrayBuffer, options.fileName)
}
