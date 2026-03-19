import { z } from "zod"
import { prisma } from "@/lib/prisma"
import {
  type HardwareOrderDocumentInput,
  buildHardwareMailtoLink,
  generateHardwareOrderPdfBuffer,
  getHardwareCommercialEmail,
  loadHardwareMaterials,
} from "@/lib/hardware-order"

export const hardwareOrderBodySchema = z.object({
  items: z
    .array(
      z.object({
        materialId: z.number().int().positive(),
        quantity: z.number().int().min(1).max(999),
      }),
    )
    .min(1)
    .max(100),
  comment: z.string().max(4000).optional().nullable(),
  customerId: z.string().trim().max(100).optional().nullable(),
})

export function createHardwareOrderReference(userId: number) {
  const now = new Date()
  const pad = (value: number) => String(value).padStart(2, "0")
  return `CM-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(
    now.getHours(),
  )}${pad(now.getMinutes())}${pad(now.getSeconds())}-${userId}`
}

export async function getHardwareRequester(userId: number) {
  const user = await prisma.t_utilisateur.findUnique({
    where: { Id_Utilisateur: userId },
    select: {
      Login: true,
      Prenom: true,
      Nom: true,
      Adresse_Email: true,
    },
  })

  const requesterName =
    `${user?.Prenom ?? ""} ${user?.Nom ?? ""}`.trim() || user?.Login || `Utilisateur ${userId}`

  return {
    requesterName,
    requesterEmail: user?.Adresse_Email?.trim() || "",
  }
}

export async function buildHardwareOrderDocumentPayload(input: {
  userId: number
  items: Array<{ materialId: number; quantity: number }>
  comment?: string | null
  customerId?: string | null
  reference: string
}) {
  const uniqueMaterialIds = Array.from(new Set(input.items.map((item) => item.materialId)))
  const [materials, commercialEmail, requester] = await Promise.all([
    loadHardwareMaterials(uniqueMaterialIds),
    getHardwareCommercialEmail(),
    getHardwareRequester(input.userId),
  ])

  const materialMap = new Map(materials.map((material) => [material.Id_Materiel, material]))
  const resolvedItems = input.items.map((item) => {
    const material = materialMap.get(item.materialId)
    if (!material) {
      throw new Error("hardware_not_found")
    }

    return {
      materialId: material.Id_Materiel,
      quantity: item.quantity,
      refCommercial: material.Ref_Commercial,
      designation: material.Designation,
      descriptif: material.Descriptif,
      gamme: material.Gamme,
      type: material.Type,
      imagePath: material.Chemin_Image,
    }
  })

  const documentInput: HardwareOrderDocumentInput = {
    reference: input.reference,
    createdAt: new Date(),
    customerId: input.customerId?.trim() || "",
    requesterName: requester.requesterName,
    requesterEmail: requester.requesterEmail,
    commercialEmail,
    comment: input.comment ?? null,
    items: resolvedItems.map((item) => ({
      refCommercial: item.refCommercial,
      designation: item.designation,
      descriptif: item.descriptif,
      gamme: item.gamme,
      type: item.type,
      rawGamme: item.gamme,
      rawType: item.type,
      isModule: item.refCommercial.startsWith("M-"),
      family: item.refCommercial.startsWith("M-") ? "Modules" : item.type,
      kind: item.refCommercial.startsWith("M-") ? "Module" : "Sonde",
      quantity: item.quantity,
    })),
  }

  const pdfBuffer = generateHardwareOrderPdfBuffer(documentInput)
  const mailtoUrl = buildHardwareMailtoLink({
    commercialEmail,
    reference: input.reference,
    requesterName: requester.requesterName,
    requesterEmail: requester.requesterEmail,
    items: resolvedItems.map((item) => ({
      designation: item.designation,
      refCommercial: item.refCommercial,
      quantity: item.quantity,
    })),
  })

  return {
    commercialEmail,
    requester,
    resolvedItems,
    pdfBuffer,
    mailtoUrl,
    documentInput,
  }
}
