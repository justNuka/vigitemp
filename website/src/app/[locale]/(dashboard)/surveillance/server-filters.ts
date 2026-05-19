import { applyAccessFilter, buildLieuAccessFilter, getUserLocationScope } from "@/lib/location-access-scope"
import { getServerAuthenticatedUserId } from "@/lib/server-auth"
import { log } from "@/lib/logger"
import { unstable_noStore } from "next/cache"

export interface Site {
  id: number
  name: string
}

export interface Group {
  id: number
  name: string
  category?: string
  siteIds: number[]
}

export async function ServerFilterOptions() {
  unstable_noStore()
  const { prisma } = await import("@/lib/prisma")

  try {
    const userId = await getServerAuthenticatedUserId()
    if (!userId) return { sites: [], groups: [] }

    const scope = await getUserLocationScope(userId)
    const lieuAccessFilter = buildLieuAccessFilter(scope)
    const [sitesData, groupeData, lieuxData] = await Promise.all([
      prisma.t_site.findMany({
        where: scope.siteIds.length > 0 ? { Id_Site: { in: scope.siteIds } } : undefined,
        select: { Id_Site: true, Libelle_Site: true },
        orderBy: { Libelle_Site: "asc" },
      }),
      prisma.t_groupe.findMany({
        select: { Id_Groupe: true, Nom_Groupe: true, Numero_Regroupement: true },
        orderBy: { Nom_Groupe: "asc" },
        where: applyAccessFilter({ Est_Archive: false }, lieuAccessFilter),
      }),
      prisma.t_lieu.findMany({
        select: {
          Id_Site: true,
          t_site: { select: { Id_Site: true, Libelle_Site: true } },
          Est_Archive: true,
          t_lieu_groupe: { select: { Id_Groupe: true } },
        },
        where: applyAccessFilter({ Est_Archive: false }, lieuAccessFilter),
      }),
    ])

    const siteMap = new Map<number, string>()
    for (const site of sitesData) {
      siteMap.set(site.Id_Site, site.Libelle_Site || `Site ${site.Id_Site}`)
    }
    for (const lieu of lieuxData) {
      const siteId = lieu.t_site?.Id_Site ?? lieu.Id_Site
      if (!siteId || siteMap.has(siteId)) continue
      siteMap.set(siteId, lieu.t_site?.Libelle_Site || `Site ${siteId}`)
    }

    const sites: Site[] = Array.from(siteMap, ([id, name]) => ({ id, name })).sort((a, b) =>
      a.name.localeCompare(b.name, "fr"),
    )

    const groupToSiteIds = new Map<number, Set<number>>()
    for (const lieu of lieuxData) {
      if (!lieu.Id_Site) continue

      const siteId = lieu.Id_Site
      const groupIds = Array.from(
        new Set((lieu.t_lieu_groupe ?? []).map((lg) => lg.Id_Groupe).filter((id): id is number => typeof id === "number" && id > 0)),
      )

      for (const groupId of groupIds) {
        let set = groupToSiteIds.get(groupId)
        if (!set) {
          set = new Set<number>()
          groupToSiteIds.set(groupId, set)
        }
        set.add(siteId)
      }
    }

    const groups: Group[] = groupeData.map((g) => ({
      id: g.Id_Groupe,
      name: g.Nom_Groupe || `Groupe ${g.Id_Groupe}`,
      category: g.Numero_Regroupement || undefined,
      siteIds: Array.from(groupToSiteIds.get(g.Id_Groupe) ?? []).sort((a, b) => a - b),
    }))

    return { sites, groups }
  } catch (error) {
    log.error("surveillance/filters", "failed_to_load_filter_options", { error })
    return { sites: [], groups: [] }
  }
}
