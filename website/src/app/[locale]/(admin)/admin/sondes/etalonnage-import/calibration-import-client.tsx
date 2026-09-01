"use client";

import { Fragment, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TanStackTable } from "@/components/data-table/tanstack-table";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useSensors } from "@/hooks/useSensors";
import { formatDbDateTime } from "@/lib/date-display";
import StepperCalibrationFileUpload, {
  type CalibrationImportResult,
  type CalibrationInsertData,
  type CalibrationMeasureInsertData,
} from "@/components/stepper-calibration-file-upload";

const formatDateTime = (value: string | Date | null | undefined, locale: string) => {
  return formatDbDateTime(value, { locale, fallback: "" }) || null;
};

const formatDate = (value: string | Date | null | undefined, locale: string) => {
  return formatDbDateTime(value, { locale, dateOnly: true, fallback: "" }) || null;
};

const normalizeOptionalText = (value: string | null | undefined) => {
  if (!value) return null;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
};

type CalibrationImportRow = {
  id: string;
  file: string;
  sensor: string | null;
  dateText: string | null;
  dateValidityText: string | null;
  uncertainty: string | null;
  errJustesse: string | null;
  calibrationName: string | null;
  sensorExists: boolean;
  insertData: CalibrationInsertData;
  persisted: boolean;
};

