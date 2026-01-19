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
import { useMemo, useState, type ReactNode } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from "@/components/ui/skeleton";
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
import { ChevronDown, ChevronUp, ChevronsUpDown, Download, Printer } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  exportFileName?: string;
  exportExcludeColumnIds?: string[];
  enableExport?: boolean;
  enablePrint?: boolean;
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
  exportFileName = "export",
  exportExcludeColumnIds = ["actions", "action", "select"],
  enableExport = true,
  enablePrint = true,
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

  const exportableColumns = useMemo(() => {
    const exclude = new Set(exportExcludeColumnIds);
    return table
      .getAllLeafColumns()
      .filter((col) => col.getIsVisible())
      .filter((col) => !exclude.has(col.id));
  }, [exportExcludeColumnIds, table]);

  const exportRows = useMemo(() => {
    // Export what is currently in the table (filtered + sorted), not only the current page.
    return table.getPrePaginationRowModel().rows;
  }, [table]);

  const exportHeaders = useMemo(() => {
    return exportableColumns.map((col) => {
      const metaLabel = (col.columnDef as any)?.meta?.exportLabel as string | undefined;
      if (metaLabel) return metaLabel;

      const header = col.columnDef.header;
      if (typeof header === "string") return header;
      return col.id;
    });
  }, [exportableColumns]);

  function formatExportValue(value: unknown): string {
    if (value == null) return "";
    if (value instanceof Date) return value.toISOString();
    if (Array.isArray(value)) return value.map((v) => formatExportValue(v)).join(", ");
    if (typeof value === "object") {
      try {
        return JSON.stringify(value);
      } catch {
        return String(value);
      }
    }
    return String(value);
  }

  function buildExportMatrix() {
    const body = exportRows.map((row) => {
      return exportableColumns.map((col) => formatExportValue(row.getValue(col.id)));
    });
    return { headers: exportHeaders, rows: body };
  }

  function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function exportCsv() {
    const { headers, rows } = buildExportMatrix();
    const delimiter = ";";
    const escape = (value: string) => {
      const needsQuotes = value.includes("\"") || value.includes("\n") || value.includes("\r") || value.includes(delimiter);
      const escaped = value.replace(/\"/g, "\"\"");
      return needsQuotes ? `"${escaped}"` : escaped;
    };

    const lines = [
      headers.map((h) => escape(String(h))).join(delimiter),
      ...rows.map((r) => r.map((v) => escape(String(v))).join(delimiter)),
    ];

    const blob = new Blob([lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
    downloadBlob(blob, `${exportFileName}.csv`);
  }

  async function exportExcel() {
    const { headers, rows } = buildExportMatrix();
    const xlsx = await import("xlsx");

    const worksheet = xlsx.utils.aoa_to_sheet([headers, ...rows]);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "Export");

    const arrayBuffer = xlsx.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([arrayBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    downloadBlob(blob, `${exportFileName}.xlsx`);
  }

  async function exportPdf() {
    const { headers, rows } = buildExportMatrix();

    const jsPDFModule = await import("jspdf");
    const autoTable = (await import("jspdf-autotable")).default;

    const doc = new jsPDFModule.jsPDF({ orientation: "landscape", unit: "pt" });
    autoTable(doc as any, {
      head: [headers],
      body: rows,
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [30, 64, 175] },
      margin: { top: 36, left: 24, right: 24, bottom: 24 },
    });

    doc.save(`${exportFileName}.pdf`);
  }

  function printTableOnly() {
    const { headers, rows } = buildExportMatrix();
    const html = `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${exportFileName}</title>
    <style>
      body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; padding: 16px; }
      h1 { font-size: 16px; margin: 0 0 12px 0; }
      table { width: 100%; border-collapse: collapse; }
      th, td { border: 1px solid #e5e7eb; padding: 6px 8px; font-size: 12px; text-align: left; vertical-align: top; }
      thead th { background: #f3f4f6; }
      @media print { body { padding: 0; } h1 { margin-bottom: 8px; } }
    </style>
  </head>
  <body>
    <h1>${exportFileName}</h1>
    <table>
      <thead>
        <tr>${headers.map((h) => `<th>${String(h)}</th>`).join("")}</tr>
      </thead>
      <tbody>
        ${rows
          .map((r) => `<tr>${r.map((c) => `<td>${String(c).replace(/</g, "&lt;")}</td>`).join("")}</tr>`)
          .join("")}
      </tbody>
    </table>
  </body>
</html>
`.trim();

    const w = window.open("", "_blank", "noopener,noreferrer");
    if (!w) return;
    w.document.open();
    w.document.write(html);
    w.document.close();
    w.focus();
    w.print();
    w.close();
  }

  return (
    <div className="space-y-4 w-full">
      {/* Barre d'outils - conditionnelle */}
      {(showSearch || enableExport || enablePrint || toolbarRight) && (
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
          {(enableExport || enablePrint || toolbarRight) && (
            <div className="ml-auto flex items-center gap-2">
              {enableExport && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2" disabled={isLoading}>
                      <Download className="h-4 w-4" />
                      Export
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={exportCsv}>CSV</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => void exportExcel()}>Excel</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => void exportPdf()}>PDF</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {enablePrint && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  disabled={isLoading}
                  onClick={printTableOnly}
                >
                  <Printer className="h-4 w-4" />
                  Imprimer
                </Button>
              )}

              {toolbarRight}
            </div>
          )}
        </div>
      )}

      {/* Tableau */}
      <div
        className={cn(
          "border rounded-lg overflow-hidden",
          "[&>div]:max-h-(--vt-table-max-height)",
          "[&>div]:overflow-auto"
        )}
        style={{
          // `none` garde le comportement actuel (pas de limite de hauteur).
          ['--vt-table-max-height' as any]: maxHeight ?? 'none',
        }}
      >
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-muted/40 backdrop-blur supports-backdrop-filter:bg-muted/20">
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
                          'transition-colors sticky top-0 bg-muted/40 backdrop-blur supports-backdrop-filter:bg-muted/20 border-b border-border border-r'
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
              Array.from({
                length: Math.min(10, showPagination ? table.getState().pagination.pageSize : 10),
              }).map((_, rowIndex) => (
                <TableRow key={`loading-${rowIndex}`} className="hover:bg-transparent">
                  {table.getVisibleLeafColumns().map((col, colIndex) => (
                    <TableCell key={`loading-${rowIndex}-${col.id}-${colIndex}`} className="border-r border-border">
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
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
              <SelectTrigger className="w-30 sm:w-35">
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
