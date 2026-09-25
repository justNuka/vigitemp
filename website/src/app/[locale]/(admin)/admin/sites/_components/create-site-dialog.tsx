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
import { AdminUserAssignList } from '@/components/admin-user-assign-list';
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

const EMPTY_USERS: AssignableUser[] = [];

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
  const usersQuery = useQuery({
    queryKey: ['users', 'sites-dialog'],
    queryFn: () => getJson<AssignableUser[]>('/api/utilisateurs'),
    enabled: open,
  });
  const users = usersQuery.data ?? EMPTY_USERS;
  const assignedUserIds = form.watch('assignedUserIds') || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-hidden rounded-[10px] border-border bg-card p-0 text-card-foreground sm:max-w-2xl">
        <DialogHeader className="border-b border-border px-5 py-4 pr-14">
          <DialogTitle className="text-[15px] font-semibold">{t('create_title')}</DialogTitle>
          <DialogDescription className="mt-0.5 text-xs">{t('create_description')}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit, (errors) => showFormValidationToast(errors))} className="scroll-thin max-h-[calc(90vh-70px)] space-y-4 overflow-y-auto px-5 py-4">
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

              <TabsContent value="users">
                <AdminUserAssignList
                  idPrefix="site-create"
                  users={users}
                  selectedIds={assignedUserIds}
                  onChange={(ids) => form.setValue('assignedUserIds', ids, { shouldDirty: true })}
                  loading={usersQuery.isLoading}
                  title={t('users.title')}
                  emptyLabel={t('users.empty')}
                  checkAllLabel={t('actions.check_all')}
                  uncheckAllLabel={t('actions.uncheck_all')}
                  searchPlaceholder={tCommon('search')}
                />
              </TabsContent>
            </Tabs>
            <DialogFooter className="-mx-5 -mb-4 border-t border-border bg-[hsl(var(--surface-muted)/0.45)] px-5 py-3">
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
