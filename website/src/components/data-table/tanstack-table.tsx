'use client';

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  SortingState,
  ColumnFiltersState,
  useReactTable,
} from '@tanstack/react-table';
import { useState, type ReactNode } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TanStackTableProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];
  searchField?: keyof TData | (keyof TData)[];
  searchPlaceholder?: string;
  pageSize?: number;
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: TData) => void;
  selectedRowId?: number | string | null;
  /**
   * Max-height du conteneur scrollable (CSS length, ex: "16rem", "384px", "60vh").
   * Rend l'en-tête sticky lorsqu'il y a un scroll vertical.
   */
  maxHeight?: string;
  showSearch?: boolean;
  showPagination?: boolean;
  toolbarRight?: ReactNode;
}

/**
 * Composant wrapper TanStack Table réutilisable
 * Gère: tri, pagination, filtrage, recherche
 * 
 * Utilisation:
 * ```tsx
 * <TanStackTable
 *   columns={[
 *     { accessorKey: "name", header: "Nom" },
 *     { accessorKey: "email", header: "Email" },
 *   ]}
 *   data={users}
 *   searchField="name"
 *   searchPlaceholder="Rechercher par nom..."
 * />
 * ```
 */
export function TanStackTable<TData extends Record<string, any>>({
  columns,
  data,
  searchField,
  searchPlaceholder = 'Rechercher...',
  pageSize = 10,
  isLoading = false,
  emptyMessage = 'Aucun résultat',
  onRowClick,
  selectedRowId,
  maxHeight,
  showSearch = true,
  showPagination = true,
  toolbarRight,
}: TanStackTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: pageSize,
  });

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: (row, columnId, filterValue) => {
      if (!filterValue) return true;
      
      const rowData = row.original;
      const searchTerm = String(filterValue).toLowerCase();
      
      // Si searchField est fourni, chercher dans ce(s) champ(s)
      if (searchField) {
        const fieldsToSearch = Array.isArray(searchField) ? searchField : [searchField];
        return fieldsToSearch.some(field => {
          const fieldValue = (rowData as any)[field as string];
          if (fieldValue !== null && fieldValue !== undefined && typeof fieldValue === 'string') {
            return String(fieldValue).toLowerCase().includes(searchTerm);
          }
          return false;
        });
      }
      
      // Sinon, utiliser les champs par défaut (pour compatibilité)
      // Champs à rechercher: location, sensor, status, etc.
      // Ignorer les valeurs numériques, dates, et autres données non textuelles
      const searchableFields = [
        (rowData as any).location?.name,
        (rowData as any).sensor?.name,
        (rowData as any).status,
        (rowData as any).Nom_Lieu,
        (rowData as any).Nom_Groupe,
        (rowData as any).Profil_Utilisateur,
        (rowData as any).Login,
      ].filter((field): field is string => 
        field !== null && field !== undefined && typeof field === 'string'
      );
      
      return searchableFields.some(value => 
        String(value).toLowerCase().includes(searchTerm)
      );
    },
  });

  const pageSizeOptions = Array.from(
    new Set([10, 20, 30, 40, 50, table.getState().pagination.pageSize])
  ).sort((a, b) => a - b);

  const rows = showPagination ? table.getRowModel().rows : table.getFilteredRowModel().rows;

  return (
    <div className="space-y-4 w-full">
      {/* Barre d'outils - conditionnelle */}
      {(showSearch || toolbarRight) && (
        <div className="flex items-center gap-2 flex-wrap">
          {showSearch && (
            <>
              <Input
                placeholder={searchPlaceholder}
                value={globalFilter ?? ''}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="max-w-sm"
                disabled={isLoading}
              />
              <span className="text-sm text-muted-foreground">
                {table.getFilteredRowModel().rows.length} résultat(s)
              </span>
            </>
          )}
          {toolbarRight && <div className="ml-auto flex items-center gap-2">{toolbarRight}</div>}
        </div>
      )}

      {/* Tableau */}
      <div
        className={cn(
          "border rounded-lg overflow-hidden",
          "[&>div]:max-h-[var(--vt-table-max-height)]",
          "[&>div]:overflow-auto"
        )}
        style={{
          // `none` garde le comportement actuel (pas de limite de hauteur).
          ['--vt-table-max-height' as any]: maxHeight ?? 'none',
        }}
      >
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-muted/40 backdrop-blur supports-[backdrop-filter]:bg-muted/20">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  (() => {
                    const canSort = header.column.getCanSort();
                    const sortState = header.column.getIsSorted();
                    const ariaSort =
                      sortState === 'asc'
                        ? 'ascending'
                        : sortState === 'desc'
                        ? 'descending'
                        : 'none';

                    return (
                      <TableHead
                        key={header.id}
                        className={cn(
                          canSort && 'cursor-pointer select-none hover:bg-muted/50',
                          'transition-colors sticky top-0 bg-muted/40 backdrop-blur supports-[backdrop-filter]:bg-muted/20 border-b border-border border-r'
                        )}
                        onClick={canSort ? header.column.getToggleSortingHandler?.() : undefined}
                        onKeyDown={(e) => {
                          if (!canSort) return;
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            header.column.toggleSorting(sortState === 'asc');
                          }
                        }}
                        tabIndex={canSort ? 0 : undefined}
                        aria-sort={canSort ? (ariaSort as any) : undefined}
                      >
                        <div className="flex items-center gap-2">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {canSort && (
                            <div className="flex items-center gap-1">
                              {sortState === 'desc' ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : sortState === 'asc' ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronsUpDown className="h-4 w-4 opacity-50" />
                              )}
                            </div>
                          )}
                        </div>
                      </TableHead>
                    );
                  })()
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody className="[&_tr:last-child]:border-b">
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center py-8 text-muted-foreground"
                >
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    Chargement...
                  </div>
                </TableCell>
              </TableRow>
            ) : rows.length > 0 ? (
              rows.map((row, rowIndex) => {
                // Vérifier si la ligne est sélectionnée
                const isSelected = selectedRowId !== null && selectedRowId !== undefined && (
                  (row.original as any).Id_Sonde === selectedRowId ||
                  (row.original as any).Id_Calibrage === selectedRowId ||
                  (row.original as any).Id_Etalonnage === selectedRowId ||
                  (row.original as any).Id_Site === selectedRowId ||
                  (row.original as any).Id_Lieu === selectedRowId ||
                  (row.original as any).Id_Utilisateur === selectedRowId ||
                  (row.original as any).Id_Groupe === selectedRowId ||
                  (row.original as any).Id_Profil === selectedRowId ||
                  (row.original as any).Id_Etalon === selectedRowId ||
                  (row.original as any).Id_Actionneur === selectedRowId ||
                  (row.original as any).Id_Alarme === selectedRowId ||
                  (row.original as any).id === selectedRowId ||
                  (row.original as any).Id === selectedRowId
                );
                
                return (
                  <TableRow
                    key={`row-${rowIndex}-${row.id}`}
                    onClick={() => onRowClick?.(row.original)}
                    onKeyDown={(e) => {
                      if (!onRowClick) return;
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onRowClick(row.original);
                      }
                    }}
                    tabIndex={onRowClick ? 0 : undefined}
                    aria-selected={isSelected || undefined}
                    className={cn(
                      onRowClick && 'cursor-pointer hover:bg-muted/50',
                      isSelected && 'bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-100 border-l-4 border-l-blue-600 dark:border-l-blue-400 font-medium',
                      onRowClick && 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                      'transition-colors'
                    )}
                  >
                    {row.getVisibleCells().map((cell, cellIndex, cellsArray) => (
                      <TableCell 
                        key={`cell-${rowIndex}-${cellIndex}-${cell.id}`}
                        className="border-r border-border"
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center py-8 text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Contrôles de pagination - conditionnels */}
      {showPagination && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Page {table.getState().pagination.pageIndex + 1} sur {table.getPageCount()} - Total: {table.getFilteredRowModel().rows.length}
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 rounded-md border border-border bg-muted/10 px-2 py-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage() || isLoading}
            >
              Précédent
            </Button>

            <Select
              value={String(table.getState().pagination.pageSize)}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
              disabled={isLoading}
            >
              <SelectTrigger className="w-[120px] sm:w-[140px]">
                <SelectValue aria-label="Taille de page" />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((pageSize) => (
                  <SelectItem key={pageSize} value={String(pageSize)}>
                    {pageSize} par page
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage() || isLoading}
            >
              Suivant
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
