"use client";
import { showFormValidationToast } from "@/lib/form-toast"

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TemporaryMemoryControls } from "@/components/form/temporary-memory-controls";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Combobox } from "@/components/ui/combobox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSensorTypes } from "@/hooks/useSensorTypes";
import { useModules } from "@/hooks/useModules";
import type { Sensor } from "@/hooks/useSensors";
import { AlertCircle } from "lucide-react";
import { patchJson, postJson } from "@/lib/http";
import { isLegacyGenericSensorTypeCode } from "@/lib/sensor-types";
import { toast } from "sonner";
import { useRouter } from '@/i18n/navigation';
import { AdjustmentsPanel, type AdjustmentRow } from "./_components/adjustments-panel";

interface SensorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sensor?: Sensor | null;
  isEditing?: boolean;
  isPack?: boolean;
  moduleOnly?: boolean;
  onSuccess?: () => void;
  adjustments?: AdjustmentRow[];
  adjustmentsLoading?: boolean;
  selectedAdjustmentId?: number | null;
  onSelectAdjustment?: (id: number) => void;
}

export function SensorModal({
  open,
  onOpenChange,
  sensor,
  isEditing,
  isPack = false,
  moduleOnly = false,
  onSuccess,
  adjustments = [],
  adjustmentsLoading = false,
  selectedAdjustmentId = null,
  onSelectAdjustment = () => undefined,
}: SensorModalProps) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const t = useTranslations('sensorsDialog');
  const tCommon = useTranslations('common');
  const isEdit = Boolean(isEditing && sensor);
  const sensorKey = (sensor as any)?.Id_Sonde ?? sensor?.Sonde_Numero_Serie ?? "new";
  const contentKey = `${isEdit ? "edit" : "new"}-${sensorKey}-${open ? "open" : "closed"}`;

  const sensorSchema = z.object({
    sondeType: z.string().min(1, t('validation.type_required')),
    serieNum: z.string().regex(/^(?=.*\d)[A-Z0-9-]+$/i, t('validation.serial_invalid')),
    probeAddress: z.string().optional(),
    moduleId: z.string().optional(),
    sondeOffset: z.number({ message: t('validation.offset_invalid') }).optional(),
  }).superRefine((value, ctx) => {
    if (["EN", "HN"].includes((value.sondeType || "").toUpperCase())) {
      const normalizedAddress = (value.probeAddress || "").trim().toUpperCase();
      if (!/^[A-Z0-9-]+$/i.test(normalizedAddress)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["probeAddress"],
          message: t('validation.address_invalid'),
        });
      }
    }
  });

  type SensorFormValues = z.infer<typeof sensorSchema>;

  const form = useForm<SensorFormValues>({
    resolver: zodResolver(sensorSchema),
    defaultValues: {
      sondeType: "",
      serieNum: "",
      probeAddress: "",
      moduleId: "",
      sondeOffset: undefined,
    },
    mode: "onChange",
  });

  const { data: sensorTypes, isLoading: sensorTypesLoading } = useSensorTypes(open);
  const { data: modules, isLoading: modulesLoading } = useModules(open);

  const selectedType = form.watch("sondeType");
  const requiresLegacyAddress = !isEdit && ["EN", "HN"].includes((selectedType || "").toUpperCase());
  const availableSensorTypes = (sensorTypes ?? []).filter((type) => !isLegacyGenericSensorTypeCode(type.Sonde_Type));
  const memoryKey = `sensor-form:${isEdit ? sensor?.Id_Sonde ?? sensor?.Sonde_Numero_Serie ?? "edit" : "new"}`;

  useEffect(() => {
    if (!open) return;

    if (isEdit && sensor) {
      form.reset({
        sondeType: sensor.Sonde_Type || sensor.Sonde_Numero_Serie?.split("-")[0] || "",
        serieNum: sensor.Sonde_Numero_Serie || "",
        probeAddress: sensor.Adresse_Sonde || "",
        moduleId: sensor.Id_Module?.toString() || "",
        sondeOffset: sensor.Sonde_Offset ?? 0,
      });
      return;
    }

    form.reset({ sondeType: "", serieNum: "", probeAddress: "", moduleId: "", sondeOffset: undefined });
  }, [form, isEdit, open, sensor]);

  const handleSubmit = async (values: SensorFormValues) => {
    try {
      const moduleIdNumber = values.moduleId ? parseInt(values.moduleId, 10) : null;
      const moduleIdValue = Number.isNaN(moduleIdNumber) ? null : moduleIdNumber;
      const sondeOffsetValue = values.sondeOffset ?? 0;

      if (isEdit) {
        if (!sensor?.Id_Sonde) {
          toast.error(t('toast.invalid_sensor'));
          return;
        }

        const payload: { moduleId: number | null; sondeOffset?: number } = {
          moduleId: moduleIdValue,
        };
        if (!isPack && !moduleOnly) {
          payload.sondeOffset = sondeOffsetValue;
        }

        await patchJson(`/api/sondes/${sensor.Id_Sonde}`, payload);
        toast.success(t('toast.update_success'));
      } else {
        const payload: {
          sondeType: string;
          serieNum: string;
          probeAddress?: string | null;
          moduleId: number | null;
          sondeOffset?: number;
        } = {
          sondeType: values.sondeType,
          serieNum: values.serieNum,
          moduleId: moduleIdValue,
        };

        if (requiresLegacyAddress) {
          payload.probeAddress = values.probeAddress?.trim() || null;
        }

        if (!isPack) {
          payload.sondeOffset = sondeOffsetValue;
        }

        await postJson(`/api/sondes`, payload);
        toast.success(t('toast.create_success'));
      }

      await queryClient.invalidateQueries({ queryKey: ["sensors"] });
      router.refresh();
      form.reset({ sondeType: "", serieNum: "", probeAddress: "", moduleId: "", sondeOffset: undefined });
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('toast.save_error'));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        key={contentKey}
        className="max-h-[90vh] overflow-y-auto bg-white dark:bg-popover dark:text-popover-foreground sm:max-w-4xl"
      >
        <DialogHeader>
          <DialogTitle>{isEdit ? t('title_edit') : t('title_create')}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit, (errors) => showFormValidationToast(errors))} className="space-y-6">
            <TemporaryMemoryControls
              form={form}
              storageKey={memoryKey}
              resetValues={{ sondeType: "", serieNum: "", probeAddress: "", moduleId: "", sondeOffset: undefined }}
              labels={{
                save: tCommon('temporary_memory.save'),
                restore: tCommon('temporary_memory.restore'),
                clear: tCommon('temporary_memory.clear'),
                saved: tCommon('temporary_memory.saved'),
              }}
            />
            <FormField
              control={form.control}
              name="sondeType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fields.type_label')}</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange} disabled={isEdit}>
                    <FormControl>
                      <SelectTrigger id="sensor-type" disabled={sensorTypesLoading || isEdit}>
                        <SelectValue placeholder={t('fields.type_placeholder')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent position="item-aligned" className="max-h-72">
                      {availableSensorTypes.map((type) => (
                        <SelectItem key={type.Sonde_Type} value={type.Sonde_Type}>
                          {type.Sonde_Type} ({type.Libelle_Sonde_Type || "-"})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="serieNum"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fields.serial_label')}</FormLabel>
                  <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                    <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <AlertDescription className="text-sm text-blue-800 dark:text-blue-300">
                      {t('fields.serial_hint')}
                    </AlertDescription>
                  </Alert>
                  <FormControl>
                    <Input
                      id="serie-num"
                      placeholder={t('fields.serial_placeholder')}
                      value={field.value}
                      onChange={(e) => {
                        const normalized = e.target.value.toUpperCase();
                        const cleaned = normalized.replace(/[^A-Z0-9-]/g, "").replace(/-{2,}/g, "-");
                        field.onChange(cleaned);
                      }}
                      readOnly={isEdit}
                      className={isEdit ? "bg-muted opacity-50" : ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {requiresLegacyAddress ? (
              <FormField
                control={form.control}
                name="probeAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('fields.address_label')}</FormLabel>
                    <Alert className="bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
                      <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      <AlertDescription className="text-sm text-amber-800 dark:text-amber-300">
                        {t('fields.address_hint')}
                      </AlertDescription>
                    </Alert>
                    <FormControl>
                      <Input
                        id="probe-address"
                        placeholder={t('fields.address_placeholder')}
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, ""))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}

            <FormField
              control={form.control}
              name="moduleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fields.module_label')}</FormLabel>
                  <FormControl>
                    <Combobox
                      triggerId="module"
                      value={field.value || ""}
                      onValueChange={field.onChange}
                      disabled={modulesLoading}
                      placeholder={t('fields.module_placeholder')}
                      searchPlaceholder={t('fields.module_search_placeholder')}
                      emptyMessage={t('fields.module_empty')}
                      options={(modules ?? []).map((mod) => ({
                        value: mod.Id_Module.toString(),
                        label: `${mod.Module_Numero_Serie || mod.Libelle_Type_Module || mod.Id_Module} sur port ${
                          mod.Port_Serie || "N/A"
                        } (${mod.Emplacement || "-"})`,
                        searchText: `${mod.Module_Numero_Serie || ""} ${mod.Libelle_Type_Module || ""} ${
                          mod.Port_Serie || ""
                        } ${mod.Emplacement || ""} ${mod.Id_Module}`,
                      }))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!moduleOnly ? (
              <FormField
                control={form.control}
                name="sondeOffset"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('fields.offset_label')}</FormLabel>
                    <p className="text-xs text-muted-foreground">
                      {isPack ? t('fields.offset_unavailable_pack') : t('fields.offset_hint')}
                    </p>
                    <FormControl>
                      <Input
                        id="sonde-offset"
                        type="number"
                        step="0.01"
                        placeholder={t('fields.offset_placeholder')}
                        value={field.value ?? ""}
                        disabled={isPack}
                        className={isPack ? "bg-muted opacity-70" : undefined}
                        onChange={(e) => {
                          const raw = e.target.value;
                          if (raw === "") {
                            field.onChange(undefined);
                            return;
                          }
                          const parsed = Number(raw);
                          field.onChange(Number.isFinite(parsed) ? parsed : undefined);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}

            {isEdit ? (
              <AdjustmentsPanel
                adjustments={adjustments}
                isLoading={adjustmentsLoading}
                selectedAdjustmentId={selectedAdjustmentId}
                onSelectAdjustment={onSelectAdjustment}
              />
            ) : null}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {tCommon('cancel')}
              </Button>
              <Button type="submit">{isEdit ? t('submit_update') : t('submit_create')}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}


