"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TanStackTable } from "@/components/data-table/tanstack-table";
import { ColumnDef } from "@tanstack/react-table";
import { usersApi, type User } from "@/lib/api";
import { toast } from "sonner";
import { Pencil, Shield, UserPlus } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface UserRow extends User {}

const formatDate = (date: string | null) => {
  if (!date) return "-";
  return format(new Date(date), "dd/MM/yyyy", { locale: fr });
};

// Définir les colonnes
const createColumns = (
  onEdit: (user: User) => void
): ColumnDef<UserRow>[] => [
  {
    accessorKey: "username",
    header: "Login",
    cell: ({ row }) => <span className="font-medium">{row.getValue("username")}</span>,
  },
  {
    accessorKey: "displayName",
    header: "Nom complet",
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => <span className="text-muted-foreground">{row.getValue("email") || "-"}</span>,
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
    cell: ({ row }) => formatDate(row.getValue("expiry_date")),
  },
  {
    id: "actions",
    header: "Actions",
    enableSorting: false,
    cell: ({ row }) => (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onEdit(row.original)}
        className="gap-2"
      >
        <Pencil className="h-4 w-4" />
        Modifier
      </Button>
    ),
  },
];

interface UsersTanStackTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onAdd?: () => void;
}

export function UsersTanStackTable({
  users,
  onEdit,
  onAdd,
}: UsersTanStackTableProps) {
  const columns = createColumns(onEdit);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Gestion des utilisateurs</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {users.length} utilisateur{users.length > 1 ? "s" : ""}
          </p>
        </div>
        {onAdd && (
          <Button onClick={onAdd} className="gap-2">
            <UserPlus className="h-4 w-4" />
            Nouvel utilisateur
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-2 md:p-4 xl:p-4">
        <TanStackTable
          columns={columns}
          data={users}
          searchField="username"
          searchPlaceholder="Rechercher par login..."
          pageSize={20}
          emptyMessage="Aucun utilisateur trouvé"
        />
      </CardContent>
    </Card>
  );
}
