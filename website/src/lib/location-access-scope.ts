import { cache } from "react"

import { prisma } from "@/lib/prisma"

type WhereInput = Record<string, unknown>

export type UserLocationScope = {
  siteIds: number[]
  groupIds: number[]
  hasRestrictions: boolean
}

function uniq(ids: Array<number | null | undefined>) {
  return Array.from(new Set(ids.filter((id): id is number => typeof id === "number" && id > 0)))
}

export const getUserLocationScope = cache(async (userId: number): Promise<UserLocationScope> => {
  const [user, siteLinks, groupLinks] = await Promise.all([
    prisma.t_utilisateur.findUnique({
      where: { Id_Utilisateur: userId },
      select: { Id_Site: true },
    }),
    prisma.t_liaison_utilisateur_site.findMany({
      where: { Id_Utilisateur: userId },
      select: { Id_Site: true },
    }),
    prisma.t_liaison_utilisateur_groupe.findMany({
      where: { Id_Utilisateur: userId },
      select: { Id_Groupe: true },
    }),
  ])

  const siteIds = uniq([user?.Id_Site, ...siteLinks.map((s) => s.Id_Site)])
  const groupIds = uniq(groupLinks.map((g) => g.Id_Groupe))

  return {
    siteIds,
    groupIds,
    hasRestrictions: siteIds.length > 0 || groupIds.length > 0,
  }
})

export function buildLieuAccessFilter(scope: UserLocationScope): WhereInput | null {
  if (!scope.hasRestrictions) return null

  const or: WhereInput[] = []
  if (scope.siteIds.length > 0) {
    or.push({ Id_Site: { in: scope.siteIds } })
  }
  if (scope.groupIds.length > 0) {
    or.push({ t_lieu_groupe: { some: { Id_Groupe: { in: scope.groupIds } } } })
  }

  return or.length > 0 ? { OR: or } : null
}

export function buildAlarmAccessFilter(scope: UserLocationScope): WhereInput | null {
  const lieuAccess = buildLieuAccessFilter(scope)
  if (!lieuAccess) return null
  return { t_lieu: { is: lieuAccess } }
}

export function buildPlanningAuditAccessFilter(scope: UserLocationScope): WhereInput | null {
  const lieuAccess = buildLieuAccessFilter(scope)
  if (!lieuAccess) return null
  return { t_lieu: { is: lieuAccess } }
}

export function applyAccessFilter(baseWhere: WhereInput, accessFilter: WhereInput | null): WhereInput {
  if (!accessFilter) return baseWhere
  return { AND: [baseWhere, accessFilter] }
}


export async function getAccessibleLieuIds(userId: number): Promise<number[] | null> {
  const scope = await getUserLocationScope(userId)
  if (!scope.hasRestrictions) return null

  const where = applyAccessFilter({ Est_Archive: false }, buildLieuAccessFilter(scope))
  const lieux = await prisma.t_lieu.findMany({
    where,
    select: { Id_Lieu: true },
  })

  return lieux.map((lieu) => lieu.Id_Lieu)
}

export async function canUserAccessLieu(userId: number, idLieu: number): Promise<boolean> {
  const scope = await getUserLocationScope(userId)
  const access = buildLieuAccessFilter(scope)
  const where = applyAccessFilter({ Id_Lieu: idLieu, Est_Archive: false }, access)
  const count = await prisma.t_lieu.count({ where })
  return count > 0
}
