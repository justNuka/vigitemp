"use client";

import { useState } from "react";
import { useActionneurs } from "@/hooks/useActionneurs";
import { Actionneur } from "@/hooks/useActionneurs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Actionneur_Modal } from "./actionneur-modal";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { Printer } from "lucide-react";

export function ActionneursClient() {
  const { data: actionneurs, isLoading } = useActionneurs();
  const [selectedActionneur, setSelectedActionneur] = useState<Actionneur | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

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

  if (isLoading) {
    return <div className="flex justify-center items-center h-96">Chargement...</div>;
  }

  // Filtrer les actionneurs selon la recherche
  const filteredActionneurs = (actionneurs || []).filter((actionneur) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      String(actionneur.Num_Serie || "").toLowerCase().includes(searchLower) ||
      String(actionneur.Type || "").toLowerCase().includes(searchLower) ||
      String(actionneur.Commentaire || "").toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label htmlFor="search" className="text-sm font-medium block mb-2">
            Rechercher
          </label>
          <Input
            id="search"
            placeholder="N° série, type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
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

      <div className="border rounded-lg max-h-96 overflow-y-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-muted">
            <TableRow>
              <TableHead>Numéro de série</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Commentaire</TableHead>
              <TableHead>État</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredActionneurs?.map((actionneur) => (
              <TableRow
                key={actionneur.Id_Actionneur}
                onClick={() => setSelectedActionneur(actionneur)}
                className={cn(
                  "cursor-pointer hover:bg-muted/50 transition-colors",
                  selectedActionneur?.Id_Actionneur === actionneur.Id_Actionneur &&
                    "bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-100 font-medium border-l-4 border-l-blue-600 dark:border-l-blue-400"
                )}
              >
                <TableCell>{actionneur.Num_Serie}</TableCell>
                <TableCell>{actionneur.Type}</TableCell>
                <TableCell>{actionneur.Commentaire}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      actionneur.Est_Etat
                        ? "default"
                        : "outline"
                    }
                  >
                    {actionneur.Est_Etat ? "Actif" : "Inactif"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

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
