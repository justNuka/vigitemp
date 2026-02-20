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
import StepperCalibrationFileUpload, {
  type CalibrationImportResult,
  type CalibrationInsertData,
} from "@/components/stepper-calibration-file-upload";

const formatDateTimeFr = (value: string | Date | null | undefined) => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
};

const formatDateFr = (value: string | Date | null | undefined) => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

type CalibrationImportRow = {
  id: string;
  file: string;
  sensor: string | null;
  dateText: string | null;
  dateValidityText: string | null;
  uncertainty: string | null;
  errJustesse: string | null;
  insertData: CalibrationInsertData;
  persisted: boolean;
};

export function CalibrationImportClient() {
  const t = useTranslations("sensorCalibrationImport");
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<CalibrationImportRow[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [stepperSessionKey, setStepperSessionKey] = useState(0);
  const [editRowId, setEditRowId] = useState<string | null>(null);
  const [editValidityDays, setEditValidityDays] = useState<string>("");

  const handleUploadResult = (result: CalibrationImportResult) => {
    const dateText =
      formatDateTimeFr(result.date) ??
      result.dateText ??
      (typeof result.date === "string" ? result.date : null);

    const dateValidityText =
      formatDateFr(result.dateValidity) ??
      result.dateValidityText ??
      (typeof result.dateValidity === "string" ? result.dateValidity : null);

    setRows((prev) => {
      if (prev.some((row) => row.id === result.id)) return prev;
      return [
        {
          id: result.id,
          file: result.file,
          sensor: result.sensor,
          dateText,
          dateValidityText,
          uncertainty: result.uncertainty,
          errJustesse: result.insertData.Err_Justesse ?? null,
          insertData: result.insertData,
          persisted: false,
        },
        ...prev,
      ];
    });
  };

  const openEdit = (row: CalibrationImportRow) => {
    setEditRowId(row.id);
    setEditValidityDays(row.insertData.Duree_Validite_Jours?.toString() ?? "");
  };

  const closeEdit = () => {
    setEditRowId(null);
    setEditValidityDays("");
  };

  const applyEdit = () => {
    if (!editRowId) return;
    setRows((prev) =>
      prev.map((row) => {
        if (row.id !== editRowId) return row;
        return {
          ...row,
          insertData: {
            ...row.insertData,
            Duree_Validite_Jours:
              editValidityDays.trim() === ""
                ? null
                : Number.isFinite(Number(editValidityDays))
                  ? Math.max(1, Math.trunc(Number(editValidityDays)))
                  : null,
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

    setIsSaving(true);
    try {
      const response = await fetch("/api/sondes/etalonnages/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rows: pendingRows.map((row) => ({
            id: row.id,
            file: row.file,
            insertData: row.insertData,
          })),
        }),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        const message = payload?.message || payload?.error || t("toast.save_error");
        throw new Error(message);
      }

      const insertedCount: number = payload?.data?.inserted ?? 0;
      const skippedCount: number = payload?.data?.skipped ?? 0;

      if (insertedCount > 0) {
        toast.success(t("toast.save_success", { count: insertedCount }));
      }
      if (skippedCount > 0) {
        toast.error(t("toast.save_skipped", { count: skippedCount }));
      }

      setRows([]);
      setOpen(false);
      setStepperSessionKey((prev) => prev + 1);
      closeEdit();
    } catch (error) {
      const message = error instanceof Error ? error.message : t("toast.save_error");
      toast.error(message || t("toast.save_error"));
      console.error("Error while saving calibrations", error);
    } finally {
      setIsSaving(false);
    }
  };

  const columns: ColumnDef<CalibrationImportRow>[] = [
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
      accessorKey: "dateValidityText",
      header: t("table.columns.date_validity"),
      cell: ({ row }) => row.getValue("dateValidityText") || "-",
    },
    {
      id: "validityDays",
      header: t("table.columns.validity_days"),
      cell: ({ row }) => row.original.insertData.Duree_Validite_Jours ?? "-",
    },
    {
      accessorKey: "uncertainty",
      header: t("table.columns.uncertainty"),
      cell: ({ row }) => row.getValue("uncertainty") || "-",
    },
    {
      accessorKey: "errJustesse",
      header: t("table.columns.err_justesse"),
      cell: ({ row }) => row.getValue("errJustesse") || "-",
    },
    {
      id: "actions",
      header: t("table.columns.actions"),
      cell: ({ row }) => (
        <Button size="sm" variant="outline" onClick={() => openEdit(row.original)} disabled={row.original.persisted}>
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
            <Button className="gap-2" onClick={handleSaveToDb} disabled={pendingRows.length === 0 || isSaving}>
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
            <StepperCalibrationFileUpload
              key={stepperSessionKey}
              onUploadResult={handleUploadResult}
              onFinish={() => setOpen(false)}
            />
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
              <label className="text-sm font-medium">{t("edit.validity_days")}</label>
              <Input
                type="number"
                min={1}
                step={1}
                value={editValidityDays}
                onChange={(event) => setEditValidityDays(event.target.value)}
              />
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
