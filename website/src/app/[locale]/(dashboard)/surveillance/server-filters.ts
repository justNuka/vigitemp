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
  disabled?: boolean
}

export async function ServerFilterOptions() {
  unstable_noStore()
  const { prisma } = await import("@/lib/prisma")

  try {
    const userId = await getServerAuthenticatedUserId()
    if (!userId) return { sites: [], groups: [] }

    const scope = await getUserLocationScope(userId)
    const lieuAccessFilter = buildLieuAccessFilter(scope)

    const groupCandidateWhere = {
      Est_Archive: false,
      ...(scope.siteIds.length > 0 ? { Id_Site: { in: scope.siteIds } } : {}),
    }

    const [lieuxData, groupCandidateLocations] = await Promise.all([
      prisma.t_lieu.findMany({
        select: {
          Id_Site: true,
          t_site: { select: { Id_Site: true, Libelle_Site: true, Est_Archive: true } },
          Est_Archive: true,
          t_lieu_groupe: { select: { Id_Groupe: true } },
        },
        where: applyAccessFilter({ Est_Archive: false }, lieuAccessFilter),
      }),
      prisma.t_lieu.findMany({
        where: groupCandidateWhere,
        select: {
          Id_Site: true,
          t_lieu_groupe: { select: { Id_Groupe: true } },
        },
      }),
    ])

    const accessibleSiteIds = Array.from(
      new Set(
        lieuxData
          .map((lieu) => lieu.t_site?.Id_Site ?? lieu.Id_Site)
          .filter((id): id is number => typeof id === "number" && id > 0),
      ),
    )

    const siteIdsForOptions =
      scope.siteIds.length > 0 ? scope.siteIds : accessibleSiteIds

    const groupToSiteIds = new Map<number, Set<number>>()
    for (const lieu of groupCandidateLocations) {
      if (!lieu.Id_Site) continue

      for (const link of lieu.t_lieu_groupe ?? []) {
        if (!link.Id_Groupe) continue
        let siteIds = groupToSiteIds.get(link.Id_Groupe)
        if (!siteIds) {
          siteIds = new Set<number>()
          groupToSiteIds.set(link.Id_Groupe, siteIds)
        }
        siteIds.add(lieu.Id_Site)
      }
    }

    const candidateGroupIds = Array.from(groupToSiteIds.keys())

    const [sitesData, groupeData] = await Promise.all([
      siteIdsForOptions.length > 0
        ? prisma.t_site.findMany({
            where: {
              Est_Archive: false,
              Id_Site: { in: siteIdsForOptions },
            },
            select: { Id_Site: true, Libelle_Site: true, Est_Archive: true },
            orderBy: { Libelle_Site: "asc" },
          })
        : Promise.resolve([]),
      candidateGroupIds.length > 0
        ? prisma.t_groupe.findMany({
            where: {
              Est_Archive: false,
              Id_Groupe: { in: candidateGroupIds },
            },
            select: { Id_Groupe: true, Nom_Groupe: true, Numero_Regroupement: true },
            orderBy: { Nom_Groupe: "asc" },
          })
        : Promise.resolve([]),
    ])

    const siteMap = new Map<number, string>()
    for (const site of sitesData) {
      if (site.Est_Archive) continue
      siteMap.set(site.Id_Site, site.Libelle_Site || `Site ${site.Id_Site}`)
    }
    for (const lieu of lieuxData) {
      const siteId = lieu.t_site?.Id_Site ?? lieu.Id_Site
      if (!siteId || siteMap.has(siteId)) continue
      if (lieu.t_site?.Est_Archive) continue
      siteMap.set(siteId, lieu.t_site?.Libelle_Site || `Site ${siteId}`)
    }

    const sites: Site[] = Array.from(siteMap, ([id, name]) => ({ id, name })).sort((a, b) =>
      a.name.localeCompare(b.name, "fr"),
    )

    const hasGroupRestrictions = scope.groupIds.length > 0
    const allowedGroupIds = new Set(scope.groupIds)
    const groups: Group[] = groupeData.map((group) => ({
      id: group.Id_Groupe,
      name: group.Nom_Groupe || `Groupe ${group.Id_Groupe}`,
      category: group.Numero_Regroupement || undefined,
      siteIds: Array.from(groupToSiteIds.get(group.Id_Groupe) ?? []).sort((a, b) => a - b),
      disabled: hasGroupRestrictions && !allowedGroupIds.has(group.Id_Groupe),
    }))

    return { sites, groups }
  } catch (error) {
    log.error("surveillance/filters", "failed_to_load_filter_options", { error })
    return { sites: [], groups: [] }
  }
}
