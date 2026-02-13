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
import { toast } from "sonner";
import { useRouter } from '@/i18n/navigation';

interface SensorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sensor?: Sensor | null;
  isEditing?: boolean;
}

export function SensorModal({ open, onOpenChange, sensor, isEditing }: SensorModalProps) {
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
    moduleId: z.string().optional(),
    sondeOffset: z.number({ message: t('validation.offset_invalid') }).optional(),
  });

  type SensorFormValues = z.infer<typeof sensorSchema>;

  const form = useForm<SensorFormValues>({
    resolver: zodResolver(sensorSchema),
    defaultValues: {
      sondeType: "",
      serieNum: "",
      moduleId: "",
      sondeOffset: undefined,
    },
    mode: "onChange",
  });

  const { data: sensorTypes, isLoading: sensorTypesLoading } = useSensorTypes(open);
  const { data: modules, isLoading: modulesLoading } = useModules(open);

  useEffect(() => {
    if (!open) return;

    if (isEdit && sensor) {
      form.reset({
        sondeType: sensor.Sonde_Numero_Serie?.split("-")[0] || "",
        serieNum: sensor.Sonde_Numero_Serie || "",
        moduleId: sensor.Id_Module?.toString() || "",
        sondeOffset: sensor.Sonde_Offset ?? 0,
      });
      return;
    }

    form.reset({ sondeType: "", serieNum: "", moduleId: "", sondeOffset: undefined });
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

        await patchJson(`/api/sondes/${sensor.Id_Sonde}`, {
          moduleId: moduleIdValue,
          sondeOffset: sondeOffsetValue,
        });
        toast.success(t('toast.update_success'));
      } else {
        await postJson(`/api/sondes`, {
          sondeType: values.sondeType,
          serieNum: values.serieNum,
          moduleId: moduleIdValue,
          sondeOffset: sondeOffsetValue,
        });
        toast.success(t('toast.create_success'));
      }

      await queryClient.invalidateQueries({ queryKey: ["sensors"] });
      router.refresh();
      form.reset({ sondeType: "", serieNum: "", moduleId: "", sondeOffset: undefined });
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('toast.save_error'));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent key={contentKey} className="sm:max-w-125 bg-white dark:bg-card">
        <DialogHeader>
          <DialogTitle>{isEdit ? t('title_edit') : t('title_create')}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit, (errors) => showFormValidationToast(errors))} className="space-y-6">
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
                    <SelectContent>
                      {sensorTypes?.map((type) => (
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

            <FormField
              control={form.control}
              name="sondeOffset"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fields.offset_label')}</FormLabel>
                  <p className="text-xs text-muted-foreground">{t('fields.offset_hint')}</p>
                  <FormControl>
                    <Input
                      id="sonde-offset"
                      type="number"
                      step="0.01"
                      placeholder={t('fields.offset_placeholder')}
                      value={field.value ?? ""}
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


