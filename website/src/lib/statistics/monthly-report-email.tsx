import React from "react"
import { endOfMonth, format, startOfMonth, subMonths } from "date-fns"

import { sendEmail } from "@/lib/email"
import { formatMeasureValue } from "@/lib/measurements"
import { loadLocationStatisticsRows } from "@/lib/statistics/location-stats"
import type { MonthlyStatsReportConfig } from "@/lib/statistics/monthly-report-config"

function durationLabel(totalSeconds: number) {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) return "-"
  const seconds = Math.max(0, Math.round(totalSeconds))
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (hours > 0) return `${hours} h ${minutes} min`
  return `${minutes} min`
}

function MonthlyStatsReportEmail({
  periodLabel,
  rows,
  config,
}: {
  periodLabel: string
  rows: Awaited<ReturnType<typeof loadLocationStatisticsRows>>
  config: MonthlyStatsReportConfig
}) {
  const headers = [
    config.includeLocationSummary ? "Lieu / Site / Groupe" : null,
    config.includeSettingsSummary ? "Consignes / Tolerances / Frequence / Retards" : null,
    config.includeMax ? "Mesure max" : null,
    config.includeMin ? "Mesure min" : null,
    config.includeAvg ? "Moyenne" : null,
    config.includeAlarmCount ? "Nombre d'alarmes" : null,
    config.includeAlarmHighDuration ? "Duree alarme haute" : null,
    config.includeAlarmLowDuration ? "Duree alarme basse" : null,
    config.includeOverHighNoAlarm ? "Depassement haut sans alarme" : null,
    config.includeOverLowNoAlarm ? "Depassement bas sans alarme" : null,
  ].filter(Boolean) as string[]

  return (
    <div style={{ fontFamily: "Arial, sans-serif", fontSize: 14, color: "#0f172a" }}>
      <h2 style={{ margin: "0 0 8px" }}>Recapitulatif mensuel des statistiques VigiSensys</h2>
      <p style={{ margin: "0 0 16px" }}>Periode: {periodLabel}</p>
      <table cellPadding={6} cellSpacing={0} style={{ borderCollapse: "collapse", width: "100%", border: "1px solid #dbe2ea" }}>
        <thead>
          <tr style={{ backgroundColor: "#f8fafc" }}>
            {headers.map((header) => (
              <th key={header} style={{ border: "1px solid #dbe2ea", textAlign: "left", fontSize: 12 }}>
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const cells = [
              config.includeLocationSummary ? `${row.locationName}\n${row.siteName} - ${row.groups}` : null,
              config.includeSettingsSummary
                ? `Consigne: ${row.consigne !== null ? formatMeasureValue(row.consigne, 2, "fr-FR") : "-"} ${row.unit}\nTol sup: ${row.toleranceSup !== null ? formatMeasureValue(row.toleranceSup, 2, "fr-FR") : "-"} ${row.unit}\nTol inf: ${row.toleranceInf !== null ? formatMeasureValue(row.toleranceInf, 2, "fr-FR") : "-"} ${row.unit}\nFrequence: ${row.frequencySec ? `${Math.round(row.frequencySec / 60)} min` : "-"}\nRetards H/B: ${row.highDelayMin ?? "-"} / ${row.lowDelayMin ?? "-"} min`
                : null,
              config.includeMax ? (row.measureMax !== null ? `${formatMeasureValue(row.measureMax, 2, "fr-FR")} ${row.unit}` : "-") : null,
              config.includeMin ? (row.measureMin !== null ? `${formatMeasureValue(row.measureMin, 2, "fr-FR")} ${row.unit}` : "-") : null,
              config.includeAvg ? (row.measureAvg !== null ? `${formatMeasureValue(row.measureAvg, 2, "fr-FR")} ${row.unit}` : "-") : null,
              config.includeAlarmCount ? String(row.alarmCount) : null,
              config.includeAlarmHighDuration ? durationLabel(row.alarmHighDurationSec) : null,
              config.includeAlarmLowDuration ? durationLabel(row.alarmLowDurationSec) : null,
              config.includeOverHighNoAlarm ? durationLabel(row.exceedHighNoAlarmSec) : null,
              config.includeOverLowNoAlarm ? durationLabel(row.exceedLowNoAlarmSec) : null,
            ].filter((value) => value !== null) as string[]

            return (
              <tr key={row.locationId}>
                {cells.map((value, index) => (
                  <td key={`${row.locationId}-${index}`} style={{ border: "1px solid #dbe2ea", verticalAlign: "top", whiteSpace: "pre-line", fontSize: 12 }}>
                    {value}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export async function sendMonthlyStatsReport({
  recipients,
  config,
  date = new Date(),
}: {
  recipients: string[]
  config: MonthlyStatsReportConfig
  date?: Date
}) {
  const targetMonth = subMonths(date, 1)
  const from = startOfMonth(targetMonth)
  const toInclusive = endOfMonth(targetMonth)
  const toExclusive = new Date(toInclusive)
  toExclusive.setDate(toExclusive.getDate() + 1)
  toExclusive.setHours(0, 0, 0, 0)

  const rows = await loadLocationStatisticsRows({ from, toExclusive })
  const periodLabel = `${format(from, "dd/MM/yyyy")} - ${format(toInclusive, "dd/MM/yyyy")}`
  const subject = `[VIGITEMP] Recap mensuel statistiques - ${format(targetMonth, "MM/yyyy")}`

  let sent = 0
  for (const recipient of recipients) {
    const result = await sendEmail({
      to: recipient,
      subject,
      react: <MonthlyStatsReportEmail periodLabel={periodLabel} rows={rows} config={config} />,
    })
    if (result.success) sent += 1
  }

  return {
    attempted: recipients.length,
    sent,
    rowCount: rows.length,
    periodMonth: format(targetMonth, "yyyy-MM"),
  }
}
