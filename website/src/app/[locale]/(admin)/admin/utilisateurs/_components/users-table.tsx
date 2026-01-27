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
      meta: {
        headerClassName: "text-center",
        cellClassName: "text-center",
      },
      cell: ({ row }) => (
        <div className="flex justify-center">
          <Badge variant={row.getValue("isActive") ? "default" : "destructive"}>
            {row.getValue("isActive") ? "Actif" : "Inactif"}
          </Badge>
        </div>
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
      meta: {
        headerClassName: "text-center",
        cellClassName: "text-center",
      },
      cell: ({ row }) => (
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onEditUser(row.original)}
            className="bg-primary/10 hover:bg-primary/20 border-primary/40 text-primary"
            title="Modifier"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
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
      maxHeight="calc(100dvh - 25rem)"
      emptyMessage="Aucun utilisateur trouvé"
      selectedRowId={selectedUserId}
      onRowClick={(row) => onSelectUser(row as User)}
      containerClassName="bg-white"
      tableClassName="bg-white border-separate border-spacing-0 [&_thead_th]:!border-r [&_thead_th]:!border-white/25 [&_thead_th:last-child]:!border-r-0"
      headerClassName="!bg-sidebar !text-sidebar-foreground"
      headerCellClassName="!bg-sidebar !text-sidebar-foreground !border-r !border-white/25 hover:!bg-sidebar-accent/80"
    />
  );
}
