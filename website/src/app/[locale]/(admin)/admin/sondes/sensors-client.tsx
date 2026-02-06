"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

import { useSensors } from "@/hooks/useSensors";
import { useAdjustments } from "@/hooks/useAdjustments";
import { useCalibrations } from "@/hooks/useCalibrations";
import { getJson } from "@/lib/http";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { SensorModal } from "./sensor-modal";
import { AdjustmentsPanel, type AdjustmentRow } from "./_components/adjustments-panel";
import { CalibrationsPanel, type CalibrationRow } from "./_components/calibrations-panel";
import { SensorsTable, toSensorRows } from "./_components/sensors-table";

export function SensorsClient() {
  const queryClient = useQueryClient();
  const t = useTranslations('sensorsPage');
  const didPrefetchRef = useRef(false);
  const [selectedSensorId, setSelectedSensorId] = useState<number | null>(null);
  const [selectedAdjustmentId, setSelectedAdjustmentId] = useState<number | null>(null);
  const [selectedCalibrationId, setSelectedCalibrationId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const { data: sensors, isLoading: sensorsLoading } = useSensors();
  const selectedSensor = sensors?.find((s) => s.Id_Sonde === selectedSensorId);

  useEffect(() => {
    if (sensorsLoading || didPrefetchRef.current) return;
    didPrefetchRef.current = true;

    queryClient.prefetchQuery({
      queryKey: ["sensorTypes"],
      queryFn: () => getJson("/api/sondes/types"),
    });
    queryClient.prefetchQuery({
      queryKey: ["modules"],
      queryFn: () => getJson("/api/modules"),
      staleTime: 60000,
    });
  }, [sensorsLoading, queryClient]);

  const { data: adjustments, isLoading: adjustmentsLoading } = useAdjustments(
    selectedSensor?.Sonde_Numero_Serie || null
  );
  const { data: calibrations, isLoading: calibrationsLoading } = useCalibrations(
    selectedSensor?.Sonde_Numero_Serie || null
  );

  const sensorsTableData = toSensorRows(sensors || []);

  const adjustmentsTableData: AdjustmentRow[] = (adjustments || []).map((calib) => ({
    Id_Ajustage: calib.Id_Ajustage,
    Date_Heure_Ajustage: calib.Date_Heure_Ajustage,
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

  if (sensorsLoading) {
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
            <CardTitle>{t('title', { count: sensors?.length || 0 })}</CardTitle>
            <div className="flex gap-2">
              <Button size="sm" className="gap-2" asChild>
                <Link href="/admin/sondes/ajustage-import">
                  {t("actions.create_from_adjustment_file")}
                </Link>
              </Button>
              <Button
                size="sm"
                className="gap-2"
                onClick={() => {
                  setIsEditing(false);
                  setIsModalOpen(true);
                }}
              >
                <Plus className="w-4 h-4" />
                {t('actions.add')}
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={!selectedSensorId}
                className="gap-2"
                onClick={() => {
                  setIsEditing(true);
                  setIsModalOpen(true);
                }}
              >
                <Pencil className="w-4 h-4" />
                {t('actions.edit')}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-2 md:p-4 xl:p-4">
          <SensorsTable
            sensors={sensorsTableData}
            isLoading={sensorsLoading}
            selectedSensorId={selectedSensorId}
            onSelectSensor={(id) => {
              setSelectedSensorId(id);
              setSelectedAdjustmentId(null);
              setSelectedCalibrationId(null);
            }}
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
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

      <SensorModal open={isModalOpen} onOpenChange={setIsModalOpen} sensor={selectedSensor || null} isEditing={isEditing} />
    </div>
  );
}

