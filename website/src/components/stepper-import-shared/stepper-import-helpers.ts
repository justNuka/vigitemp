import type { UploadItem } from "@/components/file-upload-shared"
import { decodeXmlArrayBuffer } from "@/lib/xml-decoding"
import type { ValidationResult, ValidationStatus } from "./stepper-import-types"

export function buildNameCounts(items: UploadItem[]) {
  const counts = new Map<string, number>()
  for (const item of items) {
    counts.set(item.name, (counts.get(item.name) ?? 0) + 1)
  }
  return counts
}

export function filterFilesByUploadNames(files: File[], counts: Map<string, number>) {
  const remaining = new Map(counts)
  const next: File[] = []
  for (const file of files) {
    const count = remaining.get(file.name) ?? 0
    if (count > 0) {
      next.push(file)
      remaining.set(file.name, count - 1)
    }
  }
  return next
}

export function filterValidationByUploadNames(results: ValidationResult[], counts: Map<string, number>) {
  const remaining = new Map(counts)
  const next: ValidationResult[] = []
  for (const result of results) {
    const count = remaining.get(result.file.name) ?? 0
    if (count > 0) {
      next.push(result)
      remaining.set(result.file.name, count - 1)
    }
  }
  return next
}

export function decodeXmlContent(buffer: ArrayBuffer) {
  const decoded = decodeXmlArrayBuffer(buffer)
  return {
    text: decoded.text,
    encoding: decoded.detectedEncoding,
    corrected: decoded.corrected,
  }
}


export function validateXml(
  xmlText: string,
  validateRootTag: (rootTag: string) => boolean,
  invalidRootError: string | undefined,
  invalidXmlMessage: string,
  invalidRootMessage: string,
) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(xmlText, "application/xml")
  const hasError = doc.getElementsByTagName("parsererror").length > 0
  if (hasError) return { ok: false, errors: [invalidXmlMessage] }

  const rawRootTag = doc.documentElement?.tagName?.toUpperCase() ?? ""
  const rootTag = rawRootTag.includes(":") ? (rawRootTag.split(":").pop() ?? "") : rawRootTag
  if (!validateRootTag(rootTag)) {
    return { ok: false, errors: [invalidRootError ?? invalidRootMessage] }
  }

  return { ok: true, errors: [] }
}

export function buildValidationResult(file: File, status: ValidationStatus, errors: string[], encoding: string, xmlText: string): ValidationResult {
  return { file, status, errors, encoding, xmlText }
}
