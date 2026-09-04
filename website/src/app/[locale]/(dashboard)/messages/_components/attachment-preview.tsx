"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { Download, FileSpreadsheet, FileText, FileType2, ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatNumber } from "@/lib/number-display"
import type { Attachment } from "./_types"

type Props = {
  attachment: Attachment
  isOwn: boolean
  previewUrl?: string
}

type SpreadsheetPreview = {
  headers: string[]
  rows: string[][]
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${formatNumber(bytes / 1024, { decimals: 1, locale: "en-US", grouping: false })} KB`
  return `${formatNumber(bytes / (1024 * 1024), { decimals: 1, locale: "en-US", grouping: false })} MB`
}

function getExtension(fileName: string): string {
  const extension = fileName.split(".").pop()
  return extension ? extension.toLowerCase() : ""
}

function parseCsvLine(line: string): string[] {
  const cells: string[] = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i]
    const next = line[i + 1]

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"'
        i += 1
      } else {
        inQuotes = !inQuotes
      }
      continue
    }

    if (char === "," && !inQuotes) {
      cells.push(current.trim())
      current = ""
      continue
    }

    current += char
  }

  cells.push(current.trim())
  return cells
}

function buildCsvPreview(text: string): SpreadsheetPreview | null {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 9)

  if (lines.length === 0) return null

  const rows = lines.map(parseCsvLine)
  const headers = rows[0]
  const body = rows.slice(1).map((row) => {
    if (row.length >= headers.length) return row.slice(0, headers.length)
    return [...row, ...Array.from({ length: headers.length - row.length }, () => "")]
  })

  return {
    headers,
    rows: body,
  }
}

function buildTextPreview(text: string): string {
  return text.trim().slice(0, 1200)
}

function buildSpreadsheetPreview(matrix: unknown[][]): SpreadsheetPreview | null {
  const rows = matrix
    .slice(0, 9)
    .map((row) => row.map((cell) => (cell == null ? "" : String(cell))))

  if (rows.length === 0) return null

  const columnCount = Math.max(...rows.map((row) => row.length), 0)
  if (columnCount === 0) return null

  const normalized = rows.map((row) => {
    if (row.length >= columnCount) return row.slice(0, columnCount)
    return [...row, ...Array.from({ length: columnCount - row.length }, () => "")]
  })

  const firstRow = normalized[0]
  const hasHeaderContent = firstRow.some((cell) => cell.length > 0)

  return {
    headers: hasHeaderContent ? firstRow : Array.from({ length: columnCount }, (_, index) => `Col ${index + 1}`),
    rows: hasHeaderContent ? normalized.slice(1) : normalized,
  }
}

function PreviewTable({
  preview,
  className,
}: {
  preview: SpreadsheetPreview
  className?: string
}) {
  return (
    <div className={cn("overflow-hidden rounded-md border border-border/50 bg-background", className)}>
      <div className="max-h-56 overflow-auto">
        <table className="w-full border-collapse text-left text-[11px]">
          <thead className="sticky top-0 bg-muted/70 backdrop-blur-sm">
            <tr>
              {preview.headers.map((header, index) => (
                <th key={`${header}-${index}`} className="border-b border-border/50 px-2 py-1.5 font-medium">
                  {header || `Col ${index + 1}`}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {preview.rows.length > 0 ? (
              preview.rows.map((row, rowIndex) => (
                <tr key={`row-${rowIndex}`} className="odd:bg-muted/20">
                  {row.map((cell, cellIndex) => (
                    <td key={`cell-${rowIndex}-${cellIndex}`} className="border-b border-border/30 px-2 py-1.5 align-top">
                      <span className="line-clamp-2 break-all">{cell || "\u2014"}</span>
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={preview.headers.length} className="px-2 py-3 text-center text-muted-foreground">
                  \u2014
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

async function downloadFile(apiUrl: string, blobPreviewUrl: string | undefined, fileName: string) {
  // If we already have a blob URL (pending upload preview), use it directly
  if (blobPreviewUrl?.startsWith("blob:")) {
    const a = document.createElement("a")
    a.href = blobPreviewUrl
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    return
  }
  // Otherwise fetch from API and create an ephemeral blob URL
  const res = await fetch(apiUrl, { credentials: "same-origin" })
  if (!res.ok) return
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

async function openInNewTab(apiUrl: string, blobPreviewUrl: string | undefined) {
  if (blobPreviewUrl?.startsWith("blob:")) {
    window.open(blobPreviewUrl, "_blank", "noopener,noreferrer")
    return
  }
  const res = await fetch(apiUrl, { credentials: "same-origin" })
  if (!res.ok) return
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const tab = window.open(url, "_blank", "noopener,noreferrer")
  // Revoke after a short delay — enough time for the browser to load the blob
  if (tab) {
    setTimeout(() => URL.revokeObjectURL(url), 10_000)
  } else {
    URL.revokeObjectURL(url)
  }
}

export function AttachmentPreview({ attachment, isOwn, previewUrl }: Props) {
  const t = useTranslations("messaging.thread")
  const mimeType = attachment.mimeType.toLowerCase()
  const extension = getExtension(attachment.fileName)

  const isImage = mimeType.startsWith("image/")
  const isPdf = mimeType === "application/pdf"
  const isCsv = mimeType === "text/csv" || extension === "csv"
  const isText = mimeType === "text/plain" || extension === "txt"
  const isSpreadsheet =
    mimeType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    mimeType === "application/vnd.ms-excel" ||
    extension === "xlsx" ||
    extension === "xls"
  const isWord =
    mimeType === "application/msword" ||
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    extension === "doc" ||
    extension === "docx"

  const downloadUrl = `/api/chat/attachments/${attachment.id}`
  const sourceUrl = previewUrl ?? downloadUrl

  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(previewUrl ?? null)
  const [textPreview, setTextPreview] = useState<string | null>(null)
  const [spreadsheetPreview, setSpreadsheetPreview] = useState<SpreadsheetPreview | null>(null)

  useEffect(() => {
    setPdfPreviewUrl(previewUrl ?? null)
    setTextPreview(null)
    setSpreadsheetPreview(null)

    if (!(isPdf || isCsv || isText || isSpreadsheet)) return

    let cancelled = false
    let objectUrl: string | null = null

    void fetch(sourceUrl, { credentials: previewUrl ? "omit" : "same-origin" })
      .then(async (response) => {
        if (!response.ok) throw new Error("preview_fetch_failed")

        if (isPdf) {
          const blob = await response.blob()
          objectUrl = URL.createObjectURL(blob)
          if (!cancelled) setPdfPreviewUrl(objectUrl)
          return
        }

        if (isCsv || isText) {
          const text = await response.text()
          if (cancelled) return
          if (isCsv) {
            setSpreadsheetPreview(buildCsvPreview(text))
          } else {
            setTextPreview(buildTextPreview(text))
          }
          return
        }

        if (isSpreadsheet) {
          const buffer = await response.arrayBuffer()
          const XLSX = await import("xlsx")
          const workbook = XLSX.read(buffer, { type: "array" })
          const firstSheetName = workbook.SheetNames[0]
          const worksheet = firstSheetName ? workbook.Sheets[firstSheetName] : null
          const matrix = worksheet ? (XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as unknown[][]) : []
          if (!cancelled) {
            setSpreadsheetPreview(buildSpreadsheetPreview(matrix))
          }
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPdfPreviewUrl(null)
          setTextPreview(null)
          setSpreadsheetPreview(null)
        }
      })

    return () => {
      cancelled = true
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [isPdf, isCsv, isText, isSpreadsheet, previewUrl, sourceUrl])

  const containerClassName = cn(
    "overflow-hidden rounded-xl border transition-colors",
    isOwn
      ? "border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground"
      : "border-border/60 bg-muted/40 text-foreground",
  )

  if (isImage) {
    return (
      <button
        type="button"
        onClick={() => void openInNewTab(downloadUrl, previewUrl)}
        className="block cursor-zoom-in"
        aria-label={attachment.fileName}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={sourceUrl}
          alt={attachment.fileName}
          className="max-w-60 max-h-50 rounded-lg border border-border/40 object-cover transition-opacity hover:opacity-90"
        />
      </button>
    )
  }

  if (isPdf) {
    return (
      <div className={cn("max-w-72", containerClassName)}>
        <button
          type="button"
          onClick={() => void openInNewTab(downloadUrl, previewUrl)}
          className="flex w-full cursor-pointer items-center gap-2 border-b px-3 py-2 text-xs hover:opacity-80"
        >
          <FileText className="h-4 w-4 shrink-0" />
          <span className="flex-1 truncate font-medium text-left">{attachment.fileName}</span>
          <span className="shrink-0 text-[10px] opacity-70">{formatSize(attachment.size)}</span>
          <Download className="h-3.5 w-3.5 shrink-0 opacity-70" />
        </button>
        <div className="bg-background/70 p-2">
          {pdfPreviewUrl ? (
            <iframe
              src={pdfPreviewUrl}
              title={attachment.fileName}
              className="h-52 w-full rounded-md border border-border/50 bg-background"
            />
          ) : (
            <div className="flex h-52 items-center justify-center rounded-md border border-border/50 bg-background px-4 text-center text-xs text-muted-foreground">
              {t("pdf_preview_unavailable")}
            </div>
          )}
        </div>
      </div>
    )
  }

  if (isCsv || isSpreadsheet) {
    return (
      <div className={cn("max-w-104", containerClassName)}>
        <button
          type="button"
          onClick={() => void downloadFile(downloadUrl, previewUrl, attachment.fileName)}
          className="flex w-full cursor-pointer items-center gap-2 border-b px-3 py-2 text-xs hover:opacity-80"
        >
          <FileSpreadsheet className="h-4 w-4 shrink-0" />
          <span className="flex-1 truncate font-medium text-left">{attachment.fileName}</span>
          <span className="shrink-0 text-[10px] opacity-70">{formatSize(attachment.size)}</span>
          <Download className="h-3.5 w-3.5 shrink-0 opacity-70" />
        </button>
        <div className="bg-background/70 p-2">
          {spreadsheetPreview ? (
            <PreviewTable preview={spreadsheetPreview} />
          ) : (
            <div className="flex h-52 items-center justify-center rounded-md border border-border/50 bg-background px-4 text-center text-xs text-muted-foreground">
              {t("spreadsheet_preview_unavailable")}
            </div>
          )}
        </div>
      </div>
    )
  }

  if (isText) {
    return (
      <div className={cn("max-w-104", containerClassName)}>
        <button
          type="button"
          onClick={() => void downloadFile(downloadUrl, previewUrl, attachment.fileName)}
          className="flex w-full cursor-pointer items-center gap-2 border-b px-3 py-2 text-xs hover:opacity-80"
        >
          <FileText className="h-4 w-4 shrink-0" />
          <span className="flex-1 truncate font-medium text-left">{attachment.fileName}</span>
          <span className="shrink-0 text-[10px] opacity-70">{formatSize(attachment.size)}</span>
          <Download className="h-3.5 w-3.5 shrink-0 opacity-70" />
        </button>
        <div className="bg-background/70 p-2">
          <div className="max-h-56 overflow-auto rounded-md border border-border/50 bg-background p-3">
            <pre className="whitespace-pre-wrap wrap-break-word text-[11px] text-foreground">
              {textPreview || t("text_preview_unavailable")}
            </pre>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border px-3 py-2 text-xs transition-colors hover:opacity-80",
        containerClassName,
      )}
    >
      <FileType2 className="h-4 w-4 shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="truncate font-medium">{attachment.fileName}</div>
        <div className="text-[10px] opacity-70">{mimeType}</div>
        {isWord && <div className="text-[10px] opacity-70">{t("office_preview_unavailable")}</div>}
      </div>
      <span className="shrink-0 text-[10px] opacity-60">{formatSize(attachment.size)}</span>
      <button
        type="button"
        onClick={() => void downloadFile(downloadUrl, previewUrl, attachment.fileName)}
        className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
        aria-label={t("download")}
      >
        <Download className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
