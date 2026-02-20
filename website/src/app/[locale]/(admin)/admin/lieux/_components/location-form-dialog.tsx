'use client';

import type { AvailableSensor } from '@/hooks/useAvailableSensors';
import type { Group } from '@/hooks/useGroups';
import type { Module } from '@/hooks/useModules';
import type { SiteSimple } from '@/hooks/useSites';
import type { MailingUser } from '@/hooks/useUsersForMailing';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLicense } from "@/components/license/license-provider";
import { isStandardOrExpert } from "@/lib/license-access";
import { Check, X } from "lucide-react";
import { useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";
import { FormProvider, type UseFormReturn, useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { showFormValidationToast } from '@/lib/form-toast';

import type { LocationFormData, LocationFormMode } from './location-form-types';
import { getDefaultLocationFormData } from "./location-form-defaults";
import { LocationFormTabGeneral } from './location-form-tab-general';
import { LocationFormTabMetrology } from './location-form-tab-metrology';
import { LocationFormTabTelephony } from './location-form-tab-telephony';

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
  const t = useTranslations('locationsForm.dialog');
  const tCommon = useTranslations('common');
  const internalForm = useForm<LocationFormData>({
    defaultValues: formData ?? getDefaultLocationFormData(),
  });
  const resolvedForm = form ?? internalForm;
  const hasChanges = open && resolvedForm.formState.isDirty;
  const handleSubmit = resolvedForm.handleSubmit(onSubmit, (errors) => showFormValidationToast(errors));

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


  if (!open) {
    return null;
  }
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onCancel();
      }}
    >
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white p-0 dark:bg-card">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>{isEdit ? t('title_edit') : t('title_create')}</DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>

        <FormProvider {...resolvedForm}>
          <form onSubmit={handleSubmit} className="space-y-6 px-6 pb-6">
            <Tabs defaultValue="general" className="w-full">
              <TabsList
                className={`grid w-full ${hasMetrologyTabs ? "grid-cols-3" : "grid-cols-1"} bg-[#26A5DA]/10 text-[#26A5DA] border border-[#26A5DA]/30`}
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
              </TabsList>

              <LocationFormTabGeneral
                sites={sites}
                groups={groups}
                availableSensors={availableSensors}
                modules={modules}
              />
              {hasMetrologyTabs && <LocationFormTabMetrology />}
              {hasMetrologyTabs && <LocationFormTabTelephony users={mailingUsers} />}
            </Tabs>

            {hasChanges && (
              <div className="sticky bottom-0 z-20 flex justify-end gap-2 border-t bg-white/95 py-3 backdrop-blur dark:bg-card/95">
                <Button variant="outline" onClick={onCancel} className="gap-2" type="button">
                  <X className="h-4 w-4" />
                  {tCommon('cancel')}
                </Button>
                <Button type="submit" disabled={isSubmitting} className="gap-2">
                  <Check className="h-4 w-4" />
                  {isSubmitting ? t('submit.saving') : tCommon('save')}
                </Button>
              </div>
            )}
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}


