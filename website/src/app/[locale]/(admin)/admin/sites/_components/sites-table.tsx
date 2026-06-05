'use client';

import { ColumnDef } from '@tanstack/react-table';
import { TanStackTable } from '@/components/data-table/tanstack-table';
import type { SiteAdmin } from '@/hooks/useSites';
import { useTranslations } from 'next-intl';

type SitesTableProps = {
  sites: SiteAdmin[];
  isLoading: boolean;
  selectedSiteId?: number;
  onSelectSite: (site: SiteAdmin) => void;
  onEditSite?: (site: SiteAdmin) => void;
};

export function SitesTable({ sites, isLoading, selectedSiteId, onSelectSite, onEditSite }: SitesTableProps) {
  const t = useTranslations('sitesTable');

  const columns: ColumnDef<SiteAdmin>[] = [
    {
      accessorKey: 'Libelle_Site',
      header: t('columns.site'),
      cell: ({ row }) => row.getValue('Libelle_Site') || t('placeholders.na'),
    },
    {
      accessorKey: 'Commentaire',
      header: t('columns.comments'),
      cell: ({ row }) => {
        const comment = row.getValue('Commentaire') as string | null;
        return comment ? (
          <p className="max-w-xs truncate" title={comment}>
            {comment}
          </p>
        ) : (
          t('placeholders.na')
        );
      },
    },
  ];

  return (
    <TanStackTable<SiteAdmin>
      columns={columns}
      data={sites}
      searchField={['Libelle_Site', 'Commentaire']}
      searchPlaceholder={t('search_placeholder')}
      pageSize={200}
      isLoading={isLoading}
      maxHeight="calc(100dvh - 25rem)"
      emptyMessage={t('empty')}
      onRowClick={(row) => onSelectSite(row)}
      onRowDoubleClick={(row) => onEditSite?.(row)}
      selectedRowId={selectedSiteId}
      headerClassName="!bg-sidebar !text-sidebar-foreground"
      headerCellClassName="!bg-sidebar !text-sidebar-foreground !border-r !border-white/25 hover:!bg-sidebar-accent/80"
      tableClassName="border-separate border-spacing-0 [&_thead_th]:!border-r [&_thead_th]:!border-white/25 [&_thead_th:last-child]:!border-r-0"
    />
  );
}

