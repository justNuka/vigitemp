'use client';

import type { SiteAdmin } from '@/hooks/useSites';
import type { UseFormReturn } from 'react-hook-form';
import type { EditSiteInput } from './site-schemas';
import { useTranslations } from 'next-intl';
import { showFormValidationToast } from '@/lib/form-toast';
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
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Check, X } from 'lucide-react';

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-popover dark:text-popover-foreground">
        <DialogHeader>
          <DialogTitle>{t('edit_title')}</DialogTitle>
          <DialogDescription>{t('edit_description')}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit, (errors) => showFormValidationToast(errors))} className="space-y-4">
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
            <div className="space-y-2">
              <Label>{t('fields.code_label')}</Label>
              <Input value={site?.Code_Site || ''} disabled className="bg-muted" />
            </div>
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
            <DialogFooter>
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

