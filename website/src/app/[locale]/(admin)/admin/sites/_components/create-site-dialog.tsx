'use client';

import type { UseFormReturn } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { showFormValidationToast } from '@/lib/form-toast';
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Check, X } from 'lucide-react';

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-card">
        <DialogHeader>
          <DialogTitle>{t('create_title')}</DialogTitle>
          <DialogDescription>{t('create_description')}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit, (errors) => showFormValidationToast(errors))} className="space-y-4">
            <TemporaryMemoryControls
              form={form}
              storageKey={memoryKey}
              resetValues={{ Code_Site: '', Libelle_Site: '', Commentaire: '' }}
              labels={{
                save: tCommon('temporary_memory.save'),
                restore: tCommon('temporary_memory.restore'),
                clear: tCommon('temporary_memory.clear'),
                saved: tCommon('temporary_memory.saved'),
              }}
            />
            <FormField
              control={form.control}
              name="Code_Site"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fields.code_label')}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={t('fields.code_placeholder')} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                {isSubmitting ? t('submit_creating') : t('submit_create')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

