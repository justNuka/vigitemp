'use client';

import { useEffect } from 'react';
import type { Authorization } from '@/hooks/useProfiles';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { showFormValidationToast } from '@/lib/form-toast';
import { getAuthorizationDomain } from '@/lib/authorization-domain';
import { Button } from '@/components/ui/button';
import { TemporaryMemoryControls } from '@/components/form/temporary-memory-controls';
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
  Bell,
  ChartSpline,
  FlaskConical,
  LayoutDashboard,
  MapPinOff,
  MessageSquareText,
  MonitorCog,
  Settings,
  ShieldCheck,
  ShieldEllipsis,
  Thermometer,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export type ProfileFormData = {
  name: string;
  description: string;
  mc2: boolean;
  authorizations: number[];
  assignedUserIds: number[];
};

type ProfileAssignableUser = {
  id: number;
  username: string;
  displayName: string;
  profile: string | null;
};

type ProfileDialogProps = {
  open: boolean;
  mode: 'create' | 'edit';
  initialValues: ProfileFormData;
  authorizations: Authorization[];
  users: ProfileAssignableUser[];
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (data: ProfileFormData) => void;
};

function getAuthorizationIcon(code: string | null | undefined): LucideIcon {
  const normalized = (code || '').trim().toUpperCase();
  if (normalized.includes('DASHBOARD_ADMIN')) return LayoutDashboard;
  if (normalized.includes('DASHBOARD_UTILISATEUR')) return ChartSpline;
  if (normalized.includes('ACQUITTER_ALARME')) return Bell;
  if (normalized.includes('DESACTIVATION_LIEU')) return MapPinOff;
  if (normalized.includes('PARAMETRAGE_LIEU')) return Thermometer;
  if (normalized.includes('PARAMETRAGE_MATERIEL')) return MonitorCog;
  if (normalized.includes('PARAMETRAGE_GENERAL')) return Settings;
  if (normalized.includes('AJUSTAGE') || normalized.includes('ETALONNAGE') || normalized.includes('METROLOGIE')) return FlaskConical;
  if (normalized.includes('CONVERSATION')) return MessageSquareText;
  if (normalized.includes('ACCES_ADMIN') || normalized.includes('GERER_PROFIL')) return ShieldCheck;
  if (normalized.includes('ACCES_SURVEILLANCE')) return ShieldEllipsis;
  if (normalized.includes('ACCES_VIGILOG')) return Wrench;
  return ShieldEllipsis;
}

function groupAuthorizationsByModule(
  auths: Authorization[],
  labels: Record<'administration' | 'metrology' | 'monitoring' | 'vigilog' | 'other', string>,
) {
  const groups: Record<string, Authorization[]> = {
    [labels.administration]: [],
    [labels.metrology]: [],
    [labels.monitoring]: [],
    [labels.vigilog]: [],
    [labels.other]: [],
  };

  auths.forEach((auth) => {
    const domain = getAuthorizationDomain(auth.code);
    if (domain === 'admin') groups[labels.administration].push(auth);
    else if (domain === 'metrologie') groups[labels.metrology].push(auth);
    else if (domain === 'surveillance') groups[labels.monitoring].push(auth);
    else if (domain === 'vigilog') groups[labels.vigilog].push(auth);
    else groups[labels.other].push(auth);
  });

  Object.values(groups).forEach((items) =>
    items.sort((a, b) => (a.label || a.code || '').localeCompare(b.label || b.code || ''))
  );

  return Object.entries(groups).filter(([_, items]) => items.length > 0);
}

