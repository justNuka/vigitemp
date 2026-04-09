'use client';

import { useQuery } from '@tanstack/react-query';
import type { UseFormReturn } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { showFormValidationToast } from '@/lib/form-toast';
import { getJson } from '@/lib/http';
import type { CreateSiteInput } from './site-schemas';
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

type CreateSiteDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<CreateSiteInput>;
  isSubmitting: boolean;
  onSubmit: (data: CreateSiteInput) => void;
};

export function CreateSiteDialog({
  open,
  onOpenChange,
  form,
  isSubmitting,
  onSubmit,
}: CreateSiteDialogProps) {
  const t = useTranslations('sitesDialog');
  const tCommon = useTranslations('common');
  const memoryKey = 'create-site-form:new';
  const { data: users = [] } = useQuery({
    queryKey: ['users', 'sites-dialog'],
    queryFn: () => getJson<AssignableUser[]>('/api/utilisateurs'),
    enabled: open,
  });
  const assignedUserIds = form.watch('assignedUserIds') || [];
  const allUserIds = users.map((user) => user.id);
  const allUsersSelected = allUserIds.length > 0 && allUserIds.every((userId) => assignedUserIds.includes(userId));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl bg-white dark:bg-popover dark:text-popover-foreground">
        <DialogHeader>
          <DialogTitle>{t('create_title')}</DialogTitle>
          <DialogDescription>{t('create_description')}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit, (errors) => showFormValidationToast(errors))} className="space-y-4">
            <TemporaryMemoryControls
              form={form}
              storageKey={memoryKey}
              resetValues={{ Libelle_Site: '', Commentaire: '', assignedUserIds: [] }}
              labels={{
                save: tCommon('temporary_memory.save'),
                restore: tCommon('temporary_memory.restore'),
                clear: tCommon('temporary_memory.clear'),
                saved: tCommon('temporary_memory.saved'),
              }}
            />

            <Tabs defaultValue="general" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2 bg-primary/10 text-primary">
                <TabsTrigger value="general" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  {t('tabs.general')}
                </TabsTrigger>
                <TabsTrigger value="users" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
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
                <Card>
                  <CardContent className="max-h-80 space-y-2 overflow-y-auto pt-6">
                    {users.length === 0 ? (
                      <p className="text-sm text-muted-foreground">{t('users.empty')}</p>
                    ) : (
                      users.map((user) => {
                        const checked = assignedUserIds.includes(user.id);
                        return (
                          <div key={user.id} className="flex items-start gap-3 rounded-md border border-border/60 px-3 py-2">
                            <Checkbox
                              id={`site-create-user-${user.id}`}
                              checked={checked}
                              onCheckedChange={(nextChecked) => {
                                const current = new Set(form.getValues('assignedUserIds') || []);
                                if (nextChecked === true) current.add(user.id);
                                else current.delete(user.id);
                                form.setValue('assignedUserIds', Array.from(current), { shouldDirty: true });
                              }}
                            />
                            <div className="min-w-0 flex-1">
                              <label htmlFor={`site-create-user-${user.id}`} className="cursor-pointer text-sm font-medium">
                                {user.displayName}
                              </label>
                              <p className="text-xs text-muted-foreground">{user.username}</p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="gap-2">
                <X className="h-4 w-4" />
                {tCommon('cancel')}
              </Button>
              <Button type="submit" disabled={isSubmitting} className="gap-2">
                <Check className="h-4 w-4" />
                {isSubmitting ? t('submit_creating') : t('submit_create')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
