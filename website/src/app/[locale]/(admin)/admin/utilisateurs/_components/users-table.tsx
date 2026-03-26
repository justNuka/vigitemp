"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TanStackTable } from "@/components/data-table/tanstack-table";
import type { User } from "@/lib/api";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Shield } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useAppTimezone } from "@/components/timezone-provider";

interface Props {
  users: User[];
  selectedUserId?: string | null;
  onEditUser: (user: User) => void;
  onSelectUser: (user: User) => void;
  onDoubleClickUser?: (user: User) => void;
}

export function UsersTable({
  users,
  selectedUserId,
  onEditUser,
  onSelectUser,
  onDoubleClickUser,
}: Props) {
  const t = useTranslations("usersTable");
  const locale = useLocale();
  const localeTag = locale.toLowerCase().startsWith("fr") ? "fr-FR" : locale;
  const timezone = useAppTimezone();

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "username",
      header: t("columns.login"),
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue("username")}</span>
      ),
    },
    {
      accessorKey: "displayName",
      header: t("columns.full_name"),
    },
    {
      accessorKey: "email",
      header: t("columns.email"),
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.getValue("email") || t("placeholders.na")}
        </span>
      ),
    },
    {
      accessorKey: "role",
      header: t("columns.profile"),
      cell: ({ row }) => (
        <Badge variant="outline" className="gap-1">
          <Shield className="h-3 w-3" />
          {row.getValue("role")}
        </Badge>
      ),
    },
    {
      accessorKey: "isActive",
      header: t("columns.status"),
      meta: {
        headerClassName: "text-center",
        cellClassName: "text-center",
      },
      cell: ({ row }) => (
        <div className="flex justify-center">
          <Badge variant={row.getValue("isActive") ? "default" : "destructive"}>
            {row.getValue("isActive") ? t("status.active") : t("status.inactive")}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: "expiry_date",
      header: t("columns.expiry"),
      cell: ({ row }) => {
        const date = row.getValue("expiry_date");
        return date
          ? new Date(date as string).toLocaleDateString(localeTag, {
              timeZone: timezone,
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })
          : t("placeholders.na");
      },
    },
    {
      id: "actions",
      header: t("columns.actions"),
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
            title={t("actions.edit")}
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
      searchPlaceholder={t("search_placeholder")}
      pageSize={20}
      maxHeight="calc(100dvh - 25rem)"
      emptyMessage={t("empty")}
      selectedRowId={selectedUserId}
      onRowClick={(row) => onSelectUser(row as User)}
      onRowDoubleClick={(row) => onDoubleClickUser?.(row as User)}
      containerClassName="bg-white dark:bg-card/95"
      tableClassName="bg-white dark:bg-card/95 border-separate border-spacing-0 [&_thead_th]:!border-r [&_thead_th]:!border-white/25 [&_thead_th:last-child]:!border-r-0"
      headerClassName="!bg-sidebar !text-sidebar-foreground"
      headerCellClassName="!bg-sidebar !text-sidebar-foreground !border-r !border-white/25 hover:!bg-sidebar-accent/80"
    />
  );
}

