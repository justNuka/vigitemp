import { NextRequest } from "next/server"
import { withAuthLogging, type HandlerContext } from "@/lib/api-wrappers"
import { apiError, apiOk } from "@/lib/api-response"
import { getRequestContext } from "@/lib/api-logger"
import { sendEmail } from "@/lib/email"
import { log } from "@/lib/logger"
import { prisma } from "@/lib/prisma"
import {
  buildHardwarePdfFileName,
  getHardwareOrderCapabilities,
} from "@/lib/hardware-order"
import HardwareOrderRequestEmail from "../../../../../../emails/hardware-order-request"
import {
  buildHardwareOrderDocumentPayload,
  createHardwareOrderReference,
  hardwareOrderBodySchema,
} from "../_shared"

export const POST = withAuthLogging(async (req: NextRequest, ctx: HandlerContext) => {
  try {
    const body = await req.json()
    const parsed = hardwareOrderBodySchema.safeParse(body)
    if (!parsed.success) {
      return apiError(400, "validation_error", "Donnees de commande invalides", {
        issues: parsed.error.issues,
      })
    }

    const reference = createHardwareOrderReference(ctx.user.userId)
    const {
      documentInput,
      pdfBuffer,
      resolvedItems,
      requester,
      commercialEmail,
      mailtoUrl,
    } = await buildHardwareOrderDocumentPayload({
      userId: ctx.user.userId,
      items: parsed.data.items,
      comment: parsed.data.comment,
      customerId: parsed.data.customerId,
      reference,
    })

    const { smtpReady, emailLicenseSkipped } = await getHardwareOrderCapabilities()
    const modeTransmission = smtpReady ? "SMTP" : "MAILTO"
    const initialStatus = smtpReady ? "BROUILLON" : "PREPAREE"
    const pdfFileName = buildHardwarePdfFileName(
      documentInput.customerId,
      documentInput.createdAt,
    ).slice(0, 100)

    const persisted = await prisma.$transaction(async (tx) => {
      const pdf = await tx.t_pdf.create({
        data: {
          Nom_PDF: pdfFileName,
          Contenu_PDF: pdfBuffer,
        },
      })

      const order = await tx.t_commande_materiel.create({
        data: {
          Reference_Commande: reference,
          Id_Utilisateur: ctx.user.userId,
          Nom_Demandeur: requester.requesterName,
          Email_Demandeur: requester.requesterEmail || null,
          Statut_Commande: initialStatus,
          Mode_Transmission: modeTransmission,
          Email_Commercial: commercialEmail,
          Commentaire: parsed.data.comment?.trim() || null,
          Date_Creation: new Date(),
          Id_Pdf: pdf.Id_PDF,
        },
      })

      await tx.t_commande_materiel_ligne.createMany({
        data: resolvedItems.map((item) => ({
          Id_Commande_Materiel: order.Id_Commande_Materiel,
          Id_Materiel: item.materialId,
          Quantite: item.quantity,
          Ref_Commercial: item.refCommercial,
          Designation: item.designation,
          Descriptif: item.descriptif,
          Gamme: item.gamme,
          Type: item.type,
        })),
      })

      return { orderId: order.Id_Commande_Materiel, pdfId: pdf.Id_PDF }
    })

    const { ip } = getRequestContext(req)

    if (emailLicenseSkipped) {
      log.info("services/hardware/orders", "hardware_order_email_blocked_by_license", {
        orderId: persisted.orderId,
        reference,
        reason: emailLicenseSkipped,
      })
    }

    if (smtpReady) {
      const sendResult = await sendEmail({
        to: commercialEmail,
        subject: `Demande de devis materiel ${reference}`,
        audit: { kind: "hardware_order", context: reference },
        react: HardwareOrderRequestEmail({
          reference,
          requesterName: requester.requesterName,
          requesterEmail: requester.requesterEmail,
          comment: parsed.data.comment ?? null,
          items: resolvedItems.map((item) => ({
            designation: item.designation,
            refCommercial: item.refCommercial,
            gamme: item.gamme,
            type: item.type,
            quantity: item.quantity,
          })),
        }),
        attachments: [
          {
            filename: pdfFileName,
            content: pdfBuffer,
            contentType: "application/pdf",
          },
        ],
      })

      if (!sendResult.success) {
        await prisma.t_commande_materiel.update({
          where: { Id_Commande_Materiel: persisted.orderId },
          data: { Statut_Commande: "BROUILLON" },
        })

        log.error("services/hardware/orders", "hardware_order_email_failed", {
          orderId: persisted.orderId,
          reference,
          error: sendResult.error,
        })

        return apiOk(
          {
            orderId: persisted.orderId,
            reference,
            modeTransmission,
            emailStatus: "FAILED" as const,
            emailError:
              sendResult.error || "Erreur lors de l'envoi de la demande de devis",
            commercialEmail,
            mailtoUrl: null,
            pdfDownloadUrl: `/api/services/hardware/orders/${persisted.orderId}/pdf`,
          },
          { status: 200 },
        )
      }

      await prisma.t_commande_materiel.update({
        where: { Id_Commande_Materiel: persisted.orderId },
        data: {
          Statut_Commande: "ENVOYEE",
          Date_Envoi: new Date(),
        },
      })
    }

    log.data.create(
      "Demande de devis materiel",
      persisted.orderId,
      ctx.user.username,
      ctx.user.userId,
      ip,
      {
        reference,
        modeTransmission,
        articleCount: resolvedItems.length,
      },
    )

    return apiOk(
      {
        orderId: persisted.orderId,
        reference,
        modeTransmission,
        emailStatus: smtpReady ? ("SENT" as const) : ("PREPARED" as const),
        emailError: null,
        emailLicenseSkipped,
        commercialEmail,
        mailtoUrl: smtpReady ? null : mailtoUrl,
        pdfDownloadUrl: `/api/services/hardware/orders/${persisted.orderId}/pdf`,
      },
      { status: 201 },
    )
  } catch (error) {
    if (error instanceof Error && error.message === "hardware_not_found") {
      return apiError(400, "hardware_not_found", "Un article du catalogue est introuvable")
    }

    log.error("services/hardware/orders", "hardware_order_create_failed", { error })
    return apiError(500, "hardware_order_create_failed", "Erreur lors de la creation de la commande")
  }
})
