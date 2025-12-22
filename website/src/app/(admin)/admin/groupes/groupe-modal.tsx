"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Groupe } from "@/hooks/useGroupes";

interface GroupeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupe?: Groupe | null;
  isEditing?: boolean;
}

export function GroupeModal({ open, onOpenChange, groupe, isEditing }: GroupeModalProps) {
  const [nom, setNom] = useState("");
  const [regroupement, setRegroupement] = useState("");

  // Initialiser les champs quand la modale s'ouvre
  useEffect(() => {
    if (open) {
      if (isEditing && groupe) {
        setNom(groupe.Nom_Groupe || "");
        setRegroupement(groupe.Numero_Regroupement || "");
      } else {
        setNom("");
        setRegroupement("");
      }
    }
  }, [open, groupe, isEditing]);

  const handleSubmit = async () => {
    try {
      if (!nom || !regroupement) {
        alert("Veuillez remplir tous les champs");
        return;
      }

      if (isEditing && groupe) {
        // Modifier le groupe existant
        const response = await fetch(`/api/groupes/${groupe.Id_Groupe}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nom,
            regroupement,
          }),
        });

        if (!response.ok) {
          throw new Error("Erreur lors de la modification du groupe");
        }

        console.log("Groupe modifié avec succès");
      } else {
        // Créer un nouveau groupe
        const response = await fetch("/api/groupes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nom,
            regroupement,
          }),
        });

        if (!response.ok) {
          throw new Error("Erreur lors de la création du groupe");
        }

        console.log("Groupe créé avec succès");
      }
      onOpenChange(false);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Modifier le groupe" : "Créer un groupe"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Regroupement */}
          <div className="space-y-2">
            <Label htmlFor="regroupement">Regroupement</Label>
            <Select
              value={regroupement}
              onValueChange={setRegroupement}
            >
              <SelectTrigger id="regroupement">
                <SelectValue placeholder="Sélectionner un regroupement" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Regroupement 1</SelectItem>
                <SelectItem value="2">Regroupement 2</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Nom du groupe */}
          <div className="space-y-2">
            <Label htmlFor="nom">Nom du groupe</Label>
            <Input
              id="nom"
              placeholder="Ex: Groupe A"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit}>
            {isEditing ? "Mettre à jour" : "Créer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
