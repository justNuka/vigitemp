import { prisma } from "@/lib/prisma"

export type HotlineConfig = {
  slug: string
  username: string
  passwordHash: string
  serverHost?: string
  serverPort?: number
  teamviewerId?: string
  teamviewerLink?: string
}

export type HotlinePublicConfig = {
  slug: string
  username: string
  teamviewerId?: string
  teamviewerLink?: string
}

const SECTION = "SECURITE_HOTLINE"

export async function getHotlineConfig(): Promise<HotlineConfig> {
  const params = await prisma.t_parametre.findMany({
    where: { Section: SECTION },
  })

  const config: HotlineConfig = {
    slug: process.env.HOTLINE_SLUG || "",
    username: process.env.HOTLINE_USER || "",
    passwordHash: process.env.HOTLINE_PASSWORD_HASH || "",
    serverHost: process.env.HOTLINE_SERVER_HOST || "",
    serverPort: process.env.HOTLINE_SERVER_PORT
      ? Number(process.env.HOTLINE_SERVER_PORT)
      : undefined,
    teamviewerId: process.env.HOTLINE_TEAMVIEWER_ID || "",
    teamviewerLink: process.env.HOTLINE_TEAMVIEWER_LINK || "",
  }

  if (config.serverPort !== undefined && !Number.isFinite(config.serverPort)) {
    config.serverPort = undefined
  }

  params.forEach((param) => {
    switch (param.Mot_Cle) {
      case "HOTLINE_SLUG":
        config.slug = param.Valeur || ""
        break
      case "HOTLINE_USER":
        config.username = param.Valeur || ""
        break
      case "HOTLINE_PASSWORD_HASH":
        config.passwordHash = param.Valeur || ""
        break
      case "HOTLINE_SERVER_HOST":
        config.serverHost = param.Valeur || ""
        break
      case "HOTLINE_SERVER_PORT":
        config.serverPort = param.Valeur ? Number(param.Valeur) : undefined
        if (config.serverPort !== undefined && !Number.isFinite(config.serverPort)) {
          config.serverPort = undefined
        }
        break
      case "HOTLINE_TEAMVIEWER_ID":
        config.teamviewerId = param.Valeur || ""
        break
      case "HOTLINE_TEAMVIEWER_LINK":
        config.teamviewerLink = param.Valeur || ""
        break
    }
  })

  return config
}

export async function getHotlinePublicConfig(): Promise<HotlinePublicConfig> {
  const config = await getHotlineConfig()
  return {
    slug: config.slug,
    username: config.username,
    teamviewerId: config.teamviewerId || "",
    teamviewerLink: config.teamviewerLink || "",
  }
}
