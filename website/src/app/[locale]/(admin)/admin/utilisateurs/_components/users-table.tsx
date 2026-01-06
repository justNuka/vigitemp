"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TanStackTable } from "@/components/data-table/tanstack-table";
import type { User } from "@/lib/api";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Shield } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Props {
  users: User[];
  selectedUserId?: string | null;
  onEditUser: (user: User) => void;
  onSelectUser: (user: User) => void;
}

export function UsersTable({
  users,
  selectedUserId,
  onEditUser,
  onSelectUser,
}: Props) {
  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "username",
      header: "Login",
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue("username")}</span>
      ),
    },
    {
      accessorKey: "displayName",
      header: "Nom complet",
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.getValue("email") || "-"}
        </span>
      ),
    },
    {
      accessorKey: "role",
      header: "Profil",
      cell: ({ row }) => (
        <Badge variant="outline" className="gap-1">
          <Shield className="h-3 w-3" />
          {row.getValue("role")}
        </Badge>
      ),
    },
    {
      accessorKey: "isActive",
      header: "Statut",
      cell: ({ row }) => (
        <Badge variant={row.getValue("isActive") ? "default" : "secondary"}>
          {row.getValue("isActive") ? "Actif" : "Inactif"}
        </Badge>
      ),
    },
    {
      accessorKey: "expiry_date",
      header: "Date d'expiration",
      cell: ({ row }) => {
        const date = row.getValue("expiry_date");
        return date
          ? format(new Date(date as string), "dd/MM/yyyy", { locale: fr })
          : "-";
      },
    },
    {
      id: "actions",
      header: "Actions",
      enableSorting: false,
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEditUser(row.original)}
          className="gap-2"
        >
          <Pencil className="h-4 w-4" />
          Modifier
        </Button>
      ),
    },
  ];

  return (
    <TanStackTable
      columns={columns}
      data={users}
      searchField={["displayName", "username"]}
      searchPlaceholder="Rechercher par nom ou login..."
      pageSize={20}
      maxHeight="60vh"
      emptyMessage="Aucun utilisateur trouvé"
      selectedRowId={selectedUserId}
      onRowClick={(row) => onSelectUser(row as User)}
    />
  );
}
