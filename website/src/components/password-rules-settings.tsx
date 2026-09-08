"use client";

import { useEffect, useState } from "react";
import { usePasswordRules } from "@/hooks/usePasswordRules";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SwitchWithLoading } from "@/components/ui/switch-with-loading";
import { Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { patchJson } from "@/lib/http";
import { useTranslations } from "next-intl";

const DEFAULT_COMPLEXITY = {
  min_length: 8,
  min_uppercase: 1,
  min_lowercase: 1,
  min_numbers: 1,
  min_special: 1,
};

type ComplexityRules = typeof DEFAULT_COMPLEXITY;

export function PasswordRulesSettings() {
  const t = useTranslations("passwordRulesSettings");
  const tAdmin = useTranslations("adminSettings");
  const { data: rules, isLoading } = usePasswordRules();
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  const [editedRules, setEditedRules] = useState<ComplexityRules>(DEFAULT_COMPLEXITY);
  const [cfr21Enabled, setCfr21Enabled] = useState(false);

  useEffect(() => {
    if (!rules) return;
    setEditedRules({
      min_length: rules.min_length,
      min_uppercase: rules.min_uppercase,
      min_lowercase: rules.min_lowercase,
      min_numbers: rules.min_numbers,
      min_special: rules.min_special,
    });
    setCfr21Enabled(rules.cfr21_enabled);
  }, [rules]);

  const handleChange = (field: keyof ComplexityRules, value: string) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= 0) {
      setEditedRules((prev) => ({ ...prev, [field]: numValue }));
    }
  };

  const hasComplexityChanges =
    Boolean(rules) &&
    (editedRules.min_length !== rules?.min_length ||
      editedRules.min_uppercase !== rules?.min_uppercase ||
      editedRules.min_lowercase !== rules?.min_lowercase ||
      editedRules.min_numbers !== rules?.min_numbers ||
      editedRules.min_special !== rules?.min_special);
  const hasCfr21Changes = Boolean(rules) && cfr21Enabled !== rules?.cfr21_enabled;
  const hasChanges = hasComplexityChanges || hasCfr21Changes;

  const handleSave = async () => {
    if (!rules || !hasChanges || isSaving) return;
    setIsSaving(true);

    try {
      const updates: Array<Promise<unknown>> = [];

      if (editedRules.min_length !== rules.min_length) {
        updates.push(
          patchJson("/api/parametres/SECURITE_MOT_DE_PASSE:LONGUEUR_MINIMALE", {
            value: editedRules.min_length.toString(),
          }),
        );
      }
      if (editedRules.min_uppercase !== rules.min_uppercase) {
        updates.push(
          patchJson("/api/parametres/SECURITE_MOT_DE_PASSE:MIN_LETTRES_MAJUSCULES", {
            value: editedRules.min_uppercase.toString(),
          }),
        );
      }
      if (editedRules.min_lowercase !== rules.min_lowercase) {
        updates.push(
          patchJson("/api/parametres/SECURITE_MOT_DE_PASSE:MIN_LETTRES_MINUSCULES", {
            value: editedRules.min_lowercase.toString(),
          }),
        );
      }
      if (editedRules.min_numbers !== rules.min_numbers) {
        updates.push(
          patchJson("/api/parametres/SECURITE_MOT_DE_PASSE:MIN_CHIFFRES", {
            value: editedRules.min_numbers.toString(),
          }),
        );
      }
      if (editedRules.min_special !== rules.min_special) {
        updates.push(
          patchJson("/api/parametres/SECURITE_MOT_DE_PASSE:MIN_CARACTERES_SPECIAUX", {
            value: editedRules.min_special.toString(),
          }),
        );
      }
      if (cfr21Enabled !== rules.cfr21_enabled) {
        updates.push(
          patchJson("/api/parametres/CFR21:ACTIVATION_NORME_CFR21", {
            value: cfr21Enabled ? "1" : "0",
          }),
        );
      }

      await Promise.all(updates);
      await queryClient.invalidateQueries({ queryKey: ["password-rules"] });
      toast.success(t("toast.save_success"));
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      toast.error(t("toast.save_error"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (!rules) return;
    setEditedRules({
      min_length: rules.min_length,
      min_uppercase: rules.min_uppercase,
      min_lowercase: rules.min_lowercase,
      min_numbers: rules.min_numbers,
      min_special: rules.min_special,
    });
    setCfr21Enabled(rules.cfr21_enabled);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium mb-4">{t("complexity.title")}</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="min_length">{t("complexity.min_length.label")}</Label>
            <Input
              id="min_length"
              type="number"
              min={4}
              max={24}
              value={editedRules.min_length}
              onChange={(e) => handleChange("min_length", e.target.value)}
              disabled={isSaving}
            />
            <p className="text-xs text-muted-foreground">{t("complexity.min_length.helper")}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="min_uppercase">{t("complexity.uppercase.label")}</Label>
            <Input
              id="min_uppercase"
              type="number"
              min={0}
              max={10}
              value={editedRules.min_uppercase}
              onChange={(e) => handleChange("min_uppercase", e.target.value)}
              disabled={isSaving}
            />
            <p className="text-xs text-muted-foreground">{t("complexity.uppercase.helper")}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="min_lowercase">{t("complexity.lowercase.label")}</Label>
            <Input
              id="min_lowercase"
              type="number"
              min={0}
              max={10}
              value={editedRules.min_lowercase}
              onChange={(e) => handleChange("min_lowercase", e.target.value)}
              disabled={isSaving}
            />
            <p className="text-xs text-muted-foreground">{t("complexity.lowercase.helper")}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="min_numbers">{t("complexity.numbers.label")}</Label>
            <Input
              id="min_numbers"
              type="number"
              min={0}
              max={10}
              value={editedRules.min_numbers}
              onChange={(e) => handleChange("min_numbers", e.target.value)}
              disabled={isSaving}
            />
            <p className="text-xs text-muted-foreground">{t("complexity.numbers.helper")}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="min_special">{t("complexity.special.label")}</Label>
            <Input
              id="min_special"
              type="number"
              min={0}
              max={10}
              value={editedRules.min_special}
              onChange={(e) => handleChange("min_special", e.target.value)}
              disabled={isSaving}
            />
            <p className="text-xs text-muted-foreground">{t("complexity.special.helper")}</p>
          </div>
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-sm font-medium mb-4">{t("cfr21.title")}</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex-1">
              <Label htmlFor="cfr21_enabled" className="font-medium">
                {t("cfr21.enabled.label")}
              </Label>
              <p className="text-sm text-muted-foreground mt-1">{t("cfr21.enabled.helper")}</p>
            </div>
            <SwitchWithLoading
              id="cfr21_enabled"
              checked={cfr21Enabled}
              onCheckedChange={setCfr21Enabled}
              isLoading={isSaving}
            />
          </div>

          {cfr21Enabled && rules ? (
            <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/10 p-4 dark:border-primary/25 dark:bg-primary/10">
              <div className="flex-1">
                <Label className="font-medium">{t("cfr21.expiry.label")}</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("cfr21.expiry.helper", { days: rules.expiry_days || 90 })}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{t("cfr21.expiry.value", { days: rules.expiry_days || 90 })}</p>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {hasChanges ? (
        <div className="flex justify-end gap-2 border-t pt-4">
          <Button type="button" variant="outline" onClick={handleCancel} disabled={isSaving}>
            {tAdmin("pending_changes.cancel")}
          </Button>
          <Button type="button" onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
            {isSaving ? t("actions.saving") : tAdmin("pending_changes.save")}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
