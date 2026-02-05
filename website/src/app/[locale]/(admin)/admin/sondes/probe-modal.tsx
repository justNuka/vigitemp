"use client";

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
import { useProbeTypes } from "@/hooks/useProbeTypes";
import { useModules } from "@/hooks/useModules";
import type { Probe } from "@/hooks/useProbes";
import { AlertCircle } from "lucide-react";
import { patchJson, postJson } from "@/lib/http";
import { toast } from "sonner";
import { useRouter } from '@/i18n/navigation';

interface ProbeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  probe?: Probe | null;
  isEditing?: boolean;
}

export function ProbeModal({ open, onOpenChange, probe, isEditing }: ProbeModalProps) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const t = useTranslations('probesDialog');
  const tCommon = useTranslations('common');
  const isEdit = Boolean(isEditing && probe);
  const probeKey = (probe as any)?.Id_Sonde ?? probe?.Sonde_Numero_Serie ?? "new";
  const contentKey = `${isEdit ? "edit" : "new"}-${probeKey}-${open ? "open" : "closed"}`;

  const probeSchema = z.object({
    sondeType: z.string().min(1, t('validation.type_required')),
    serieNum: z.string().regex(/^\d+(?:-?[TH])?$/i, t('validation.serial_invalid')),
    moduleId: z.string().optional(),
    sondeOffset: z.number({ message: t('validation.offset_invalid') }).optional(),
  });

  type ProbeFormValues = z.infer<typeof probeSchema>;

  const form = useForm<ProbeFormValues>({
    resolver: zodResolver(probeSchema),
    defaultValues: {
      sondeType: "",
      serieNum: "",
      moduleId: "",
      sondeOffset: undefined,
    },
    mode: "onChange",
  });

  const { data: probeTypes, isLoading: probeTypesLoading } = useProbeTypes(open);
  const { data: modules, isLoading: modulesLoading } = useModules(open);

  useEffect(() => {
    if (!open) return;

    if (isEdit && probe) {
      form.reset({
        sondeType: probe.Sonde_Numero_Serie?.substring(0, 2) || "",
        serieNum: probe.Sonde_Numero_Serie || "",
        moduleId: probe.Id_Module?.toString() || "",
        sondeOffset: probe.Sonde_Offset ?? 0,
      });
      return;
    }

    form.reset({ sondeType: "", serieNum: "", moduleId: "", sondeOffset: undefined });
  }, [form, isEdit, open, probe]);

  const handleSubmit = async (values: ProbeFormValues) => {
    try {
      const moduleIdNumber = values.moduleId ? parseInt(values.moduleId, 10) : null;
      const moduleIdValue = Number.isNaN(moduleIdNumber) ? null : moduleIdNumber;
      const sondeOffsetValue = values.sondeOffset ?? 0;

      if (isEdit) {
        if (!probe?.Id_Sonde) {
          toast.error(t('toast.invalid_probe'));
          return;
        }

        await patchJson(`/api/sondes/${probe.Id_Sonde}`, {
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

      await queryClient.invalidateQueries({ queryKey: ["probes"] });
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
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="sondeType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fields.type_label')}</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange} disabled={isEdit}>
                    <FormControl>
                      <SelectTrigger id="probe-type" disabled={probeTypesLoading || isEdit}>
                        <SelectValue placeholder={t('fields.type_placeholder')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {probeTypes?.map((type) => (
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
                        const cleaned = normalized.replace(/[^0-9TH]/g, "");
                        const suffix = cleaned.endsWith("T") ? "T" : cleaned.endsWith("H") ? "H" : "";
                        const digits = suffix
                          ? cleaned.slice(0, -1).replace(/[^0-9]/g, "")
                          : cleaned.replace(/[^0-9]/g, "");
                        field.onChange(suffix ? `${digits}-${suffix}` : digits);
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
