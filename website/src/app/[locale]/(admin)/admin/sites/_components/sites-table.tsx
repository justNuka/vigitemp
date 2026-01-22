'use client';

import { ColumnDef } from '@tanstack/react-table';
import { TanStackTable } from '@/components/data-table/tanstack-table';
import type { SiteAdmin } from '@/hooks/useSites';

type SitesTableProps = {
  sites: SiteAdmin[];
  isLoading: boolean;
  selectedSiteId?: number;
  onSelectSite: (site: SiteAdmin) => void;
};

export function SitesTable({ sites, isLoading, selectedSiteId, onSelectSite }: SitesTableProps) {
  const columns: ColumnDef<SiteAdmin>[] = [
    {
      accessorKey: 'Code_Site',
      header: 'Site',
      cell: ({ row }) => row.getValue('Code_Site') || '-',
    },
    {
      accessorKey: 'Libelle_Site',
      header: 'Description',
      cell: ({ row }) => row.getValue('Libelle_Site') || '-',
    },
    {
      accessorKey: 'Commentaire',
      header: 'Commentaires',
      cell: ({ row }) => {
        const comment = row.getValue('Commentaire') as string | null;
        return comment ? (
          <p className="max-w-xs truncate" title={comment}>
            {comment}
          </p>
        ) : (
          '-'
        );
      },
    },
  ];

  return (
    <TanStackTable<SiteAdmin>
      columns={columns}
      data={sites}
      searchField={['Code_Site', 'Libelle_Site', 'Commentaire']}
      searchPlaceholder="Rechercher les sites..."
      pageSize={10}
      isLoading={isLoading}
      maxHeight="calc(100dvh - 25rem)"
      emptyMessage="Aucun site trouvé"
      onRowClick={(row) => onSelectSite(row)}
      selectedRowId={selectedSiteId}
      headerClassName="!bg-sidebar !text-sidebar-foreground"
      headerCellClassName="!bg-sidebar !text-sidebar-foreground !border-r !border-white/25 hover:!bg-sidebar-accent/80"
      tableClassName="border-separate border-spacing-0 [&_thead_th]:!border-r [&_thead_th]:!border-white/25 [&_thead_th:last-child]:!border-r-0"
    />
  );
}
