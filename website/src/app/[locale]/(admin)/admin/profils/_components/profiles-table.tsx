'use client';

import type { Profile } from '@/hooks/useProfiles';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TanStackTable } from '@/components/data-table/tanstack-table';
import type { ColumnDef } from '@tanstack/react-table';
import { CheckCircle2, Edit, Shield, Trash2, Users } from 'lucide-react';

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
};

export function ProfilesTable({
  profiles,
  isLoading,
  selectedProfileId,
  onSelectProfile,
  onEdit,
  onDelete,
}: ProfilesTableProps) {
  const columns: ColumnDef<ProfileRow>[] = [
    {
      accessorKey: 'name',
      header: 'Nom',
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
      header: 'Description',
      cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.getValue('description') || '-'}</span>,
    },
    {
      accessorKey: 'authCount',
      header: 'Autorisations',
      cell: ({ row }) => (
        <Badge variant="outline" className="gap-1">
          <CheckCircle2 className="h-3 w-3" />
          {row.getValue('authCount')} autorisation{(row.getValue('authCount') as number) > 1 ? 's' : ''}
        </Badge>
      ),
    },
    {
      accessorKey: 'userCount',
      header: 'Utilisateurs',
      cell: ({ row }) => (
        <Badge variant="outline" className="gap-1">
          <Users className="h-3 w-3" />
          {row.getValue('userCount')} utilisateur{(row.getValue('userCount') as number) > 1 ? 's' : ''}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const profile = profiles.find((p) => p.id === row.original.id);
        if (!profile) return null;

        return (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => onEdit(profile)} title="Modifier">
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onDelete(profile)} title="Supprimer">
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
      <CardHeader>
        <CardTitle>Profils</CardTitle>
        <CardDescription>Les profils définissent les autorisations des utilisateurs sur l'application</CardDescription>
      </CardHeader>
      <CardContent className="p-2 md:p-4 xl:p-4">
        <TanStackTable
          columns={columns}
          data={tableData}
          searchField="name"
          searchPlaceholder="Nom du profil..."
          isLoading={isLoading}
          emptyMessage="Aucun profil trouvé"
          selectedRowId={selectedProfileId}
          onRowClick={(row) => {
            const profile = profiles.find((p) => p.id === (row as ProfileRow).id);
            if (profile) onSelectProfile(profile);
          }}
        />
      </CardContent>
    </Card>
  );
}

