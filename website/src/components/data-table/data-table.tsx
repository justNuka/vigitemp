"use client";

import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";

interface DataTableProps<TData> {
  columns: Array<{
    accessorKey: string;
    header: string;
    cell?: (info: any) => React.ReactNode;
    enableSorting?: boolean;
    enableColumnFilter?: boolean;
  }>;
  data: TData[];
}

export function DataTable<TData extends Record<string, any>>({
  columns,
  data,
}: DataTableProps<TData>) {
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sorting, setSorting] = useState<{
    column: string;
    direction: "asc" | "desc";
  } | null>(null);

  // Filter data
  const filteredData = useMemo(() => {
    return data.filter((row) => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        const cellValue = String(row[key] ?? "").toLowerCase();
        return cellValue.includes(value.toLowerCase());
      });
    });
  }, [data, filters]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sorting) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sorting.column];
      const bValue = b[sorting.column];

      if (aValue < bValue) return sorting.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sorting.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredData, sorting]);

  const handleSort = (column: string) => {
    setSorting((prev) => {
      if (prev?.column === column) {
        return {
          column,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      }
      return { column, direction: "asc" };
    });
  };

  const handleFilter = (column: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [column]: value,
    }));
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.accessorKey} className="p-0">
                  <div className="space-y-2 p-2">
                    {/* Sort button */}
                    {column.enableSorting ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSort(column.accessorKey)}
                        className="h-8 w-full justify-start gap-2 font-semibold"
                      >
                        {column.header}
                        <ArrowUpDown className="h-4 w-4 opacity-50" />
                      </Button>
                    ) : (
                      <div className="font-semibold px-2">{column.header}</div>
                    )}

                    {/* Filter input */}
                    {column.enableColumnFilter && (
                      <Input
                        type="text"
                        placeholder={`Rechercher...`}
                        value={filters[column.accessorKey] ?? ""}
                        onChange={(e) =>
                          handleFilter(column.accessorKey, e.target.value)
                        }
                        className="h-8 w-full text-sm"
                      />
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.length ? (
              sortedData.map((row, rowIdx) => (
                <TableRow key={rowIdx}>
                  {columns.map((column) => (
                    <TableCell key={column.accessorKey}>
                      {column.cell
                        ? column.cell({ getValue: () => row[column.accessorKey], row: { original: row } })
                        : row[column.accessorKey]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Aucun résultat.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