export function ProfileDialog({
  open,
  mode,
  initialValues,
  authorizations,
  users,
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
    assignedUserIds: z.array(z.number()),
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

  const toggleAuthorizationSection = (authIds: number[], checked: boolean) => {
    const current = new Set(form.getValues('authorizations') || []);
    if (checked) {
      authIds.forEach((authId) => current.add(authId));
    } else {
      authIds.forEach((authId) => current.delete(authId));
    }
    form.setValue('authorizations', Array.from(current), { shouldDirty: true });
  };

  const selectedAuthorizations = useWatch({ control: form.control, name: 'authorizations' }) || [];
  const assignedUserIds = useWatch({ control: form.control, name: 'assignedUserIds' }) || [];
  const profileName = useWatch({ control: form.control, name: 'name' });
  const allAuthorizationIds = authorizations.map((auth) => auth.id);
  const allAuthorizationsSelected =
    allAuthorizationIds.length > 0 &&
    allAuthorizationIds.every((authId) => selectedAuthorizations.includes(authId));
  const memoryKey = `profile-form:${mode}:${initialValues.name || 'new'}`;
  const domainLabels = {
    administration: t('domains.administration'),
    metrology: t('domains.metrology'),
    monitoring: t('domains.monitoring'),
    vigilog: t('domains.vigilog'),
    other: t('domains.other'),
  } as const;
  const allAssignableUserIds = users.map((user) => user.id);
  const allUsersSelected =
    allAssignableUserIds.length > 0 &&
    allAssignableUserIds.every((userId) => assignedUserIds.includes(userId));

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onCancel();
      }}
    >
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto bg-background">
        <DialogHeader>
          <DialogTitle>{isEdit ? t('title_edit') : t('title_create')}</DialogTitle>
          <DialogDescription>
            {isEdit ? t('description_edit') : t('description_create')}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit, (errors) => showFormValidationToast(errors))} className="space-y-4">
            <TemporaryMemoryControls
              form={form}
              storageKey={memoryKey}
              resetValues={initialValues}
              labels={{
                save: tCommon('temporary_memory.save'),
                restore: tCommon('temporary_memory.restore'),
                clear: tCommon('temporary_memory.clear'),
                saved: tCommon('temporary_memory.saved'),
              }}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fields.name_label')}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="bg-white dark:bg-background"
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
                      className="bg-white dark:bg-background"
                      placeholder={isEdit ? undefined : t('fields.description_placeholder')}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Tabs defaultValue="authorizations" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2 bg-primary/10 text-primary">
                <TabsTrigger value="authorizations" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  {t('tabs.authorizations')}
                </TabsTrigger>
                <TabsTrigger value="users" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  {t('tabs.users')}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="authorizations" className="space-y-4">
                <div>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <Label className="block">{t('authorizations_title')}</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        form.setValue(
                          'authorizations',
                          allAuthorizationsSelected ? [] : allAuthorizationIds,
                          { shouldDirty: true },
                        )
                      }
                    >
                      {allAuthorizationsSelected ? t('actions.uncheck_all') : t('actions.check_all')}
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {groupAuthorizationsByModule(authorizations, domainLabels).map(([module, auths]) => {
                      const sectionIds = auths.map((auth) => auth.id);
                      const selectedCount = sectionIds.filter((id) => selectedAuthorizations.includes(id)).length;
                      const allSelected = sectionIds.length > 0 && selectedCount === sectionIds.length;
                      const partiallySelected = selectedCount > 0 && selectedCount < sectionIds.length;

                      return (
                      <Card key={module}>
                        <CardHeader className="flex flex-row items-start justify-between gap-4 pb-3">
                          <CardTitle className="text-sm font-medium">{module}</CardTitle>
                          <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                            <Checkbox
                              checked={allSelected ? true : partiallySelected ? 'indeterminate' : false}
                              onCheckedChange={(checked) => toggleAuthorizationSection(sectionIds, checked === true)}
                            />
                            <span>{allSelected ? t('actions.uncheck_all') : t('actions.check_all')}</span>
                          </label>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {auths.map((auth) => (
                            <div key={auth.id} className="group flex items-start space-x-2">
                              <Checkbox
                                id={`${mode}-auth-${auth.id}`}
                                checked={selectedAuthorizations.includes(auth.id)}
                                onCheckedChange={() => toggleAuthorization(auth.id)}
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-1.5">
                                  <label htmlFor={`${mode}-auth-${auth.id}`} className="cursor-pointer text-sm font-medium">
                                    {auth.label || auth.code}
                                  </label>
                                  {(() => {
                                    const Icon = getAuthorizationIcon(auth.code);
                                    return (
                                      <span
                                        className="inline-flex opacity-0 transition-opacity group-hover:opacity-100"
                                        title={auth.description || auth.code || ''}
                                        aria-label={auth.description || auth.code || ''}
                                      >
                                        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                                      </span>
                                    );
                                  })()}
                                </div>
                                {auth.description && (
                                  <p className="text-xs text-muted-foreground">{auth.description}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                      );
                    })}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="users" className="space-y-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <Label className="block">{t('users_title')}</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      form.setValue(
                        'assignedUserIds',
                        allUsersSelected ? [] : allAssignableUserIds,
                        { shouldDirty: true },
                      )
                    }
                    disabled={users.length === 0}
                  >
                    {allUsersSelected ? t('actions.uncheck_all') : t('actions.check_all')}
                  </Button>
                </div>
                <Card>
                  <CardContent className="max-h-80 space-y-2 overflow-y-auto pt-6">
                    {users.length === 0 ? (
                      <p className="text-sm text-muted-foreground">{t('users_empty')}</p>
                    ) : (
                      users.map((user) => {
                        const checked = assignedUserIds.includes(user.id)
                        const currentProfile = user.profile && user.profile !== profileName ? user.profile : null
                        return (
                          <div key={user.id} className="flex items-start gap-3 rounded-md border border-border/60 px-3 py-2">
                            <Checkbox
                              id={`${mode}-user-${user.id}`}
                              checked={checked}
                              onCheckedChange={(nextChecked) => {
                                const current = new Set(form.getValues('assignedUserIds') || [])
                                if (nextChecked === true) current.add(user.id)
                                else current.delete(user.id)
                                form.setValue('assignedUserIds', Array.from(current), { shouldDirty: true })
                              }}
                            />
                            <div className="min-w-0 flex-1">
                              <label htmlFor={`${mode}-user-${user.id}`} className="cursor-pointer text-sm font-medium">
                                {user.displayName}
                              </label>
                              <p className="text-xs text-muted-foreground">{user.username}</p>
                              {currentProfile ? (
                                <p className="text-xs text-amber-600 dark:text-amber-400">
                                  {t('users_current_profile', { profile: currentProfile })}
                                </p>
                              ) : null}
                            </div>
                          </div>
                        )
                      })
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

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
