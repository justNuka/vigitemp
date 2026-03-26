"use client";

import { useState } from "react";
import { usePasswordRules } from "@/hooks/usePasswordRules";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { SwitchWithLoading } from "@/components/ui/switch-with-loading";
import { Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { patchJson } from "@/lib/http";
import { useTranslations } from "next-intl";

export function PasswordRulesSettings() {
  const t = useTranslations("passwordRulesSettings");
  const { data: rules, isLoading } = usePasswordRules();
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  const [cfr21Saving, setCfr21Saving] = useState(false);
  const [editedRules, setEditedRules] = useState({
    min_length: 8,
    min_uppercase: 1,
    min_lowercase: 1,
    min_numbers: 1,
    min_special: 1,
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
      // Sauvegarder chaque paramètre avec les nouveaux noms
      const updates = [
        { key: "SECURITE_MOT_DE_PASSE:LONGUEUR_MINIMALE", value: editedRules.min_length.toString() },
        { key: "SECURITE_MOT_DE_PASSE:MIN_LETTRES_MAJUSCULES", value: editedRules.min_uppercase.toString() },
        { key: "SECURITE_MOT_DE_PASSE:MIN_LETTRES_MINUSCULES", value: editedRules.min_lowercase.toString() },
        { key: "SECURITE_MOT_DE_PASSE:MIN_CHIFFRES", value: editedRules.min_numbers.toString() },
        { key: "SECURITE_MOT_DE_PASSE:MIN_CARACTERES_SPECIAUX", value: editedRules.min_special.toString() },
      ];

      // Mettre à jour chaque paramètre
      for (const update of updates) {
        await patchJson(`/api/parametres/${update.key}`, { value: update.value });
      }

      // Invalider le cache pour recharger les règles
      queryClient.invalidateQueries({ queryKey: ["password-rules"] });

      toast.success(t("toast.save_success"));
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      toast.error(t("toast.save_error"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCFR21Toggle = async (field: string, newValue: boolean) => {
    setCfr21Saving(true);
    try {
      const key = `CFR21:${field}`;
      const value = newValue ? "1" : "0";
      
      await patchJson(`/api/parametres/${key}`, { value });

      // Si CFR21 est désactivé, réinitialiser JOURS_VALIDITE_MOT_DE_PASSE à 0
      if (field === "ACTIVATION_NORME_CFR21" && !newValue) {
        await patchJson(`/api/parametres/CFR21:JOURS_VALIDITE_MOT_DE_PASSE`, { value: "0" });
      }

      // Invalider le cache pour recharger les règles
      queryClient.invalidateQueries({ queryKey: ["password-rules"] });

      toast.success(t("toast.cfr21_success"));
    } catch (error) {
      console.error("Erreur lors de la sauvegarde CFR21:", error);
      toast.error(t("toast.cfr21_error"));
    } finally {
      setCfr21Saving(false);
    }
  };

  const hasChanges =
    rules &&
    (editedRules.min_length !== rules.min_length ||
      editedRules.min_uppercase !== rules.min_uppercase ||
      editedRules.min_lowercase !== rules.min_lowercase ||
      editedRules.min_numbers !== rules.min_numbers ||
      editedRules.min_special !== rules.min_special);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Règles de complexity */}
      <div>
        <h3 className="text-sm font-medium mb-4">{t("complexity.title")}</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Longueur minimale */}
          <div className="space-y-2">
            <Label htmlFor="min_length">
              {t("complexity.min_length.label")}
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
              {t("complexity.min_length.helper")}
            </p>
          </div>

          {/* Majuscules */}
          <div className="space-y-2">
            <Label htmlFor="min_uppercase">
              {t("complexity.uppercase.label")}
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
              {t("complexity.uppercase.helper")}
            </p>
          </div>

          {/* Minuscules */}
          <div className="space-y-2">
            <Label htmlFor="min_lowercase">
              {t("complexity.lowercase.label")}
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
              {t("complexity.lowercase.helper")}
            </p>
          </div>

          {/* Chiffres */}
          <div className="space-y-2">
            <Label htmlFor="min_numbers">
              {t("complexity.numbers.label")}
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
              {t("complexity.numbers.helper")}
            </p>
          </div>

          {/* Caractères spéciaux */}
          <div className="space-y-2">
            <Label htmlFor="min_special">
              {t("complexity.special.label")}
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
              {t("complexity.special.helper")}
            </p>
          </div>
        </div>

        {/* Bouton de sauvegarde */}
        <div className="flex justify-end mt-6">
          <Button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("actions.saving")}
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                {t("actions.save")}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Paramètres CFR21 */}
      <div className="border-t pt-6">
        <h3 className="text-sm font-medium mb-4">{t("cfr21.title")}</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex-1">
              <Label htmlFor="cfr21_enabled" className="font-medium">
                {t("cfr21.enabled.label")}
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                {t("cfr21.enabled.helper")}
              </p>
            </div>
            <SwitchWithLoading
              id="cfr21_enabled"
              checked={rules?.cfr21_enabled ?? false}
              onCheckedChange={(checked) => handleCFR21Toggle("ACTIVATION_NORME_CFR21", checked)}
              isLoading={cfr21Saving}
            />
          </div>

          {rules?.cfr21_enabled && (
            <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/10 p-4 dark:border-primary/25 dark:bg-primary/10">
              <div className="flex-1">
                <Label className="font-medium">
                  {t("cfr21.expiry.label")}
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("cfr21.expiry.helper", { days: rules?.expiry_days || 90 })}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{t("cfr21.expiry.value", { days: rules?.expiry_days || 90 })}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
