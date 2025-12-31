'use client';

import type { Dispatch, SetStateAction } from 'react';
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

import type { LocationFormData, LocationFormMode } from './location-form-types';
import { LocationFormTabGeneral } from './location-form-tab-general';
import { LocationFormTabMetrology } from './location-form-tab-metrology';
import { LocationFormTabTelephony } from './location-form-tab-telephony';

type LocationFormDialogProps = {
  open: boolean;
  mode: LocationFormMode;
  formData: LocationFormData;
  setFormData: Dispatch<SetStateAction<LocationFormData>>;
  sites: SiteSimple[];
  groups: Group[];
  availableProbes: AvailableProbe[];
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: () => void;
};

export function LocationFormDialog({
  open,
  mode,
  formData,
  setFormData,
  sites,
  groups,
  availableProbes,
  isSubmitting,
  onCancel,
  onSubmit,
}: LocationFormDialogProps) {
  const isEdit = mode === 'edit';

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onCancel();
      }}
    >
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Modifier le lieu' : 'Créer un nouveau lieu'}</DialogTitle>
          <DialogDescription>Remplissez les informations du lieu</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">Général</TabsTrigger>
            <TabsTrigger value="metrologie">Métrologie</TabsTrigger>
            <TabsTrigger value="telephonie">Téléphonie/Planning</TabsTrigger>
          </TabsList>

          <LocationFormTabGeneral
            formData={formData}
            setFormData={setFormData}
            sites={sites}
            groups={groups}
            availableProbes={availableProbes}
          />
          <LocationFormTabMetrology formData={formData} setFormData={setFormData} />
          <LocationFormTabTelephony />
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Annuler
          </Button>
          <Button onClick={onSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
