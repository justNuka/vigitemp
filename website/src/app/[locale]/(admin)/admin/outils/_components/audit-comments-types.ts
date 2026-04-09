export type AuditCode = {
  Code_Journal: string
  Commentaire: string | null
}

export type AuditComment = {
  id: number
  type: string
  text: string
}



export function sanitizeAuditCommentLabel(label: string | null | undefined): string {
  if (!label) return ""
  return label.replace(/%[12]/g, "").replace(/\s{2,}/g, " ").trim()
}
