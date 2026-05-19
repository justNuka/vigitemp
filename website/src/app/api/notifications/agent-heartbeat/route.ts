import { NextRequest } from "next/server"
import { z } from "zod"

import { getClientIp, withLogging } from "@/lib/api-logger"
import { apiError, apiOk } from "@/lib/api-response"
import { log } from "@/lib/logger"
import { prisma } from "@/lib/prisma"
import { getCompatEnv, getCompatHeader } from "@/lib/vigisensys-compat"

const heartbeatSchema = z.object({
  machineName: z.string().trim().min(1).max(255).optional(),
  ip: z.string().trim().min(1).max(64).optional(),
  userId: z.string().trim().min(1).max(64).optional(),
  username: z.string().trim().min(1).max(255).optional(),
})

function isAuthorized(req: NextRequest) {
  const secret = getCompatEnv("VIGISENSYS_AGENT_SECRET", "VIGITEMP_AGENT_SECRET")
  if (!secret) return false
  return getCompatHeader(req, "x-vigisensys-agent-secret", "x-vigitemp-agent-secret") === secret
}

export const POST = withLogging(async (req: NextRequest) => {
  if (!isAuthorized(req)) {
    log.warn("AGENT_HEARTBEAT", "Agent heartbeat rejected: invalid secret", {
      ip: getClientIp(req),
    })
    return apiError(401, "unauthorized", "Non autoris?")
  }

  const body = await req.json().catch(() => null)
  const validated = heartbeatSchema.safeParse(body)
  if (!validated.success) {
    return apiError(400, "invalid_payload", "Payload invalide", {
      details: validated.error.flatten(),
    })
  }

  const { machineName, ip, userId, username } = validated.data
  if (!machineName && !ip) {
    return apiError(400, "missing_target", "Machine ou IP manquante")
  }

  const now = new Date()
  const loginValue = username?.slice(0, 50)
  const nameValue = username?.slice(0, 50)

  let posteId: number

  if (machineName) {
    const row = await prisma.t_postes_clients.upsert({
      where: { Nom_Machine_Connexion: machineName },
      update: {
        Adresse_IP_Connexion: ip ?? undefined,
        Login: loginValue,
        Nom: nameValue,
        Date_Heure_Derniere_Connexion: now,
      },
      create: {
        Nom_Machine_Connexion: machineName,
        Adresse_IP_Connexion: ip ?? undefined,
        Login: loginValue,
        Nom: nameValue,
        Date_Heure_Derniere_Connexion: now,
      },
      select: { Id_Poste: true },
    })
    posteId = row.Id_Poste
  } else {
    const existing = await prisma.t_postes_clients.findFirst({
      where: { Adresse_IP_Connexion: ip },
      orderBy: { Date_Heure_Derniere_Connexion: "desc" },
      select: { Id_Poste: true },
    })

    if (existing) {
      const row = await prisma.t_postes_clients.update({
        where: { Id_Poste: existing.Id_Poste },
        data: {
          Login: loginValue,
          Nom: nameValue,
          Date_Heure_Derniere_Connexion: now,
        },
        select: { Id_Poste: true },
      })
      posteId = row.Id_Poste
    } else {
      const row = await prisma.t_postes_clients.create({
        data: {
          Adresse_IP_Connexion: ip,
          Login: loginValue,
          Nom: nameValue,
          Date_Heure_Derniere_Connexion: now,
        },
        select: { Id_Poste: true },
      })
      posteId = row.Id_Poste
    }
  }

  log.info("AGENT_HEARTBEAT", "Agent heartbeat received", {
    posteId,
    machineName: machineName ?? null,
    ip: ip ?? null,
    userId: userId ?? null,
    username: username ?? null,
  })

  return apiOk({ ok: true, posteId, receivedAt: now.toISOString() })
})