export function CalibrationImportClient() {
  const t = useTranslations("sensorCalibrationImport");
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<CalibrationImportRow[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [stepperSessionKey, setStepperSessionKey] = useState(0);
  const [editRowIds, setEditRowIds] = useState<string[]>([]);
  const [editValidityDays, setEditValidityDays] = useState<string>("");
  const [editCalibrationName, setEditCalibrationName] = useState<string>("");
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [expandedRowIds, setExpandedRowIds] = useState<string[]>([]);
  const [measuresRowId, setMeasuresRowId] = useState<string | null>(null);

  const { data: sensors = [] } = useSensors();
  const knownSensorSerials = useMemo(() => new Set(sensors.map((sensor) => sensor.Sonde_Numero_Serie).filter(Boolean)), [sensors]);

  const handleUploadResult = (result: CalibrationImportResult) => {
    const dateText =
      formatDateTime(result.date, locale) ??
      result.dateText ??
      (typeof result.date === "string" ? result.date : null);

    const dateValidityText =
      formatDate(result.dateValidity, locale) ??
      result.dateValidityText ??
      (typeof result.dateValidity === "string" ? result.dateValidity : null);

    setRows((prev) => {
      const nextRow: CalibrationImportRow = {
        id: result.id,
        file: result.file,
        sensor: result.sensor,
        dateText,
        dateValidityText,
        uncertainty: result.uncertainty,
        errJustesse: result.insertData.Err_Justesse ?? null,
        calibrationName: normalizeOptionalText(result.calibrationName),
        sensorExists: result.insertData.Sonde_Numero_Serie ? knownSensorSerials.has(result.insertData.Sonde_Numero_Serie) : false,
        insertData: result.insertData,
        persisted: false,
      };
      const deduped = prev.filter((row) => !(row.file == result.file && row.sensor === result.sensor && !row.persisted));
      return [nextRow, ...deduped];
    });
  };

  const rowsWithSensorState = useMemo(() => rows.map((row) => ({
    ...row,
    sensorExists: row.insertData.Sonde_Numero_Serie ? knownSensorSerials.has(row.insertData.Sonde_Numero_Serie) : false,
  })), [knownSensorSerials, rows]);

  const openEdit = (rowIds: string[]) => {
    const targets = rowIds.filter((id) => rows.some((row) => row.id === id && !row.persisted));
    if (targets.length === 0) return;
    const sourceRow = rows.find((row) => row.id === targets[0]) ?? null;
    setEditRowIds(targets);
    setEditValidityDays(sourceRow?.insertData.Duree_Validite_Jours?.toString() ?? "");
    setEditCalibrationName(sourceRow?.calibrationName ?? "");
  };

  const closeEdit = () => {
    setEditRowIds([]);
    setEditValidityDays("");
    setEditCalibrationName("");
  };

  const applyEdit = () => {
    if (editRowIds.length === 0) return;
    const nextValue =
      editValidityDays.trim() === ""
        ? null
        : Number.isFinite(Number(editValidityDays))
          ? Math.max(1, Math.trunc(Number(editValidityDays)))
          : null;

    setRows((prev) =>
      prev.map((row) =>
        !editRowIds.includes(row.id)
          ? row
          : {
              ...row,
              insertData: {
                ...row.insertData,
                Duree_Validite_Jours: nextValue,
              },
              calibrationName: normalizeOptionalText(editCalibrationName),
            },
      ),
    );
    closeEdit();
  };

  const pendingRows = useMemo(() => rowsWithSensorState.filter((row) => !row.persisted), [rowsWithSensorState]);
  const allPendingIds = useMemo(() => pendingRows.map((row) => row.id), [pendingRows]);
  const allPendingSelected = allPendingIds.length > 0 && allPendingIds.every((id) => selectedRowIds.includes(id));

  const toggleSelected = (rowId: string, checked: boolean) => {
    setSelectedRowIds((prev) => checked ? [...new Set([...prev, rowId])] : prev.filter((id) => id !== rowId));
  };

  const toggleSelectAll = (checked: boolean) => {
    setSelectedRowIds(checked ? allPendingIds : []);
  };

  const toggleExpanded = (rowId: string) => {
    setExpandedRowIds((prev) => prev.includes(rowId) ? prev.filter((id) => id !== rowId) : [...prev, rowId]);
  };

  const handleClearRows = () => {
    if (selectedRowIds.length > 0) {
      setRows((prev) => prev.filter((row) => !selectedRowIds.includes(row.id)));
      setSelectedRowIds([]);
    } else {
      setRows([]);
    }
    closeEdit();
    setExpandedRowIds([]);
    setMeasuresRowId(null);
    setConfirmClearOpen(false);
  };

  const handleSaveToDb = async () => {
    if (isSaving) return;
    if (pendingRows.length === 0) {
      toast.error(t("toast.no_pending"));
      return;
    }

    const missingSensorRows = pendingRows.filter((row) => !row.sensorExists);
    if (missingSensorRows.length > 0) {
      toast.error(t("toast.missing_sensor", { count: missingSensorRows.length }));
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
            calibrationName: row.calibrationName,
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
        toast.warning(t("toast.save_skipped", { count: skippedCount }));
      }

      setRows([]);
      setSelectedRowIds([]);
      setExpandedRowIds([]);
      setMeasuresRowId(null);
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

  const measuresRow = useMemo(() => rowsWithSensorState.find((row) => row.id === measuresRowId) ?? null, [measuresRowId, rowsWithSensorState]);

  const detailItemsForRow = (row: CalibrationImportRow) => [
    { label: t("table.details.operator"), value: row.insertData.Operateur || "-" },
    { label: t("table.details.unit"), value: row.insertData.Unite || "-" },
    { label: t("table.details.reference_sensor"), value: row.insertData.Etalon_Numero_Serie || "-" },
    { label: t("table.details.certificate"), value: row.insertData.Num_Certif || "-" },
    { label: t("table.details.organization"), value: row.insertData.Organisme || "-" },
    { label: t("table.details.measure_count"), value: String(row.insertData.Mesures?.length ?? 0) },
  ];

  const columns: ColumnDef<CalibrationImportRow>[] = [
    {
      id: "select",
      header: () => (
        <Checkbox
          checked={allPendingSelected}
          onCheckedChange={(checked) => toggleSelectAll(Boolean(checked))}
          aria-label={t("actions.select_all")}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={selectedRowIds.includes(row.original.id)}
          onCheckedChange={(checked) => toggleSelected(row.original.id, Boolean(checked))}
          aria-label={t("actions.select_row")}
          disabled={row.original.persisted}
        />
      ),
    },
    {
      accessorKey: "file",
      header: t("table.columns.file"),
      cell: ({ row }) => <span className="font-medium">{row.getValue("file") || "-"}</span>,
    },
    {
      accessorKey: "sensor",
      header: t("table.columns.sensor"),
      cell: ({ row }) => {
        const sensorLabel = row.original.sensor ?? row.original.insertData.Sonde_Numero_Serie ?? "-";
        return (
          <div className="space-y-1">
            <div>{sensorLabel}</div>
            {!row.original.sensorExists ? (
              <p className="text-xs font-medium text-destructive">{t("table.sensor_missing")}</p>
            ) : null}
          </div>
        );
      },
    },
    {
      accessorKey: "calibrationName",
      header: t("table.columns.calibration_name"),
      cell: ({ row }) => row.original.calibrationName || "-",
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
      id: "details",
      header: t("table.columns.details"),
      cell: ({ row }) => {
        const isExpanded = expandedRowIds.includes(row.original.id);
        return (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="ghost" onClick={() => toggleExpanded(row.original.id)}>
                {isExpanded ? t("actions.hide_details") : t("actions.show_details")}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setMeasuresRowId(row.original.id)}>
                {t("actions.view_reference_measures")}
              </Button>
            </div>
            {isExpanded ? (
              <dl className="grid gap-2 rounded-md border bg-muted/40 p-3 text-xs sm:grid-cols-2">
                {detailItemsForRow(row.original).map((item) => (
                  <Fragment key={`${row.original.id}-${item.label}`}>
                    <dt className="text-muted-foreground">{item.label}</dt>
                    <dd className="font-medium">{item.value}</dd>
                  </Fragment>
                ))}
              </dl>
            ) : null}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: t("table.columns.actions"),
      cell: ({ row }) => (
        <Button size="sm" variant="outline" onClick={() => openEdit([row.original.id])} disabled={row.original.persisted}>
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

          {pendingRows.length > 0 ? (
            <div className="rounded-lg border border-amber-300/40 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
              {t("recap.save_hint", { count: pendingRows.length })}
            </div>
          ) : null}

          <div className="flex justify-end gap-2">
            <Button variant="destructive" onClick={() => setConfirmClearOpen(true)} disabled={rows.length === 0 || isSaving}>
              {selectedRowIds.length > 0 ? t("actions.delete_selection") : t("actions.clear_list")}
            </Button>
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


      <AlertDialog open={confirmClearOpen} onOpenChange={setConfirmClearOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("clear_confirm.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedRowIds.length > 0
                ? t("clear_confirm.description_selected", { count: selectedRowIds.length })
                : t("clear_confirm.description_all")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end gap-2">
            <AlertDialogCancel>{t("actions.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearRows} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {selectedRowIds.length > 0 ? t("actions.delete_selection") : t("actions.clear_list")}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={measuresRowId !== null} onOpenChange={(openState) => (!openState ? setMeasuresRowId(null) : null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{t("measures.title")}</DialogTitle>
            <p className="text-sm text-muted-foreground">
              {measuresRow ? t("measures.description", { sensor: measuresRow.sensor ?? measuresRow.insertData.Sonde_Numero_Serie ?? "-" }) : null}
            </p>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-auto rounded-md border">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-muted/95 text-left">
                <tr>
                  <th className="px-3 py-2 font-medium">{t("measures.columns.order")}</th>
                  <th className="px-3 py-2 font-medium">{t("measures.columns.reference")}</th>
                  <th className="px-3 py-2 font-medium">{t("measures.columns.sensor")}</th>
                </tr>
              </thead>
              <tbody>
                {(measuresRow?.insertData.Mesures ?? []).map((measure: CalibrationMeasureInsertData) => (
                  <tr key={`${measure.Numero_Ordre}-${measure.Mesure_Etalon}-${measure.Mesure_Sonde}`} className="border-t">
                    <td className="px-3 py-2">{measure.Numero_Ordre}</td>
                    <td className="px-3 py-2">{measure.Mesure_Etalon ?? "-"}</td>
                    <td className="px-3 py-2">{measure.Mesure_Sonde ?? "-"}</td>
                  </tr>
                ))}
                {(measuresRow?.insertData.Mesures?.length ?? 0) === 0 ? (
                  <tr>
                    <td className="px-3 py-6 text-center text-muted-foreground" colSpan={3}>{t("measures.empty")}</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={editRowIds.length > 0} onOpenChange={(openState) => (!openState ? closeEdit() : null)}>
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
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("edit.calibration_name")}</label>
              <Input
                type="text"
                maxLength={255}
                value={editCalibrationName}
                onChange={(event) => setEditCalibrationName(event.target.value)}
                placeholder={t("edit.calibration_name_helper")}
              />
              <p className="text-xs text-muted-foreground">{t("edit.batch_helper", { count: editRowIds.length })}</p>
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
