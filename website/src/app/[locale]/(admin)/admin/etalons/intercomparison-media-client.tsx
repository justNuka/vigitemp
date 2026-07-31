"use client"

import { useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { Plus, Archive, Pencil } from "lucide-react"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import { useTranslations } from "next-intl"

import { deleteJson } from "@/lib/http"
import { useIntercomparisonMedia, type IntercomparisonMedium } from "@/hooks/useIntercomparisonMedia"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TanStackTable } from "@/components/data-table/tanstack-table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import { IntercomparisonMediumModal } from "./intercomparison-medium-modal"

export function IntercomparisonMediaClient() {
  const t = useTranslations("metrologyAdmin.intercomparisonTable")
  const queryClient = useQueryClient()
  const { data, isLoading } = useIntercomparisonMedia(true, "all")
  const [selectedMedium, setSelectedMedium] = useState<IntercomparisonMedium | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [archiveOpen, setArchiveOpen] = useState(false)
  const [statusTab, setStatusTab] = useState<"active" | "archived">("active")

  const activeMedia = (data || []).filter((item) => !item.Est_Archive)
  const archivedMedia = (data || []).filter((item) => Boolean(item.Est_Archive))
  const displayedMedia = statusTab === "active" ? activeMedia : archivedMedia

  function formatDecimalDisplay(value: unknown, maxFractionDigits = 6) {
    if (value === null || value === undefined || value === "") return ""
    const parsed =
      typeof value === "number"
        ? value
        : Number(String(value).replace(",", "."))
    if (!Number.isFinite(parsed)) return String(value)
    return parsed.toFixed(maxFractionDigits).replace(/\.?0+$/, "")
  }

  const columns: ColumnDef<IntercomparisonMedium>[] = [
    { accessorKey: "Model", header: t("columns.model") },
    { accessorKey: "Reference", header: t("columns.reference") },
    {
      accessorKey: "Stabilite",
      header: t("columns.stability"),
      cell: ({ row }) => formatDecimalDisplay(row.original.Stabilite),
    },
    {
      accessorKey: "Homogeneite",
      header: t("columns.homogeneity"),
      cell: ({ row }) => formatDecimalDisplay(row.original.Homogeneite),
    },
    { accessorKey: "Contenu", header: t("columns.content") },
  ]

  async function handleArchive() {
    if (!selectedMedium) return
    try {
      await deleteJson(`/api/metrologie/milieux/${selectedMedium.Id_Milieu}`)
      toast.success(t("toast.archived"))
      queryClient.invalidateQueries({ queryKey: ["metrology-intercomparison-media"] })
      setSelectedMedium(null)
      setArchiveOpen(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("toast.archiveError"))
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{t("title")}</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("description")}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="default"
              size="sm"
              className="gap-2"
              onClick={() => {
                setSelectedMedium(null)
                setModalOpen(true)
              }}
            >
              <Plus className="h-4 w-4" />
              {t("actions.new")}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2"
              disabled={!selectedMedium || statusTab === "archived"}
              onClick={() => setModalOpen(true)}
            >
              <Pencil className="h-4 w-4" />
              {t("actions.edit")}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2"
              disabled={!selectedMedium || statusTab === "archived"}
              onClick={() => setArchiveOpen(true)}
            >
              <Archive className="h-4 w-4" />
              {t("actions.archive")}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-2 md:p-4 xl:p-4">
          <Tabs
            value={statusTab}
            onValueChange={(value) => {
              setStatusTab(value as "active" | "archived")
              setSelectedMedium(null)
            }}
            className="space-y-4"
          >
            <TabsList className="grid w-full max-w-md grid-cols-2 bg-primary/10 text-primary">
              <TabsTrigger value="active" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                {t("tabs.active", { count: activeMedia.length })}
              </TabsTrigger>
              <TabsTrigger value="archived" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                {t("tabs.archived", { count: archivedMedia.length })}
              </TabsTrigger>
            </TabsList>
          <TanStackTable
            columns={columns}
            data={displayedMedia}
            searchField="Model"
            searchPlaceholder={t("searchPlaceholder")}
            isLoading={isLoading}
            emptyMessage={t("empty")}
            selectedRowId={selectedMedium?.Id_Milieu}
            onRowClick={(row) => setSelectedMedium(row)}
            onRowDoubleClick={(row) => {
              if (statusTab === "archived") return
              setSelectedMedium(row)
              setModalOpen(true)
            }}
            maxHeight="60vh"
            headerClassName="!bg-sidebar !text-sidebar-foreground"
            headerCellClassName="!bg-sidebar !text-sidebar-foreground !border-r !border-white/25 hover:!bg-sidebar-accent/80"
            tableClassName="border-separate border-spacing-0 [&_thead_th]:!border-r [&_thead_th]:!border-white/25 [&_thead_th:last-child]:!border-r-0"
          />
          </Tabs>
        </CardContent>
      </Card>

      <IntercomparisonMediumModal open={modalOpen} onOpenChange={setModalOpen} medium={selectedMedium} />

      <AlertDialog open={archiveOpen} onOpenChange={setArchiveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("archiveDialog.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("archiveDialog.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogCancel>{t("archiveDialog.cancel")}</AlertDialogCancel>
          <AlertDialogAction onClick={handleArchive}>{t("archiveDialog.confirm")}</AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
