"use client"

import { useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { Plus, Archive, Pencil } from "lucide-react"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"

import { deleteJson } from "@/lib/http"
import { useIntercomparisonMedia, type IntercomparisonMedium } from "@/hooks/useIntercomparisonMedia"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  const queryClient = useQueryClient()
  const { data, isLoading } = useIntercomparisonMedia()
  const [selectedMedium, setSelectedMedium] = useState<IntercomparisonMedium | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [archiveOpen, setArchiveOpen] = useState(false)

  const columns: ColumnDef<IntercomparisonMedium>[] = [
    { accessorKey: "Model", header: "Modele" },
    { accessorKey: "Reference", header: "Reference" },
    { accessorKey: "Stabilite", header: "Stabilite" },
    { accessorKey: "Homogeneite", header: "Homogeneite" },
    { accessorKey: "Contenu", header: "Contenu" },
  ]

  async function handleArchive() {
    if (!selectedMedium) return
    try {
      await deleteJson(`/api/metrologie/milieux/${selectedMedium.Id_Milieu}`)
      toast.success("Milieu d'inter-comparaison archive.")
      queryClient.invalidateQueries({ queryKey: ["metrology-intercomparison-media"] })
      setSelectedMedium(null)
      setArchiveOpen(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur lors de l'archivage du milieu")
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Milieux d'inter-comparaison</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Gestion des bains et autres milieux utilises pour les comparaisons.
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
              Nouveau
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2"
              disabled={!selectedMedium}
              onClick={() => setModalOpen(true)}
            >
              <Pencil className="h-4 w-4" />
              Modifier
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2"
              disabled={!selectedMedium}
              onClick={() => setArchiveOpen(true)}
            >
              <Archive className="h-4 w-4" />
              Archiver
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-2 md:p-4 xl:p-4">
          <TanStackTable
            columns={columns}
            data={data || []}
            searchField="Model"
            searchPlaceholder="Rechercher un milieu"
            isLoading={isLoading}
            emptyMessage="Aucun milieu d'inter-comparaison trouve"
            selectedRowId={selectedMedium?.Id_Milieu}
            onRowClick={(row) => setSelectedMedium(row)}
            onRowDoubleClick={(row) => {
              setSelectedMedium(row)
              setModalOpen(true)
            }}
            maxHeight="60vh"
            headerClassName="!bg-sidebar !text-sidebar-foreground"
            headerCellClassName="!bg-sidebar !text-sidebar-foreground !border-r !border-white/25 hover:!bg-sidebar-accent/80"
            tableClassName="border-separate border-spacing-0 [&_thead_th]:!border-r [&_thead_th]:!border-white/25 [&_thead_th:last-child]:!border-r-0"
          />
        </CardContent>
      </Card>

      <IntercomparisonMediumModal open={modalOpen} onOpenChange={setModalOpen} medium={selectedMedium} />

      <AlertDialog open={archiveOpen} onOpenChange={setArchiveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archiver le milieu</AlertDialogTitle>
            <AlertDialogDescription>
              Confirmez l'archivage de ce milieu d'inter-comparaison.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction onClick={handleArchive}>Archiver</AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
