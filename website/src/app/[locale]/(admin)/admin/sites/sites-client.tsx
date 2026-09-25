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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useSites, type SiteAdmin } from '@/hooks/useSites'
import { deleteJson, getJson, HttpError, patchJson, postJson } from '@/lib/http'

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
  const [statusTab, setStatusTab] = useState<'active' | 'archived'>('active')

  const activeSites = sites.filter((site) => !site.Est_Archive)
  const archivedSites = sites.filter((site) => Boolean(site.Est_Archive))
  const displayedSites = statusTab === 'active' ? activeSites : archivedSites

  const createForm = useForm<CreateSiteInput>({
    resolver: zodResolver(createSiteSchema(tDialog)),
    defaultValues: {
      Libelle_Site: '',
      Commentaire: null,
      assignedUserIds: [],
    },
  })

  const editForm = useForm<EditSiteInput>({
    resolver: zodResolver(editSiteSchema(tDialog)),
    defaultValues: {
      Libelle_Site: '',
      Commentaire: null,
      assignedUserIds: [],
    },
  })

  const createMutation = useMutation({
    mutationFn: async (data: CreateSiteInput) => {
      const created = await postJson<{ Id_Site: number }>('/api/sites', data)
      const siteId = created.Id_Site
      if (siteId && data.assignedUserIds.length > 0) {
        await Promise.all(data.assignedUserIds.map((userId) => postJson(`/api/utilisateurs/${userId}/sites`, { siteId })))
      }
      return created
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites'] })
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['siteUsers'] })
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
      await patchJson(`/api/sites/${selectedSite.Id_Site}`, data)
      const currentAssigned = await getJson<Array<{ Id_Utilisateur: number }>>(`/api/sites/${selectedSite.Id_Site}/utilisateurs`)
      const currentIds = currentAssigned.map((user) => user.Id_Utilisateur)
      const nextIds = data.assignedUserIds
      const currentSet = new Set(currentIds)
      const nextSet = new Set(nextIds)
      const toAdd = nextIds.filter((userId) => !currentSet.has(userId))
      const toRemove = currentIds.filter((userId) => !nextSet.has(userId))
      await Promise.all([
        ...toAdd.map((userId) => postJson(`/api/utilisateurs/${userId}/sites`, { siteId: selectedSite.Id_Site })),
        ...toRemove.map((userId) => deleteJson(`/api/utilisateurs/${userId}/sites/${selectedSite.Id_Site}`)),
      ])
      return { ok: true }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites'] })
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['siteUsers'] })
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
      assignedUserIds: [],
    })
    setIsEditOpen(true)
  }

  return (
    <LazyMotion features={domAnimation}>
      <m.main
        className="flex-1 space-y-4"
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
      >
        <section className="overflow-hidden rounded-[10px] border border-border bg-card shadow-[0_1px_2px_hsl(var(--shadow)/0.06)]">
          <SitesTable
            sites={displayedSites}
            isLoading={isLoading}
            selectedSiteId={selectedSite?.Id_Site}
            onSelectSite={(site) => setSelectedSite((current) => current?.Id_Site === site.Id_Site ? null : site)}
            onEditSite={(site) => {
              if (statusTab === 'archived') return
              setSelectedSite(site)
              editForm.reset({
                Libelle_Site: site.Libelle_Site || '',
                Commentaire: site.Commentaire,
                assignedUserIds: [],
              })
              setIsEditOpen(true)
            }}
            toolbarLeft={
              <Tabs
                value={statusTab}
                onValueChange={(value) => {
                  setStatusTab(value as 'active' | 'archived')
                  setSelectedSite(null)
                }}
              >
                <TabsList className="grid h-8 w-auto grid-cols-2 gap-0.5 rounded-md border border-border bg-[hsl(var(--surface-muted))] p-0.5 text-muted-foreground">
                  <TabsTrigger
                    value="active"
                    className="h-7 rounded-[5px] px-2.5 text-[13px] font-medium transition-colors duration-150 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/60 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=active]:ring-1 data-[state=active]:ring-border"
                  >
                    {t('tabs.active', { count: activeSites.length })}
                  </TabsTrigger>
                  <TabsTrigger
                    value="archived"
                    className="h-7 rounded-[5px] px-2.5 text-[13px] font-medium transition-colors duration-150 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/60 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=active]:ring-1 data-[state=active]:ring-border"
                  >
                    {t('tabs.archived', { count: archivedSites.length })}
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            }
            toolbarRight={
              <>
                <Button onClick={() => setIsCreateOpen(true)} size="sm" className="h-8 gap-1.5 text-xs">
                  <Plus className="h-4 w-4" />
                  {tCommon('add')}
                </Button>
                <Button onClick={handleEdit} variant="outline" size="sm" disabled={!selectedSite} className="h-8 gap-1.5 text-xs">
                  <Pencil className="h-4 w-4" />
                  {tCommon('edit')}
                </Button>
                <Button
                  onClick={() => setIsArchiveAlertOpen(true)}
                  variant="outline"
                  size="sm"
                  disabled={!selectedSite || statusTab === 'archived'}
                  className="h-8 gap-1.5 text-xs hover:text-[hsl(var(--status-critical))]"
                >
                  <Archive className="h-4 w-4" />
                  {t('actions.archive')}
                </Button>
              </>
            }
          />
        </section>

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

