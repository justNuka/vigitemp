export type DateRangeValue = { from: Date; to?: Date }

export type AuditLog = {
  id: number
  timestamp: string | null
  code: string
  label: string
  commentaire: string | null
  commentaireUtilisateur: string | null
  user: string | null
  profile: string | null
  detailsSummary?: string | null
  lieuId: number
}

export type ZoomBounds = {
  xMin?: number
  xMax?: number
  yMin?: number
  yMax?: number
}
