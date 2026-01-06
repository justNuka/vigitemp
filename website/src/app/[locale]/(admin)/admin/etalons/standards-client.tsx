"use client"

import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import type { ColumnDef } from "@tanstack/react-table"
import type { Standard } from "@/hooks/useStandards"
import { useStandards } from "@/hooks/useStandards"
import { deleteJson } from "@/lib/http"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { TanStackTable } from "@/components/data-table/tanstack-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { StandardModal } from "./standard-modal"

type StandardRow = {
  Id_Etalon: number
  Etalon_Numero_Serie: string | null
  Etat_Etalon: string | null
}

export function StandardsClient() {
  const { data: standards, isLoading } = useStandards()
  const queryClient = useQueryClient()
  const [selectedStandard, setSelectedStandard] = useState<Standard | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false)

  const handleAddClick = () => {
    setSelectedStandard(null)
    setIsEditing(false)
    setIsModalOpen(true)
  }

  const handleEditClick = () => {
    if (selectedStandard) {
      setIsEditing(true)
      setIsModalOpen(true)
    }
  }

  const handleArchiveClick = () => {
    setIsArchiveDialogOpen(true)
  }

  const handleConfirmArchive = async () => {
    if (!selectedStandard) return

    try {
      await deleteJson(`/api/etalons/${selectedStandard.Id_Etalon}`)
      toast.success("Étalon archivé")
      setIsArchiveDialogOpen(false)
      setSelectedStandard(null)
      await queryClient.invalidateQueries({ queryKey: ["etalons"] })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur lors de l'archivage")
    }
  }

  const handleTestClick = () => {
    console.log("Test:", selectedStandard)
  }

  const columns: ColumnDef<StandardRow>[] = [
    {
      accessorKey: "Etalon_Numero_Serie",
      header: "Numéro de série",
    },
    {
      id: "date_certificat",
      header: "Date certificat",
      cell: () => "-",
    },
    {
      accessorKey: "Etat_Etalon",
      header: "État actuel",
      cell: ({ row }) => (
        <Badge variant={row.getValue("Etat_Etalon") === "1" ? "default" : "outline"}>
          {row.getValue("Etat_Etalon") === "1" ? "Actif" : "Inactif"}
        </Badge>
      ),
    },
  ]

  const tableData: StandardRow[] = (standards || []).map((e) => ({
    Id_Etalon: e.Id_Etalon,
    Etalon_Numero_Serie: e.Etalon_Numero_Serie,
    Etat_Etalon: e.Etat_Etalon,
  }))

  return (
    <main className="flex-1 p-4 md:p-6 space-y-6 animate-fade-in">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Gestion des étalons</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {standards?.length || 0} étalon{standards && standards.length > 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAddClick} variant="default">
              Nouveau
            </Button>
            <Button onClick={handleEditClick} disabled={!selectedStandard} variant="outline">
              Modifier
            </Button>
            <Button onClick={handleArchiveClick} disabled={!selectedStandard} variant="outline">
              Archiver
            </Button>
            <Button onClick={handleTestClick} disabled={!selectedStandard} variant="outline">
              Tester
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-2 md:p-4 xl:p-4">
          <TanStackTable
            columns={columns}
            data={tableData}
            searchPlaceholder="N° série, état..."
            isLoading={isLoading}
            emptyMessage="Aucun étalon trouvé"
            selectedRowId={selectedStandard?.Id_Etalon}
            onRowClick={(row: StandardRow) => {
              setSelectedStandard(standards?.find((e) => e.Id_Etalon === row.Id_Etalon) || null)
            }}
            maxHeight="60vh"
          />
        </CardContent>
      </Card>

      <StandardModal open={isModalOpen} onOpenChange={setIsModalOpen} standard={selectedStandard} isEditing={isEditing} />

      <AlertDialog open={isArchiveDialogOpen} onOpenChange={setIsArchiveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer l'archivage</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir archiver cet étalon ? Cette action ne pourra pas être annulée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirmArchive}>Archiver</AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  )
}
