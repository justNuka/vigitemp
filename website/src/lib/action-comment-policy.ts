import { prisma } from "@/lib/prisma"

const ACTION_COMMENT_REQUIRED_DEFAULT = false

function parseBooleanSetting(value: string | null | undefined): boolean | null {
  if (!value) return null
  const normalized = value.trim().toLowerCase()
  if (["1", "true", "yes", "on"].includes(normalized)) return true
  if (["0", "false", "no", "off"].includes(normalized)) return false
  return null
}

function getCaseCandidates(section: string, motCle: string) {
  const sectionLower = section.toLowerCase()
  const sectionUpper = section.toUpperCase()
  const motCleLower = motCle.toLowerCase()
  const motCleUpper = motCle.toUpperCase()

  return [
    { Section: section, Mot_Cle: motCle },
    { Section: sectionLower, Mot_Cle: motCleLower },
    { Section: sectionUpper, Mot_Cle: motCleUpper },
    { Section: sectionLower, Mot_Cle: motCleUpper },
    { Section: sectionUpper, Mot_Cle: motCleLower },
  ]
}

export async function isSurveillanceActionCommentRequired(): Promise<boolean> {
  try {
    const setting = await prisma.t_parametre.findFirst({
      where: {
        OR: getCaseCandidates("dashboard", "require_action_comment"),
      },
      select: { Valeur: true },
    })

    const parsed = parseBooleanSetting(setting?.Valeur)
    return parsed ?? ACTION_COMMENT_REQUIRED_DEFAULT
  } catch {
    return ACTION_COMMENT_REQUIRED_DEFAULT
  }
}