"use client";

import { useState } from "react";
import { useEtalons } from "@/hooks/useEtalons";
import { Etalon } from "@/hooks/useEtalons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EtalonModal } from "./etalon-modal";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { TanStackTable } from "@/components/data-table/tanstack-table";
import { ColumnDef } from "@tanstack/react-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface EtalonsRow {
  Id_Etalon: number;
  Etalon_Numero_Serie: string | null;
  Etat_Etalon: string | null;
}

export function EtalonsClient() {
  const { data: etalons, isLoading } = useEtalons();
  const [selectedEtalon, setSelectedEtalon] = useState<Etalon | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);

  const handleAddClick = () => {
    setSelectedEtalon(null);
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleEditClick = () => {
    if (selectedEtalon) {
      setIsEditing(true);
      setIsModalOpen(true);
    }
  };

  const handleArchiveClick = () => {
    setIsArchiveDialogOpen(true);
  };

  const handleConfirmArchive = () => {
    // TODO: Implement archive API call
    console.log("Archive:", selectedEtalon);
    setIsArchiveDialogOpen(false);
    setSelectedEtalon(null);
  };

  const handleTestClick = () => {
    // TODO: Implement test logic
    console.log("Test:", selectedEtalon);
  };

  // Colonnes TanStack
  const columns: ColumnDef<EtalonsRow>[] = [
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
        <Badge
          variant={
            row.getValue("Etat_Etalon") === "1"
              ? "default"
              : "outline"
          }
        >
          {row.getValue("Etat_Etalon") === "1" ? "Actif" : "Inactif"}
        </Badge>
      ),
    },
  ];

  const tableData: EtalonsRow[] = (etalons || []).map((e) => ({
    Id_Etalon: e.Id_Etalon,
    Etalon_Numero_Serie: e.Etalon_Numero_Serie,
    Etat_Etalon: e.Etat_Etalon,
  }));

  return (
    <main className="flex-1 p-4 md:p-6 space-y-6 animate-fade-in">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Gestion des étalons</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {etalons?.length || 0} étalon{etalons && etalons.length > 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAddClick} variant="default">
              Nouveau
            </Button>
            <Button
              onClick={handleEditClick}
              disabled={!selectedEtalon}
              variant="outline"
            >
              Modifier
            </Button>
            <Button
              onClick={handleArchiveClick}
              disabled={!selectedEtalon}
              variant="outline"
            >
              Archiver
            </Button>
            <Button
              onClick={handleTestClick}
              disabled={!selectedEtalon}
              variant="outline"
            >
              Tester
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <TanStackTable
            columns={columns}
            data={tableData}
            searchPlaceholder="N° série, état..."
            isLoading={isLoading}
            emptyMessage="Aucun étalon trouvé"
            selectedRowId={selectedEtalon?.Id_Etalon}
            onRowClick={(row: EtalonsRow) => {
              setSelectedEtalon(etalons?.find(e => e.Id_Etalon === row.Id_Etalon) || null);
            }}
          />
        </CardContent>
      </Card>

      <EtalonModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        etalon={selectedEtalon}
        isEditing={isEditing}
      />

      <AlertDialog open={isArchiveDialogOpen} onOpenChange={setIsArchiveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer l'archivage</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir archiver cet étalon ? Cette action ne pourra pas être annulée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirmArchive}>
            Archiver
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
