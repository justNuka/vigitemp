'use client';

import type { Dispatch, SetStateAction } from 'react';
import type { Authorization } from '@/hooks/useProfiles';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export type ProfileFormData = {
  name: string;
  description: string;
  mc2: boolean;
  authorizations: number[];
};

type ProfileDialogProps = {
  open: boolean;
  mode: 'create' | 'edit';
  formData: ProfileFormData;
  setFormData: Dispatch<SetStateAction<ProfileFormData>>;
  authorizations: Authorization[];
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: () => void;
};

function groupAuthorizationsByModule(auths: Authorization[]) {
  const groups: Record<string, Authorization[]> = {
    Administration: [],
    Métrologie: [],
    Surveillance: [],
    VigiLog: [],
    Autres: [],
  };

  auths.forEach((auth) => {
    if (auth.fenAdmin) groups.Administration.push(auth);
    else if (auth.fenMetrologie) groups.Métrologie.push(auth);
    else if (auth.fenSurveillance) groups.Surveillance.push(auth);
    else if (auth.fenVigiLog) groups.VigiLog.push(auth);
    else groups.Autres.push(auth);
  });

  return Object.entries(groups).filter(([_, items]) => items.length > 0);
}

export function ProfileDialog({
  open,
  mode,
  formData,
  setFormData,
  authorizations,
  isSubmitting,
  onCancel,
  onSubmit,
}: ProfileDialogProps) {
  const isEdit = mode === 'edit';

  const toggleAuthorization = (authId: number) => {
    setFormData((prev) => ({
      ...prev,
      authorizations: prev.authorizations.includes(authId)
        ? prev.authorizations.filter((id) => id !== authId)
        : [...prev.authorizations, authId],
    }));
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onCancel();
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Modifier le profil' : 'Créer un profil'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Modifier les informations et autorisations du profil"
              : "Définir un nouveau profil d'utilisateur avec ses autorisations"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor={isEdit ? 'edit-name' : 'name'}>Nom du profil *</Label>
            <Input
              id={isEdit ? 'edit-name' : 'name'}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={isEdit ? undefined : 'Responsable qualité'}
            />
          </div>

          <div>
            <Label htmlFor={isEdit ? 'edit-description' : 'description'}>Description</Label>
            <Textarea
              id={isEdit ? 'edit-description' : 'description'}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={isEdit ? undefined : 'Description optionnelle du profil'}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id={isEdit ? 'edit-mc2' : 'mc2'}
              checked={formData.mc2}
              onCheckedChange={(checked) => setFormData({ ...formData, mc2: checked as boolean })}
            />
            <label htmlFor={isEdit ? 'edit-mc2' : 'mc2'} className="text-sm font-medium">
              Réservé MC2
            </label>
          </div>

          <div>
            <Label className="mb-3 block">Autorisations</Label>
            <div className="space-y-4">
              {groupAuthorizationsByModule(authorizations).map(([module, auths]) => (
                <Card key={module}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">{module}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {auths.map((auth) => (
                      <div key={auth.id} className="flex items-start space-x-2">
                        <Checkbox
                          id={`${mode}-auth-${auth.id}`}
                          checked={formData.authorizations.includes(auth.id)}
                          onCheckedChange={() => toggleAuthorization(auth.id)}
                        />
                        <div className="flex-1">
                          <label htmlFor={`${mode}-auth-${auth.id}`} className="text-sm font-medium cursor-pointer">
                            {auth.label || auth.code}
                          </label>
                          {auth.description && <p className="text-xs text-muted-foreground">{auth.description}</p>}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Annuler
          </Button>
          <Button onClick={onSubmit} disabled={!formData.name || isSubmitting}>
            {isSubmitting ? (isEdit ? 'Mise à jour...' : 'Création...') : isEdit ? 'Mettre à jour' : 'Créer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

