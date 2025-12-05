"use client";

import { useState } from "react";
import { usePasswordRules } from "@/hooks/usePasswordRules";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export function PasswordRulesSettings() {
  const { data: rules, isLoading } = usePasswordRules();
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  const [editedRules, setEditedRules] = useState({
    min_length: 8,
    min_uppercase: 1,
    min_lowercase: 1,
    min_numbers: 1,
    min_special: 1,
    history_count: 5,
  });

  // Initialiser les valeurs éditées quand les règles sont chargées
  useState(() => {
    if (rules) {
      setEditedRules(rules);
    }
  });

  const handleChange = (field: keyof typeof editedRules, value: string) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= 0) {
      setEditedRules((prev) => ({ ...prev, [field]: numValue }));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Sauvegarder chaque paramètre
      const updates = [
        { key: "security:password_min_length", value: editedRules.min_length.toString() },
        { key: "security:password_min_uppercase", value: editedRules.min_uppercase.toString() },
        { key: "security:password_min_lowercase", value: editedRules.min_lowercase.toString() },
        { key: "security:password_min_numbers", value: editedRules.min_numbers.toString() },
        { key: "security:password_min_special", value: editedRules.min_special.toString() },
        { key: "security:password_history_count", value: editedRules.history_count.toString() },
      ];

      // Mettre à jour chaque paramètre
      for (const update of updates) {
        await fetch(`/api/settings/${update.key}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ value: update.value }),
        });
      }

      // Invalider le cache pour recharger les règles
      queryClient.invalidateQueries({ queryKey: ["password-rules"] });

      toast.success("Règles de mot de passe mises à jour avec succès");
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      toast.error("Erreur lors de la sauvegarde des règles");
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges =
    rules &&
    (editedRules.min_length !== rules.min_length ||
      editedRules.min_uppercase !== rules.min_uppercase ||
      editedRules.min_lowercase !== rules.min_lowercase ||
      editedRules.min_numbers !== rules.min_numbers ||
      editedRules.min_special !== rules.min_special ||
      editedRules.history_count !== rules.history_count);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Longueur minimale */}
        <div className="space-y-2">
          <Label htmlFor="min_length">
            Longueur minimale
          </Label>
          <Input
            id="min_length"
            type="number"
            min={4}
            max={128}
            value={editedRules.min_length}
            onChange={(e) => handleChange("min_length", e.target.value)}
            disabled={isSaving}
          />
          <p className="text-xs text-muted-foreground">
            Nombre minimum de caractères (4-128)
          </p>
        </div>

        {/* Majuscules */}
        <div className="space-y-2">
          <Label htmlFor="min_uppercase">
            Lettres majuscules
          </Label>
          <Input
            id="min_uppercase"
            type="number"
            min={0}
            max={10}
            value={editedRules.min_uppercase}
            onChange={(e) => handleChange("min_uppercase", e.target.value)}
            disabled={isSaving}
          />
          <p className="text-xs text-muted-foreground">
            Nombre minimum de majuscules requises
          </p>
        </div>

        {/* Minuscules */}
        <div className="space-y-2">
          <Label htmlFor="min_lowercase">
            Lettres minuscules
          </Label>
          <Input
            id="min_lowercase"
            type="number"
            min={0}
            max={10}
            value={editedRules.min_lowercase}
            onChange={(e) => handleChange("min_lowercase", e.target.value)}
            disabled={isSaving}
          />
          <p className="text-xs text-muted-foreground">
            Nombre minimum de minuscules requises
          </p>
        </div>

        {/* Chiffres */}
        <div className="space-y-2">
          <Label htmlFor="min_numbers">
            Chiffres
          </Label>
          <Input
            id="min_numbers"
            type="number"
            min={0}
            max={10}
            value={editedRules.min_numbers}
            onChange={(e) => handleChange("min_numbers", e.target.value)}
            disabled={isSaving}
          />
          <p className="text-xs text-muted-foreground">
            Nombre minimum de chiffres requis
          </p>
        </div>

        {/* Caractères spéciaux */}
        <div className="space-y-2">
          <Label htmlFor="min_special">
            Caractères spéciaux
          </Label>
          <Input
            id="min_special"
            type="number"
            min={0}
            max={10}
            value={editedRules.min_special}
            onChange={(e) => handleChange("min_special", e.target.value)}
            disabled={isSaving}
          />
          <p className="text-xs text-muted-foreground">
            Nombre minimum de caractères spéciaux (!@#$%^&*)
          </p>
        </div>

        {/* Historique */}
        <div className="space-y-2">
          <Label htmlFor="history_count">
            Historique des mots de passe
          </Label>
          <Input
            id="history_count"
            type="number"
            min={0}
            max={20}
            value={editedRules.history_count}
            onChange={(e) => handleChange("history_count", e.target.value)}
            disabled={isSaving}
          />
          <p className="text-xs text-muted-foreground">
            Nombre d&apos;anciens mots de passe à vérifier (0-20)
          </p>
        </div>
      </div>

      {/* Bouton de sauvegarde */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sauvegarde...
            </>
          ) : (
            <>
              <Check className="mr-2 h-4 w-4" />
              Enregistrer les modifications
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
