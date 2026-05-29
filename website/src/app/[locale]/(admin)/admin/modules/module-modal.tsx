"use client";
import { showFormValidationToast } from "@/lib/form-toast"

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { useModuleSondes, useModuleTypes, useModuleWorkers } from "@/hooks/useModules";
import { ModuleAssociatedSensors } from "./_components/module-associated-sensors";
import { moduleSchema, type ModuleFormData } from "./_components/module-schemas";
import { useTranslations } from 'next-intl';

interface ModuleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  module?: {
    Id_Module: number;
    Module_Numero_Serie: string | null;
    Type_Module: number | null;
    Port_Serie: string | null;
    Emplacement: string | null;
    Adresse_IP?: string | null;
    Id_Worker?: number | null;
    Delai_Reseau?: number | null;
    Est_Module_GSO?: boolean | null;
  } | null;
  onSuccess?: () => void;
}

function getDefaultValues(module: ModuleModalProps["module"]): ModuleFormData {
  return {
    Module_Numero_Serie: module?.Module_Numero_Serie || "",
    Type_Module: module?.Type_Module ? String(module.Type_Module) : "",
    Port_Serie: module?.Port_Serie ? parseInt(module.Port_Serie) : 1,
    Emplacement: module?.Emplacement || "",
    Adresse_IP: module?.Adresse_IP || "",
    Id_Worker: module?.Id_Worker ? String(module.Id_Worker) : "",
    Delai_Reseau: module?.Delai_Reseau || undefined,
    Est_Module_GSO: module?.Est_Module_GSO || false,
  };
}

export function ModuleModal({ open, onOpenChange, module, onSuccess }: ModuleModalProps) {
  const t = useTranslations('modulesForm');
  const tCommon = useTranslations('common');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const { data: moduleTypes, isLoading: typesLoading } = useModuleTypes(open);
  const { data: workerSummary } = useModuleWorkers(open);
  const { data: sondes, isLoading: sondesLoading } = useModuleSondes(
    module?.Id_Module || null,
    open && Boolean(module),
  );

  const isEditing = !!module;
  const defaultValues = useMemo(() => getDefaultValues(module), [module]);

  const form = useForm<ModuleFormData>({
    resolver: zodResolver(moduleSchema),
    defaultValues,
  });

  useEffect(() => {
    if (!open) return;
    form.reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, defaultValues]);

  const onSubmit = async (data: ModuleFormData) => {
    if (isEditing && !module) return;

    setIsSubmitting(true);
    try {
      const url = isEditing ? `/api/modules/${module.Id_Module}` : "/api/modules";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Module_Numero_Serie: data.Module_Numero_Serie,
          Type_Module: parseInt(data.Type_Module),
          Port_Serie: String(data.Port_Serie),
          Emplacement: data.Emplacement,
          Adresse_IP: data.Adresse_IP || null,
          Id_Worker: data.Id_Worker ? parseInt(data.Id_Worker) : null,
          Delai_Reseau: data.Delai_Reseau || null,
          Est_Module_GSO: data.Est_Module_GSO ?? false,
        }),
      });

      if (!res.ok) throw new Error(t('errors.save')); 

      form.reset(getDefaultValues(null));
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Erreur sauvegarde module:", error);
      form.setError("root", { message: t('errors.save_form') });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset(getDefaultValues(null));
      setIsAdvancedOpen(false);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-white dark:bg-popover dark:text-popover-foreground">
        <DialogHeader>
          <DialogTitle>{isEditing ? t('title_edit') : t('title_create')}</DialogTitle>
          <DialogDescription>
            {isEditing ? t('description_edit') : t('description_create')}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit, (errors) => showFormValidationToast(errors))} className="space-y-4">
            <FormField
              control={form.control}
              name="Module_Numero_Serie"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fields.serial_label')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('fields.serial_placeholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="Type_Module"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fields.type_label')}</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger disabled={typesLoading}>
                        <SelectValue placeholder={t('fields.type_placeholder')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {moduleTypes?.map((type) => (
                        <SelectItem key={type.Id_Module_Type} value={String(type.Id_Module_Type)}>
                          {type.Libelle_Type_Module}
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
              name="Est_Module_GSO"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-1">
                    <FormLabel>{t('fields.gso_label')}</FormLabel>
                    <FormDescription>{t('fields.gso_help')}</FormDescription>
                  </div>
                  <FormControl>
                    <Checkbox checked={!!field.value} onCheckedChange={(checked) => field.onChange(!!checked)} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="Port_Serie"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fields.port_label')}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      max="255"
                      placeholder={t('fields.port_placeholder')}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="Emplacement"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fields.location_label')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('fields.location_placeholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Card className="border-dashed">
              <CardHeader className="pb-3 cursor-pointer" onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">{t('advanced.title')}</CardTitle>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isAdvancedOpen ? "rotate-180" : ""}`} />
                </div>
              </CardHeader>

              {isAdvancedOpen && (
                <CardContent className="space-y-4">
                  <div className="rounded-md border border-sky-200 bg-sky-50 p-3 text-sm text-sky-900">
                    {t('advanced.worker_info')}
                    {workerSummary?.workerIds?.length ? (
                      <div className="mt-1 font-medium">
                        {t('advanced.workers_configured', { workers: workerSummary.workerIds.join(", ") })}
                      </div>
                    ) : null}
                  </div>
                  <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                    {t('advanced.worker_warning')}
                  </div>

                  <FormField
                    control={form.control}
                    name="Adresse_IP"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('advanced.address_ip_label')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('advanced.address_ip_placeholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="Id_Worker"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('advanced.server_id_label')}</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder={t('advanced.server_id_placeholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="Delai_Reseau"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('advanced.network_delay_label')}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder={t('advanced.network_delay_placeholder')}
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                          />
                        </FormControl>
                        <FormDescription>{t('advanced.network_delay_help')}</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              )}
            </Card>

            {form.formState.errors.root && (
              <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md">
                {form.formState.errors.root.message}
              </div>
            )}

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => handleOpenChange(false)}>{tCommon('cancel')}</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? isEditing
                    ? t('submit.saving_edit')
                    : t('submit.saving_create')
                  : isEditing
                    ? t('submit.edit')
                    : t('submit.create')}
              </Button>
            </DialogFooter>

            {isEditing && (
              <div className="mt-6 pt-6 border-t space-y-3">
                <h3 className="font-semibold text-sm">{t('associated.title')}</h3>
                <ModuleAssociatedSensors sondes={sondes} isLoading={sondesLoading} />
              </div>
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}


