import { applyAccessFilter, buildLieuAccessFilter, getUserLocationScope } from "@/lib/location-access-scope"
import { prisma } from "@/lib/prisma"
import { getServerAuthenticatedUserId } from "@/lib/server-auth"

export type DashboardAlarmHierarchyEntry = {
  siteName: string | null
  groupNames: string[]
  locationName: string | null
  sensorName: string | null
}

export type DashboardAlarmHierarchy = Record<string, DashboardAlarmHierarchyEntry>

export async function ServerAlarmHierarchy(locationIds: readonly string[]): Promise<DashboardAlarmHierarchy> {
  const parsedLocationIds = Array.from(
    new Set(
      locationIds
        .map((id) => Number(id))
        .filter((id) => Number.isInteger(id) && id > 0),
    ),
  )

  if (parsedLocationIds.length === 0) return {}

  const userId = await getServerAuthenticatedUserId()
  if (!userId) return {}

  const scope = await getUserLocationScope(userId)
  const accessFilter = buildLieuAccessFilter(scope)

  const locations = await prisma.t_lieu.findMany({
    where: applyAccessFilter({ Id_Lieu: { in: parsedLocationIds } }, accessFilter),
    select: {
      Id_Lieu: true,
      Nom_Lieu: true,
      Sonde_Numero_Serie: true,
      t_site: {
        select: { Libelle_Site: true },
      },
      t_lieu_groupe: {
        select: {
          t_groupe: {
            select: { Id_Groupe: true, Nom_Groupe: true },
          },
        },
      },
    },
  })

  return Object.fromEntries(
    locations.map((location) => {
      const groupNames = (location.t_lieu_groupe ?? [])
        .map((link) => link.t_groupe?.Nom_Groupe?.trim())
        .filter((name): name is string => Boolean(name))
        .sort((a, b) => a.localeCompare(b, "fr", { sensitivity: "base", numeric: true }))

      return [
        String(location.Id_Lieu),
        {
          siteName: location.t_site?.Libelle_Site?.trim() || null,
          groupNames,
          locationName: location.Nom_Lieu?.trim() || null,
          sensorName: location.Sonde_Numero_Serie?.trim() || location.Nom_Lieu?.trim() || null,
        },
      ]
    }),
  )
}
