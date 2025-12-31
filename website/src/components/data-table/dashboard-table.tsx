"use client"

import { TanStackTable, type TanStackTableProps } from "@/components/data-table/tanstack-table"

type DashboardTableProps<TData extends Record<string, any>> = Omit<
  TanStackTableProps<TData>,
  "showPagination" | "showSearch"
> & {
  maxHeight?: string
}

/**
 * Variante "dashboard" : table compacte sans pagination UI ni barre de recherche.
 * Utile pour afficher un aperçu (ex: top 5 alarmes, sessions actives, etc.).
 */
export function DashboardTable<TData extends Record<string, any>>(
  props: DashboardTableProps<TData>,
) {
  return <TanStackTable {...props} showPagination={false} showSearch={false} />
}
