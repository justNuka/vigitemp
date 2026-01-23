'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { useRouter } from '@/i18n/navigation'
import { Archive, Pencil, Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useSites, type SiteAdmin } from '@/hooks/useSites'
import { HttpError, patchJson, postJson } from '@/lib/http'

import { SitesTable } from './_components/sites-table'
import { CreateSiteDialog } from './_components/create-site-dialog'
import { EditSiteDialog } from './_components/edit-site-dialog'
import { ArchiveSiteDialog } from './_components/archive-site-dialog'
import {
  createSiteSchema,
  editSiteSchema,
  type CreateSiteInput,
  type EditSiteInput,
} from './_components/site-schemas'

export function SitesClient() {
  const queryClient = useQueryClient()
  const router = useRouter()
  const { data: sites = [], isLoading } = useSites()

  const [selectedSite, setSelectedSite] = useState<SiteAdmin | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isArchiveAlertOpen, setIsArchiveAlertOpen] = useState(false)
  const [archiveBlockedOpen, setArchiveBlockedOpen] = useState(false)
  const [archiveBlockedMessage, setArchiveBlockedMessage] = useState<string | null>(null)

  const createForm = useForm<CreateSiteInput>({
    resolver: zodResolver(createSiteSchema),
    defaultValues: {
      Code_Site: '',
      Libelle_Site: '',
      Commentaire: null,
    },
  })

  const editForm = useForm<EditSiteInput>({
    resolver: zodResolver(editSiteSchema),
    defaultValues: {
      Libelle_Site: '',
      Commentaire: null,
    },
  })

  const createMutation = useMutation({
    mutationFn: async (data: CreateSiteInput) => postJson('/api/sites', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites'] })
      router.refresh()
      toast.success('Site créé avec succès')
      setIsCreateOpen(false)
      createForm.reset()
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la création du site')
    },
  })

  const updateMutation = useMutation({
    mutationFn: async (data: EditSiteInput) => {
      if (!selectedSite?.Id_Site) throw new Error('Aucun site sélectionné')
      return patchJson(`/api/sites/${selectedSite.Id_Site}`, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites'] })
      router.refresh()
      toast.success('Site modifié avec succès')
      setIsEditOpen(false)
      setSelectedSite(null)
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la modification du site')
    },
  })

  const archiveMutation = useMutation({
    mutationFn: async () => {
      if (!selectedSite?.Id_Site) throw new Error('Aucun site sélectionné')
      return patchJson(`/api/sites/${selectedSite.Id_Site}`, { Est_Archive: true })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites'] })
      router.refresh()
      toast.success('Site archivé avec succès')
      setSelectedSite(null)
      setIsArchiveAlertOpen(false)
    },
    onError: (error) => {
      if (error instanceof HttpError && error.status === 409) {
        const linked = (error.payload as any)?.linkedLieuxCount
        const detail =
          typeof linked === 'number' && linked > 0
            ? `Ce site est lié à ${linked} lieu${linked > 1 ? 'x' : ''}.`
            : ''
        setArchiveBlockedMessage(`${error.message}${detail ? ` ${detail}` : ''}`)
        setArchiveBlockedOpen(true)
        return
      }
      toast.error(error instanceof Error ? error.message : "Erreur lors de l'archivage du site")
    },
  })

  const handleEdit = () => {
    if (!selectedSite) return
    editForm.reset({
      Libelle_Site: selectedSite.Libelle_Site || '',
      Commentaire: selectedSite.Commentaire,
    })
    setIsEditOpen(true)
  }

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
            <Button onClick={() => setIsCreateOpen(true)} variant="default" size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Nouveau
            </Button>
            <Button onClick={handleEdit} variant="outline" size="sm" disabled={!selectedSite} className="gap-2">
              <Pencil className="h-4 w-4" />
              Modifier
            </Button>
            <Button
              onClick={() => setIsArchiveAlertOpen(true)}
              variant="outline"
              size="sm"
              disabled={!selectedSite}
              className="gap-2"
            >
              <Archive className="h-4 w-4" />
              Archiver
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <SitesTable
            sites={sites}
            isLoading={isLoading}
            selectedSiteId={selectedSite?.Id_Site}
            onSelectSite={setSelectedSite}
          />
        </CardContent>
      </Card>

      <CreateSiteDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        form={createForm}
        isSubmitting={createMutation.isPending}
        onSubmit={(data) => createMutation.mutate(data)}
      />

      <EditSiteDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        site={selectedSite}
        form={editForm}
        isSubmitting={updateMutation.isPending}
        onSubmit={(data) => updateMutation.mutate(data)}
      />

      <ArchiveSiteDialog
        open={isArchiveAlertOpen}
        onOpenChange={setIsArchiveAlertOpen}
        site={selectedSite}
        isArchiving={archiveMutation.isPending}
        onConfirm={() => archiveMutation.mutate()}
      />

      <AlertDialog open={archiveBlockedOpen} onOpenChange={setArchiveBlockedOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archivage impossible</AlertDialogTitle>
            <AlertDialogDescription>
              {archiveBlockedMessage || "Ce site est encore lié à d'autres éléments."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogAction onClick={() => setArchiveBlockedOpen(false)}>
            OK
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  )}
