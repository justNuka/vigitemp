'use client'

import { LazyMotion, domAnimation, m } from 'motion/react'
import { fadeInUp } from '@/lib/motion-variants'
import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { useRouter } from '@/i18n/navigation'
import { Archive, Pencil, Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'

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
  const t = useTranslations('sitesPage')
  const tDialog = useTranslations('sitesDialog')
  const tCommon = useTranslations('common')
  const { data: sites = [], isLoading } = useSites()

  const [selectedSite, setSelectedSite] = useState<SiteAdmin | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isArchiveAlertOpen, setIsArchiveAlertOpen] = useState(false)
  const [archiveBlockedOpen, setArchiveBlockedOpen] = useState(false)
  const [archiveBlockedMessage, setArchiveBlockedMessage] = useState<string | null>(null)

  const createForm = useForm<CreateSiteInput>({
    resolver: zodResolver(createSiteSchema(tDialog)),
    defaultValues: {
      Code_Site: '',
      Libelle_Site: '',
      Commentaire: null,
    },
  })

  const editForm = useForm<EditSiteInput>({
    resolver: zodResolver(editSiteSchema(tDialog)),
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
      toast.success(t('toast.create_success'))
      setIsCreateOpen(false)
      createForm.reset()
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : t('toast.create_error'))
    },
  })

  const updateMutation = useMutation({
    mutationFn: async (data: EditSiteInput) => {
      if (!selectedSite?.Id_Site) throw new Error(t('errors.no_site_selected'))
      return patchJson(`/api/sites/${selectedSite.Id_Site}`, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites'] })
      router.refresh()
      toast.success(t('toast.update_success'))
      setIsEditOpen(false)
      setSelectedSite(null)
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : t('toast.update_error'))
    },
  })

  const archiveMutation = useMutation({
    mutationFn: async () => {
      if (!selectedSite?.Id_Site) throw new Error(t('errors.no_site_selected'))
      return patchJson(`/api/sites/${selectedSite.Id_Site}`, { Est_Archive: true })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites'] })
      router.refresh()
      toast.success(t('toast.archive_success'))
      setSelectedSite(null)
      setIsArchiveAlertOpen(false)
    },
    onError: (error) => {
      if (error instanceof HttpError && error.status === 409) {
        const linked = (error.payload as any)?.linkedLieuxCount
        const detail =
          typeof linked === 'number' && linked > 0
            ? t('archive_blocked_detail', { count: linked })
            : ''
        setArchiveBlockedMessage(`${error.message}${detail ? ` ${detail}` : ''}`)
        setArchiveBlockedOpen(true)
        return
      }
      toast.error(error instanceof Error ? error.message : t('toast.archive_error'))
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
    <LazyMotion features={domAnimation}>
    <m.main
      className="flex-1 p-4 md:p-6 space-y-6"
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>{t('title')}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {t('count', { count: sites.length })}
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setIsCreateOpen(true)} variant="default" size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              {tCommon('add')}
            </Button>
            <Button onClick={handleEdit} variant="outline" size="sm" disabled={!selectedSite} className="gap-2">
              <Pencil className="h-4 w-4" />
              {tCommon('edit')}
            </Button>
            <Button
              onClick={() => setIsArchiveAlertOpen(true)}
              variant="outline"
              size="sm"
              disabled={!selectedSite}
              className="gap-2"
            >
              <Archive className="h-4 w-4" />
              {t('actions.archive')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <SitesTable
            sites={sites}
            isLoading={isLoading}
            selectedSiteId={selectedSite?.Id_Site}
            onSelectSite={setSelectedSite}
            onEditSite={(site) => {
              setSelectedSite(site)
              editForm.reset({
                Libelle_Site: site.Libelle_Site || '',
                Commentaire: site.Commentaire,
              })
              setIsEditOpen(true)
            }}
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
            <AlertDialogTitle>{t('archive_blocked_title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {archiveBlockedMessage || t('archive_blocked_fallback')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogAction onClick={() => setArchiveBlockedOpen(false)}>
            {tCommon('confirm')}
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </m.main>
    </LazyMotion>
  )}

