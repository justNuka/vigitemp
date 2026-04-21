import { format } from "date-fns"

import { prisma, prismaMesure } from "@/lib/prisma"

export type LocationStatisticsRow = {
  locationId: number
  locationName: string
  siteName: string
  groups: string
  unit: string
  consigne: number | null
  toleranceSup: number | null
  toleranceInf: number | null
  frequencySec: number | null
  highDelayMin: number | null
  lowDelayMin: number | null
  retriggerDelayMeasures: number | null
  measureMax: number | null
  measureMin: number | null
  measureAvg: number | null
  alarmCount: number
  alarmHighDurationSec: number
  alarmLowDurationSec: number
  exceedHighNoAlarmSec: number
  exceedLowNoAlarmSec: number
}

export async function loadLocationStatisticsRows({
  from,
  toExclusive,
  locationIds,
}: {
  from: Date
  toExclusive: Date
  locationIds?: number[]
}): Promise<LocationStatisticsRow[]> {
  const idsFilter =
    locationIds && locationIds.length > 0
      ? { in: locationIds }
      : undefined

  const lieux = await prisma.t_lieu.findMany({
    where: {
      Est_Archive: false,
      Lieu_Etat: "S",
      ...(idsFilter ? { Id_Lieu: idsFilter } : {}),
    },
    select: {
      Id_Lieu: true,
      Nom_Lieu: true,
      Consigne: true,
      Tolerance_Surveillance_Sup: true,
      Tolerance_Surveillance_Inf: true,
      Frequence: true,
      Retard_Alarme_Haut: true,
      Retard_Alarme_Bas: true,
      Nb_Mesures_Temporisation_Redeclenchement: true,
      Derniere_Unite: true,
      t_site: { select: { Libelle_Site: true } },
      t_lieu_groupe: {
        select: {
          t_groupe: { select: { Nom_Groupe: true } },
        },
      },
    },
    orderBy: [{ t_site: { Libelle_Site: "asc" } }, { Nom_Lieu: "asc" }],
  })

  if (lieux.length === 0) return []

  const lieuIds = lieux.map((l) => l.Id_Lieu).filter((id): id is number => typeof id === "number")
  if (lieuIds.length === 0) return []

  const idsList = lieuIds.join(",")
  const fromIso = format(from, "yyyy-MM-dd HH:mm:ss")
  const toIso = format(toExclusive, "yyyy-MM-dd HH:mm:ss")

  const measureAggRows = await prismaMesure.$queryRawUnsafe<Array<{
    idLieu: number
    measureMax: number | null
    measureMin: number | null
    measureAvg: number | null
    exceedHighNoAlarmSec: number | bigint | null
    exceedLowNoAlarmSec: number | bigint | null
  }>>(
    `
      SELECT
        m.Id_Lieu AS idLieu,
        MAX(m.Valeur) AS measureMax,
        MIN(m.Valeur) AS measureMin,
        AVG(m.Valeur) AS measureAvg,
        SUM(
          CASE
            WHEN IFNULL(m.Est_Valeur_Null, 0) = 0
             AND IFNULL(m.Est_Etat_Alarme, 0) = 0
             AND m.Valeur IS NOT NULL
             AND m.Consigne_Sup IS NOT NULL
             AND m.Valeur > m.Consigne_Sup
            THEN IFNULL(m.Frequence, 0)
            ELSE 0
          END
        ) AS exceedHighNoAlarmSec,
        SUM(
          CASE
            WHEN IFNULL(m.Est_Valeur_Null, 0) = 0
             AND IFNULL(m.Est_Etat_Alarme, 0) = 0
             AND m.Valeur IS NOT NULL
             AND m.Consigne_Inf IS NOT NULL
             AND m.Valeur < m.Consigne_Inf
            THEN IFNULL(m.Frequence, 0)
            ELSE 0
          END
        ) AS exceedLowNoAlarmSec
      FROM tm_mesures m
      WHERE m.Id_Lieu IN (${idsList})
        AND m.Date_Heure_Mesure >= '${fromIso}'
        AND m.Date_Heure_Mesure < '${toIso}'
      GROUP BY m.Id_Lieu
    `,
  )

  const alarmAggRows = await prisma.$queryRawUnsafe<Array<{
    idLieu: number
    alarmCount: number | bigint | null
    alarmHighDurationSec: number | bigint | null
    alarmLowDurationSec: number | bigint | null
  }>>(
    `
      SELECT
        src.Id_Lieu AS idLieu,
        COUNT(*) AS alarmCount,
        SUM(
          CASE
            WHEN src.Type = 'H'
            THEN GREATEST(
              0,
              TIMESTAMPDIFF(
                SECOND,
                GREATEST(src.Date_Heure_Debut, '${fromIso}'),
                LEAST(IFNULL(src.Date_Heure_Fin, '${toIso}'), '${toIso}')
              )
            )
            ELSE 0
          END
        ) AS alarmHighDurationSec,
        SUM(
          CASE
            WHEN src.Type = 'B'
            THEN GREATEST(
              0,
              TIMESTAMPDIFF(
                SECOND,
                GREATEST(src.Date_Heure_Debut, '${fromIso}'),
                LEAST(IFNULL(src.Date_Heure_Fin, '${toIso}'), '${toIso}')
              )
            )
            ELSE 0
          END
        ) AS alarmLowDurationSec
      FROM (
        SELECT Id_Lieu, Type, Date_Heure_Debut, Date_Heure_Fin
        FROM t_alarme
        WHERE Id_Lieu IN (${idsList})
          AND Date_Heure_Debut < '${toIso}'
          AND IFNULL(Date_Heure_Fin, '${toIso}') >= '${fromIso}'
        UNION ALL
        SELECT Id_Lieu, Type, Date_Heure_Debut, Date_Heure_Fin
        FROM t_alarme_histo
        WHERE Id_Lieu IN (${idsList})
          AND Date_Heure_Debut < '${toIso}'
          AND IFNULL(Date_Heure_Fin, '${toIso}') >= '${fromIso}'
      ) src
      GROUP BY src.Id_Lieu
    `,
  )

  const measureAggByLieu = new Map(
    measureAggRows.map((row) => [
      row.idLieu,
      {
        measureMax: row.measureMax,
        measureMin: row.measureMin,
        measureAvg: row.measureAvg,
        exceedHighNoAlarmSec: Number(row.exceedHighNoAlarmSec ?? 0),
        exceedLowNoAlarmSec: Number(row.exceedLowNoAlarmSec ?? 0),
      },
    ]),
  )

  const alarmAggByLieu = new Map(
    alarmAggRows.map((row) => [
      row.idLieu,
      {
        alarmCount: Number(row.alarmCount ?? 0),
        alarmHighDurationSec: Number(row.alarmHighDurationSec ?? 0),
        alarmLowDurationSec: Number(row.alarmLowDurationSec ?? 0),
      },
    ]),
  )

  return lieux.map((lieu) => {
    const measureAgg = measureAggByLieu.get(lieu.Id_Lieu)
    const alarmAgg = alarmAggByLieu.get(lieu.Id_Lieu)
    const groups = lieu.t_lieu_groupe
      .map((item) => item.t_groupe?.Nom_Groupe?.trim() ?? "")
      .filter((name) => name.length > 0)

    return {
      locationId: lieu.Id_Lieu,
      locationName: lieu.Nom_Lieu?.trim() || `Lieu ${lieu.Id_Lieu}`,
      siteName: lieu.t_site?.Libelle_Site?.trim() || "-",
      groups: groups.length > 0 ? groups.join(", ") : "-",
      unit: lieu.Derniere_Unite?.trim() || "°C",
      consigne: lieu.Consigne ?? null,
      toleranceSup: lieu.Tolerance_Surveillance_Sup ?? null,
      toleranceInf: lieu.Tolerance_Surveillance_Inf ?? null,
      frequencySec: lieu.Frequence ?? null,
      highDelayMin: lieu.Retard_Alarme_Haut ?? null,
      lowDelayMin: lieu.Retard_Alarme_Bas ?? null,
      retriggerDelayMeasures: lieu.Nb_Mesures_Temporisation_Redeclenchement ?? null,
      measureMax: measureAgg?.measureMax ?? null,
      measureMin: measureAgg?.measureMin ?? null,
      measureAvg: measureAgg?.measureAvg ?? null,
      alarmCount: alarmAgg?.alarmCount ?? 0,
      alarmHighDurationSec: alarmAgg?.alarmHighDurationSec ?? 0,
      alarmLowDurationSec: alarmAgg?.alarmLowDurationSec ?? 0,
      exceedHighNoAlarmSec: measureAgg?.exceedHighNoAlarmSec ?? 0,
      exceedLowNoAlarmSec: measureAgg?.exceedLowNoAlarmSec ?? 0,
    }
  })
}


