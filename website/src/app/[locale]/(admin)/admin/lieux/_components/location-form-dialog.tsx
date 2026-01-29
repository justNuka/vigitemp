'use client';

import type { AvailableProbe } from '@/hooks/useAvailableProbes';
import type { Group } from '@/hooks/useGroups';
import type { SiteSimple } from '@/hooks/useSites';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLicense } from "@/components/license/license-provider";
import { Check, X } from "lucide-react";
import { FormProvider, type UseFormReturn } from 'react-hook-form';
import type { Dispatch, SetStateAction } from 'react';
import { useTranslations } from 'next-intl';

import type { LocationFormData, LocationFormMode } from './location-form-types';
import { LocationFormTabGeneral } from './location-form-tab-general';
import { LocationFormTabMetrology } from './location-form-tab-metrology';
import { LocationFormTabTelephony } from './location-form-tab-telephony';

type LocationFormDialogProps = {
  open: boolean;
  mode: LocationFormMode;
  form: UseFormReturn<LocationFormData>;
  formData?: LocationFormData;
  setFormData?: Dispatch<SetStateAction<LocationFormData>>;
  sites: SiteSimple[];
  groups: Group[];
  availableProbes: AvailableProbe[];
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (values: LocationFormData) => void | Promise<void>;
};

export function LocationFormDialog({
  open,
  mode,
  form,
  sites,
  groups,
  availableProbes,
  isSubmitting,
  onCancel,
  onSubmit,
}: LocationFormDialogProps) {
  const isEdit = mode === 'edit';
  const { license } = useLicense();
  const edition = (license?.edition || "one").trim().toLowerCase();
  const isOne = edition === "one";
  const t = useTranslations('locationsForm.dialog');
  const tCommon = useTranslations('common');
  const handleSubmit = form.handleSubmit(async (values) => onSubmit(values));

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onCancel();
      }}
    >
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-card">
        <DialogHeader>
          <DialogTitle>{isEdit ? t('title_edit') : t('title_create')}</DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>

        <FormProvider {...form}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Tabs defaultValue="general" className="w-full">
              <TabsList className={`grid w-full ${isOne ? "grid-cols-1" : "grid-cols-3"}`}>
                <TabsTrigger value="general">{t('tabs.general')}</TabsTrigger>
                {!isOne && <TabsTrigger value="metrologie">{t('tabs.metrology')}</TabsTrigger>}
                {!isOne && <TabsTrigger value="telephonie">{t('tabs.telephony')}</TabsTrigger>}
              </TabsList>

              <LocationFormTabGeneral
                sites={sites}
                groups={groups}
                availableProbes={availableProbes}
              />
              {!isOne && <LocationFormTabMetrology />}
              {!isOne && <LocationFormTabTelephony />}
            </Tabs>

            <DialogFooter>
              <Button variant="outline" onClick={onCancel} className="gap-2" type="button">
                <X className="h-4 w-4" />
                {tCommon('cancel')}
              </Button>
              <Button type="submit" disabled={isSubmitting} className="gap-2">
                <Check className="h-4 w-4" />
                {isSubmitting ? t('submit.saving') : tCommon('save')}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
