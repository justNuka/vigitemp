"use client"

import { useEffect, useRef, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import type { ColumnDef } from "@tanstack/react-table"
import type { Actuator } from "@/hooks/useActuators"
import { useActuators } from "@/hooks/useActuators"
import { deleteJson, getJson } from "@/lib/http"
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
import { useRouter } from '@/i18n/navigation'
import { ActuatorModal } from "./actuator-modal"
import { Archive, Pencil, Plus } from "lucide-react"

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
  const router = useRouter()
  const didPrefetchRef = useRef(false)
  const [selectedActuator, setSelectedActuator] = useState<Actuator | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  useEffect(() => {
    if (isLoading || didPrefetchRef.current) return
    didPrefetchRef.current = true

    queryClient.prefetchQuery({
      queryKey: ["actionneur-types"],
      queryFn: () => getJson("/api/actionneurs/types"),
    })
    queryClient.prefetchQuery({
      queryKey: ["locations"],
      queryFn: () => getJson("/api/lieux"),
    })
  }, [isLoading, queryClient])

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
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur lors de l'archivage")
    }
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
      cell: ({ row }) => <span className="text-sm">{row.getValue("Commentaire") || "-"}</span>,
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
            <Button onClick={handleAddClick} variant="default" size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Nouveau
            </Button>
            <Button onClick={handleEditClick} disabled={!selectedActuator} variant="outline" size="sm" className="gap-2">
              <Pencil className="h-4 w-4" />
              Modifier
            </Button>
            <Button onClick={handleDeleteClick} disabled={!selectedActuator} variant="outline" size="sm" className="gap-2">
              <Archive className="h-4 w-4" />
              Archiver
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
            maxHeight="calc(100dvh - 25rem)"
            emptyMessage="Aucun actionneur trouvé"
            selectedRowId={selectedActuator?.Id_Actionneur}
            onRowClick={(row: ActuatorRow) => {
              setSelectedActuator(actuators?.find((a) => a.Id_Actionneur === row.Id_Actionneur) || null)
            }}
            headerClassName="!bg-sidebar !text-sidebar-foreground"
            headerCellClassName="!bg-sidebar !text-sidebar-foreground !border-r !border-white/25 hover:!bg-sidebar-accent/80"
            tableClassName="border-separate border-spacing-0 [&_thead_th]:!border-r [&_thead_th]:!border-white/25 [&_thead_th:last-child]:!border-r-0"
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
