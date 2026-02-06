"use client";

import { useEffect, useRef, useState } from "react";
import { Archive, Pencil, Plus } from "lucide-react";
import { useRouter } from '@/i18n/navigation';
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { useModules, useModuleSondes } from "@/hooks/useModules";
import { deleteJson, getJson, HttpError } from "@/lib/http";
import { Button } from "@/components/ui/button";
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

  const { data: modules, isLoading: modulesLoading, refetch: refetchModules } = useModules();
  const { data: sondes, isLoading: sondesLoading } = useModuleSondes(selectedModuleId);

  useEffect(() => {
    if (modulesLoading || didPrefetchRef.current) return;
    didPrefetchRef.current = true;

    queryClient.prefetchQuery({
      queryKey: ["module-types"],
      queryFn: () => getJson("/api/modules/types"),
      staleTime: 60000,
    });
  }, [modulesLoading, queryClient]);

  const selectedModule = selectedModuleId ? modules?.find((m) => m.Id_Module === selectedModuleId) : null;

  const modulesTableData: ModuleRow[] = (modules || []).map((m) => ({
    Id_Module: m.Id_Module,
    Libelle_Type_Module: m.Libelle_Type_Module,
    Module_Numero_Serie: m.Module_Numero_Serie,
    Emplacement: m.Emplacement,
    Port_Serie: m.Port_Serie,
    sondes_count: m.sondes_count,
    Id_Serveur: m.Id_Serveur,
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
            <CardTitle>{t('title', { count: modules?.length || 0 })}</CardTitle>
            <div className="flex gap-2">
              <Button
                size="sm"
                className="gap-2"
                onClick={() => {
                  setIsEditMode(false);
                  setIsModalOpen(true);
                }}
              >
                <Plus className="w-4 h-4" />
                {t('actions.new')}
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={!selectedModuleId}
                className="gap-2"
                onClick={() => {
                  setIsEditMode(true);
                  setIsModalOpen(true);
                }}
              >
                <Pencil className="w-4 h-4" />
                {t('actions.edit')}
              </Button>
              <Button size="sm" variant="outline" disabled={!selectedModuleId} className="gap-2" onClick={() => setArchiveConfirmOpen(true)}>
                <Archive className="w-4 h-4" />
                {t('actions.archive')}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-2 md:p-4 xl:p-4">
          <ModulesTable
            modules={modulesTableData}
            isLoading={modulesLoading}
            selectedModuleId={selectedModuleId}
            onSelectModule={(moduleId) => {
              setSelectedModuleId(moduleId);
              setSelectedSondeId(null);
            }}
          />
        </CardContent>
      </Card>

      {selectedModuleId && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{t('associated.title', { count: sondes?.length || 0 })}</CardTitle>
          </CardHeader>
          <CardContent className="p-2 md:p-4 xl:p-4">
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

    </div>
  );
}


