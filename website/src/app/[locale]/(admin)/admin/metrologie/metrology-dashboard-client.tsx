"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { FlaskConical, GaugeCircle, TestTubeDiagonal } from "lucide-react"

import { Link } from "@/i18n/navigation"
import { PageHeader } from "@/components/page-header"
import { TanStackTable } from "@/components/data-table/tanstack-table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useMetrologyDashboard, type MetrologyDashboardRow } from "@/hooks/useMetrologyDashboard"

function formatNumber(value: number | null) {
  if (value == null) return "-"
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 }).format(value)
}

function formatDate(value: string | null) {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "-"
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "short" }).format(date)
}

function yesNoBadge(active: boolean) {
  return <Badge variant={active ? "default" : "outline"}>{active ? "Oui" : "Non"}</Badge>
}

function conformityBadge(value: MetrologyDashboardRow["conformity"]) {
  if (value === "ok") return <Badge className="bg-emerald-600 hover:bg-emerald-600">Conforme</Badge>
  if (value === "alert") return <Badge variant="destructive">Alerte</Badge>
  return <Badge variant="outline">Non applicable</Badge>
}

export function MetrologyDashboardClient() {
  const { data, isLoading } = useMetrologyDashboard()

  const columns: ColumnDef<MetrologyDashboardRow>[] = [
    { accessorKey: "nomLieu", header: "Nom du lieu" },
    { accessorKey: "sondeAssociee", header: "Sonde associée" },
    { accessorKey: "conformity", header: "Conformité", cell: ({ row }) => conformityBadge(row.original.conformity) },
    { accessorKey: "toleranceInf", header: "Tolérance inf", cell: ({ row }) => formatNumber(row.original.toleranceInf) },
    { accessorKey: "consigne", header: "Consigne", cell: ({ row }) => formatNumber(row.original.consigne) },
    { accessorKey: "toleranceSup", header: "Tolérance sup", cell: ({ row }) => formatNumber(row.original.toleranceSup) },
    { accessorKey: "dateEtalonnage", header: "Date d'étalonnage", cell: ({ row }) => formatDate(row.original.dateEtalonnage) },
    { accessorKey: "erreurJustesse", header: "Erreur de justesse", cell: ({ row }) => formatNumber(row.original.erreurJustesse) },
    { accessorKey: "incertitudeEtalonnage", header: "Incertitude d'étalonnage", cell: ({ row }) => formatNumber(row.original.incertitudeEtalonnage) },
    { accessorKey: "correctionErreurJustesseActive", header: "EJ active", cell: ({ row }) => yesNoBadge(row.original.correctionErreurJustesseActive) },
    { accessorKey: "correctionDeriveActive", header: "Dérive active", cell: ({ row }) => yesNoBadge(row.original.correctionDeriveActive) },
    { accessorKey: "derive", header: "Dérive", cell: ({ row }) => formatNumber(row.original.derive) },
    { accessorKey: "incertitudeMesure", header: "Incertitude de mesure", cell: ({ row }) => formatNumber(row.original.incertitudeMesure) },
    { accessorKey: "dateProchainEtalonnage", header: "Date prochain étalonnage", cell: ({ row }) => formatDate(row.original.dateProchainEtalonnage) },
  ]

  return (
    <>
      <PageHeader title="Bains & étalons" description="Vue d'ensemble métrologie et accès rapide aux opérations." />
      <div className="space-y-6 p-6">
        <Card>
          <CardHeader>
            <CardTitle>Suivi métrologique des lieux</CardTitle>
            <CardDescription>Tableau de synthèse des lieux instrumentés et de leur état métrologique.</CardDescription>
          </CardHeader>
          <CardContent className="p-2 md:p-4 xl:p-4">
            <TanStackTable
              columns={columns}
              data={data || []}
              searchField={["nomLieu", "sondeAssociee"]}
              searchPlaceholder="Rechercher un lieu ou une sonde"
              isLoading={isLoading}
              emptyMessage="Aucun lieu trouvé"
              maxHeight="60vh"
              headerClassName="!bg-sidebar !text-sidebar-foreground"
              headerCellClassName="!bg-sidebar !text-sidebar-foreground !border-r !border-white/25 hover:!bg-sidebar-accent/80"
              tableClassName="border-separate border-spacing-0 [&_thead_th]:!border-r [&_thead_th]:!border-white/25 [&_thead_th:last-child]:!border-r-0"
              exportFileName="tableau-metrologie"
            />
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-3 text-primary"><FlaskConical className="h-5 w-5" /></div>
                <div>
                  <CardTitle className="text-xl">Bains & sondes étalons</CardTitle>
                  <CardDescription>Gérer les sondes étalons et les milieux d'inter-comparaison.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/admin/metrologie/bains-etalons">Ouvrir la gestion</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-3 text-primary"><GaugeCircle className="h-5 w-5" /></div>
                <div>
                  <CardTitle className="text-xl">Réaliser un ajustage</CardTitle>
                  <CardDescription>Préparer et exécuter un ajustage/calibrage sur une sonde.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/admin/metrologie/realiser-ajustage">Accéder à l'ajustage</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-3 text-primary"><TestTubeDiagonal className="h-5 w-5" /></div>
                <div>
                  <CardTitle className="text-xl">Réaliser un étalonnage</CardTitle>
                  <CardDescription>Lancer un étalonnage et consulter les opérations à venir.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/admin/metrologie/realiser-etalonnage">Accéder à l'étalonnage</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
