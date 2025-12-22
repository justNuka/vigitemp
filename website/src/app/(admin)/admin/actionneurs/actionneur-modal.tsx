"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useActionneursTypes } from "@/hooks/useActionneursTypes";
import { useLieux } from "@/hooks/useLieux";
import { Actionneur } from "@/hooks/useActionneurs";

interface Actionneur_ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actionneur?: Actionneur | null;
  isEditing?: boolean;
}

export function Actionneur_Modal({ open, onOpenChange, actionneur, isEditing }: Actionneur_ModalProps) {
  const [type, setType] = useState("");
  const [serie, setSerie] = useState("");
  const [commentaire, setCommentaire] = useState("");
  const [lieuId, setLieuId] = useState("");

  const { data: types, isLoading: typesLoading } = useActionneursTypes();
  const { data: lieux, isLoading: lieuxLoading } = useLieux();

  // Initialiser les champs quand la modale s'ouvre
  useEffect(() => {
    if (open) {
      if (isEditing && actionneur) {
        setType(actionneur.Type?.toString() || "");
        setSerie(actionneur.Num_Serie || "");
        setCommentaire(actionneur.Commentaire || "");
        setLieuId(actionneur.Id_Lieu?.toString() || "");
      } else {
        setType("");
        setSerie("");
        setCommentaire("");
        setLieuId("");
      }
    }
  }, [open, actionneur, isEditing]);

  const handleSubmit = async () => {
    try {
      if (isEditing && actionneur) {
        // Modifier l'actionneur existant
        const response = await fetch(`/api/actionneurs/${actionneur.Id_Actionneur}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type,
            serie,
            commentaire,
            lieuId,
          }),
        });

        if (!response.ok) {
          throw new Error("Erreur lors de la modification de l'actionneur");
        }

        console.log("Actionneur modifié avec succès");
      } else {
        // Créer un nouvel actionneur
        const response = await fetch("/api/actionneurs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type,
            serie,
            commentaire,
            lieuId,
          }),
        });

        if (!response.ok) {
          throw new Error("Erreur lors de la création de l'actionneur");
        }

        console.log("Actionneur créé avec succès");
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
            {isEditing ? "Modifier l'actionneur" : "Créer un actionneur"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Type d'actionneur</Label>
            <Select
              value={type}
              onValueChange={setType}
              disabled={isEditing}
            >
              <SelectTrigger id="type" disabled={typesLoading || isEditing}>
                <SelectValue placeholder="Sélectionner un type" />
              </SelectTrigger>
              <SelectContent>
                {types?.map((t) => (
                  <SelectItem key={t.Type} value={t.Type?.toString() || ""}>
                    {t.Description || `Type ${t.Type}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Numéro de série */}
          <div className="space-y-2">
            <Label htmlFor="serie">Numéro de série</Label>
            <Input
              id="serie"
              placeholder="Ex: 00001"
              value={serie}
              onChange={(e) => setSerie(e.target.value)}
            />
          </div>

          {/* Commentaire */}
          <div className="space-y-2">
            <Label htmlFor="commentaire">Commentaire</Label>
            <Input
              id="commentaire"
              placeholder="Commentaire..."
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
            />
          </div>

          {/* Lieu */}
          <div className="space-y-2">
            <Label htmlFor="lieu">Lieu</Label>
            <Select
              value={lieuId}
              onValueChange={setLieuId}
            >
              <SelectTrigger id="lieu" disabled={lieuxLoading}>
                <SelectValue placeholder="Sélectionner un lieu" />
              </SelectTrigger>
              <SelectContent>
                {lieux?.map((l) => (
                  <SelectItem key={l.Id_Lieu} value={l.Id_Lieu.toString()}>
                    {l.Nom_Lieu || `Lieu ${l.Id_Lieu}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
