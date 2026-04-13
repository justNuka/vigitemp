'use client';

import type { AvailableSensor } from '@/hooks/useAvailableSensors';
import type { Group } from '@/hooks/useGroups';
import type { Module } from '@/hooks/useModules';
import type { SiteSimple } from '@/hooks/useSites';
import type { MailingUser } from '@/hooks/useUsersForMailing';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { TemporaryMemoryControls } from '@/components/form/temporary-memory-controls';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLicense } from "@/components/license/license-provider";
import { isExpert, isStandardOrExpert } from "@/lib/license-access";
import { Check, ChevronDown, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { FormProvider, type UseFormReturn, useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { showFormValidationToast } from '@/lib/form-toast';

import type { EmtMode } from "@/lib/emt"
import type { LieuEmtParams } from "@/lib/planning-regle-schema"
import type { LocationFormData, LocationFormMode } from './location-form-types';
import { getDefaultLocationFormData } from "./location-form-defaults";
import { locationFormSchema } from './location-form-schema';
import { LocationFormTabGeneral } from './location-form-tab-general';
import { LocationFormTabMetrology } from './location-form-tab-metrology';
import { LocationFormTabTelephony } from './location-form-tab-telephony';
import { LocationFormTabPlanning } from './location-form-tab-planning';

type LocationFormDialogProps = {
  open: boolean;
  mode: LocationFormMode;
  form?: UseFormReturn<LocationFormData>;
  // Legacy props kept for backward compatibility
  formData?: LocationFormData;
  setFormData?: Dispatch<SetStateAction<LocationFormData>>;
  sites: SiteSimple[];
  groups: Group[];
  availableSensors: AvailableSensor[];
  modules: Module[];
  mailingUsers: MailingUser[];
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (values: LocationFormData) => void | Promise<void>;
};

export function LocationFormDialog({
  open,
  mode,
  form,
  formData,
  setFormData,
  sites,
  groups,
  availableSensors,
  modules,
  mailingUsers,
  isSubmitting,
  onCancel,
  onSubmit,
}: LocationFormDialogProps) {
  const isEdit = mode === 'edit';
  const { license } = useLicense();
  const hasMetrologyTabs = isStandardOrExpert(license);
  const isExpertEdition = isExpert(license);
  const t = useTranslations('locationsForm.dialog');
  const tCommon = useTranslations('common');
  const internalForm = useForm<LocationFormData>({
    defaultValues: formData ?? getDefaultLocationFormData(),
  });
  const resolvedForm = form ?? internalForm;
  const hasChanges = open && resolvedForm.formState.isDirty;
  const submitAndStay = resolvedForm.handleSubmit(async (values) => {
    resolvedForm.clearErrors();
    const validation = locationFormSchema.safeParse(values);
    if (!validation.success) {
      for (const issue of validation.error.issues) {
        const [field] = issue.path;
        if (typeof field === 'string') {
          resolvedForm.setError(field as keyof LocationFormData, {
            type: 'manual',
            message: issue.message,
          });
        }
      }
      toast.error(validation.error.issues[0]?.message ?? tCommon('error'));
      return;
    }
    await onSubmit(values);
  }, (errors) => showFormValidationToast(errors));

  const submitAndClose = resolvedForm.handleSubmit(async (values) => {
    resolvedForm.clearErrors();
    const validation = locationFormSchema.safeParse(values);
    if (!validation.success) {
      for (const issue of validation.error.issues) {
        const [field] = issue.path;
        if (typeof field === 'string') {
          resolvedForm.setError(field as keyof LocationFormData, {
            type: 'manual',
            message: issue.message,
          });
        }
      }
      toast.error(validation.error.issues[0]?.message ?? tCommon('error'));
      return;
    }
    await onSubmit(values);
    onCancel();
  }, (errors) => showFormValidationToast(errors));
  const memoryKey = `location-form:${mode}:${resolvedForm.watch('Id_Lieu') ?? 'new'}`;
  const resetValues = (resolvedForm.getValues() as LocationFormData) ?? getDefaultLocationFormData();
  const [activeTab, setActiveTab] = useState<string>('general');

  const confirmCloseIfDirty = () => {
    if (!hasChanges) return true;
    return window.confirm(t('unsaved_changes_confirm'));
  };

  useEffect(() => {
    if (!open || form || !formData) return;
    internalForm.reset(formData);
  }, [open, form, formData, internalForm]);

  useEffect(() => {
    if (!open || form || !setFormData) return;
    const subscription = internalForm.watch((value) => {
      setFormData(value as LocationFormData);
    });
    return () => subscription.unsubscribe();
  }, [open, form, internalForm, setFormData]);


  const emtParamsForPlanning: LieuEmtParams = {
    mode: ((resolvedForm.watch('EMT_Mode') ?? 'sans-objet') as EmtMode),
    emtValue: resolvedForm.watch('EMT_Valeur') ?? null,
    incertitude: resolvedForm.watch('Incertitude') ?? null,
    erreurJustesse: resolvedForm.watch('Erreur_Justesse') ?? null,
    derive: resolvedForm.watch('Derive') ?? null,
    includeDeriveInUncertainty: resolvedForm.watch('Prendre_En_Compte_Derive') ?? false,
    correctAccuracyError: resolvedForm.watch('Corriger_Erreur_Justesse') ?? false,
    isConsigneSupActive: resolvedForm.watch('Est_Consigne_Sup_Active') ?? false,
    isConsigneInfActive: resolvedForm.watch('Est_Consigne_Inf_Active') ?? false,
  }

  if (!open) {
    return null;
  }
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && confirmCloseIfDirty()) onCancel();
      }}
    >
      <DialogContent className="max-w-4xl xl:max-w-5xl max-h-[96vh] overflow-y-auto bg-white p-0 dark:bg-card">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>{isEdit ? t('title_edit') : t('title_create')}</DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>

        <FormProvider {...resolvedForm}>
          <form onSubmit={(event) => { event.preventDefault(); void submitAndStay(); }} className="space-y-4 px-6 pb-6">
            {!isEdit ? (
              <TemporaryMemoryControls
                form={resolvedForm}
                storageKey={memoryKey}
                resetValues={resetValues}
                labels={{
                  save: t('temporary_memory.save'),
                  restore: t('temporary_memory.restore'),
                  clear: t('temporary_memory.clear'),
                  saved: t('temporary_memory.saved'),
                }}
              />
            ) : null}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              {isEdit && resolvedForm.watch('Nom_Lieu') ? (
                <div className="mb-3 rounded-md border border-sky-200 bg-sky-50 px-4 py-2 text-sm text-sky-900 dark:border-sky-500/40 dark:bg-sky-500/10 dark:text-sky-100">
                  <span className="font-medium">{t('current_location_label')}</span>{' '}
                  <span>{resolvedForm.watch('Nom_Lieu')}</span>
                </div>
              ) : null}
              <TabsList
                className={`grid w-full ${hasMetrologyTabs ? "grid-cols-4" : "grid-cols-2"} bg-[#26A5DA]/10 text-[#26A5DA] border border-[#26A5DA]/30`}
              >
                <TabsTrigger
                  value="general"
                  className="data-[state=active]:bg-[#26A5DA] data-[state=active]:text-sidebar-foreground hover:bg-[#26A5DA]/15"
                >
                  {t('tabs.general')}
                </TabsTrigger>
                {hasMetrologyTabs && (
                  <TabsTrigger
                    value="metrologie"
                    className="data-[state=active]:bg-[#26A5DA] data-[state=active]:text-sidebar-foreground hover:bg-[#26A5DA]/15"
                  >
                    {t('tabs.metrology')}
                  </TabsTrigger>
                )}
                {hasMetrologyTabs && (
                  <TabsTrigger
                    value="telephonie"
                    className="data-[state=active]:bg-[#26A5DA] data-[state=active]:text-sidebar-foreground hover:bg-[#26A5DA]/15"
                  >
                    {t('tabs.mailing')}
                  </TabsTrigger>
                )}
                <TabsTrigger
                  value="planning"
                  className="data-[state=active]:bg-[#26A5DA] data-[state=active]:text-sidebar-foreground hover:bg-[#26A5DA]/15"
                >
                  {t('tabs.planning')}
                </TabsTrigger>
              </TabsList>

              <LocationFormTabGeneral
                sites={sites}
                groups={groups}
                availableSensors={availableSensors}
                modules={modules}
                onGoToPlanning={() => setActiveTab('planning')}
              />
              {hasMetrologyTabs && <LocationFormTabMetrology isExpertEdition={isExpertEdition} />}
              {hasMetrologyTabs && <LocationFormTabTelephony users={mailingUsers} />}
              <TabsContent value="planning">
                <LocationFormTabPlanning
                  idLieu={resolvedForm.watch('Id_Lieu') ?? null}
                  emtParams={emtParamsForPlanning}
                  onGoToGeneral={() => setActiveTab('general')}
                  baseSetpoints={{
                    consigne: resolvedForm.watch('Consigne') ?? null,
                    consigneSup: resolvedForm.watch('Consigne_Sup') ?? null,
                    consigneInf: resolvedForm.watch('Consigne_Inf') ?? null,
                    frequence: resolvedForm.watch('Frequence') ?? null,
                    retardAlarmeHaut: resolvedForm.watch('Retard_Alarme_Haut') ?? null,
                    retardAlarmeBas: resolvedForm.watch('Retard_Alarme_Bas') ?? null,
                  }}
                />
              </TabsContent>
            </Tabs>

            {hasChanges && (
              <div className="sticky bottom-0 z-20 flex justify-end gap-2 border-t bg-white/95 py-3 backdrop-blur dark:bg-popover/95">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2" type="button" disabled={isSubmitting}>
                      <X className="h-4 w-4" />
                      {tCommon('cancel')}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => { if (confirmCloseIfDirty()) onCancel(); }}>
                      {t('submit.cancel_and_close')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => resolvedForm.reset()}>
                      {t('submit.cancel_and_stay')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button type="button" disabled={isSubmitting} className="gap-2">
                      <Check className="h-4 w-4" />
                      {isSubmitting ? t('submit.saving') : tCommon('save')}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => void submitAndClose()}>
                      {t('submit.save_and_close')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => void submitAndStay()}>
                      {t('submit.save_and_stay')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}


