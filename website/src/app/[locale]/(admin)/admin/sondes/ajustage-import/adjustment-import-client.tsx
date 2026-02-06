"use client";

import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TanStackTable } from "@/components/data-table/tanstack-table";
import StepperFileUpload, { type AdjustmentImportResult } from "@/components/stepper-file-upload";

type AdjustmentImportRow = {
  id: number;
  file: string;
  sensor: string | null;
  dateText: string | null;
  operator: string | null;
  coeffX: number | null;
  coeffConstant: number | null;
  measureEtalon1: number | null;
  measureEtalon2: number | null;
  unit: string | null;
};

export function AdjustmentImportClient() {
  const t = useTranslations("sensorAdjustmentImport");
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<AdjustmentImportRow[]>([]);

  const handleUploadResult = (result: AdjustmentImportResult) => {
    const dateText = result.dateText ?? (typeof result.date === "string" ? result.date : null);
    setRows((prev) => {
      if (prev.some((row) => row.id === result.id)) return prev;
      return [
        {
          id: result.id,
          file: result.file,
          sensor: result.sensor,
          dateText: dateText,
          operator: result.operator,
          coeffX: result.coeffX,
          coeffConstant: result.coeffConstant,
          measureEtalon1: result.measureEtalon1,
          measureEtalon2: result.measureEtalon2,
          unit: result.unit,
        },
        ...prev,
      ];
    });
  };

  const formatNumber = (value: number | null) => {
    if (value === null || Number.isNaN(value)) return "-";
    return value.toString();
  };

  const columns: ColumnDef<AdjustmentImportRow>[] = [
    {
      accessorKey: "file",
      header: t("table.columns.file"),
      cell: ({ row }) => <span className="font-medium">{row.getValue("file") || "-"}</span>,
    },
    {
      accessorKey: "sensor",
      header: t("table.columns.sensor"),
      cell: ({ row }) => row.getValue("sensor") || "-",
    },
    {
      accessorKey: "dateText",
      header: t("table.columns.date"),
      cell: ({ row }) => row.getValue("dateText") || "-",
    },
    {
      accessorKey: "operator",
      header: t("table.columns.operator"),
      cell: ({ row }) => row.getValue("operator") || "-",
    },
    {
      accessorKey: "coeffX",
      header: t("table.columns.coeff_x"),
      cell: ({ row }) => formatNumber(row.original.coeffX),
    },
    {
      accessorKey: "coeffConstant",
      header: t("table.columns.coeff_constant"),
      cell: ({ row }) => formatNumber(row.original.coeffConstant),
    },
    {
      accessorKey: "measureEtalon1",
      header: t("table.columns.measure_etalon_1"),
      cell: ({ row }) => formatNumber(row.original.measureEtalon1),
    },
    {
      accessorKey: "measureEtalon2",
      header: t("table.columns.measure_etalon_2"),
      cell: ({ row }) => formatNumber(row.original.measureEtalon2),
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle>{t("table.title")}</CardTitle>
            <Button size="sm" className="gap-2" onClick={() => setOpen(true)}>
              {t("actions.import")}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-2 md:p-4 xl:p-4">
          <TanStackTable
            columns={columns}
            data={rows}
            showSearch={false}
            showPagination={false}
            emptyMessage={t("table.empty")}
            headerClassName="!bg-sidebar !text-sidebar-foreground"
            headerCellClassName="!bg-sidebar !text-sidebar-foreground !border-r !border-white/25 hover:!bg-sidebar-accent/80"
            tableClassName="border-separate border-spacing-0 [&_thead_th]:!border-r [&_thead_th]:!border-white/25 [&_thead_th:last-child]:!border-r-0"
          />
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl h-[88vh] max-h-[88vh] overflow-hidden outline-none focus:outline-none focus:ring-0 ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 flex flex-col">
          <DialogHeader>
            <DialogTitle>{t("modal.title")}</DialogTitle>
            <p className="text-sm text-muted-foreground">{t("modal.description")}</p>
          </DialogHeader>
          <div className="flex-1 min-h-0 flex flex-col"><StepperFileUpload onUploadResult={handleUploadResult} onFinish={() => setOpen(false)} /></div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

