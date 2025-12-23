'use client';

import { useState } from 'react';
import { useSites, type SiteAdmin } from '@/hooks/useSites';
import { TanStackTable } from '@/components/data-table/tanstack-table';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQueryClient, useMutation } from '@tanstack/react-query';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Printer } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { toast } from 'sonner';

interface SiteRow {
  Id_Site: number;
  Code_Site: string | null;
  Libelle_Site: string | null;
  Commentaire: string | null;
  Est_Archive: boolean | null;
}

const createSiteSchema = z.object({
  Code_Site: z.string().min(1, 'Code site requis').max(20),
  Libelle_Site: z.string().min(1, 'Libellé site requis').max(50),
  Commentaire: z.string().max(200).nullable(),
});

const editSiteSchema = z.object({
  Libelle_Site: z.string().min(1, 'Libellé site requis').max(50),
  Commentaire: z.string().max(200).nullable(),
});

type CreateSiteInput = z.infer<typeof createSiteSchema>;
type EditSiteInput = z.infer<typeof editSiteSchema>;

export function SitesClient() {
  const queryClient = useQueryClient();
  const { data: sites = [], isLoading } = useSites();
  const [selectedSite, setSelectedSite] = useState<SiteRow | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isArchiveAlertOpen, setIsArchiveAlertOpen] = useState(false);

  const createForm = useForm<CreateSiteInput>({
    resolver: zodResolver(createSiteSchema),
    defaultValues: {
      Code_Site: '',
      Libelle_Site: '',
      Commentaire: null,
    },
  });

  const editForm = useForm<EditSiteInput>({
    resolver: zodResolver(editSiteSchema),
    defaultValues: {
      Libelle_Site: '',
      Commentaire: null,
    },
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (data: CreateSiteInput) => {
      const res = await fetch('/api/sites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Erreur création site');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      toast.success('Site créé avec succès');
      setIsCreateOpen(false);
      createForm.reset();
    },
    onError: () => {
      toast.error('Erreur lors de la création du site');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: EditSiteInput) => {
      const res = await fetch(`/api/sites/${selectedSite?.Id_Site}?id=${selectedSite?.Id_Site}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Erreur modification site');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      toast.success('Site modifié avec succès');
      setIsEditOpen(false);
      setSelectedSite(null);
    },
    onError: () => {
      toast.error('Erreur lors de la modification du site');
    },
  });

  const archiveMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/sites/${selectedSite?.Id_Site}?id=${selectedSite?.Id_Site}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Est_Archive: true }),
      });
      if (!res.ok) throw new Error('Erreur archivage site');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      toast.success('Site archivé avec succès');
      setSelectedSite(null);
      setIsArchiveAlertOpen(false);
    },
    onError: () => {
      toast.error('Erreur lors de l\'archivage du site');
    },
  });

  const handleEdit = () => {
    if (!selectedSite) return;
    editForm.reset({
      Libelle_Site: selectedSite.Libelle_Site || '',
      Commentaire: selectedSite.Commentaire,
    });
    setIsEditOpen(true);
  };

  const handlePrint = () => {
    if (!selectedSite) return;
    const printContent = `
Site: ${selectedSite.Code_Site} - ${selectedSite.Libelle_Site}
Description: ${selectedSite.Commentaire || 'N/A'}
    `.trim();
    const printWindow = window.open('', '', 'height=400,width=600');
    if (printWindow) {
      printWindow.document.write('<pre>' + printContent + '</pre>');
      printWindow.document.close();
      printWindow.print();
    }
  };

  const columns: ColumnDef<SiteRow>[] = [
    {
      accessorKey: 'Code_Site',
      header: 'Site',
      cell: ({ row }) => row.getValue('Code_Site') || '-',
    },
    {
      accessorKey: 'Libelle_Site',
      header: 'Description',
      cell: ({ row }) => row.getValue('Libelle_Site') || '-',
    },
    {
      accessorKey: 'Commentaire',
      header: 'Commentaires',
      cell: ({ row }) => {
        const comment = row.getValue('Commentaire') as string | null;
        return comment ? (
          <p className="max-w-xs truncate" title={comment}>
            {comment}
          </p>
        ) : (
          '-'
        );
      },
    },
  ];

  return (
    <main className="flex-1 p-4 md:p-6 space-y-6 animate-fade-in">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Gestion des sites</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {sites.length} site{sites.length > 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setIsCreateOpen(true)} variant="default">
              Nouveau
            </Button>
            <Button
              onClick={handleEdit}
              variant="outline"
              disabled={!selectedSite}
            >
              Modifier
            </Button>
            <Button
              onClick={() => setIsArchiveAlertOpen(true)}
              variant="outline"
              disabled={!selectedSite}
            >
              Archiver
            </Button>
            <Button
              onClick={handlePrint}
              variant="ghost"
              size="icon"
              disabled={!selectedSite}
              title="Imprimer le site sélectionné"
            >
              <Printer className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Table */}
          <TanStackTable<SiteRow>
            columns={columns}
            data={sites}
            searchPlaceholder="Rechercher les sites..."
            pageSize={20}
            isLoading={isLoading}
            emptyMessage="Aucun site trouvé"
            onRowClick={(row) => setSelectedSite(row)}
            selectedRowId={selectedSite?.Id_Site}
          />
        </CardContent>
      </Card>

      {/* Dialog Création */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Créer un nouveau site</DialogTitle>
            <DialogDescription>
              Remplissez les informations du site
            </DialogDescription>
          </DialogHeader>
          <Form {...createForm}>
            <form
              onSubmit={createForm.handleSubmit((data) => createMutation.mutate(data))}
              className="space-y-4"
            >
              <FormField
                control={createForm.control}
                name="Code_Site"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Code Site</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ex: SITE01" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="Libelle_Site"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Libellé Site</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ex: Site Principal" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
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
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Création...' : 'Créer'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog Modification */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier le site</DialogTitle>
            <DialogDescription>
              Modifiez les informations du site
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit((data) => updateMutation.mutate(data))}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label>Code Site</Label>
                <Input
                  value={selectedSite?.Code_Site || ''}
                  disabled
                  className="bg-muted"
                />
              </div>
              <FormField
                control={editForm.control}
                name="Libelle_Site"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Libellé Site</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ex: Site Principal" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
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
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditOpen(false)}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? 'Modification...' : 'Modifier'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Alert Dialog Archivage */}
      <AlertDialog open={isArchiveAlertOpen} onOpenChange={setIsArchiveAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archiver le site</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir archiver le site <strong>{selectedSite?.Code_Site}</strong> ? Cette action ne peut être annulée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => archiveMutation.mutate()}
              disabled={archiveMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {archiveMutation.isPending ? 'Archivage...' : 'Archiver'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
