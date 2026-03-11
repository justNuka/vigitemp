import { NextRequest, NextResponse } from "next/server"
import { withAuthLogging, type HandlerContext } from "@/lib/api-wrappers"
import { apiError } from "@/lib/api-response"
import { prisma } from "@/lib/prisma"
import { log } from "@/lib/logger"

export const GET = withAuthLogging(
  async (
    _req: NextRequest,
    _ctx: HandlerContext,
    routeCtx: { params: Promise<{ id: string }> },
  ) => {
    try {
      const params = await routeCtx.params
      const orderId = Number(params.id)
      if (!Number.isFinite(orderId) || orderId <= 0) {
        return apiError(400, "invalid_id", "Commande invalide")
      }

      const order = await prisma.t_commande_materiel.findUnique({
        where: { Id_Commande_Materiel: orderId },
        select: {
          Id_Commande_Materiel: true,
          t_pdf: {
            select: {
              Nom_PDF: true,
              Contenu_PDF: true,
            },
          },
        },
      })

      if (!order?.t_pdf?.Contenu_PDF) {
        return apiError(404, "pdf_not_found", "PDF introuvable")
      }

      return new NextResponse(Buffer.from(order.t_pdf.Contenu_PDF), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${order.t_pdf.Nom_PDF || `commande-materiel-${order.Id_Commande_Materiel}.pdf`}"`,
          "Cache-Control": "private, no-store",
        },
      })
    } catch (error) {
      log.error("services/hardware/orders/pdf", "hardware_order_pdf_download_failed", { error })
      return apiError(500, "hardware_order_pdf_download_failed", "Erreur lors du telechargement du PDF")
    }
  },
)
