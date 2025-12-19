"use client";

import { useState } from "react";
import { useActionneurs } from "@/hooks/useActionneurs";
import { Actionneur } from "@/hooks/useActionneurs";
import { Button } from "@/components/ui/button";
import {
  Badge } from "@/components/ui/badge";
import { Actionneur_Modal } from "./actionneur-modal";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Printer } from "lucide-react";
import { TanStackTable } from "@/components/data-table/tanstack-table";
import { ColumnDef } from "@tanstack/react-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ActionneursRow {
  Id_Actionneur: number;
  Num_Serie: string | null;
  Type: number | null;
  Commentaire: string | null;
  Est_Etat: boolean | null;
}

export function ActionneursClient() {
  const { data: actionneurs, isLoading } = useActionneurs();
  const [selectedActionneur, setSelectedActionneur] = useState<Actionneur | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleAddClick = () => {
    setSelectedActionneur(null);
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleEditClick = () => {
    if (selectedActionneur) {
      setIsEditing(true);
      setIsModalOpen(true);
    }
  };

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    // TODO: Implement delete API call
    console.log("Delete:", selectedActionneur);
    setIsDeleteDialogOpen(false);
    setSelectedActionneur(null);
  };

  const handlePrintClick = () => {
    window.print();
  };

  // Colonnes TanStack
  const columns: ColumnDef<ActionneursRow>[] = [
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
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{row.getValue("Commentaire") || "-"}</span>
      ),
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
  ];

  const tableData: ActionneursRow[] = (actionneurs || []).map((a) => ({
    Id_Actionneur: a.Id_Actionneur,
    Num_Serie: a.Num_Serie,
    Type: a.Type,
    Commentaire: a.Commentaire,
    Est_Etat: a.Est_Etat,
  }));

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="flex gap-2">
          <Button onClick={handleAddClick} className="bg-green-600 hover:bg-green-700">
            Nouveau
          </Button>
          <Button
            onClick={handleEditClick}
            disabled={!selectedActionneur}
            variant="outline"
          >
            Modifier
          </Button>
          <Button
            onClick={handleDeleteClick}
            disabled={!selectedActionneur}
            variant="outline"
          >
            Supprimer
          </Button>
          <Button
            onClick={handlePrintClick}
            variant="outline"
            className="ml-auto"
            size="sm"
          >
            <Printer size={16} className="mr-2" />
            Imprimer
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Actionneurs</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <TanStackTable
            columns={columns}
            data={tableData}
            searchField="Num_Serie"
            searchPlaceholder="N° série, type..."
            isLoading={isLoading}
            emptyMessage="Aucun actionneur trouvé"
            selectedRowId={selectedActionneur?.Id_Actionneur}
            onRowClick={(row: ActionneursRow) => {
              setSelectedActionneur(actionneurs?.find(a => a.Id_Actionneur === row.Id_Actionneur) || null);
            }}
          />
        </CardContent>
      </Card>

      <Actionneur_Modal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        actionneur={selectedActionneur}
        isEditing={isEditing}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cet actionneur ? Cette action ne pourra pas être annulée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600">
            Supprimer
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
