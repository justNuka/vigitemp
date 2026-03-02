import { prisma } from "@/lib/prisma"

export type HotlineServerConfig = {
  serverHost?: string
  serverPort?: number
  teamviewerId?: string
  teamviewerLink?: string
}

const SECTION = "SECURITE_HOTLINE"

export async function getHotlineServerConfig(): Promise<HotlineServerConfig> {
  const params = await prisma.t_parametre.findMany({
    where: { Section: SECTION },
  })

  const config: HotlineServerConfig = {
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