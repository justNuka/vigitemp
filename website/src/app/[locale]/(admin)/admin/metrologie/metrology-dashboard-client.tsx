"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { FlaskConical, GaugeCircle, TestTubeDiagonal } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"

import { Link } from "@/i18n/navigation"
import { PageHeader } from "@/components/page-header"
import { TanStackTable } from "@/components/data-table/tanstack-table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useMetrologyDashboard, type MetrologyDashboardRow } from "@/hooks/useMetrologyDashboard"
import { formatDbDateTime } from "@/lib/date-display"

export function MetrologyDashboardClient() {
  const t = useTranslations("metrologyAdmin.dashboard")
  const locale = useLocale()
  const { data, isLoading } = useMetrologyDashboard()

  function formatNumber(value: number | null) {
    if (value == null) return "-"
    return new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-US", { maximumFractionDigits: 2 }).format(value)
  }

  function formatDate(value: string | null) {
    return formatDbDateTime(value, {
      dateOnly: true,
      locale: locale === "fr" ? "fr-FR" : "en-US",
    })
  }

  function yesNoBadge(active: boolean) {
    return <Badge variant={active ? "default" : "outline"}>{active ? t("badges.yes") : t("badges.no")}</Badge>
  }

  function conformityBadge(value: MetrologyDashboardRow["conformity"]) {
    if (value === "ok") return <Badge className="bg-emerald-600 hover:bg-emerald-600">{t("badges.conformity.ok")}</Badge>
    if (value === "alert") return <Badge variant="destructive">{t("badges.conformity.alert")}</Badge>
    return <Badge variant="outline">{t("badges.conformity.na")}</Badge>
  }

  const columns: ColumnDef<MetrologyDashboardRow>[] = [
    { accessorKey: "nomLieu", header: t("table.columns.location") },
    { accessorKey: "sondeAssociee", header: t("table.columns.sensor") },
    { accessorKey: "conformity", header: t("table.columns.conformity"), cell: ({ row }) => conformityBadge(row.original.conformity) },
    { accessorKey: "toleranceInf", header: t("table.columns.toleranceInf"), cell: ({ row }) => formatNumber(row.original.toleranceInf) },
    { accessorKey: "consigne", header: t("table.columns.setpoint"), cell: ({ row }) => formatNumber(row.original.consigne) },
    { accessorKey: "toleranceSup", header: t("table.columns.toleranceSup"), cell: ({ row }) => formatNumber(row.original.toleranceSup) },
    { accessorKey: "dateEtalonnage", header: t("table.columns.calibrationDate"), cell: ({ row }) => formatDate(row.original.dateEtalonnage) },
    { accessorKey: "erreurJustesse", header: t("table.columns.accuracyError"), cell: ({ row }) => formatNumber(row.original.erreurJustesse) },
    { accessorKey: "incertitudeEtalonnage", header: t("table.columns.calibrationUncertainty"), cell: ({ row }) => formatNumber(row.original.incertitudeEtalonnage) },
    { accessorKey: "correctionErreurJustesseActive", header: t("table.columns.ejActive"), cell: ({ row }) => yesNoBadge(row.original.correctionErreurJustesseActive) },
    { accessorKey: "correctionDeriveActive", header: t("table.columns.driftActive"), cell: ({ row }) => yesNoBadge(row.original.correctionDeriveActive) },
    { accessorKey: "derive", header: t("table.columns.drift"), cell: ({ row }) => formatNumber(row.original.derive) },
    { accessorKey: "incertitudeMesure", header: t("table.columns.measurementUncertainty"), cell: ({ row }) => formatNumber(row.original.incertitudeMesure) },
    { accessorKey: "dateProchainEtalonnage", header: t("table.columns.nextCalibrationDate"), cell: ({ row }) => formatDate(row.original.dateProchainEtalonnage) },
  ]

  return (
    <div className="min-w-0 max-w-full overflow-x-hidden">
      <PageHeader title={t("header.title")} description={t("header.description")} />
      <div className="w-full max-w-full space-y-6 overflow-x-hidden p-6">
        <Card className="min-w-0 max-w-full overflow-hidden">
          <CardHeader>
            <CardTitle>{t("section.title")}</CardTitle>
            <CardDescription>{t("section.description")}</CardDescription>
          </CardHeader>
          <CardContent className="min-w-0 max-w-full overflow-hidden p-2 md:p-4 xl:p-4">
            <div className="w-full max-w-full overflow-x-auto">
              <TanStackTable
                columns={columns}
                data={data || []}
                searchField={["nomLieu", "sondeAssociee"]}
                searchPlaceholder={t("table.searchPlaceholder")}
                isLoading={isLoading}
                emptyMessage={t("table.empty")}
                maxHeight="60vh"
                containerClassName="w-full max-w-full"
                headerClassName="!bg-sidebar !text-sidebar-foreground"
                headerCellClassName="!bg-sidebar !text-sidebar-foreground !border-r !border-white/25 hover:!bg-sidebar-accent/80"
                tableClassName="w-full border-separate border-spacing-0 [&_thead_th]:!border-r [&_thead_th]:!border-white/25 [&_thead_th:last-child]:!border-r-0"
                exportFileName={t("table.exportFileName")}
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid min-w-0 max-w-full gap-4 md:grid-cols-3">
          <Card className="min-w-0">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-3 text-primary"><FlaskConical className="h-5 w-5" /></div>
                <div>
                  <CardTitle className="text-xl">{t("cards.baths.title")}</CardTitle>
                  <CardDescription>{t("cards.baths.description")}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/admin/metrologie/bains-etalons">{t("cards.baths.cta")}</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="min-w-0">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-3 text-primary"><GaugeCircle className="h-5 w-5" /></div>
                <div>
                  <CardTitle className="text-xl">{t("cards.adjustment.title")}</CardTitle>
                  <CardDescription>{t("cards.adjustment.description")}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/admin/metrologie/realiser-ajustage">{t("cards.adjustment.cta")}</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="min-w-0">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-3 text-primary"><TestTubeDiagonal className="h-5 w-5" /></div>
                <div>
                  <CardTitle className="text-xl">{t("cards.calibration.title")}</CardTitle>
                  <CardDescription>{t("cards.calibration.description")}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/admin/metrologie/realiser-etalonnage">{t("cards.calibration.cta")}</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
