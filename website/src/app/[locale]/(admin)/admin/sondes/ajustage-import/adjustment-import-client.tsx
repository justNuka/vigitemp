"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { AdjustmentImportResult, AdjustmentInsertData } from "@/components/stepper-file-upload";
import { useModules } from "@/hooks/useModules";
import { useSensors } from "@/hooks/useSensors";
import { formatDbDateTime } from "@/lib/date-display";

import { AdjustmentImportEditDialog } from "./_components/adjustment-import-edit-dialog";
import { saveAdjustmentsBulk, notifyBulkSaveResult } from "./_components/adjustment-import-save";
import { AdjustmentImportTableCard } from "./_components/adjustment-import-table-card";
import { AdjustmentImportUploadDialog } from "./_components/adjustment-import-upload-dialog";

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

type ModuleAssignment = {
  status: "existing_assigned" | "existing_unassigned" | "to_create";
  moduleLabel: string;
};

const COMMON_UNIT_OPTIONS = ["\u00B0C", "C", "%", "Pa", "hPa", "bar", "mbar", "ppm", "lux", "V", "mA"];

const formatDateTime = (value: string | Date | null | undefined, locale: string) => {
  return formatDbDateTime(value, { format: "dateTimeSeconds", locale, fallback: "" }) || null;
};

