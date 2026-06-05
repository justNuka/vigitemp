import { NextRequest, NextResponse } from "next/server"

import { apiError } from "@/lib/api-response"
import { withStandardOrExpertAnyAuthorizationLogging } from "@/lib/license-guards"
import { getPermissionAliases } from "@/lib/permissions"
import { prisma } from "@/lib/prisma"

const ETALON_READ_CODES = getPermissionAliases("METROLOGY_ACCESS")

export const GET = withStandardOrExpertAnyAuthorizationLogging(
  ETALON_READ_CODES,
  async (_req: NextRequest, _ctx, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const resolvedParams = await params
      const etalonId = Number.parseInt(resolvedParams.id, 10)

      if (Number.isNaN(etalonId)) {
        return apiError(400, "invalid_id", "ID invalide")
      }

      const etalon = await prisma.t_etalon.findUnique({
        where: { Id_Etalon: etalonId },
        select: { Etalon_Numero_Serie: true },
      })

      if (!etalon?.Etalon_Numero_Serie) {
        return apiError(404, "not_found", "Etalon introuvable")
      }

      const certif = await prisma.t_certif.findFirst({
        where: {
          Etalon_Numero_Serie: etalon.Etalon_Numero_Serie,
          Id_PDF: { not: null },
        },
        orderBy: [{ Date: "desc" }, { Id_Certif: "desc" }],
        select: { Id_PDF: true },
      })

      if (!certif?.Id_PDF) {
        return apiError(404, "not_found", "Aucun PDF associe a cet etalon")
      }

      const pdf = await prisma.t_pdf.findUnique({
        where: { Id_PDF: certif.Id_PDF },
        select: { Nom_PDF: true, Contenu_PDF: true },
      })

      if (!pdf?.Contenu_PDF) {
        return apiError(404, "not_found", "Aucun PDF associe a cet etalon")
      }

      return new NextResponse(Buffer.from(pdf.Contenu_PDF), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `inline; filename="${pdf.Nom_PDF || `etalon-${etalonId}.pdf`}"`,
          "Cache-Control": "private, max-age=60",
        },
      })
    } catch (error) {
      return apiError(500, "etalon_pdf_fetch_failed", "Erreur lors du chargement du PDF")
    }
  },
)
