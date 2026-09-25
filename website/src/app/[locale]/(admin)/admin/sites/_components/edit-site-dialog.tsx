'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { SiteAdmin } from '@/hooks/useSites';
import type { UseFormReturn } from 'react-hook-form';
import type { EditSiteInput } from './site-schemas';
import { useTranslations } from 'next-intl';
import { showFormValidationToast } from '@/lib/form-toast';
import { getJson } from '@/lib/http';
import { Button } from '@/components/ui/button';
import { TemporaryMemoryControls } from '@/components/form/temporary-memory-controls';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Check, X } from 'lucide-react';

type AssignableUser = {
  id: number;
  username: string;
  displayName: string;
  role: string | null;
};

type AssignedUser = {
  Id_Utilisateur: number;
};

const EMPTY_USERS: AssignableUser[] = [];
const EMPTY_ASSIGNED_USERS: AssignedUser[] = [];

type EditSiteDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  site: SiteAdmin | null;
  form: UseFormReturn<EditSiteInput>;
  isSubmitting: boolean;
  onSubmit: (data: EditSiteInput) => void;
};

export function EditSiteDialog({
  open,
  onOpenChange,
  site,
  form,
  isSubmitting,
  onSubmit,
}: EditSiteDialogProps) {
  const t = useTranslations('sitesDialog');
  const tCommon = useTranslations('common');
  const memoryKey = `edit-site-form:${site?.Id_Site ?? 'unknown'}`;
  const usersQuery = useQuery({
    queryKey: ['users', 'sites-dialog'],
    queryFn: () => getJson<AssignableUser[]>('/api/utilisateurs'),
    enabled: open,
  });
  const users = usersQuery.data ?? EMPTY_USERS;
  const assignedUsersQuery = useQuery({
    queryKey: ['siteUsers', site?.Id_Site, 'dialog'],
    queryFn: () => getJson<AssignedUser[]>(`/api/sites/${site?.Id_Site}/utilisateurs`),
    enabled: open && Boolean(site?.Id_Site),
  });
  const assignedUsers = assignedUsersQuery.data ?? EMPTY_ASSIGNED_USERS;
  const assignedUserIds = form.watch('assignedUserIds') || [];
  const allUserIds = users.map((user) => user.id);
  const allUsersSelected = allUserIds.length > 0 && allUserIds.every((userId) => assignedUserIds.includes(userId));

  useEffect(() => {
    if (!open) return;
    const nextAssignedUserIds = assignedUsers.map((user) => user.Id_Utilisateur);
    const currentAssignedUserIds = form.getValues('assignedUserIds') || [];
    const isSameLength = currentAssignedUserIds.length === nextAssignedUserIds.length;
    const isSame =
      isSameLength &&
      currentAssignedUserIds.every((id, index) => id === nextAssignedUserIds[index]);

    if (!isSame) {
      form.setValue('assignedUserIds', nextAssignedUserIds, { shouldDirty: false });
    }
  }, [assignedUsers, assignedUsersQuery.data, form, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-hidden rounded-[10px] border-border bg-card p-0 text-card-foreground sm:max-w-2xl">
        <DialogHeader className="border-b border-border px-5 py-4 pr-14">
          <DialogTitle className="text-[15px] font-semibold">{t('edit_title')}</DialogTitle>
          <DialogDescription className="mt-0.5 text-xs">{t('edit_description')}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit, (errors) => showFormValidationToast(errors))} className="scroll-thin max-h-[calc(90vh-70px)] space-y-4 overflow-y-auto px-5 py-4">
            <TemporaryMemoryControls
              form={form}
              storageKey={memoryKey}
              resetValues={form.getValues()}
              labels={{
                save: tCommon('temporary_memory.save'),
                restore: tCommon('temporary_memory.restore'),
                clear: tCommon('temporary_memory.clear'),
                saved: tCommon('temporary_memory.saved'),
              }}
            />
            <Tabs defaultValue="general" className="space-y-4">
              <TabsList className="grid h-8 w-auto grid-cols-2 gap-0.5 rounded-md border border-border bg-[hsl(var(--surface-muted))] p-0.5 text-muted-foreground">
                <TabsTrigger value="general" className="h-7 rounded-[5px] px-2.5 text-[13px] font-medium transition-colors duration-150 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/60 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=active]:ring-1 data-[state=active]:ring-border">
                  {t('tabs.general')}
                </TabsTrigger>
                <TabsTrigger value="users" className="h-7 rounded-[5px] px-2.5 text-[13px] font-medium transition-colors duration-150 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/60 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=active]:ring-1 data-[state=active]:ring-border">
                  {t('tabs.users')}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-4">
                <FormField
                  control={form.control}
                  name="Libelle_Site"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('fields.label_label')}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder={t('fields.label_placeholder')} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="Commentaire"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('fields.comment_label')}</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          value={field.value || ''}
                          placeholder={t('fields.comment_placeholder')}
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="users" className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <Label>{t('users.title')}</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => form.setValue('assignedUserIds', allUsersSelected ? [] : allUserIds, { shouldDirty: true })}
                    disabled={users.length === 0}
                  >
                    {allUsersSelected ? t('actions.uncheck_all') : t('actions.check_all')}
                  </Button>
                </div>
                <Card className="overflow-hidden rounded-lg border-border bg-[hsl(var(--surface-muted)/0.45)] shadow-none">
                  <CardContent className="scroll-thin max-h-72 space-y-1.5 overflow-y-auto p-2">
                    {users.length === 0 ? (
                      <p className="text-sm text-muted-foreground">{t('users.empty')}</p>
                    ) : (
                      users.map((user) => {
                        const checked = assignedUserIds.includes(user.id);
                        const initiallyAssigned = assignedUsers.some((assignedUser) => assignedUser.Id_Utilisateur === user.id);
                        return (
                          <div key={user.id} className="flex items-start gap-3 rounded-md border border-transparent px-2.5 py-2 transition-colors duration-150 hover:border-border hover:bg-card">
                            <Checkbox
                              id={`site-edit-user-${user.id}`}
                              checked={checked}
                              onCheckedChange={(nextChecked) => {
                                const current = new Set(form.getValues('assignedUserIds') || []);
                                if (nextChecked === true) current.add(user.id);
                                else current.delete(user.id);
                                form.setValue('assignedUserIds', Array.from(current), { shouldDirty: true });
                              }}
                            />
                            <div className="min-w-0 flex-1">
                              <label htmlFor={`site-edit-user-${user.id}`} className="cursor-pointer text-sm font-medium">
                                {user.displayName}
                              </label>
                              <p className="text-xs text-muted-foreground">{user.username}</p>
                              {initiallyAssigned ? <p className="text-xs text-primary">{t('users.assigned')}</p> : null}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            <DialogFooter className="-mx-5 -mb-4 border-t border-border bg-[hsl(var(--surface-muted)/0.45)] px-5 py-3">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="gap-2">
                <X className="h-4 w-4" />
                {tCommon('cancel')}
              </Button>
              <Button type="submit" disabled={isSubmitting} className="gap-2">
                <Check className="h-4 w-4" />
                {isSubmitting ? t('submit_updating') : tCommon('edit')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
