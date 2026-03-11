import { NextRequest, NextResponse } from "next/server"
import { withAuthLogging } from "@/lib/api-wrappers"
import { apiError } from "@/lib/api-response"
import { hardwareOrderBodySchema, buildHardwareOrderDocumentPayload } from "../_shared"
import { log } from "@/lib/logger"
import type { JWTPayload } from "@/lib/jwt"

export const POST = withAuthLogging(async (req: NextRequest, ctx: { user: JWTPayload }) => {
  try {
    const body = await req.json()
    const parsed = hardwareOrderBodySchema.safeParse(body)

    if (!parsed.success) {
      return apiError(400, "validation_error", "Donnees de commande invalides", {
        issues: parsed.error.issues,
      })
    }

    const reference = `PDF-${Date.now()}`
    const { pdfBuffer } = await buildHardwareOrderDocumentPayload({
      userId: ctx.user.userId,
      items: parsed.data.items,
      comment: parsed.data.comment,
      reference,
    })

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="commande-materiel-${reference}.pdf"`,
        "Content-Length": String(pdfBuffer.length),
        "Cache-Control": "private, no-store",
      },
    })
  } catch (error) {
    if (error instanceof Error && error.message === "hardware_not_found") {
      return apiError(400, "hardware_not_found", "Un article du catalogue est introuvable")
    }

    log.error("services/hardware/pdf", "pdf_generation_failed", { error })
    return apiError(500, "pdf_generation_failed", "Erreur lors de la generation du PDF")
  }
})
