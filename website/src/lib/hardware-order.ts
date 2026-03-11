import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import { prisma } from "@/lib/prisma"
import { isEmailEnabled } from "@/lib/email"

export const HARDWARE_COMMERCIAL_EMAIL_FALLBACK = "contactsite@mc2lab.fr"
export const HARDWARE_COMMERCIAL_EMAIL_SECTION = "SERVICES"
export const HARDWARE_COMMERCIAL_EMAIL_KEY = "COMMERCIAL_CONTACT_EMAIL"

export type HardwareOrderItemInput = {
  materialId: number
  quantity: number
}

export type HardwareOrderMaterialSnapshot = {
  Id_Materiel: number
  Ref_Commercial: string
  Designation: string
  Descriptif: string
  Gamme: string
  Type: string
  Chemin_Image: string | null
}

export type HardwareOrderDocumentInput = {
  reference: string
  createdAt: Date
  requesterName: string
  requesterEmail: string
  commercialEmail: string
  comment?: string | null
  items: Array<{
    refCommercial: string
    designation: string
    descriptif: string
    gamme: string
    type: string
    rawGamme: string
    rawType: string
    isModule: boolean
    family: string
    kind: string
    quantity: number
  }>
}

function normalizeParamValue(value: string | null | undefined) {
  return value?.trim() || null
}

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(value)
}

export async function getHardwareCommercialEmail() {
  const setting = await prisma.t_parametre.findUnique({
    where: {
      Section_Mot_Cle: {
        Section: HARDWARE_COMMERCIAL_EMAIL_SECTION,
        Mot_Cle: HARDWARE_COMMERCIAL_EMAIL_KEY,
      },
    },
    select: { Valeur: true },
  })

  return normalizeParamValue(setting?.Valeur) ?? HARDWARE_COMMERCIAL_EMAIL_FALLBACK
}

export async function getHardwareOrderCapabilities() {
  const [commercialEmail, smtpReady] = await Promise.all([
    getHardwareCommercialEmail(),
    isEmailEnabled(),
  ])

  return {
    commercialEmail,
    smtpReady,
  }
}

export async function getHardwareCatalog() {
  const materials = await prisma.t_materiel.findMany({
    orderBy: [
      { Gamme: "asc" },
      { Type: "asc" },
      { Designation: "asc" },
      { Ref_Commercial: "asc" },
    ],
    select: {
      Id_Materiel: true,
      Ref_Commercial: true,
      Designation: true,
      Descriptif: true,
      Gamme: true,
      Type: true,
      Chemin_Image: true,
    },
  })

  return materials.map((item) => ({
    ...item,
    Ref_Commercial: item.Ref_Commercial ?? "",
    Designation: item.Designation ?? "",
    Descriptif: item.Descriptif ?? "",
    Gamme: item.Gamme ?? "",
    Type: item.Type ?? "",
    Chemin_Image: item.Chemin_Image ?? null,
  }))
}

export async function loadHardwareMaterials(materialIds: number[]) {
  if (materialIds.length === 0) return []

  const rows = await prisma.t_materiel.findMany({
    where: { Id_Materiel: { in: materialIds } },
    select: {
      Id_Materiel: true,
      Ref_Commercial: true,
      Designation: true,
      Descriptif: true,
      Gamme: true,
      Type: true,
      Chemin_Image: true,
    },
  })

  return rows.map((item) => ({
    ...item,
    Ref_Commercial: item.Ref_Commercial ?? "",
    Designation: item.Designation ?? "",
    Descriptif: item.Descriptif ?? "",
    Gamme: item.Gamme ?? "",
    Type: item.Type ?? "",
    Chemin_Image: item.Chemin_Image ?? null,
  }))
}

export function buildHardwareMailtoLink(input: {
  commercialEmail: string
  reference: string
  requesterName: string
  requesterEmail: string
  items: Array<{ designation: string; refCommercial: string; quantity: number }>
}) {
  const subject = `Demande de devis materiel ${input.reference}`
  const lines = [
    `Bonjour,`,
    ``,
    `Veuillez trouver ma demande de devis materiel ${input.reference}.`,
    `Demandeur : ${input.requesterName}`,
    `Email : ${input.requesterEmail}`,
    ``,
    `Articles :`,
    ...input.items.map(
      (item) => `- ${item.designation} (${item.refCommercial}) x ${item.quantity}`,
    ),
    ``,
    `Merci de traiter cette demande de devis.`,
  ]

  const search = new URLSearchParams({
    subject,
    body: lines.join("\n"),
  })

  return `mailto:${input.commercialEmail}?${search.toString()}`
}

