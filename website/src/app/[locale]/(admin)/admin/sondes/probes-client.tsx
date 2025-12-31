"use client";

import { useState } from "react";
import { Plus, Pencil, Printer } from "lucide-react";

import { useProbes } from "@/hooks/useProbes";
import { useAdjustments } from "@/hooks/useAdjustments";
import { useCalibrations } from "@/hooks/useCalibrations";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { ProbeModal } from "./probe-modal";
import { AdjustmentsPanel, type AdjustmentRow } from "./_components/adjustments-panel";
import { CalibrationsPanel, type CalibrationRow } from "./_components/calibrations-panel";
import { ProbesTable, toProbeRows } from "./_components/probes-table";

export function ProbesClient() {
  const [selectedProbeId, setSelectedProbeId] = useState<number | null>(null);
  const [selectedAdjustmentId, setSelectedAdjustmentId] = useState<number | null>(null);
  const [selectedCalibrationId, setSelectedCalibrationId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const { data: probes, isLoading: probesLoading } = useProbes();
  const selectedProbe = probes?.find((s) => s.Id_Sonde === selectedProbeId);

  const { data: adjustments, isLoading: adjustmentsLoading } = useAdjustments(
    selectedProbe?.Sonde_Numero_Serie || null
  );
  const { data: calibrations, isLoading: calibrationsLoading } = useCalibrations(
    selectedProbe?.Sonde_Numero_Serie || null
  );

  const probesTableData = toProbeRows(probes || []);

  const adjustmentsTableData: AdjustmentRow[] = (adjustments || []).map((calib) => ({
    Id_Calibrage: calib.Id_Calibrage,
    Date_Heure_Calibrage: calib.Date_Heure_Calibrage,
    Operateur: calib.Operateur,
    Unite: calib.Unite,
    Nb_Decimale: calib.Nb_Decimale,
  }));

  const calibrationsTableData: CalibrationRow[] = (calibrations || []).map((etal) => ({
    Id_Etalonnage: etal.Id_Etalonnage,
    Date_Heure_Etalonnage: etal.Date_Heure_Etalonnage,
    Date_Validite: etal.Date_Validite,
    Operateur: etal.Operateur,
    Incertitude: etal.Incertitude,
  }));

  if (probesLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Sondes ({probes?.length || 0})</CardTitle>
            <div className="flex gap-2">
              <Button
                size="sm"
                className="gap-2"
                onClick={() => {
                  setIsEditing(false);
                  setIsModalOpen(true);
                }}
              >
                <Plus className="w-4 h-4" />
                Ajouter
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={!selectedProbeId}
                className="gap-2"
                onClick={() => {
                  setIsEditing(true);
                  setIsModalOpen(true);
                }}
              >
                <Pencil className="w-4 h-4" />
                Modifier
              </Button>
              <Button size="sm" variant="outline" onClick={() => window.print()} className="gap-2">
                <Printer className="w-4 h-4" />
                Imprimer
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-2 md:p-4 xl:p-4">
          <ProbesTable
            probes={probesTableData}
            isLoading={probesLoading}
            selectedProbeId={selectedProbeId}
            onSelectProbe={(id) => {
              setSelectedProbeId(id);
              setSelectedAdjustmentId(null);
              setSelectedCalibrationId(null);
            }}
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AdjustmentsPanel
          adjustments={adjustmentsTableData}
          isLoading={adjustmentsLoading}
          selectedAdjustmentId={selectedAdjustmentId}
          onSelectAdjustment={setSelectedAdjustmentId}
        />
        <CalibrationsPanel
          calibrations={calibrationsTableData}
          isLoading={calibrationsLoading}
          selectedCalibrationId={selectedCalibrationId}
          onSelectCalibration={setSelectedCalibrationId}
        />
      </div>

      <ProbeModal open={isModalOpen} onOpenChange={setIsModalOpen} probe={selectedProbe || null} isEditing={isEditing} />
    </div>
  );
}