export function AdjustmentImportClient() {
  const t = useTranslations("sensorAdjustmentImport");
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<AdjustmentImportRow[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [stepperSessionKey, setStepperSessionKey] = useState(0);
  const [editRowId, setEditRowId] = useState<string | null>(null);
  const [editOperator, setEditOperator] = useState("");
  const [editUnit, setEditUnit] = useState("");
  const [selectedModuleId, setSelectedModuleId] = useState<string>("");
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  const [bulkUnit, setBulkUnit] = useState<string>("");
  const [confirmOverwriteOpen, setConfirmOverwriteOpen] = useState(false);
  const [confirmOverwriteAdjustments, setConfirmOverwriteAdjustments] = useState<string[]>([]);
  const [confirmOverwriteOffsets, setConfirmOverwriteOffsets] = useState<string[]>([]);

  const { data: modules = [] } = useModules(true);
  const { data: sensors = [] } = useSensors();

  const moduleById = useMemo(() => {
    const map = new Map<number, string>();
    for (const moduleItem of modules) {
      const id = moduleItem.Id_Module;
      const label = moduleItem.Module_Numero_Serie || moduleItem.Libelle_Type_Module || `#${id}`;
      const port = moduleItem.Port_Serie ? ` (${moduleItem.Port_Serie})` : "";
      map.set(id, `${label}${port}`);
    }
    return map;
  }, [modules]);

  const sensorBySerial = useMemo(() => {
    const map = new Map<string, (typeof sensors)[number]>();
    for (const sensor of sensors) {
      const serial = sensor.Sonde_Numero_Serie?.trim();
      if (serial) map.set(serial, sensor);
    }
    return map;
  }, [sensors]);

  const selectedModuleNumericId = selectedModuleId ? Number(selectedModuleId) : null;
  const pendingRows = useMemo(() => rows.filter((row) => !row.persisted), [rows]);
  const pendingRowIds = useMemo(() => pendingRows.map((row) => row.id), [pendingRows]);
  const selectedPendingRowIds = useMemo(
    () => selectedRowIds.filter((id) => pendingRowIds.includes(id)),
    [pendingRowIds, selectedRowIds],
  );
  const allPendingSelected = pendingRowIds.length > 0 && pendingRowIds.every((id) => selectedRowIds.includes(id));
  const unitOptions = useMemo(() => {
    const importedUnits = rows.map((row) => row.unit?.trim()).filter((unit): unit is string => !!unit);
    return Array.from(new Set([...COMMON_UNIT_OPTIONS, ...importedUnits]));
  }, [rows]);

  const handleUploadResult = (result: AdjustmentImportResult) => {
    const dateText =
      formatDateTime(result.date, locale) ??
      result.dateText ??
      (typeof result.date === "string" ? result.date : null);
    setRows((prev) => {
      const nextRow: AdjustmentImportRow = {
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
      };
      const deduped = prev.filter((row) => !(row.file === result.file && row.sensor === result.sensor && !row.persisted));
      return [nextRow, ...deduped];
    });
  };

  const formatNumber = (value: number | null) => (value === null || Number.isNaN(value) ? "-" : value.toString());

  const getModuleAssignment = (row: AdjustmentImportRow): ModuleAssignment => {
    const serial = row.sensor?.trim();
    if (!serial) return { status: "to_create", moduleLabel: "-" };

    const existing = sensorBySerial.get(serial);
    if (existing) {
      if (existing.Id_Module) {
        return {
          status: "existing_assigned",
          moduleLabel: moduleById.get(existing.Id_Module) ?? `#${existing.Id_Module}`,
        };
      }
      return { status: "existing_unassigned", moduleLabel: t("labels.no_module") };
    }

    const selectedLabel = selectedModuleNumericId
      ? moduleById.get(selectedModuleNumericId) ?? `#${selectedModuleNumericId}`
      : t("labels.module_not_selected");

    return { status: "to_create", moduleLabel: selectedLabel };
  };

  const summaryCounts = useMemo(() => {
    const seenSerials = new Set<string>();
    let createdSensors = 0;
    let existingAssigned = 0;

    for (const row of pendingRows) {
      const serial = row.sensor?.trim();
      if (!serial || seenSerials.has(serial)) continue;
      seenSerials.add(serial);

      const existing = sensorBySerial.get(serial);
      if (!existing) {
        createdSensors += 1;
      } else if (existing.Id_Module) {
        existingAssigned += 1;
      }
    }

    return { createdSensors, existingAssigned };
  }, [pendingRows, sensorBySerial]);

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
      prev.map((row) =>
        row.id !== editRowId
          ? row
          : {
              ...row,
              operator: editOperator.trim() || null,
              unit: editUnit.trim() || null,
              insertData: {
                ...row.insertData,
                Operateur: editOperator.trim() || null,
                Unite: editUnit.trim() || null,
              },
            },
      ),
    );
    closeEdit();
  };

  const toggleSelected = (rowId: string, checked: boolean) => {
    setSelectedRowIds((prev) => (checked ? [...new Set([...prev, rowId])] : prev.filter((id) => id !== rowId)));
  };

  const toggleSelectAll = (checked: boolean) => {
    setSelectedRowIds(checked ? pendingRowIds : []);
  };

  const applyBulkUnit = () => {
    const normalizedUnit = bulkUnit.trim();
    if (selectedPendingRowIds.length === 0) {
      toast.error(t("toast.no_unit_selection"));
      return;
    }
    if (!normalizedUnit) {
      toast.error(t("toast.unit_required"));
      return;
    }

    setRows((prev) =>
      prev.map((row) =>
        !selectedPendingRowIds.includes(row.id)
          ? row
          : {
              ...row,
              unit: normalizedUnit,
              insertData: {
                ...row.insertData,
                Unite: normalizedUnit,
              },
            },
      ),
    );
    toast.success(t("toast.unit_applied", { count: selectedPendingRowIds.length }));
  };

  const handleRemoveRow = (rowId: string) => {
    setRows((prev) => prev.filter((row) => row.id !== rowId));
    setSelectedRowIds((prev) => prev.filter((id) => id !== rowId));
    if (editRowId === rowId) closeEdit();
  };

  const handleClearRows = () => {
    setRows([]);
    setSelectedRowIds([]);
    closeEdit();
  };

  const handleSaveToDb = async () => {
    if (isSaving) return;
    if (pendingRows.length === 0) {
      toast.error(t("toast.no_pending"));
      return;
    }
    if (!selectedModuleNumericId) {
      toast.error(t("toast.module_required"));
      return;
    }

    setIsSaving(true);
    try {
      const result = await saveAdjustmentsBulk(
        selectedModuleNumericId,
        pendingRows.map((row) => ({ id: row.id, file: row.file, insertData: row.insertData })),
        t,
      );

      if (result.status === "confirmation_required") {
        setConfirmOverwriteAdjustments(result.adjustmentList);
        setConfirmOverwriteOffsets(result.offsetList);
        setConfirmOverwriteOpen(true);
        setIsSaving(false);
        return;
      }

      notifyBulkSaveResult(result.payload, t);
      setRows([]);
      setSelectedRowIds([]);
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

  const handleConfirmOverwrite = async () => {
    if (isSaving || pendingRows.length === 0 || !selectedModuleNumericId) {
      setConfirmOverwriteOpen(false);
      return;
    }

    setIsSaving(true);
    try {
      const result = await saveAdjustmentsBulk(
        selectedModuleNumericId,
        pendingRows.map((row) => ({ id: row.id, file: row.file, insertData: row.insertData })),
        t,
        true,
      );

      if (result.status === "confirmation_required") {
        setConfirmOverwriteAdjustments(result.adjustmentList);
        setConfirmOverwriteOffsets(result.offsetList);
        setConfirmOverwriteOpen(true);
        return;
      }

      notifyBulkSaveResult(result.payload, t);
      setRows([]);
      setSelectedRowIds([]);
      setOpen(false);
      setStepperSessionKey((prev) => prev + 1);
      closeEdit();
      setConfirmOverwriteOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : t("toast.save_error");
      toast.error(message || t("toast.save_error"));
      console.error("Error while confirming adjustment overwrite", error);
    } finally {
      setIsSaving(false);
    }
  };

  const columns: ColumnDef<AdjustmentImportRow>[] = [
    {
      id: "selection",
      header: () => (
        <Checkbox
          checked={allPendingSelected}
          onCheckedChange={(checked) => toggleSelectAll(checked === true)}
          aria-label={t("actions.select_all")}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={selectedRowIds.includes(row.original.id)}
          onCheckedChange={(checked) => toggleSelected(row.original.id, checked === true)}
          disabled={row.original.persisted}
          aria-label={t("actions.select_row")}
        />
      ),
      enableSorting: false,
    },
    {
      accessorKey: "file",
      header: t("table.columns.file"),
      cell: ({ row }) => <span className="font-medium">{row.getValue("file") || "-"}</span>,
    },
    {
      id: "module_assignment",
      header: t("table.columns.module_assignment"),
      cell: ({ row }) => {
        const assignment = getModuleAssignment(row.original);
        if (assignment.status === "existing_assigned") {
          return (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex rounded-md bg-red-100 px-2 py-1 text-xs font-medium text-red-700">{assignment.moduleLabel}</span>
                </TooltipTrigger>
                <TooltipContent className="max-w-72 whitespace-normal break-words">{t("tooltips.existing_assigned")}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        }

        if (assignment.status === "to_create") {
          return (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex rounded-md bg-sky-100 px-2 py-1 text-xs font-medium text-sky-700">{assignment.moduleLabel}</span>
                </TooltipTrigger>
                <TooltipContent className="max-w-72 whitespace-normal break-words">{t("tooltips.created_on_import")}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        }

        return <span className="text-muted-foreground">{assignment.moduleLabel}</span>;
      },
    },
    { accessorKey: "sensor", header: t("table.columns.sensor"), cell: ({ row }) => row.getValue("sensor") || "-" },
    { accessorKey: "dateText", header: t("table.columns.date"), cell: ({ row }) => row.getValue("dateText") || "-" },
    { accessorKey: "operator", header: t("table.columns.operator"), cell: ({ row }) => row.getValue("operator") || "-" },
    { accessorKey: "unit", header: t("table.columns.unit"), cell: ({ row }) => row.getValue("unit") || "-" },
    { accessorKey: "measureEtalon1", header: t("table.columns.measure_etalon_1"), cell: ({ row }) => formatNumber(row.original.measureEtalon1) },
    { accessorKey: "measureEtalon2", header: t("table.columns.measure_etalon_2"), cell: ({ row }) => formatNumber(row.original.measureEtalon2) },
    {
      id: "actions",
      header: t("table.columns.actions"),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => openEdit(row.original)} disabled={row.original.persisted}>
            {t("actions.edit")}
          </Button>
          <Button size="icon" variant="ghost" onClick={() => handleRemoveRow(row.original.id)} aria-label={t("actions.remove")}> 
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const unitAssignmentToolbar = rows.length > 0 ? (
    <div className="flex flex-wrap items-center gap-3 rounded-md border bg-muted/30 p-3 text-sm">
      <span className="text-muted-foreground">
        {t("labels.selected_rows", { count: selectedPendingRowIds.length })}
      </span>
      <div className="w-40">
        <Select value={bulkUnit} onValueChange={setBulkUnit}>
          <SelectTrigger>
            <SelectValue placeholder={t("labels.select_unit")} />
          </SelectTrigger>
          <SelectContent>
            {unitOptions.map((unit) => (
              <SelectItem key={unit} value={unit}>
                {unit}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button size="sm" variant="outline" onClick={applyBulkUnit} disabled={selectedPendingRowIds.length === 0 || isSaving}>
        {t("actions.apply_unit")}
      </Button>
    </div>
  ) : null;

  return (
    <div className="space-y-6">
      <AdjustmentImportTableCard
        title={t("table.title")}
        modulePlaceholder={t("labels.select_module")}
        modules={modules}
        selectedModuleId={selectedModuleId}
        onModuleChange={setSelectedModuleId}
        onOpenImport={() => setOpen(true)}
        importLabel={t("actions.import")}
        columns={columns}
        rows={rows}
        emptyMessage={t("table.empty")}
        toolbarContent={unitAssignmentToolbar}
        summaryCreatedLabel={t("toast.created_sensors_from_adjustment", { count: summaryCounts.createdSensors })}
        summaryExistingLabel={t("toast.existing_sensors_with_module", { count: summaryCounts.existingAssigned })}
        onSave={handleSaveToDb}
        saveLabel={isSaving ? t("actions.saving_to_db") : t("actions.save_to_db")}
        disabled={pendingRows.length === 0 || isSaving || !selectedModuleNumericId}
        onClear={handleClearRows}
        clearLabel={t("actions.clear_list")}
        clearDisabled={rows.length === 0 || isSaving}
      />

      <AdjustmentImportUploadDialog
        open={open}
        onOpenChange={setOpen}
        title={t("modal.title")}
        description={t("modal.description")}
        stepperSessionKey={stepperSessionKey}
        onUploadResult={handleUploadResult}
      />

      <AdjustmentImportEditDialog
        open={!!editRowId}
        title={t("edit.title")}
        operatorLabel={t("edit.operator")}
        unitLabel={t("edit.unit")}
        operator={editOperator}
        unit={editUnit}
        onOperatorChange={setEditOperator}
        onUnitChange={setEditUnit}
        onClose={closeEdit}
        onApply={applyEdit}
        cancelLabel={t("actions.cancel")}
        applyLabel={t("actions.apply")}
      />

      <AlertDialog
        open={confirmOverwriteOpen}
        onOpenChange={(open) => {
          setConfirmOverwriteOpen(open);
          if (!open) {
            setConfirmOverwriteAdjustments([]);
            setConfirmOverwriteOffsets([]);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("confirm_overwrite.title")}</AlertDialogTitle>
            <AlertDialogDescription>{t("confirm_overwrite.description")}</AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-3 text-sm">
            {confirmOverwriteAdjustments.length > 0 ? (
              <div className="space-y-1">
                <p className="font-medium">
                  {t("toast.confirm_adjustment_overwrite", { count: confirmOverwriteAdjustments.length })}
                </p>
                <p className="text-muted-foreground wrap-break-word">{confirmOverwriteAdjustments.join(", ")}</p>
              </div>
            ) : null}

            {confirmOverwriteOffsets.length > 0 ? (
              <div className="space-y-1">
                <p className="font-medium">
                  {t("toast.confirm_offset_clear", { count: confirmOverwriteOffsets.length })}
                </p>
                <p className="text-muted-foreground wrap-break-word">{confirmOverwriteOffsets.join(", ")}</p>
              </div>
            ) : null}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSaving}>{t("confirm_overwrite.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={() => void handleConfirmOverwrite()} disabled={isSaving}>
              {isSaving ? t("confirm_overwrite.submitting") : t("confirm_overwrite.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