export function generateHardwareOrderPdfBuffer(input: HardwareOrderDocumentInput) {
  const doc = new jsPDF({
    unit: "mm",
    format: "a4",
  })

  const mc2Blue: [number, number, number] = [25, 145, 201]
  const dark: [number, number, number] = [31, 41, 55]
  const muted: [number, number, number] = [99, 115, 129]

  doc.setFillColor(...mc2Blue)
  doc.rect(0, 0, 210, 22, "F")
  doc.setTextColor(255, 255, 255)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(18)
  doc.text("Demande de devis matériel MC2", 14, 14)

  doc.setTextColor(...dark)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(12)
  doc.text("Informations devis", 14, 32)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)
  doc.text(`Référence : ${input.reference}`, 14, 40)
  doc.text(`Date : ${formatDateTime(input.createdAt)}`, 14, 46)
  doc.text(`Demandeur : ${input.requesterName}`, 14, 52)
  doc.text(`Email demandeur : ${input.requesterEmail}`, 14, 58)
  doc.text(`Contact commercial : ${input.commercialEmail}`, 14, 64)

  if (input.comment?.trim()) {
    doc.setFont("helvetica", "bold")
    doc.text("Commentaire", 14, 74)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(...muted)
    const commentLines = doc.splitTextToSize(input.comment.trim(), 180)
    doc.text(commentLines, 14, 80)
    doc.setTextColor(...dark)
  }

  const commentHeight = input.comment?.trim()
    ? Math.max(doc.splitTextToSize(input.comment.trim(), 180).length * 4, 12)
    : 0

  autoTable(doc, {
    startY: 86 + commentHeight,
    head: [["Ref", "Désignation", "Gamme", "Famille", "Type", "Quantité"]],
    body: input.items.map((item) => [
      item.refCommercial,
      item.designation,
      item.gamme,
      item.family,
      item.type,
      String(item.quantity),
    ]),
    theme: "grid",
    headStyles: {
      fillColor: mc2Blue,
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    styles: {
      fontSize: 9,
      cellPadding: 2.5,
      textColor: dark,
      lineColor: [226, 232, 240],
      lineWidth: 0.1,
    },
    bodyStyles: {
      valign: "top",
    },
    columnStyles: {
      0: { cellWidth: 28 },
      1: { cellWidth: 60 },
      2: { cellWidth: 22 },
      3: { cellWidth: 24 },
      4: { cellWidth: 24 },
      5: { halign: "center", cellWidth: 20 },
    },
  })

  const finalY = (doc as jsPDF & { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?? 110
  doc.setFont("helvetica", "bold")
  doc.setFontSize(11)
  doc.text("Descriptif par gamme et famille", 14, finalY + 10)

  let cursorY = finalY + 18
  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  const typeOrder: Record<string, number> = {
    RADIO: 1,
    ETALON: 2,
    ETHERNET: 3,
    FILAIRE: 4,
  }
  const groupedItems = Object.values(
    input.items.reduce<
      Record<
        string,
        {
          gamme: string
          rawGamme: string
          modules: typeof input.items
          sensors: typeof input.items
          byType: Record<
            string,
            {
              label: string
              modules: typeof input.items
              sensors: typeof input.items
            }
          >
        }
      >
    >((acc, item) => {
      const gammeKey = item.rawGamme || item.gamme
      if (!acc[gammeKey]) {
        acc[gammeKey] = {
          gamme: item.gamme,
          rawGamme: item.rawGamme,
          modules: [],
          sensors: [],
          byType: {},
        }
      }

      const gammeGroup = acc[gammeKey]
      if (gammeKey === "GSO") {
        if (item.isModule) gammeGroup.modules.push(item)
        else gammeGroup.sensors.push(item)
        return acc
      }

      const typeKey = item.rawType || "AUTRES"
      if (!gammeGroup.byType[typeKey]) {
        gammeGroup.byType[typeKey] = {
          label: item.type,
          modules: [],
          sensors: [],
        }
      }

      if (item.isModule) gammeGroup.byType[typeKey].modules.push(item)
      else gammeGroup.byType[typeKey].sensors.push(item)

      return acc
    }, {}),
  ).map((group) => ({
    ...group,
    typeGroups: Object.entries(group.byType)
      .sort((a, b) => (typeOrder[a[0]] ?? 99) - (typeOrder[b[0]] ?? 99))
      .map(([key, value]) => ({ key, ...value })),
  }))

  const ensurePageRoom = (neededY = 270) => {
    if (cursorY > neededY) {
      doc.addPage()
      cursorY = 20
    }
  }

  groupedItems.forEach((group, groupIndex) => {
    ensurePageRoom(260)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(11)
    doc.text(group.gamme, 14, cursorY)
    cursorY += 7

    const renderSection = (label: string, items: typeof input.items, indent: number) => {
      if (items.length === 0) return
      ensurePageRoom(265)
      doc.setFont("helvetica", "bold")
      doc.setFontSize(indent === 18 ? 10 : 9)
      doc.text(label, indent, cursorY)
      cursorY += 6

      items.forEach((item) => {
        ensurePageRoom(270)
        doc.setFont("helvetica", "bold")
        doc.setFontSize(9)
        doc.text(`${item.designation} (${item.refCommercial}) x ${item.quantity}`, indent + 4, cursorY)
        doc.setFont("helvetica", "normal")
        doc.setTextColor(...muted)
        const details = doc.splitTextToSize(item.descriptif || "-", 170 - indent)
        doc.text(details, indent + 4, cursorY + 5)
        doc.setTextColor(...dark)
        cursorY += Math.max(details.length * 4 + 10, 16)
      })
    }

    if (group.rawGamme === "GSO") {
      renderSection("Modules", group.modules, 18)
      renderSection("Sondes", group.sensors, 18)
    } else {
      group.typeGroups.forEach((typeGroup) => {
        ensurePageRoom(265)
        doc.setFont("helvetica", "bold")
        doc.setFontSize(10)
        doc.text(typeGroup.label, 18, cursorY)
        cursorY += 6
        renderSection("Modules", typeGroup.modules, 22)
        renderSection("Sondes", typeGroup.sensors, 22)
      })
    }

    if (groupIndex < groupedItems.length - 1) {
      doc.setDrawColor(226, 232, 240)
      doc.line(14, cursorY - 3, 196, cursorY - 3)
      cursorY += 6
    }
  })

  return Buffer.from(doc.output("arraybuffer"))
}
