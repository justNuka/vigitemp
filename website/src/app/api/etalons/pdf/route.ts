import { NextRequest } from "next/server"

import { apiError, apiOk } from "@/lib/api-response"
import { withStandardOrExpertAnyAuthorizationLogging } from "@/lib/license-guards"
import { getPermissionAliases } from "@/lib/permissions"
import { prisma } from "@/lib/prisma"

const ETALON_WRITE_CODES = getPermissionAliases("METROLOGY_OPERATION_ACCESS")

export const POST = withStandardOrExpertAnyAuthorizationLogging(ETALON_WRITE_CODES, async (req: NextRequest) => {
  try {
    const formData = await req.formData()
    const file = formData.get("file")

    if (!(file instanceof File)) {
      return apiError(400, "missing_file", "Aucun fichier PDF fourni")
    }

    if (file.type !== "application/pdf") {
      return apiError(400, "invalid_file_type", "Le fichier doit etre un PDF")
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const pdf = await prisma.t_pdf.create({
      data: {
        Nom_PDF: file.name.slice(0, 50),
        Contenu_PDF: buffer,
      },
      select: {
        Id_PDF: true,
        Nom_PDF: true,
      },
    })

    return apiOk({
      id: pdf.Id_PDF,
      name: pdf.Nom_PDF,
    }, { status: 201 })
  } catch (error) {
    return apiError(500, "etalon_pdf_upload_failed", "Erreur lors de l'enregistrement du PDF")
  }
})
