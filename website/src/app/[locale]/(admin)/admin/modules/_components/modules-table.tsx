'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { TanStackTable } from '@/components/data-table/tanstack-table';
import { useTranslations } from 'next-intl';

export type ModuleRow = {
  Id_Module: number;
  Libelle_Type_Module: string | null;
  Module_Numero_Serie: string | null;
  Emplacement: string | null;
  Port_Serie: string | null;
  sondes_count: number;
  Id_Worker: number | null;
};

type ModulesTableProps = {
  modules: ModuleRow[];
  isLoading: boolean;
  selectedModuleId: number | null;
  onSelectModule: (moduleId: number) => void;
  onEditModule?: (moduleId: number) => void;
};

export function ModulesTable({
  modules,
  isLoading,
  selectedModuleId,
  onSelectModule,
  onEditModule,
}: ModulesTableProps) {
  const t = useTranslations('modulesTable');
  const columns: ColumnDef<ModuleRow>[] = [
    {
      accessorKey: 'Libelle_Type_Module',
      header: t('columns.type'),
      cell: ({ row }) => <span className="font-medium">{row.getValue('Libelle_Type_Module') || '-'}</span>,
    },
    {
      accessorKey: 'Module_Numero_Serie',
      header: t('columns.serial'),
      cell: ({ row }) => row.getValue('Module_Numero_Serie') || '-',
    },
    {
      accessorKey: 'Emplacement',
      header: t('columns.location'),
      cell: ({ row }) => row.getValue('Emplacement') || '-',
    },
    {
      accessorKey: 'Port_Serie',
      header: t('columns.port'),
      cell: ({ row }) => row.getValue('Port_Serie') || '-',
    },
    {
      accessorKey: 'sondes_count',
      header: () => <div className="text-right">{t('columns.sensors_count')}</div>,
      cell: ({ row }) => (
        <div className="text-right font-medium">
          {t('sensors_count_value', { count: row.getValue('sondes_count') })}
        </div>
      ),
    },
    {
      accessorKey: 'Id_Worker',
      header: t('columns.server'),
      cell: ({ row }) => row.getValue('Id_Worker') || '-',
    },
  ];

  return (
    <TanStackTable<ModuleRow>
      columns={columns}
      data={modules}
      searchPlaceholder={t('search_placeholder')}
      isLoading={isLoading}
      emptyMessage={t('empty')}
      selectedRowId={selectedModuleId ?? undefined}
      onRowClick={(row) => onSelectModule(row.Id_Module)}
      onRowDoubleClick={(row) => onEditModule?.(row.Id_Module)}
      headerClassName="!bg-sidebar !text-sidebar-foreground"
      headerCellClassName="!bg-sidebar !text-sidebar-foreground !border-r !border-white/25 hover:!bg-sidebar-accent/80"
      tableClassName="border-separate border-spacing-0 [&_thead_th]:!border-r [&_thead_th]:!border-white/25 [&_thead_th:last-child]:!border-r-0"
      maxHeight="60vh"
    />
  );
}



