"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TanStackTable } from "@/components/data-table/tanstack-table";
import { Input } from "@/components/ui/input";
import StepperFileUpload, {
  type AdjustmentImportResult,
  type AdjustmentInsertData,
} from "@/components/stepper-file-upload";

type AdjustmentImportRow = {
  id: string;
  file: string;
  sensor: string | null;
  dateText: string | null;
  operator: string | null;
  coeffX: number | null;
  coeffConstant: number | null;
  measureEtalon1: number | null;
  measureEtalon2: number | null;
  unit: string | null;
  insertData: AdjustmentInsertData;
  persisted: boolean;
};

export function AdjustmentImportClient() {
  const t = useTranslations("sensorAdjustmentImport");
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<AdjustmentImportRow[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [stepperSessionKey, setStepperSessionKey] = useState(0);
  const [editRowId, setEditRowId] = useState<string | null>(null);
  const [editOperator, setEditOperator] = useState("");
  const [editUnit, setEditUnit] = useState("");

  const handleUploadResult = (result: AdjustmentImportResult) => {
    const dateText = result.dateText ?? (typeof result.date === "string" ? result.date : null);
    setRows((prev) => {
      if (prev.some((row) => row.id === result.id)) return prev;
      return [
        {
          id: result.id,
          file: result.file,
          sensor: result.sensor,
          dateText,
          operator: result.operator,
          coeffX: result.coeffX,
          coeffConstant: result.coeffConstant,
          measureEtalon1: result.measureEtalon1,
          measureEtalon2: result.measureEtalon2,
          unit: result.unit,
          insertData: result.insertData,
          persisted: false,
        },
        ...prev,
      ];
    });
  };

  const formatNumber = (value: number | null) => {
    if (value === null || Number.isNaN(value)) return "-";
    return value.toString();
  };

  const openEdit = (row: AdjustmentImportRow) => {
    setEditRowId(row.id);
    setEditOperator(row.operator ?? "");
    setEditUnit(row.unit ?? "");
  };

  const closeEdit = () => {
    setEditRowId(null);
    setEditOperator("");
    setEditUnit("");
  };

  const applyEdit = () => {
    if (!editRowId) return;
    setRows((prev) =>
      prev.map((row) => {
        if (row.id !== editRowId) return row;
        return {
          ...row,
          operator: editOperator.trim() || null,
          unit: editUnit.trim() || null,
          insertData: {
            ...row.insertData,
            Operateur: editOperator.trim() || null,
            Unite: editUnit.trim() || null,
          },
        };
      }),
    );
    closeEdit();
  };

  const pendingRows = useMemo(() => rows.filter((row) => !row.persisted), [rows]);

  const handleSaveToDb = async () => {
    if (isSaving) return;
    if (pendingRows.length === 0) {
      toast.error(t("toast.no_pending"));
      return;
    }

    const postBulk = async (confirmOverwrite: boolean) => {
      const response = await fetch("/api/sondes/ajustages/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rows: pendingRows.map((row) => ({
            id: row.id,
            file: row.file,
            insertData: row.insertData,
          })),
          confirmOverwrite,
        }),
      });

      const payload = await response.json().catch(() => null);
      return { response, payload };
    };

    setIsSaving(true);
    try {
      let { response, payload } = await postBulk(false);

      if (!response.ok && payload?.error?.code === "confirmation_required") {
        const adjustmentList = (payload?.error?.details?.sensorsWithAdjustment as string[] | undefined) ?? [];
        const offsetList = ((payload?.error?.details?.sensorsWithOffset as { Sonde_Numero_Serie?: string | null }[] | undefined) ?? [])
          .map((item) => item?.Sonde_Numero_Serie)
          .filter((item): item is string => !!item);

        const parts: string[] = [];
        if (adjustmentList.length > 0) {
          parts.push(`${t("toast.confirm_adjustment_overwrite", { count: adjustmentList.length })} ${adjustmentList.join(", ")}`);
        }
        if (offsetList.length > 0) {
          parts.push(`${t("toast.confirm_offset_clear", { count: offsetList.length })} ${offsetList.join(", ")}`);
        }

        const confirmed = window.confirm(parts.join("\n\n"));
        if (!confirmed) {
          setIsSaving(false);
          return;
        }

        ({ response, payload } = await postBulk(true));
      }

      if (!response.ok) {
        const message = payload?.error?.message || t("toast.save_error");
        throw new Error(message);
      }

      const insertedCount: number = payload?.data?.inserted ?? 0;
      const skippedCount: number = payload?.data?.skipped ?? 0;
      const overwrittenAdjustments: number = payload?.data?.overwrittenAdjustments ?? 0;
      const clearedOffsets: number = payload?.data?.clearedOffsets ?? 0;

      if (insertedCount > 0) {
        toast.success(t("toast.save_success", { count: insertedCount }));
      }
      if (skippedCount > 0) {
        toast.error(t("toast.save_skipped", { count: skippedCount }));
      }
      if (overwrittenAdjustments > 0) {
        toast.success(t("toast.overwrite_done", { count: overwrittenAdjustments }));
      }
      if (clearedOffsets > 0) {
        toast.success(t("toast.offsets_cleared", { count: clearedOffsets }));
      }

      setRows([]);
      setOpen(false);
      setStepperSessionKey((prev) => prev + 1);
      closeEdit();
    } catch (error) {
      const message = error instanceof Error ? error.message : t("toast.save_error");
      toast.error(message || t("toast.save_error"));
      console.error("Error while saving adjustments", error);
    } finally {
      setIsSaving(false);
    }
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
      accessorKey: "unit",
      header: t("table.columns.unit"),
      cell: ({ row }) => row.getValue("unit") || "-",
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
    {
      id: "actions",
      header: t("table.columns.actions"),
      cell: ({ row }) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => openEdit(row.original)}
          disabled={row.original.persisted}
        >
          {t("actions.edit")}
        </Button>
      ),
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
        <CardContent className="space-y-4 p-2 md:p-4 xl:p-4">
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

          <div className="flex justify-end">
            <Button
              className="gap-2"
              onClick={handleSaveToDb}
              disabled={pendingRows.length === 0 || isSaving}
            >
              {isSaving ? t("actions.saving_to_db") : t("actions.save_to_db")}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl h-[88vh] max-h-[88vh] overflow-hidden outline-none focus:outline-none focus:ring-0 ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 flex flex-col">
          <DialogHeader>
            <DialogTitle>{t("modal.title")}</DialogTitle>
            <p className="text-sm text-muted-foreground">{t("modal.description")}</p>
          </DialogHeader>
          <div className="flex-1 min-h-0 flex flex-col">
            <StepperFileUpload key={stepperSessionKey} onUploadResult={handleUploadResult} onFinish={() => setOpen(false)} />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editRowId} onOpenChange={(openState) => (!openState ? closeEdit() : null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("edit.title")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("edit.operator")}</label>
              <Input value={editOperator} onChange={(event) => setEditOperator(event.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("edit.unit")}</label>
              <Input value={editUnit} onChange={(event) => setEditUnit(event.target.value)} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={closeEdit}>{t("actions.cancel")}</Button>
              <Button onClick={applyEdit}>{t("actions.apply")}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

