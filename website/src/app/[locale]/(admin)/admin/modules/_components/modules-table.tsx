'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { TanStackTable } from '@/components/data-table/tanstack-table';

export type ModuleRow = {
  Id_Module: number;
  Libelle_Type_Module: string | null;
  Module_Numero_Serie: string | null;
  Emplacement: string | null;
  Port_Serie: string | null;
  sondes_count: number;
  Id_Serveur: number | null;
};

type ModulesTableProps = {
  modules: ModuleRow[];
  isLoading: boolean;
  selectedModuleId: number | null;
  onSelectModule: (moduleId: number) => void;
};

export function ModulesTable({
  modules,
  isLoading,
  selectedModuleId,
  onSelectModule,
}: ModulesTableProps) {
  const columns: ColumnDef<ModuleRow>[] = [
    {
      accessorKey: 'Libelle_Type_Module',
      header: 'Type',
      cell: ({ row }) => <span className="font-medium">{row.getValue('Libelle_Type_Module') || '-'}</span>,
    },
    {
      accessorKey: 'Module_Numero_Serie',
      header: 'Numéro de série',
      cell: ({ row }) => row.getValue('Module_Numero_Serie') || '-',
    },
    {
      accessorKey: 'Emplacement',
      header: 'Emplacement',
      cell: ({ row }) => row.getValue('Emplacement') || '-',
    },
    {
      accessorKey: 'Port_Serie',
      header: 'Port',
      cell: ({ row }) => row.getValue('Port_Serie') || '-',
    },
    {
      accessorKey: 'sondes_count',
      header: () => <div className="text-right">Nombre de sondes</div>,
      cell: ({ row }) => <div className="text-right font-medium">{row.getValue('sondes_count')} sonde(s)</div>,
    },
    {
      accessorKey: 'Id_Serveur',
      header: 'Serveur',
      cell: ({ row }) => row.getValue('Id_Serveur') || '-',
    },
  ];

  return (
    <TanStackTable<ModuleRow>
      columns={columns}
      data={modules}
      searchPlaceholder="Numéro de série, emplacement..."
      isLoading={isLoading}
      emptyMessage="Aucun module trouvé"
      selectedRowId={selectedModuleId ?? undefined}
      onRowClick={(row) => onSelectModule(row.Id_Module)}
      maxHeight="30rem"
    />
  );
}

