"use client";

import { LazyMotion, domAnimation, m } from "motion/react";
import { fadeInUp } from "@/lib/motion-variants";
import { useEffect, useRef, useState } from "react";
import { Archive, Cpu, Pencil, Plus, Thermometer } from "lucide-react";
import { useRouter } from '@/i18n/navigation';
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { useModules, useModuleSondes } from "@/hooks/useModules";
import { useSensors } from "@/hooks/useSensors";
import { deleteJson, getJson, HttpError } from "@/lib/http";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { SensorModal } from "../sondes/sensor-modal";

import { ModuleModal } from "./module-modal";
import { ModulesTable, type ModuleRow } from "./_components/modules-table";
import { SensorsTable, type SensorRow } from "./_components/sensors-table";
import { useTranslations } from 'next-intl';

export function ModulesClient() {
  const t = useTranslations('modulesPage');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const queryClient = useQueryClient();
  const didPrefetchRef = useRef(false);
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);
  const [selectedSondeId, setSelectedSondeId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [archiveConfirmOpen, setArchiveConfirmOpen] = useState(false);
  const [archiveBlockedOpen, setArchiveBlockedOpen] = useState(false);
  const [archiveBlockedMessage, setArchiveBlockedMessage] = useState<string | null>(null);
  const [statusTab, setStatusTab] = useState<"active" | "archived">("active");
  const [isSensorModalOpen, setIsSensorModalOpen] = useState(false);

  const { data: modules, isLoading: modulesLoading, refetch: refetchModules } = useModules(true, "all");
  const { data: sondes, isLoading: sondesLoading } = useModuleSondes(selectedModuleId);
  const { data: allSensors = [] } = useSensors();
  const selectedSensor = selectedSondeId
    ? allSensors.find((sensor) => sensor.Id_Sonde === selectedSondeId) ?? null
    : null;

  useEffect(() => {
    if (modulesLoading || didPrefetchRef.current) return;
    didPrefetchRef.current = true;

    queryClient.prefetchQuery({
      queryKey: ["module-types"],
      queryFn: () => getJson("/api/modules/types"),
      staleTime: 60000,
    });
  }, [modulesLoading, queryClient]);

  const activeModules = (modules || []).filter((module) => !module.Archive);
  const archivedModules = (modules || []).filter((module) => Boolean(module.Archive));
  const displayedModules = statusTab === "active" ? activeModules : archivedModules;
  const selectedModule = selectedModuleId ? displayedModules.find((m) => m.Id_Module === selectedModuleId) : null;

  const modulesTableData: ModuleRow[] = displayedModules.map((m) => ({
    Id_Module: m.Id_Module,
    Libelle_Type_Module: m.Libelle_Type_Module,
    Module_Numero_Serie: m.Module_Numero_Serie,
    Emplacement: m.Emplacement,
    Port_Serie: m.Port_Serie,
    sondes_count: m.sondes_count,
    Id_Worker: m.Id_Worker,
  }));

  const sondesTableData: SensorRow[] = (sondes || []).map((s) => ({
    Id_Sonde: s.Id_Sonde,
    Adresse_Sonde: s.Adresse_Sonde,
    Sonde_Numero_Serie: s.Sonde_Numero_Serie,
    Port_Serie: s.Port_Serie,
    Surveillance_Etat: s.Surveillance_Etat,
  }));


  const handleArchive = async () => {
    if (!selectedModuleId) return;

    try {
      await deleteJson(`/api/modules/${selectedModuleId}`);
      setSelectedModuleId(null);
      refetchModules();
      router.refresh();
      setArchiveConfirmOpen(false);
      toast.success(t('toast.archive_success'));
    } catch (error) {
      if (error instanceof HttpError && error.status === 409) {
        const linked = (error.payload as any)?.linkedSensorsCount;
        const detail =
          typeof linked === 'number' && linked > 0
            ? t('archive_blocked.detail', { count: linked })
            : '';
        setArchiveBlockedMessage(`${error.message}${detail ? ` ${detail}` : ''}`);
        setArchiveBlockedOpen(true);
        return;
      }
      toast.error(error instanceof Error ? error.message : t('toast.archive_error'));
    }
  };

  if (modulesLoading) {
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
        <section className="overflow-hidden rounded-[10px] border border-border bg-card shadow-[0_1px_2px_hsl(var(--shadow)/0.06)]">
          <ModulesTable
            modules={modulesTableData}
            isLoading={modulesLoading}
            selectedModuleId={selectedModuleId}
            onSelectModule={(moduleId) => {
              setSelectedModuleId((current) => (current === moduleId ? null : moduleId));
              setSelectedSondeId(null);
            }}
            onEditModule={(moduleId) => {
              if (statusTab === "archived") return;
              setSelectedModuleId(moduleId);
              setSelectedSondeId(null);
              setIsEditMode(true);
              setIsModalOpen(true);
            }}
            toolbarLeft={
              <Tabs
                value={statusTab}
                onValueChange={(value) => {
                  setStatusTab(value as "active" | "archived");
                  setSelectedModuleId(null);
                  setSelectedSondeId(null);
                }}
              >
                <TabsList className="grid h-8 w-auto grid-cols-2 gap-0.5 rounded-md border border-border bg-[hsl(var(--surface-muted))] p-0.5 text-muted-foreground">
                  <TabsTrigger
                    value="active"
                    className="h-7 rounded-[5px] px-2.5 text-[13px] font-medium transition-colors duration-150 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/60 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=active]:ring-1 data-[state=active]:ring-border"
                  >
                    {t('tabs.active', { count: activeModules.length })}
                  </TabsTrigger>
                  <TabsTrigger
                    value="archived"
                    className="h-7 rounded-[5px] px-2.5 text-[13px] font-medium transition-colors duration-150 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/60 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=active]:ring-1 data-[state=active]:ring-border"
                  >
                    {t('tabs.archived', { count: archivedModules.length })}
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            }
            toolbarRight={
              <>
                <Button
                  size="sm"
                  className="h-8 gap-1.5 text-xs"
                  onClick={() => {
                    setIsEditMode(false);
                    setIsModalOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4" />
                  {t('actions.new')}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!selectedModuleId || statusTab === "archived"}
                  className="h-8 gap-1.5 text-xs"
                  onClick={() => {
                    setIsEditMode(true);
                    setIsModalOpen(true);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                  {t('actions.edit')}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!selectedModuleId || statusTab === "archived"}
                  className="h-8 gap-1.5 text-xs hover:text-[hsl(var(--status-critical))]"
                  onClick={() => setArchiveConfirmOpen(true)}
                >
                  <Archive className="h-4 w-4" />
                  {t('actions.archive')}
                </Button>
              </>
            }
          />
        </section>

        {selectedModuleId && (
          <Card className="overflow-hidden rounded-[10px] border-border bg-card shadow-[0_1px_2px_hsl(var(--shadow)/0.06)]">
            <CardHeader className="border-b border-border px-3 py-2.5">
              <CardTitle className="flex items-center gap-2 text-base">
                <Thermometer className="h-4 w-4 text-primary" />
                {t('associated.title', { count: sondes?.length || 0 })}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              {sondesLoading ? (
                <div className="p-6 space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : sondesTableData.length > 0 ? (
                <SensorsTable
                  sensors={sondesTableData}
                  isLoading={false}
                  selectedSensorId={selectedSondeId}
                  onSelectSensor={setSelectedSondeId}
                  onEditSensor={(sensorId) => {
                    setSelectedSondeId(sensorId);
                    setIsSensorModalOpen(true);
                  }}
                />
              ) : (
                <div className="text-center py-8 text-sm text-muted-foreground">{t('associated.empty')}</div>
              )}
            </CardContent>
          </Card>
        )}

        <ModuleModal
          open={isModalOpen}
          onOpenChange={(open) => {
            setIsModalOpen(open);
            if (!open) {
              setIsEditMode(false);
            }
          }}
          module={isEditMode ? selectedModule : null}
          onSuccess={() => {
            refetchModules();
            router.refresh();
            setSelectedModuleId(null);
            setIsEditMode(false);
          }}
        />

        <AlertDialog open={archiveConfirmOpen} onOpenChange={setArchiveConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('archive.title')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('archive.description')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogCancel>{tCommon('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleArchive}>{t('archive.confirm')}</AlertDialogAction>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={archiveBlockedOpen} onOpenChange={setArchiveBlockedOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('archive_blocked.title')}</AlertDialogTitle>
              <AlertDialogDescription>
                {archiveBlockedMessage || t('archive_blocked.default')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogAction onClick={() => setArchiveBlockedOpen(false)}>{tCommon('confirm')}</AlertDialogAction>
          </AlertDialogContent>
        </AlertDialog>

        <SensorModal
          open={isSensorModalOpen && !!selectedSensor}
          onOpenChange={setIsSensorModalOpen}
          sensor={selectedSensor}
          isEditing
          moduleOnly
          onSuccess={() => {
            void refetchModules();
            void queryClient.invalidateQueries({ queryKey: ["modules", selectedModuleId, "sondes"] });
          }}
        />

      </m.div>
    </LazyMotion>
  );
}





