'use client';

import type { UseFormReturn } from 'react-hook-form';
import type { CreateSiteInput } from './site-schemas';
import { Button } from '@/components/ui/button';
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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-card">
        <DialogHeader>
          <DialogTitle>Créer un nouveau site</DialogTitle>
          <DialogDescription>Remplissez les informations du site</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="Code_Site"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Code site</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: SITE01" />
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
                  <FormLabel>Libellé site</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: Site principal" />
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
                  <FormLabel>Commentaires</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value || ''}
                      placeholder="Ajouter des commentaires..."
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
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting} className="gap-2">
                <Check className="h-4 w-4" />
                {isSubmitting ? 'Création...' : 'Créer'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

