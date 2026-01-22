"use client";

import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Combobox } from "@/components/ui/combobox";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useProbeTypes } from "@/hooks/useProbeTypes";
import { useModules } from "@/hooks/useModules";
import type { Probe } from "@/hooks/useProbes";
import { AlertCircle } from "lucide-react";
import { patchJson, postJson } from "@/lib/http";
import { toast } from "sonner";
import { useRouter } from '@/i18n/navigation';

interface ProbeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  probe?: Probe | null;
  isEditing?: boolean;
}

export function ProbeModal({ open, onOpenChange, probe, isEditing }: ProbeModalProps) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const isEdit = Boolean(isEditing && probe);
  const probeKey = (probe as any)?.Id_Sonde ?? probe?.Sonde_Numero_Serie ?? "new";
  const contentKey = `${isEdit ? "edit" : "new"}-${probeKey}-${open ? "open" : "closed"}`;

  const [serieNum, setSerieNum] = useState("");
  const [probeType, setProbeType] = useState("");
  const [moduleId, setModuleId] = useState("");

  const { data: probeTypes, isLoading: probeTypesLoading } = useProbeTypes();
  const { data: modules, isLoading: modulesLoading } = useModules();

  const displayedSerieNum = isEdit ? probe?.Sonde_Numero_Serie || "" : serieNum;
  const displayedProbeType = useMemo(() => {
    if (!isEdit) return probeType;
    return probe?.Sonde_Numero_Serie?.substring(0, 2) || "";
  }, [isEdit, probe?.Sonde_Numero_Serie, probeType]);

  const displayedModuleId = useMemo(() => {
    if (!isEdit) return moduleId;
    return moduleId || probe?.Id_Module?.toString() || "";
  }, [isEdit, moduleId, probe?.Id_Module]);

  const handleSerieChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const normalized = e.target.value.toUpperCase();
    const cleaned = normalized.replace(/[^0-9TH]/g, "");
    const suffix = cleaned.endsWith("T") ? "T" : cleaned.endsWith("H") ? "H" : "";
    const digits = suffix ? cleaned.slice(0, -1).replace(/[^0-9]/g, "") : cleaned.replace(/[^0-9]/g, "");
    setSerieNum(suffix ? `${digits}-${suffix}` : digits);
  };

  const handleSubmit = async () => {
    try {
      const moduleIdNumber = displayedModuleId ? parseInt(displayedModuleId, 10) : null;
      const moduleIdValue = Number.isNaN(moduleIdNumber) ? null : moduleIdNumber;

      if (isEdit) {
        if (!probe?.Id_Sonde) {
          toast.error("Sonde invalide");
          return;
        }

        await patchJson(`/api/sondes/${probe.Id_Sonde}`, { moduleId: moduleIdValue });
        toast.success("Sonde mise à jour");
      } else {
        if (!displayedProbeType) {
          toast.error("Type de sonde requis");
          return;
        }
        if (!displayedSerieNum) {
          toast.error("Numéro de série requis");
          return;
        }

        await postJson(`/api/sondes`, {
          sondeType: displayedProbeType,
          serieNum: displayedSerieNum,
          moduleId: moduleIdValue,
        });
        toast.success("Sonde créée");
      }

      await queryClient.invalidateQueries({ queryKey: ["probes"] });
      router.refresh();
      setSerieNum("");
      setProbeType("");
      setModuleId("");
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur serveur");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent key={contentKey} className="sm:max-w-125 bg-white dark:bg-card">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Modifier la sonde" : "Ajouter une sonde"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="probe-type">Type de sonde</Label>
            <Select value={displayedProbeType} onValueChange={setProbeType} disabled={isEdit}>
              <SelectTrigger id="probe-type" disabled={probeTypesLoading || isEdit}>
                <SelectValue placeholder="Sélectionner un type" />
              </SelectTrigger>
              <SelectContent>
                {probeTypes?.map((type) => (
                  <SelectItem key={type.Sonde_Type} value={type.Sonde_Type}>
                    {type.Sonde_Type} ({type.Libelle_Sonde_Type || "-"})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="serie-num">Numéro de série</Label>
            <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
              <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertDescription className="text-sm text-blue-800 dark:text-blue-300">
                Chiffres + suffixe optionnel -T ou -H
              </AlertDescription>
            </Alert>
            <Input
              id="serie-num"
              placeholder="Ex: 00002"
              value={displayedSerieNum}
              onChange={handleSerieChange}
              readOnly={isEdit}
              className={isEdit ? "bg-muted opacity-50" : ""}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="module">Module</Label>
            <Combobox
              triggerId="module"
              value={displayedModuleId}
              onValueChange={setModuleId}
              disabled={modulesLoading}
              placeholder="Sélectionner un module"
              searchPlaceholder="Rechercher un module..."
              emptyMessage="Aucun module"
              options={(modules ?? []).map((mod) => ({
                value: mod.Id_Module.toString(),
                label: `Module ${mod.Module_Numero_Serie || mod.Libelle_Type_Module || mod.Id_Module} sur port ${
                  mod.Port_Serie || "N/A"
                } (${mod.Emplacement || "-"})`,
                searchText: `${mod.Module_Numero_Serie || ""} ${mod.Libelle_Type_Module || ""} ${
                  mod.Port_Serie || ""
                } ${mod.Emplacement || ""} ${mod.Id_Module}`,
              }))}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit}>{isEdit ? "Mettre à jour" : "Ajouter"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
