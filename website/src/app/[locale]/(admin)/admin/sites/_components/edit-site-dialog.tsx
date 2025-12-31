'use client';

import type { SiteAdmin } from '@/hooks/useSites';
import type { UseFormReturn } from 'react-hook-form';
import type { EditSiteInput } from './site-schemas';
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
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Modifier le site</DialogTitle>
          <DialogDescription>Modifiez les informations du site</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Code site</Label>
              <Input value={site?.Code_Site || ''} disabled className="bg-muted" />
            </div>
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
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Modification...' : 'Modifier'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

