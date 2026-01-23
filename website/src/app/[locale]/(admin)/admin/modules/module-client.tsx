"use client";

import { useState } from "react";
import { Archive, Pencil, Plus } from "lucide-react";
import { useRouter } from '@/i18n/navigation';
import { toast } from "sonner";

import { useModules, useModuleSondes } from "@/hooks/useModules";
import { deleteJson, HttpError } from "@/lib/http";
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
import { ProbesTable, type ProbeRow } from "./_components/probes-table";

export function ModulesClient() {
  const router = useRouter();
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);
  const [selectedSondeId, setSelectedSondeId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [archiveConfirmOpen, setArchiveConfirmOpen] = useState(false);
  const [archiveBlockedOpen, setArchiveBlockedOpen] = useState(false);
  const [archiveBlockedMessage, setArchiveBlockedMessage] = useState<string | null>(null);

  const { data: modules, isLoading: modulesLoading, refetch: refetchModules } = useModules();
  const { data: sondes, isLoading: sondesLoading } = useModuleSondes(selectedModuleId);

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

  const sondesTableData: ProbeRow[] = (sondes || []).map((s) => ({
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
            ? `Ce module est lie a ${linked} sonde${linked > 1 ? 's' : ''}.`
            : '';
        setArchiveBlockedMessage(`${error.message}${detail ? ` ${detail}` : ''}`);
        setArchiveBlockedOpen(true);
        return;
      }
      toast.error(error instanceof Error ? error.message : "Erreur lors de l'archivage");
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
            <CardTitle>Modules ({modules?.length || 0})</CardTitle>
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
                Nouveau
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
                Modifier
              </Button>
              <Button size="sm" variant="outline" disabled={!selectedModuleId} className="gap-2" onClick={() => setArchiveConfirmOpen(true)}>
                <Archive className="w-4 h-4" />
                Archiver
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
            <CardTitle className="text-base">Matériel associé ({sondes?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent className="p-2 md:p-4 xl:p-4">
            {sondesLoading ? (
              <div className="p-6 space-y-3">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : sondesTableData.length > 0 ? (
              <ProbesTable
                probes={sondesTableData}
                isLoading={false}
                selectedProbeId={selectedSondeId}
                onSelectProbe={setSelectedSondeId}
              />
            ) : (
              <div className="text-center py-8 text-sm text-muted-foreground">Aucun matériel associé à ce module</div>
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
            <AlertDialogTitle>Archiver le module</AlertDialogTitle>
            <AlertDialogDescription>
              Etes-vous sur de vouloir archiver ce module ? Cette action ne peut pas etre annulee.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction onClick={handleArchive}>Archiver</AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={archiveBlockedOpen} onOpenChange={setArchiveBlockedOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archivage impossible</AlertDialogTitle>
            <AlertDialogDescription>
              {archiveBlockedMessage || "Ce module est encore lie a d'autres elements."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogAction onClick={() => setArchiveBlockedOpen(false)}>
            OK
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}

