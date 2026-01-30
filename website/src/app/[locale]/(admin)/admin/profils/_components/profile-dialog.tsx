'use client';

import { useEffect } from 'react';
import type { Authorization } from '@/hooks/useProfiles';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';
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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

export type ProfileFormData = {
  name: string;
  description: string;
  mc2: boolean;
  authorizations: number[];
};

type ProfileDialogProps = {
  open: boolean;
  mode: 'create' | 'edit';
  initialValues: ProfileFormData;
  authorizations: Authorization[];
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (data: ProfileFormData) => void;
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
  initialValues,
  authorizations,
  isSubmitting,
  onCancel,
  onSubmit,
}: ProfileDialogProps) {
  const isEdit = mode === 'edit';
  const t = useTranslations('profilesDialog');
  const tCommon = useTranslations('common');

  const profileSchema = z.object({
    name: z.string().min(1, t('validation.name_required')),
    description: z.string(),
    mc2: z.boolean(),
    authorizations: z.array(z.number()),
  });

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: initialValues,
    mode: 'onChange',
  });

  useEffect(() => {
    if (!open) return;
    form.reset(initialValues);
  }, [form, initialValues, open]);

  const toggleAuthorization = (authId: number) => {
    const current = form.getValues('authorizations') || [];
    const next = current.includes(authId)
      ? current.filter((id) => id !== authId)
      : [...current, authId];
    form.setValue('authorizations', next, { shouldDirty: true });
  };

  const selectedAuthorizations = form.watch('authorizations') || [];
  const profileName = form.watch('name');

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onCancel();
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto max-w-2xl bg-white/50 dark:bg-card">
        <DialogHeader>
          <DialogTitle>{isEdit ? t('title_edit') : t('title_create')}</DialogTitle>
          <DialogDescription>
            {isEdit ? t('description_edit') : t('description_create')}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fields.name_label')}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={isEdit ? undefined : t('fields.name_placeholder')}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fields.description_label')}</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder={isEdit ? undefined : t('fields.description_placeholder')}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mc2"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                    />
                  </FormControl>
                  <FormLabel className="text-sm font-medium">{t('fields.mc2_label')}</FormLabel>
                </FormItem>
              )}
            />

            <div>
              <Label className="mb-3 block">{t('authorizations_title')}</Label>
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
                            checked={selectedAuthorizations.includes(auth.id)}
                            onCheckedChange={() => toggleAuthorization(auth.id)}
                          />
                          <div className="flex-1">
                            <label htmlFor={`${mode}-auth-${auth.id}`} className="text-sm font-medium cursor-pointer">
                              {auth.label || auth.code}
                            </label>
                            {auth.description && (
                              <p className="text-xs text-muted-foreground">{auth.description}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onCancel}>
                {tCommon('cancel')}
              </Button>
              <Button type="submit" disabled={!profileName || isSubmitting}>
                {isSubmitting
                  ? isEdit
                    ? t('submit_updating')
                    : t('submit_creating')
                  : isEdit
                    ? t('submit_update')
                    : t('submit_create')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

