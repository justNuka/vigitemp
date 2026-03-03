import type { UploadItem } from "@/components/file-upload-shared"
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
  const utf8Decoder = new TextDecoder("utf-8", { fatal: false })
  let utf8Text = utf8Decoder.decode(buffer)
  let corrected = false

  const declaredEncodingMatch = utf8Text.match(/encoding="([^"]+)"/i)
  const declaredEncoding = declaredEncodingMatch?.[1] ?? null

  const replacementChar = String.fromCharCode(0xfffd)
  const mojibakeE = String.fromCharCode(0x00ef, 0x00bf, 0x00bd)
  const mojibakeDeg = String.fromCharCode(0x00c2, 0x00b0)
  const uppercaseE = String.fromCharCode(0x00c9)
  const degree = String.fromCharCode(0x00b0)

  const fixTagContent = (tagName: string, fixer: (value: string) => string) => {
    const pattern = new RegExp(`<${tagName}>([\s\S]*?)</${tagName}>`, "gi")
    utf8Text = utf8Text.replace(pattern, (_match, content) => {
      const next = fixer(content)
      if (next !== content) corrected = true
      return `<${tagName}>${next}</${tagName}>`
    })
  }

  fixTagContent("OPERATEUR", (value) => value.replaceAll(replacementChar, uppercaseE).replaceAll(mojibakeE, uppercaseE))
  fixTagContent("UNITE", (value) => value.replaceAll(replacementChar, degree).replaceAll(mojibakeDeg, degree))

  return { text: utf8Text, encoding: declaredEncoding ?? "utf-8", corrected }
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
