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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import StepperFileUpload, {
  type AdjustmentImportResult,
  type AdjustmentInsertData,
} from "@/components/stepper-file-upload";
import { useModules } from "@/hooks/useModules";
import { useSensors } from "@/hooks/useSensors";

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

const EXISTING_ASSIGNED_TOOLTIP =
  "Module déjà affecté à cette sonde. Pour affecter cette sonde à un nouveau module, rendez vous sur la page de gestion des sondes et modifier celle-ci.";
const CREATED_ON_IMPORT_TOOLTIP =
  "Sonde créée durant l'importation de l'ajustage. Module sélectionné dans le menu déroulant affecté à celle-ci. Pour en affecter un autre, rendez vous sur la page de gestion des sondes.";

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
      return { status: "existing_unassigned", moduleLabel: "Aucun module" };
    }

    const selectedLabel = selectedModuleNumericId
      ? (moduleById.get(selectedModuleNumericId) ?? `#${selectedModuleNumericId}`)
      : "Module non sélectionné";

    return {
      status: "to_create",
      moduleLabel: selectedLabel,
    };
  };

  const summaryCounts = useMemo(() => {
    const pending = rows.filter((row) => !row.persisted);
    let createdSensors = 0;
    let existingAssigned = 0;

    const seenSerials = new Set<string>();
    for (const row of pending) {
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
  }, [rows, sensorBySerial]);

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
    if (!selectedModuleNumericId) {
      toast.error("Veuillez sélectionner un module.");
      return;
    }

    const postBulk = async (confirmOverwrite: boolean) => {
      const response = await fetch("/api/sondes/ajustages/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moduleId: selectedModuleNumericId,
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
      const createdSensorsFromAdjustment: number = payload?.data?.createdSensorsFromAdjustment ?? 0;
      const existingSensorsWithModule: number = payload?.data?.existingSensorsWithModule ?? 0;

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
      if (createdSensorsFromAdjustment > 0) {
        toast.success(`Sondes créées suite a l'ajustage: ${createdSensorsFromAdjustment}`);
      }
      if (existingSensorsWithModule > 0) {
        toast.success(`Sondes existantes deja affectées a un module: ${existingSensorsWithModule}`);
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
      id: "module_assignment",
      header: "Module affecté",
      cell: ({ row }) => {
        const assignment = getModuleAssignment(row.original);
        if (assignment.status === "existing_assigned") {
          return (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex rounded-md bg-red-100 px-2 py-1 text-xs font-medium text-red-700">
                    {assignment.moduleLabel}
                  </span>
                </TooltipTrigger>
                <TooltipContent>{EXISTING_ASSIGNED_TOOLTIP}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        }

        if (assignment.status === "to_create") {
          return (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex rounded-md bg-sky-100 px-2 py-1 text-xs font-medium text-sky-700">
                    {assignment.moduleLabel}
                  </span>
                </TooltipTrigger>
                <TooltipContent>{CREATED_ON_IMPORT_TOOLTIP}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        }

        return <span className="text-muted-foreground">{assignment.moduleLabel}</span>;
      },
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
            <div className="flex flex-wrap items-center gap-2">
              <div className="w-[260px]">
                <Select value={selectedModuleId} onValueChange={setSelectedModuleId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un module" />
                  </SelectTrigger>
                  <SelectContent>
                    {modules.map((module) => (
                      <SelectItem key={module.Id_Module} value={String(module.Id_Module)}>
                        {module.Module_Numero_Serie || module.Libelle_Type_Module || `#${module.Id_Module}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button size="sm" className="gap-2" onClick={() => setOpen(true)}>
                {t("actions.import")}
              </Button>
            </div>
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

          <div className="grid gap-1 rounded-md border border-dashed p-3 text-sm text-muted-foreground">
            <div>Sondes créées suite a l'ajustage : {summaryCounts.createdSensors}</div>
            <div>Sondes existantes déjà affectées a un module : {summaryCounts.existingAssigned}</div>
          </div>

          <div className="flex justify-end">
            <Button
              className="gap-2"
              onClick={handleSaveToDb}
              disabled={pendingRows.length === 0 || isSaving || !selectedModuleNumericId}
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
