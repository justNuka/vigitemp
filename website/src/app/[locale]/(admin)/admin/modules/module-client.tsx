"use client";

import { useState } from "react";
import { useModules, useModuleSondes } from "@/hooks/useModules";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Pencil, Archive } from "lucide-react";
import { ModuleModal } from "./module-modal";
import { TanStackTable } from "@/components/data-table/tanstack-table";
import { ColumnDef } from "@tanstack/react-table";

interface ModuleRow {
  Id_Module: number;
  Libelle_Type_Module: string | null;
  Module_Numero_Serie: string | null;
  Emplacement: string | null;
  Port_Serie: string | null;
  sondes_count: number;
  Id_Serveur: number | null;
}

interface SondeRow {
  Id_Sonde: number;
  Adresse_Sonde: string | null;
  Sonde_Numero_Serie: string | null;
  Port_Serie: string | null;
  Etat_Sonde: string | null;
}

export function ModulesClient() {
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);
  const [selectedSondeId, setSelectedSondeId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const { data: modules, isLoading: modulesLoading, refetch: refetchModules } = useModules();
  const { data: sondes, isLoading: sondesLoading } = useModuleSondes(selectedModuleId);

  // Trouver le module sélectionné pour l'édition
  const selectedModule = selectedModuleId
    ? modules?.find((m) => m.Id_Module === selectedModuleId)
    : null;

  // Colonnes TanStack pour Modules
  const modulesColumns: ColumnDef<ModuleRow>[] = [
    {
      accessorKey: "Libelle_Type_Module",
      header: "Type",
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue("Libelle_Type_Module") || "-"}</span>
      ),
    },
    {
      accessorKey: "Module_Numero_Serie",
      header: "Numéro de série",
      cell: ({ row }) => row.getValue("Module_Numero_Serie") || "-",
    },
    {
      accessorKey: "Emplacement",
      header: "Emplacement",
      cell: ({ row }) => row.getValue("Emplacement") || "-",
    },
    {
      accessorKey: "Port_Serie",
      header: "Port",
      cell: ({ row }) => row.getValue("Port_Serie") || "-",
    },
    {
      accessorKey: "sondes_count",
      header: () => <div className="text-right">Nombre de sondes</div>,
      cell: ({ row }) => (
        <div className="text-right font-medium">
          {row.getValue("sondes_count")} sonde(s)
        </div>
      ),
    },
    {
      accessorKey: "Id_Serveur",
      header: "Serveur",
      cell: ({ row }) => row.getValue("Id_Serveur") || "-",
    },
  ];

  const modulesTableData: ModuleRow[] = (modules || []).map((m) => ({
    Id_Module: m.Id_Module,
    Libelle_Type_Module: m.Libelle_Type_Module,
    Module_Numero_Serie: m.Module_Numero_Serie,
    Emplacement: m.Emplacement,
    Port_Serie: m.Port_Serie,
    sondes_count: m.sondes_count,
    Id_Serveur: m.Id_Serveur,
  }));

  const sondesTableData: SondeRow[] = (sondes || []).map((s) => ({
    Id_Sonde: s.Id_Sonde,
    Adresse_Sonde: s.Adresse_Sonde,
    Sonde_Numero_Serie: s.Sonde_Numero_Serie,
    Port_Serie: s.Port_Serie,
    Etat_Sonde: s.Etat_Sonde,
  }));

  // Colonnes TanStack pour Sondes associées
  const sondesColumns: ColumnDef<SondeRow>[] = [
    {
      accessorKey: "Adresse_Sonde",
      header: "Adresse",
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue("Adresse_Sonde") || "-"}</span>
      ),
    },
    {
      accessorKey: "Sonde_Numero_Serie",
      header: "Numéro de série",
      cell: ({ row }) => row.getValue("Sonde_Numero_Serie") || "-",
    },
    {
      accessorKey: "Port_Serie",
      header: "Port série",
      cell: ({ row }) => row.getValue("Port_Serie") || "-",
    },
    {
      accessorKey: "Etat_Sonde",
      header: "État",
      cell: ({ row }) => row.getValue("Etat_Sonde") || "-",
    },
  ];

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
      {/* Modules Table */}
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
              <Button
                size="sm"
                variant="outline"
                disabled={!selectedModuleId}
                className="gap-2"
              >
                <Archive className="w-4 h-4" />
                Archiver
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-2 md:p-4 xl:p-4">
          <TanStackTable
            columns={modulesColumns}
            data={modulesTableData}
            searchPlaceholder="Numéro de série, emplacement..."
            isLoading={modulesLoading}
            emptyMessage="Aucun module trouvé"
            selectedRowId={selectedModuleId}
            onRowClick={(row: ModuleRow) => {
              setSelectedModuleId(row.Id_Module);
              setSelectedSondeId(null);
            }}
            maxHeight="30rem"
          />
        </CardContent>
      </Card>

      {/* Matériel associé Table */}
      {selectedModuleId && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              Matériel associé ({sondes?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2 md:p-4 xl:p-4">
            {sondesLoading ? (
              <div className="p-6 space-y-3">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : sondesTableData.length > 0 ? (
              <TanStackTable
                columns={sondesColumns}
                data={sondesTableData}
                showSearch={false}
                showPagination={false}
                maxHeight="16rem"
                emptyMessage="Aucun matériel associé à ce module"
                selectedRowId={selectedSondeId}
                onRowClick={(row: SondeRow) => setSelectedSondeId(row.Id_Sonde)}
              />
            ) : (
              <div className="text-center py-8 text-sm text-muted-foreground">
                Aucun matériel associé à ce module
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Module Modal */}
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
          setSelectedModuleId(null);
          setIsEditMode(false);
        }}
      />
    </div>
  );
}
