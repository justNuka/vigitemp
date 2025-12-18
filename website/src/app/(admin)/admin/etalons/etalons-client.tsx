"use client";

import { useState } from "react";
import { useEtalons } from "@/hooks/useEtalons";
import { Etalon } from "@/hooks/useEtalons";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EtalonModal } from "./etalon-modal";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

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

  if (isLoading) {
    return <div className="flex justify-center items-center h-96">Chargement...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button onClick={handleAddClick} className="bg-green-600 hover:bg-green-700">
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

      <div className="border rounded-lg max-h-96 overflow-y-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-muted">
            <TableRow>
              <TableHead>Numéro de série</TableHead>
              <TableHead>Date certificat</TableHead>
              <TableHead>État actuel</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {etalons?.map((etalon) => (
              <TableRow
                key={etalon.Id_Etalon}
                onClick={() => setSelectedEtalon(etalon)}
                className={cn(
                  "cursor-pointer hover:bg-muted/50 transition-colors",
                  selectedEtalon?.Id_Etalon === etalon.Id_Etalon &&
                    "bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-100 font-medium border-l-4 border-l-blue-600 dark:border-l-blue-400"
                )}
              >
                <TableCell>{etalon.Etalon_Numero_Serie}</TableCell>
                <TableCell>-</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      etalon.Etat_Etalon === "1"
                        ? "default"
                        : "outline"
                    }
                  >
                    {etalon.Etat_Etalon === "1" ? "Actif" : "Inactif"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

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
    </div>
  );
}
