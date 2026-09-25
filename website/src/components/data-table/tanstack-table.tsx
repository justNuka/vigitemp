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
  type Updater,
  useReactTable,
} from '@tanstack/react-table';
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { LazyMotion, domAnimation, m } from 'motion/react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { exportStyledExcel } from '@/lib/excel-export';
import { serializeDbDateTime } from '@/lib/date-display';
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
import { ChevronDown, ChevronUp, ChevronsUpDown, Download, Inbox, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export interface TanStackTableProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];
  searchField?: keyof TData | (keyof TData)[];
  searchPlaceholder?: string;
  pageSize?: number;
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: TData) => void;
  onRowDoubleClick?: (row: TData) => void;
  selectedRowId?: number | string | null;
  /**
   * Max-height du conteneur scrollable (CSS length, ex: "16rem", "384px", "60vh").
   * Rend l'en-tête sticky lorsqu'il y a un scroll vertical.
   */
  maxHeight?: string;
  showSearch?: boolean;
  showPagination?: boolean;
  toolbarLeft?: ReactNode;
  toolbarRight?: ReactNode;
  tableClassName?: string;
  headerClassName?: string;
  bodyClassName?: string;
  rowClassName?: (row: TData) => string | undefined;
  containerClassName?: string;
  toolbarClassName?: string;
  headerCellClassName?: string;
  exportFileName?: string;
  exportExcludeColumnIds?: string[];
  enableExport?: boolean;
  exportFormats?: Array<"xlsx" | "pdf">;
  promptExportCount?: boolean;
  enableExportColumnSelection?: boolean;
  exportData?: TData[];
  exportTitle?: string;
  exportFilters?: Array<{ label: string; value: string }>;
  manualPagination?: boolean;
  manualSorting?: boolean;
  pageCount?: number;
  totalRows?: number;
  paginationState?: { pageIndex: number; pageSize: number };
  onPaginationChange?: (
    updater:
      | { pageIndex: number; pageSize: number }
      | ((prev: { pageIndex: number; pageSize: number }) => { pageIndex: number; pageSize: number })
  ) => void;
  sortingState?: SortingState;
  onSortingChange?: (updater: Updater<SortingState>) => void;
  onFilteredRowCountChange?: (count: number) => void;
  resultsLabel?: string;
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
  pageSize = 200,
  isLoading = false,
  searchPlaceholder,
  emptyMessage,
  onRowClick,
  onRowDoubleClick,
  selectedRowId,
  maxHeight,
  showSearch = true,
  showPagination = true,
  toolbarLeft,
  toolbarRight,
  tableClassName,
  headerClassName,
  bodyClassName,
  rowClassName,
  containerClassName,
  toolbarClassName,
  headerCellClassName,
  exportFileName = "export",
  exportExcludeColumnIds = ["actions", "action", "select"],
  enableExport = true,
  exportFormats = ["xlsx", "pdf"],
  promptExportCount = false,
  enableExportColumnSelection = false,
  exportData,
  exportTitle,
  exportFilters = [],
  manualPagination = false,
  manualSorting = false,
  pageCount,
  totalRows,
  paginationState,
  onPaginationChange,
  sortingState,
  onSortingChange,
  onFilteredRowCountChange,
  resultsLabel,
}: TanStackTableProps<TData>) {
  const t = useTranslations('tanstackTable');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: pageSize,
  });

  const resolvedSearchPlaceholder = searchPlaceholder ?? t('search_placeholder');
  const resolvedEmptyMessage = emptyMessage ?? t('empty');

  const resolvedPagination = paginationState ?? pagination;
  const handlePaginationChange = onPaginationChange ?? setPagination;
  const resolvedSorting = sortingState ?? sorting;
  const handleSortingChange = onSortingChange ?? setSorting;

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting: resolvedSorting,
      columnFilters,
      globalFilter,
      pagination: resolvedPagination,
    },
    onSortingChange: handleSortingChange,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: handlePaginationChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination,
    manualSorting,
    pageCount: manualPagination ? pageCount : undefined,
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
    new Set([10, 20, 50, 100, 200, 500, 1000, table.getState().pagination.pageSize])
  ).sort((a, b) => a - b);

  const rows = showPagination ? table.getRowModel().rows : table.getFilteredRowModel().rows;
  const filteredRowCount = table.getFilteredRowModel().rows.length;

  const exportableColumns = useMemo(() => {
    const exclude = new Set(exportExcludeColumnIds);
    return table
      .getAllLeafColumns()
      .filter((col) => col.getIsVisible())
      .filter((col) => !exclude.has(col.id));
  }, [exportExcludeColumnIds, table]);

  const exportRows = useMemo(() => {
    // Export the current logical dataset after local filters/sorting, but before pagination.
    return table.getPrePaginationRowModel().rows;
  }, [table]);

  const exportDataRows = useMemo(() => {
    if (!exportData) return null;

    const searchTerm = globalFilter.trim().toLocaleLowerCase();
    if (!searchTerm) return exportData;

    return exportData.filter((rowData) => {
      if (searchField) {
        const fieldsToSearch = Array.isArray(searchField) ? searchField : [searchField];
        return fieldsToSearch.some((field) => {
          const fieldValue = rowData[field];
          return fieldValue != null && String(fieldValue).toLocaleLowerCase().includes(searchTerm);
        });
      }

      return Object.values(rowData).some((value) =>
        value != null && String(value).toLocaleLowerCase().includes(searchTerm),
      );
    });
  }, [exportData, globalFilter, searchField]);
  const exportRowCount = exportDataRows?.length ?? exportRows.length;

  useEffect(() => {
    onFilteredRowCountChange?.(filteredRowCount);
  }, [filteredRowCount, onFilteredRowCountChange]);

  const [selectedExportColumnIds, setSelectedExportColumnIds] = useState<string[]>([]);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [pendingExportFormat, setPendingExportFormat] = useState<"xlsx" | "pdf" | null>(null);
  const [exportCountInput, setExportCountInput] = useState("");

  const availableExportColumnIds = useMemo(() => {
    return exportableColumns.map((col) => col.id);
  }, [exportableColumns]);

  const selectedExportColumns = useMemo(() => {
    if (!enableExportColumnSelection || selectedExportColumnIds.length === 0) {
      return exportableColumns;
    }

    const selectedIds = new Set(selectedExportColumnIds);
    const selectedColumns = exportableColumns.filter((col) => selectedIds.has(col.id));

    return selectedColumns.length > 0 ? selectedColumns : exportableColumns;
  }, [enableExportColumnSelection, exportableColumns, selectedExportColumnIds]);

  useEffect(() => {
    if (!enableExportColumnSelection) {
      return;
    }

    setSelectedExportColumnIds((current) => {
      if (availableExportColumnIds.length === 0) {
        return current.length === 0 ? current : [];
      }

      if (current.length === 0) {
        return availableExportColumnIds;
      }

      const next = current.filter((id) => availableExportColumnIds.includes(id));
      const fallback = next.length > 0 ? next : availableExportColumnIds;
      if (
        fallback.length === current.length &&
        fallback.every((id, index) => current[index] === id)
      ) {
        return current;
      }
      return fallback;
    });
  }, [enableExportColumnSelection, availableExportColumnIds]);

  const getExportColumnLabel = useCallback((column: (typeof exportableColumns)[number]) => {
    const metaLabel = (column.columnDef as any)?.meta?.exportLabel as string | undefined;
    if (metaLabel) return metaLabel;

    const header = column.columnDef.header;
    if (typeof header === "string") return header;
    return column.id;
  }, []);

  const exportHeaders = useMemo(() => {
    return selectedExportColumns.map((col) => getExportColumnLabel(col));
  }, [getExportColumnLabel, selectedExportColumns]);

  function formatExportValue(value: unknown): string {
    if (value == null) return "";
    if (value instanceof Date) return serializeDbDateTime(value) ?? "";
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

  function resolveRowsToExport(requestedCount?: number | null) {
    const rowsSource = exportDataRows ?? exportRows;
    if (rowsSource.length === 0) {
      return rowsSource;
    }

    if (!promptExportCount || requestedCount === null || requestedCount === undefined) {
      return rowsSource;
    }

    const parsedCount = Math.trunc(requestedCount);
    if (!Number.isFinite(parsedCount) || parsedCount < 1 || parsedCount > rowsSource.length) {
      toast.error(t('export_count_prompt.invalid', { max: rowsSource.length }));
      return null;
    }

    return rowsSource.slice(0, parsedCount);
  }

  function buildExportMatrixForRows(rowsToExport: typeof exportRows | TData[]) {
    const body = rowsToExport.map((row) => {
      const rawRow = (typeof (row as any)?.getValue === "function"
        ? (row as any).original
        : row) as TData;

      const resolveExportValue = (col: (typeof selectedExportColumns)[number], fallback: unknown) => {
        const exportValue = (col.columnDef as any)?.meta?.exportValue as
          | ((data: TData) => unknown)
          | undefined;
        return formatExportValue(exportValue ? exportValue(rawRow) : fallback);
      };

      if (typeof (row as any)?.getValue === "function") {
        return selectedExportColumns.map((col) => resolveExportValue(col, (row as any).getValue(col.id)));
      }

      return selectedExportColumns.map((col) => {
        const columnDef = col.columnDef as any;
        if (typeof columnDef.accessorFn === "function") {
          return resolveExportValue(col, columnDef.accessorFn(rawRow, 0));
        }
        if (typeof columnDef.accessorKey === "string") {
          return resolveExportValue(col, (rawRow as Record<string, unknown>)[columnDef.accessorKey]);
        }
        return resolveExportValue(col, "");
      });
    });
    return { headers: exportHeaders, rows: body };
  }

  function isExportColumnSelected(columnId: string) {
    if (!enableExportColumnSelection || selectedExportColumnIds.length === 0) {
      return true;
    }
    return selectedExportColumnIds.includes(columnId);
  }

  function toggleExportColumn(columnId: string, checked: boolean) {
    setSelectedExportColumnIds((current) => {
      const normalizedCurrent = current.length > 0 ? current : availableExportColumnIds;

      if (checked) {
        if (normalizedCurrent.includes(columnId)) {
          return normalizedCurrent;
        }
        return [...normalizedCurrent, columnId];
      }

      const next = normalizedCurrent.filter((id) => id !== columnId);
      if (next.length === 0) {
        toast.error(t('export_columns.at_least_one'));
        return normalizedCurrent;
      }
      return next;
    });
  }

  function requestExport(format: "xlsx" | "pdf") {
    if (promptExportCount && exportRowCount > 0) {
      setPendingExportFormat(format);
      setExportCountInput(String(exportRowCount));
      setExportDialogOpen(true);
      return;
    }

    if (format === "xlsx") {
      void exportExcel();
      return;
    }
    void exportPdf();
  }

  function confirmExportWithCount() {
    if (!pendingExportFormat) return;
    const parsedCount = Number.parseInt(exportCountInput.trim(), 10);
    if (!Number.isFinite(parsedCount)) {
      toast.error(t('export_count_prompt.invalid', { max: exportRowCount }));
      return;
    }

    if (pendingExportFormat === "xlsx") {
      void exportExcel(parsedCount);
    } else {
      void exportPdf(parsedCount);
    }

    setExportDialogOpen(false);
    setPendingExportFormat(null);
  }

  async function exportExcel(requestedCount?: number | null) {
    const rowsToExport = resolveRowsToExport(requestedCount);
    if (!rowsToExport) return;

    const { headers, rows } = buildExportMatrixForRows(rowsToExport);
    const exportedAt = new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "medium",
    }).format(new Date());
    const presentationRows = [
      { label: "Date export", value: exportedAt },
      { label: "Nombre de lignes", value: rows.length },
      ...exportFilters
        .filter((filter) => filter.value.trim().length > 0)
        .map((filter) => ({ label: filter.label, value: filter.value })),
    ];
    await exportStyledExcel({
      fileName: exportFileName,
      title: exportTitle ?? exportFileName,
      presentationSheetName: "Presentation",
      dataSheetName: "Donnees",
      presentationHeaders: ["Information", "Valeur"],
      presentationRows,
      dataHeaders: headers,
      dataRows: rows,
    });
  }

  async function exportPdf(requestedCount?: number | null) {
    const rowsToExport = resolveRowsToExport(requestedCount);
    if (!rowsToExport) return;

    const { headers, rows } = buildExportMatrixForRows(rowsToExport);

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



  return (
    <>
      <div className="w-full space-y-3">
      {/* Barre d'outils - conditionnelle */}
      {(toolbarLeft || showSearch || enableExport || toolbarRight) && (
        <div className={cn("flex flex-wrap items-center gap-2 border-b border-border px-3 py-2", toolbarClassName)}>
          {toolbarLeft}
          {showSearch && (
            <>
              <Input
                placeholder={resolvedSearchPlaceholder}
                value={globalFilter ?? ''}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className={cn(
                  "h-8 max-w-sm border-border bg-[hsl(var(--primary-soft)/0.55)] text-[13px] shadow-sm transition-[border-color,box-shadow,background-color] duration-200 ease-out",
                  "hover:border-[hsl(var(--border-strong))] focus-visible:border-primary/55 focus-visible:ring-2 focus-visible:ring-primary/15 focus-visible:ring-offset-0",
                  globalFilter && "border-primary/45 bg-[hsl(var(--primary-soft))]",
                )}
                disabled={isLoading}
              />
              {globalFilter ? (
                <>
                  <Badge variant="secondary" className="border border-[#26A5DA]/35 bg-[#26A5DA]/8 text-[#075776] dark:text-sky-50">
                    {t('filter_active')}
                  </Badge>
                  <Button type="button" size="sm" variant="ghost" className="gap-1" onClick={() => setGlobalFilter("")} disabled={isLoading}>
                    <X className="h-4 w-4" />
                    {t('clear_search')}
                  </Button>
                </>
              ) : null}
              <span className="text-sm text-muted-foreground">
                {resultsLabel ?? t('results', { count: filteredRowCount })}
              </span>
            </>
          )}
          {(enableExport || toolbarRight) && (
            <div className="ml-auto flex items-center gap-2">
              {enableExport && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline" className="gap-2"
                      disabled={isLoading}
                    >
                      <Download className="h-4 w-4" />
                      {t('export')}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {exportFormats.includes("xlsx") ? (
                      <DropdownMenuItem onClick={() => requestExport("xlsx")}>Excel</DropdownMenuItem>
                    ) : null}
                    {exportFormats.includes("pdf") ? (
                      <DropdownMenuItem onClick={() => requestExport("pdf")}>PDF</DropdownMenuItem>
                    ) : null}
                    {enableExportColumnSelection && exportableColumns.length > 0 ? (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>{t('export_columns.title')}</DropdownMenuLabel>
                        {exportableColumns.map((column) => (
                          <DropdownMenuCheckboxItem
                            key={`export-column-${column.id}`}
                            checked={isExportColumnSelected(column.id)}
                            onCheckedChange={(checked) => toggleExportColumn(column.id, checked === true)}
                            onSelect={(event) => event.preventDefault()}
                          >
                            {getExportColumnLabel(column)}
                          </DropdownMenuCheckboxItem>
                        ))}
                      </>
                    ) : null}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {toolbarRight}
            </div>
          )}
        </div>
      )}

      {/* Tableau */}
      <div
        className={cn(
          "isolate max-w-full overflow-auto rounded-lg border border-border bg-card",
          (toolbarLeft || showSearch || enableExport || toolbarRight) && "-mt-3 rounded-t-none border-t-0",
          "[&>div]:max-h-(--vt-table-max-height)",
          "[&>div]:overflow-auto",
          containerClassName
        )}
        style={{
          // `none` garde le comportement actuel (pas de limite de hauteur).
          ['--vt-table-max-height' as any]: maxHeight ?? 'none',
        }}
      >
        <LazyMotion features={domAnimation}>
        <Table className={tableClassName}>
          <TableHeader
            className={cn(
              "sticky top-0 z-10 bg-[hsl(var(--surface-muted))] text-muted-foreground",
              headerClassName
            )}
          >
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

                    const headerMeta = (header.column.columnDef as any)?.meta as
                      | { headerClassName?: string }
                      | undefined;
                    const headerCellMetaClass = headerMeta?.headerClassName;

                    return (
                      <TableHead
                        key={header.id}
                        className={cn(
                          canSort && 'cursor-pointer select-none hover:bg-[hsl(var(--surface-sunken)/0.70)] hover:text-foreground',
                          'sticky top-0 z-10 border-b border-r border-border bg-[hsl(var(--surface-muted))] text-[11px] font-semibold text-muted-foreground shadow-none transition-colors',
                          headerCellClassName,
                          headerCellMetaClass
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
                        <div className="flex items-center justify-center gap-2 text-center">
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

          <TableBody
            className={cn(
              "[&_tr:last-child]:border-b",
              bodyClassName
            )}
          >
            {isLoading ? (
              Array.from({
                length: Math.min(10, showPagination ? table.getState().pagination.pageSize : 10),
              }).map((_, rowIndex) => (
                <TableRow key={`loading-${rowIndex}`} className="hover:bg-transparent">
                  {table.getVisibleLeafColumns().map((col, colIndex) => (
                    <TableCell key={`loading-${rowIndex}-${col.id}-${colIndex}`} className="border-r border-border">
                      <div className="h-4 rounded animate-shimmer" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : rows.length > 0 ? (
              rows.map((row, rowIndex) => {
                // Vérifier si la ligne est sélectionnée
                const isSelected = selectedRowId !== null && selectedRowId !== undefined && (
                  (row.original as Record<string, unknown>)['Id_Sonde'] === selectedRowId ||
                  (row.original as Record<string, unknown>)['Id_Calibrage'] === selectedRowId ||
                  (row.original as Record<string, unknown>)['Id_Ajustage'] === selectedRowId ||
                  (row.original as Record<string, unknown>)['Id_Etalonnage'] === selectedRowId ||
                  (row.original as Record<string, unknown>)['Id_Site'] === selectedRowId ||
                  (row.original as Record<string, unknown>)['Id_Lieu'] === selectedRowId ||
                  (row.original as Record<string, unknown>)['Id_Utilisateur'] === selectedRowId ||
                  (row.original as Record<string, unknown>)['Id_Groupe'] === selectedRowId ||
                  (row.original as Record<string, unknown>)['Id_Profil'] === selectedRowId ||
                  (row.original as Record<string, unknown>)['Id_Etalon'] === selectedRowId ||
                  (row.original as Record<string, unknown>)['Id_Actionneur'] === selectedRowId ||
                  (row.original as Record<string, unknown>)['Id_Alarme'] === selectedRowId ||
                  (row.original as Record<string, unknown>)['id'] === selectedRowId ||
                  (row.original as Record<string, unknown>)['Id'] === selectedRowId
                );

                return (
                  <m.tr
                    key={`row-${rowIndex}-${row.id}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: Math.min(rowIndex, 10) * 0.04,
                      duration: 0.22,
                      ease: [0.22, 1, 0.36, 1] as const,
                    }}
                    onClick={() => onRowClick?.(row.original)}
                    onDoubleClick={() => onRowDoubleClick?.(row.original)}
                    onKeyDown={(e: React.KeyboardEvent<HTMLTableRowElement>) => {
                      if (!onRowClick) return;
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onRowClick(row.original);
                      }
                    }}
                    tabIndex={onRowClick ? 0 : undefined}
                    aria-selected={isSelected || undefined}
                    className={cn(
                      "border-b transition-colors duration-150",
                      onRowClick && 'cursor-pointer hover:bg-[hsl(var(--surface-muted)/0.80)]',
                      onRowDoubleClick && 'cursor-pointer',
                      isSelected &&
                        'bg-primary/[0.07] font-medium [&_td:first-child]:border-l-[3px] [&_td:first-child]:border-l-primary',
                      onRowClick && 'focus-visible:outline-none focus-visible:bg-primary/[0.05] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/60',
                      rowClassName?.(row.original),
                    )}
                  >
                    {row.getVisibleCells().map((cell, cellIndex) => {
                      const cellMeta = (cell.column.columnDef as { meta?: { cellClassName?: string } })?.meta;
                      const cellMetaClass = cellMeta?.cellClassName;

                      return (
                      <TableCell
                        key={`cell-${rowIndex}-${cellIndex}-${cell.id}`}
                        className={cn("border-r border-border/70", cellMetaClass)}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                      );
                    })}
                  </m.tr>
                );
              })
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={columns.length}
                  className="py-12 text-center"
                >
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Inbox className="h-8 w-8 opacity-40" />
                    <p className="text-sm">{resolvedEmptyMessage}</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        </LazyMotion>
      </div>

      {/* Contrôles de pagination - conditionnels */}
      {showPagination && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {t('pagination.summary', {
                current: table.getState().pagination.pageIndex + 1,
                total: table.getPageCount(),
                count:
                  manualPagination && typeof totalRows === "number"
                    ? totalRows
                    : filteredRowCount,
              })}
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 rounded-md border border-border bg-muted/10 px-2 py-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage() || isLoading}
              className="border-primary/40 text-primary hover:bg-primary/10"
            >
              {t('pagination.previous')}
            </Button>

            <Select
              value={String(table.getState().pagination.pageSize)}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
              disabled={isLoading}
            >
              <SelectTrigger className="w-30 sm:w-35">
                <SelectValue aria-label={t('pagination.page_size_label')} />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((pageSize) => (
                  <SelectItem key={pageSize} value={String(pageSize)}>
                    {t('pagination.page_size_option', { count: pageSize })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage() || isLoading}
              className="border-primary/40 text-primary hover:bg-primary/10"
            >
              {t('pagination.next')}
            </Button>
          </div>
        </div>
      )}
      </div>

      <Dialog
        open={exportDialogOpen}
        onOpenChange={(open) => {
          setExportDialogOpen(open);
          if (!open) {
            setPendingExportFormat(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('export_count_prompt.title')}</DialogTitle>
                  <DialogDescription>{t('export_count_prompt.message', { max: exportRowCount })}</DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Input
              type="number"
              min={1}
                        max={Math.max(1, exportRowCount)}
              value={exportCountInput}
              onChange={(event) => setExportCountInput(event.target.value)}
              aria-label={t('export_count_prompt.input_label')}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setExportDialogOpen(false)}>
              {t('export_count_prompt.cancel')}
            </Button>
            <Button onClick={confirmExportWithCount}>{t('export_count_prompt.confirm')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

