"use client"

import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import type { ColumnDef } from "@tanstack/react-table"
import type { Actuator } from "@/hooks/useActuators"
import { useActuators } from "@/hooks/useActuators"
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
import { Printer } from "lucide-react"
import { TanStackTable } from "@/components/data-table/tanstack-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { ActuatorModal } from "./actuator-modal"

type ActuatorRow = {
  Id_Actionneur: number
  Num_Serie: string | null
  Type: number | null
  Commentaire: string | null
  Est_Etat: boolean | null
}

export function ActuatorsClient() {
  const { data: actuators, isLoading } = useActuators()
  const queryClient = useQueryClient()
  const [selectedActuator, setSelectedActuator] = useState<Actuator | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const handleAddClick = () => {
    setSelectedActuator(null)
    setIsEditing(false)
    setIsModalOpen(true)
  }

  const handleEditClick = () => {
    if (selectedActuator) {
      setIsEditing(true)
      setIsModalOpen(true)
    }
  }

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!selectedActuator) return

    try {
      await deleteJson(`/api/actionneurs/${selectedActuator.Id_Actionneur}`)
      toast.success("Actionneur archivé")
      setIsDeleteDialogOpen(false)
      setSelectedActuator(null)
      await queryClient.invalidateQueries({ queryKey: ["actionneurs"] })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur lors de l'archivage")
    }
  }

  const handlePrintClick = () => {
    window.print()
  }

  const columns: ColumnDef<ActuatorRow>[] = [
    {
      accessorKey: "Num_Serie",
      header: "Numéro de série",
    },
    {
      accessorKey: "Type",
      header: "Type",
    },
    {
      accessorKey: "Commentaire",
      header: "Commentaire",
      cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.getValue("Commentaire") || "-"}</span>,
    },
    {
      accessorKey: "Est_Etat",
      header: "État",
      cell: ({ row }) => (
        <Badge variant={row.getValue("Est_Etat") ? "default" : "outline"}>
          {row.getValue("Est_Etat") ? "Actif" : "Inactif"}
        </Badge>
      ),
    },
  ]

  const tableData: ActuatorRow[] = (actuators || []).map((a) => ({
    Id_Actionneur: a.Id_Actionneur,
    Num_Serie: a.Num_Serie,
    Type: a.Type,
    Commentaire: a.Commentaire,
    Est_Etat: a.Est_Etat,
  }))

  return (
    <main className="flex-1 p-4 md:p-6 space-y-6 animate-fade-in">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Gestion des actionneurs</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {actuators?.length || 0} actionneur{actuators && actuators.length > 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAddClick} variant="default">
              Nouveau
            </Button>
            <Button onClick={handleEditClick} disabled={!selectedActuator} variant="outline">
              Modifier
            </Button>
            <Button onClick={handleDeleteClick} disabled={!selectedActuator} variant="outline">
              Archiver
            </Button>
            <Button onClick={handlePrintClick} variant="outline" size="icon">
              <Printer className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <TanStackTable
            columns={columns}
            data={tableData}
            searchField="Num_Serie"
            searchPlaceholder="N° série, type..."
            isLoading={isLoading}
            emptyMessage="Aucun actionneur trouvé"
            selectedRowId={selectedActuator?.Id_Actionneur}
            onRowClick={(row: ActuatorRow) => {
              setSelectedActuator(actuators?.find((a) => a.Id_Actionneur === row.Id_Actionneur) || null)
            }}
          />
        </CardContent>
      </Card>

      <ActuatorModal open={isModalOpen} onOpenChange={setIsModalOpen} actuator={selectedActuator} isEditing={isEditing} />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer l'archivage</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir archiver cet actionneur ? Cette action ne pourra pas être annulée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600">
            Archiver
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  )
}

