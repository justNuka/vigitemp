"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { AdjustmentImportResult, AdjustmentInsertData } from "@/components/stepper-file-upload";
import { useModules } from "@/hooks/useModules";
import { useSensors } from "@/hooks/useSensors";

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

export function AdjustmentImportClient() {
  const t = useTranslations("sensorAdjustmentImport");
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<AdjustmentImportRow[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [stepperSessionKey, setStepperSessionKey] = useState(0);
  const [editRowId, setEditRowId] = useState<string | null>(null);
  const [editOperator, setEditOperator] = useState("");
  const [editUnit, setEditUnit] = useState("");
  const [selectedModuleId, setSelectedModuleId] = useState<string>("");

  const { data: modules = [] } = useModules(true);
  const { data: sensors = [] } = useSensors();

  const moduleById = useMemo(() => {
    const map = new Map<number, string>();
    for (const module of modules) {
      const id = module.Id_Module;
      const label = module.Module_Numero_Serie || module.Libelle_Type_Module || `#${id}`;
      const port = module.Port_Serie ? ` (${module.Port_Serie})` : "";
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

  const handleUploadResult = (result: AdjustmentImportResult) => {
    const dateText = result.dateText ?? (typeof result.date === "string" ? result.date : null);
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

  const handleRemoveRow = (rowId: string) => {
    setRows((prev) => prev.filter((row) => row.id !== rowId));
    if (editRowId === rowId) closeEdit();
  };

  const handleClearRows = () => {
    setRows([]);
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

      if (result.cancelled) {
        setIsSaving(false);
        return;
      }

      notifyBulkSaveResult(result.payload, t);
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
                <TooltipContent>{t("tooltips.existing_assigned")}</TooltipContent>
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
                <TooltipContent>{t("tooltips.created_on_import")}</TooltipContent>
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
        createdSensors={summaryCounts.createdSensors}
        existingAssigned={summaryCounts.existingAssigned}
        summaryCreatedLabel="Sondes créées suite à l'ajustage"
        summaryExistingLabel="Sondes existantes déjà affectées à un module"
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
    </div>
  );
}
