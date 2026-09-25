"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, Pencil, Thermometer } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useAppAccess } from "@/components/access/app-access-provider";

import { useSensors } from "@/hooks/useSensors";
import { useAdjustments } from "@/hooks/useAdjustments";
import { useCalibrations } from "@/hooks/useCalibrations";
import { fetchJson, getJson } from "@/lib/http";
import { parseDbDateTime } from "@/lib/date-display";

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "@/i18n/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { LazyMotion, domAnimation, m } from "motion/react";
import { fadeInUp } from "@/lib/motion-variants";

import { SensorModal } from "./sensor-modal";
import type { AdjustmentRow } from "./_components/adjustments-panel";
import { CalibrationsPanel, type CalibrationRow } from "./_components/calibrations-panel";
import { SensorsTable, toSensorRows } from "./_components/sensors-table";

export function SensorsClient() {
  const queryClient = useQueryClient();
  const t = useTranslations('sensorsPage');
  const { isPack } = useAppAccess();
  const didPrefetchRef = useRef(false);
  const [selectedSensorId, setSelectedSensorId] = useState<number | null>(null);
  const [selectedAdjustmentId, setSelectedAdjustmentId] = useState<number | null>(null);
  const [selectedCalibrationId, setSelectedCalibrationId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [statusTab, setStatusTab] = useState<"active" | "archived">("active");

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
  const { data: calibrations, isLoading: calibrationsLoading, refetch: refetchCalibrations } = useCalibrations(
    selectedSensor?.Sonde_Numero_Serie || null
  );

  const { data: etalonnageWarningDays = 30 } = useQuery({
    queryKey: ["settings", "dashboard:etalonnage_warning_days"],
    queryFn: async () => {
      const payload = await fetchJson<{ value?: string }>("/api/parametres/dashboard:etalonnage_warning_days");
      const parsed = Number(payload?.value ?? "30");
      return Number.isFinite(parsed) && parsed > 0 ? Math.trunc(parsed) : 30;
    },
    staleTime: 60_000,
    retry: false,
  });

  const activeSensors = (sensors || []).filter((sensor) => !sensor.Est_Sonde_Reformee);
  const archivedSensors = (sensors || []).filter((sensor) => Boolean(sensor.Est_Sonde_Reformee));
  const displayedSensors = statusTab === "active" ? activeSensors : archivedSensors;

  const sensorsTableData = toSensorRows(displayedSensors);

  const adjustmentsTableData: AdjustmentRow[] = (adjustments || []).map((calib) => ({
    Id_Ajustage: calib.Id_Ajustage,
    Date_Heure_Ajustage: parseDbDateTime(calib.Date_Heure_Ajustage),
    Operateur: calib.Operateur,
    Unite: calib.Unite,
    Nb_Decimale: calib.Nb_Decimale,
  }));

  const calibrationsTableData: CalibrationRow[] = (calibrations || []).map((etal) => ({
    Id_Etalonnage: etal.Id_Etalonnage,
    Date_Heure_Etalonnage: parseDbDateTime(etal.Date_Heure_Etalonnage),
    Date_Validite: parseDbDateTime(etal.Date_Validite),
    Operateur: etal.Operateur,
    Incertitude: etal.Incertitude === null || etal.Incertitude === undefined ? null : String(etal.Incertitude),
    Duree_Validite_Jours: etal.Duree_Validite_Jours ?? null,
    Valide: parseDbDateTime(etal.Valide),
  }));

  if (sensorsLoading) {
    return (
      <Card className="overflow-hidden rounded-[10px] border-border bg-card shadow-[0_1px_2px_hsl(var(--shadow)/0.06)]">
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
    <LazyMotion features={domAnimation}>
      <m.div
        className="space-y-4"
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
      >
      <Card>
        <CardHeader className="border-b border-border px-3 py-2.5">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Thermometer className="h-4 w-4 text-primary" />
              {t('title_with_count', { count: displayedSensors.length })}
            </CardTitle>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs" asChild>
                <Link href="/admin/sondes/ajustage-import">
                  {t("actions.create_from_adjustment_file")}
                </Link>
              </Button>
              <Button
                size="sm"
                className="h-8 gap-1.5 text-xs"
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
                className="h-8 gap-1.5 text-xs"
                disabled={!selectedSensorId || statusTab === "archived"}
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
        <CardContent className="p-3">
          <Tabs
            value={statusTab}
            onValueChange={(value) => {
              setStatusTab(value as "active" | "archived");
              setSelectedSensorId(null);
              setSelectedAdjustmentId(null);
              setSelectedCalibrationId(null);
            }}
            className="space-y-4"
          >
            <TabsList className="grid h-8 w-auto max-w-md grid-cols-2 gap-0.5 rounded-md border border-border bg-[hsl(var(--surface-muted))] p-0.5 text-muted-foreground">
              <TabsTrigger
                value="active"
                className="h-7 rounded-[5px] px-2.5 text-[13px] font-medium transition-colors duration-150 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/60 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=active]:ring-1 data-[state=active]:ring-border"
              >
                {t('tabs.active', { count: activeSensors.length })}
              </TabsTrigger>
              <TabsTrigger
                value="archived"
                className="h-7 rounded-[5px] px-2.5 text-[13px] font-medium transition-colors duration-150 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/60 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=active]:ring-1 data-[state=active]:ring-border"
              >
                {t('tabs.archived', { count: archivedSensors.length })}
              </TabsTrigger>
            </TabsList>
            <SensorsTable
              sensors={sensorsTableData}
              isLoading={sensorsLoading}
              selectedSensorId={selectedSensorId}
              onSelectSensor={(id) => {
                setSelectedSensorId(id);
                setSelectedAdjustmentId(null);
                setSelectedCalibrationId(null);
              }}
              warningWindowDays={etalonnageWarningDays}
              onEditSensor={(id) => {
                if (statusTab === "archived") return;
                setSelectedSensorId(id);
                setSelectedAdjustmentId(null);
                setSelectedCalibrationId(null);
                setIsEditing(true);
                setIsModalOpen(true);
              }}
            />
          </Tabs>
        </CardContent>
      </Card>

      <div className="mb-12">
        <CalibrationsPanel
          calibrations={calibrationsTableData}
          isLoading={calibrationsLoading}
          selectedCalibrationId={selectedCalibrationId}
          onSelectCalibration={setSelectedCalibrationId}
          warningWindowDays={etalonnageWarningDays}
          onCalibrationUpdated={() => {
            void refetchCalibrations();
            void queryClient.invalidateQueries({ queryKey: ["sensors"] });
          }}
        />
      </div>

      <SensorModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        sensor={selectedSensor || null}
        isEditing={isEditing}
        isPack={isPack}
        adjustments={adjustmentsTableData}
        adjustmentsLoading={adjustmentsLoading}
        selectedAdjustmentId={selectedAdjustmentId}
        onSelectAdjustment={setSelectedAdjustmentId}
      />
      </m.div>
    </LazyMotion>
  );
}



