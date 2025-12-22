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
import { useState } from 'react';
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
  maxHeight?: string;
  showSearch?: boolean;
  showPagination?: boolean;
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

  const pageCount = table.getPageCount();
  const pageIndex = table.getState().pagination.pageIndex;

  return (
    <div className="space-y-4 w-full">
      {/* Barre de recherche - conditionnelle */}
      {showSearch && (
        <div className="flex items-center gap-2">
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
        </div>
      )}

      {/* Tableau */}
      <div 
        className={cn(
          "border rounded-lg overflow-y-auto",
          maxHeight ? maxHeight : ""
        )}
      >
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-background">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header, headerIndex, headersArray) => (
                  <TableHead
                    key={header.id}
                    className={cn(
                      header.column.getCanSort() && 'cursor-pointer select-none hover:bg-muted/50',
                      'transition-colors sticky top-0 bg-background',
                      headerIndex < headersArray.length - 1 ? 'border-r' : ''
                    )}
                    onClick={header.column.getToggleSortingHandler?.()}
                  >
                    <div className="flex items-center gap-2">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {header.column.getCanSort() && (
                        <div className="flex items-center gap-1">
                          {header.column.getIsSorted() === 'desc' ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : header.column.getIsSorted() === 'asc' ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronsUpDown className="h-4 w-4 opacity-50" />
                          )}
                        </div>
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
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
            ) : table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row, rowIndex) => {
                // ✅ Vérifier si la ligne est sélectionnée
                const isSelected = selectedRowId !== null && selectedRowId !== undefined && (
                  (row.original as any).Id_Sonde === selectedRowId ||
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
                    className={cn(
                      onRowClick && 'cursor-pointer hover:bg-muted/50',
                      isSelected && 'bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-100 border-l-4 border-l-blue-600 dark:border-l-blue-400 font-medium',
                      'transition-colors'
                    )}
                  >
                    {row.getVisibleCells().map((cell, cellIndex, cellsArray) => (
                      <TableCell 
                        key={`cell-${rowIndex}-${cellIndex}-${cell.id}`}
                        className={cellIndex < cellsArray.length - 1 ? 'border-r' : ''}
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
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Page {pageIndex + 1} sur {pageCount || 1} - Total: {table.getFilteredRowModel().rows.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
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
              <SelectTrigger className="w-[80px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 20, 30, 40, 50].map((pageSize) => (
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
