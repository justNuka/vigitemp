'use client';

import type { AvailableSensor } from '@/hooks/useAvailableSensors';
import type { Group } from '@/hooks/useGroups';
import type { Module } from '@/hooks/useModules';
import type { SiteSimple } from '@/hooks/useSites';
import type { MailingUser } from '@/hooks/useUsersForMailing';
import type { LocationTemplateRow } from '@/hooks/useLocationTemplates';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { TemporaryMemoryControls } from '@/components/form/temporary-memory-controls';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLicense } from "@/components/license/license-provider";
import { isExpert, isStandardOrExpert } from "@/lib/license-access";
import { Check, ChevronDown, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { FormProvider, type UseFormReturn, useForm, useWatch } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { showFormValidationToast } from '@/lib/form-toast';
import { postJson } from '@/lib/http';

import type { EmtMode } from "@/lib/emt"
import type { LieuEmtParams } from "@/lib/planning-regle-schema"
import type { LocationFormData, LocationFormMode } from './location-form-types';
import { getDefaultLocationFormData } from "./location-form-defaults";
import { locationFormSchema } from './location-form-schema';
import { buildFormPatchFromTemplate, buildTemplatePayloadFromForm } from './location-template-utils';
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
  locationTemplates?: LocationTemplateRow[];
  isSubmitting: boolean;
  showActionComment?: boolean;
  requireActionComment?: boolean;
  onCancel: () => void;
  onSubmit: (values: LocationFormData, submitMode?: "stay" | "close") => void | Promise<void>;
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
  locationTemplates = [],
  isSubmitting,
  showActionComment = false,
  requireActionComment = false,
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
  const internalFormValues = useWatch({ control: internalForm.control });
  const hasChanges = open && resolvedForm.formState.isDirty;

  const normalizeSubmitValues = (values: LocationFormData): LocationFormData | null => {
    if (!showActionComment) return values;

    const rawComment = typeof values.Commentaire_Action === 'string' ? values.Commentaire_Action.trim() : '';
    if (requireActionComment && rawComment.length === 0) {
      const message = t('action_comment_required');
      resolvedForm.setError('Commentaire_Action', {
        type: 'manual',
        message,
      });
      toast.error(message);
      return null;
    }

    resolvedForm.clearErrors('Commentaire_Action');
    return {
      ...values,
      Commentaire_Action: rawComment.length > 0 ? rawComment : null,
    };
  };

  const submitAndStay = resolvedForm.handleSubmit(async (values) => {
    resolvedForm.clearErrors();
    const normalized = normalizeSubmitValues(values);
    if (!normalized) return;
    const validation = locationFormSchema.safeParse(normalized);
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
    await onSubmit(normalized, 'stay');
    const nextCommitted = {
      ...normalized,
      Commentaire_Action: null,
    };
    setLastCommittedValues(nextCommitted);
    resolvedForm.reset(nextCommitted);
  }, (errors) => showFormValidationToast(errors));

  const submitAndClose = resolvedForm.handleSubmit(async (values) => {
    resolvedForm.clearErrors();
    const normalized = normalizeSubmitValues(values);
    if (!normalized) return;
    const validation = locationFormSchema.safeParse(normalized);
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
    await onSubmit(normalized, 'close');
    setLastCommittedValues(normalized);
    onCancel();
  }, (errors) => showFormValidationToast(errors));
  const memoryKey = `location-form:${mode}:${resolvedForm.watch('Id_Lieu') ?? 'new'}`;
  const resetValues = useMemo(() => (
    (resolvedForm.getValues() as LocationFormData) ?? getDefaultLocationFormData()
  ), [resolvedForm]);
  const [activeTab, setActiveTab] = useState<string>('general');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [isCreateTemplateDialogOpen, setIsCreateTemplateDialogOpen] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const [lastCommittedValues, setLastCommittedValues] = useState<LocationFormData>(() => getDefaultLocationFormData());
  const queryClient = useQueryClient();
  const createTemplateMutation = useMutation({
    mutationFn: async (payload: ReturnType<typeof buildTemplatePayloadFromForm>) =>
      postJson('/api/lieux/templates', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['location-templates'] });
      toast.success(t('template.toast_create_success'));
      setIsCreateTemplateDialogOpen(false);
      setTemplateName("");
      setTemplateDescription("");
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : t('template.toast_create_error');
      toast.error(message);
    },
  });

  useEffect(() => {
    if (!open || form || !formData) return;
    internalForm.reset(formData);
    setLastCommittedValues(formData);
  }, [open, form, formData, internalForm]);

  useEffect(() => {
    if (!open) return;
    setLastCommittedValues(resolvedForm.getValues() as LocationFormData);
  }, [open, resolvedForm]);

  useEffect(() => {
    if (!open || form || !setFormData || !internalFormValues) return;
    setFormData(internalFormValues as LocationFormData);
  }, [open, form, internalFormValues, setFormData]);


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

  const selectedTemplate = locationTemplates.find((template) => String(template.Id_Lieu_Template) === selectedTemplateId) ?? null;

  const applySelectedTemplate = () => {
    if (!selectedTemplate) return;
    const currentValues = resolvedForm.getValues();
    const patch = buildFormPatchFromTemplate(selectedTemplate);
    resolvedForm.reset({
      ...currentValues,
      ...patch,
    }, {
      keepDirty: true,
      keepTouched: true,
    });
    toast.success(t('template.toast_apply_success', { name: selectedTemplate.Nom_Template }));
  };

  const handleCreateTemplate = () => {
    const trimmedName = templateName.trim();
    if (!trimmedName) {
      toast.error(t('template.name_required'));
      return;
    }
    const payload = buildTemplatePayloadFromForm(resolvedForm.getValues(), trimmedName, templateDescription);
    createTemplateMutation.mutate(payload);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onCancel();
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
            <div className="space-y-3 rounded-md border border-border/60 bg-muted/20 p-3">
              <div className="space-y-1">
                <p className="text-sm font-medium">{t('template.title')}</p>
                <p className="text-xs text-muted-foreground">{t('template.description')}</p>
              </div>
              <div className="grid gap-2 md:grid-cols-[1fr_auto_auto]">
                <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('template.select_placeholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {locationTemplates.length === 0 ? (
                      <SelectItem value="__empty" disabled>
                        {t('template.empty')}
                      </SelectItem>
                    ) : (
                      locationTemplates.map((template) => (
                        <SelectItem key={template.Id_Lieu_Template} value={String(template.Id_Lieu_Template)}>
                          {template.Nom_Template}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <Button type="button" variant="outline" onClick={applySelectedTemplate} disabled={!selectedTemplate}>
                  {t('template.apply')}
                </Button>
                <Button type="button" variant="secondary" onClick={() => setIsCreateTemplateDialogOpen(true)}>
                  {t('template.save_current')}
                </Button>
              </div>
            </div>
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
              <div className="sticky bottom-0 z-20 space-y-3 border-t bg-white/95 py-3 backdrop-blur dark:bg-popover/95">
                {showActionComment ? (
                  <div className="space-y-1">
                    <label htmlFor="location-action-comment" className="text-sm font-medium">
                      {t('action_comment_label')}
                      {requireActionComment ? ' *' : ''}
                    </label>
                    <Textarea
                      id="location-action-comment"
                      rows={2}
                      maxLength={500}
                      placeholder={t(requireActionComment ? 'action_comment_placeholder_required' : 'action_comment_placeholder_optional')}
                      {...resolvedForm.register('Commentaire_Action')}
                    />
                    {resolvedForm.formState.errors.Commentaire_Action?.message ? (
                      <p className="text-xs text-destructive">{String(resolvedForm.formState.errors.Commentaire_Action.message)}</p>
                    ) : null}
                  </div>
                ) : null}

                <div className="flex justify-end gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="gap-2" type="button" disabled={isSubmitting}>
                        <X className="h-4 w-4" />
                        {tCommon('cancel')}
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={onCancel}>
                        {t('submit.cancel_and_close')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => resolvedForm.reset(lastCommittedValues)}>
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
              </div>
            )}
          </form>
        </FormProvider>
      </DialogContent>

      <AlertDialog open={isCreateTemplateDialogOpen} onOpenChange={setIsCreateTemplateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('template.create_title')}</AlertDialogTitle>
            <AlertDialogDescription>{t('template.create_description')}</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <label htmlFor="location-template-name" className="text-sm font-medium">
                {t('template.name_label')}
              </label>
              <Input
                id="location-template-name"
                value={templateName}
                onChange={(event) => setTemplateName(event.target.value)}
                maxLength={80}
                placeholder={t('template.name_placeholder')}
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="location-template-description" className="text-sm font-medium">
                {t('template.description_label')}
              </label>
              <Textarea
                id="location-template-description"
                value={templateDescription}
                onChange={(event) => setTemplateDescription(event.target.value)}
                rows={3}
                maxLength={255}
                placeholder={t('template.description_placeholder')}
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>{tCommon('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleCreateTemplate} disabled={createTemplateMutation.isPending}>
              {createTemplateMutation.isPending ? t('template.create_saving') : t('template.create_confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </Dialog>
  );
}


