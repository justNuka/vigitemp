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
      searchPlaceholder="Rechercher les sites..."
      pageSize={10}
      isLoading={isLoading}
      maxHeight="60vh"
      emptyMessage="Aucun site trouvé"
      onRowClick={(row) => onSelectSite(row)}
      selectedRowId={selectedSiteId}
    />
  );
}

