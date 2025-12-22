"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useProbeTypes } from "@/hooks/useProbeTypes";
import { useModules } from "@/hooks/useModules";
import { Sonde } from "@/hooks/useSondes";
import { AlertCircle } from "lucide-react";

interface SondeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  probe?: Sonde | null;
  isEditing?: boolean;
}

export function SondeModal({ open, onOpenChange, probe, isEditing }: SondeModalProps) {
  const [serieNum, setSerieNum] = useState("");
  const [probeType, setProbeType] = useState("");
  const [moduleId, setModuleId] = useState("");

  const { data: probeTypes, isLoading: probeTypesLoading } = useProbeTypes();
  const { data: modules, isLoading: modulesLoading } = useModules();

  // Mettre à jour les champs quand la modale s'ouvre
  useEffect(() => {
    if (open) {
      if (isEditing && probe) {
        setSerieNum(probe.Sonde_Numero_Serie || "");
        setProbeType(probe.Sonde_Numero_Serie?.substring(0, 2) || "");
        setModuleId(probe.Id_Module?.toString() || "");
      } else {
        setSerieNum("");
        setProbeType("");
        setModuleId("");
      }
    }
  }, [open, probe, isEditing]);

  const handleSerieChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Enlever les caractères non-numériques
    const onlyNumbers = e.target.value.replace(/\D/g, "");
    setSerieNum(onlyNumbers);
  };

  const handleSubmit = () => {
    // TODO: Implémenter la création/modification
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Modifier la sonde" : "Ajouter une sonde"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Type de sonde */}
          <div className="space-y-2">
            <Label htmlFor="probe-type">Type de sonde</Label>
            <Select
              value={probeType}
              onValueChange={setProbeType}
              disabled={isEditing}
            >
              <SelectTrigger id="probe-type" disabled={probeTypesLoading || isEditing}>
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

          {/* Numéro de série */}
          <div className="space-y-2">
            <Label htmlFor="serie-num">Numéro de série</Label>
            <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
              <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertDescription className="text-sm text-blue-800 dark:text-blue-300">
                Uniquement les chiffres
              </AlertDescription>
            </Alert>
            <Input
              id="serie-num"
              placeholder="Ex: 00002"
              value={serieNum}
              onChange={handleSerieChange}
              readOnly={isEditing}
              className={isEditing ? "bg-muted opacity-50" : ""}
            />
          </div>

          {/* Module */}
          <div className="space-y-2">
            <Label htmlFor="module">Module</Label>
            <Select
              value={moduleId}
              onValueChange={setModuleId}
            >
              <SelectTrigger id="module" disabled={modulesLoading}>
                <SelectValue placeholder="Sélectionner un module" />
              </SelectTrigger>
              <SelectContent>
                {modules?.map((mod) => (
                  <SelectItem key={mod.Id_Module} value={mod.Id_Module.toString()}>
                    Module sur port {mod.Port_Serie || "N/A"}
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
            {isEditing ? "Mettre à jour" : "Ajouter"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
