'use client';

import type { Profile } from '@/hooks/useProfiles';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TanStackTable } from '@/components/data-table/tanstack-table';
import type { ColumnDef } from '@tanstack/react-table';
import { CheckCircle2, Edit, Plus, Shield, Trash2, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';

type ProfileRow = {
  id: number;
  name: string;
  description: string | null;
  mc2: boolean | null;
  authCount: number;
  userCount: number;
};

type ProfilesTableProps = {
  profiles: Profile[];
  isLoading: boolean;
  selectedProfileId?: number;
  onSelectProfile: (profile: Profile) => void;
  onEdit: (profile: Profile) => void;
  onDelete: (profile: Profile) => void;
  onCreate: () => void;
};

export function ProfilesTable({
  profiles,
  isLoading,
  selectedProfileId,
  onSelectProfile,
  onEdit,
  onDelete,
  onCreate,
}: ProfilesTableProps) {
  const t = useTranslations('profilesTable');

  const columns: ColumnDef<ProfileRow>[] = [
    {
      accessorKey: 'name',
      header: t('columns.name'),
      cell: ({ row }) => {
        const profile = row.original;
        return (
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{profile.name}</span>
            {profile.mc2 && (
              <Badge variant="secondary" className="text-xs">
                MC2
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'description',
      header: t('columns.description'),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.getValue('description') || t('placeholders.na')}
        </span>
      ),
    },
    {
      accessorKey: 'authCount',
      header: t('columns.authorizations'),
      meta: { headerClassName: 'w-36 text-center', cellClassName: 'text-center' },
      cell: ({ row }) => (
        <Badge variant="outline" className="gap-1 text-xs px-2 py-0.5 whitespace-nowrap">
          <CheckCircle2 className="h-3 w-3" />
          {t('counts.authorizations', { count: row.getValue('authCount') })}
        </Badge>
      ),
    },
    {
      accessorKey: 'userCount',
      header: t('columns.users'),
      meta: { headerClassName: 'w-32 text-center', cellClassName: 'text-center' },
      cell: ({ row }) => (
        <Badge variant="outline" className="gap-1 text-xs px-2 py-0.5 whitespace-nowrap">
          <Users className="h-3 w-3" />
          {t('counts.users', { count: row.getValue('userCount') })}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: t('columns.actions'),
      meta: { headerClassName: 'w-24 text-center', cellClassName: 'text-center' },
      cell: ({ row }) => {
        const profile = profiles.find((p) => p.id === row.original.id);
        if (!profile) return null;

        return (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onEdit(profile)}
              title={t('actions.edit')}
              className="text-primary"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onDelete(profile)}
              title={t('actions.delete')}
              className="bg-destructive/10 hover:bg-destructive/20 border-destructive/30"
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        );
      },
    },
  ];

  const tableData: ProfileRow[] = profiles.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    mc2: p.mc2,
    authCount: p.authorizations.length,
    userCount: p.userCount,
  }));

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </div>
        <Button className="gap-2" onClick={onCreate}>
          <Plus className="h-4 w-4" />
          {t('actions.new')}
        </Button>
      </CardHeader>
      <CardContent className="p-2 md:p-4 xl:p-4">
        <TanStackTable
          columns={columns}
          data={tableData}
          searchField="name"
          searchPlaceholder={t('search_placeholder')}
          isLoading={isLoading}
          emptyMessage={t('empty')}
          selectedRowId={selectedProfileId}
          onRowClick={(row) => {
            const profile = profiles.find((p) => p.id === (row as ProfileRow).id);
            if (profile) onSelectProfile(profile);
          }}
          onRowDoubleClick={(row) => {
            const profile = profiles.find((p) => p.id === (row as ProfileRow).id);
            if (profile) onEdit(profile);
          }}
          maxHeight="calc(100dvh - 25rem)"
          headerClassName="!bg-sidebar !text-sidebar-foreground"
          headerCellClassName="!bg-sidebar !text-sidebar-foreground !border-r !border-white/25 hover:!bg-sidebar-accent/80"
          tableClassName="border-separate border-spacing-0 [&_thead_th]:!border-r [&_thead_th]:!border-white/25 [&_thead_th:last-child]:!border-r-0"
        />
      </CardContent>
    </Card>
  );
}


