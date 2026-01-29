'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useRouter } from '@/i18n/navigation'
import { useAuthorizations, useProfiles, type Profile } from '@/hooks/useProfiles'
import { DeleteProfileDialog } from './_components/delete-profile-dialog'
import { ProfileDialog, type ProfileFormData } from './_components/profile-dialog'
import { ProfilesTable } from './_components/profiles-table'
import { deleteJson, getJson, patchJson, postJson } from '@/lib/http'

export function ProfilesClient() {
  const queryClient = useQueryClient()
  const router = useRouter()
  const t = useTranslations('profilesPage')
  const tCommon = useTranslations('common')
  const didPrefetchRef = useRef(false)
  const { data: profiles = [], isLoading: profilesLoading } = useProfiles()

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null)
  const shouldLoadAuthorizations = isCreateOpen || isEditOpen
  const { data: authorizations = [], isLoading: authorizationsLoading } = useAuthorizations(shouldLoadAuthorizations)

  const defaultProfileValues: ProfileFormData = useMemo(
    () => ({
      name: '',
      description: '',
      mc2: false,
      authorizations: [],
    }),
    [],
  )

  useEffect(() => {
    if (profilesLoading || didPrefetchRef.current) return
    didPrefetchRef.current = true

    queryClient.prefetchQuery({
      queryKey: ['authorizations'],
      queryFn: () => getJson('/api/autorisations'),
    })
  }, [profilesLoading, queryClient])

  const createMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => postJson('/api/profils', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] })
      router.refresh()
      toast.success(t('toast.create_success'))
      setIsCreateOpen(false)
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : t('toast.create_error'))
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ProfileFormData }) => patchJson(`/api/profils/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] })
      router.refresh()
      toast.success(t('toast.update_success'))
      setIsEditOpen(false)
      setSelectedProfile(null)
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : t('toast.update_error'))
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => deleteJson(`/api/profils/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] })
      router.refresh()
      toast.success(t('toast.delete_success'))
      setIsDeleteOpen(false)
      setSelectedProfile(null)
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : t('toast.delete_error'))
    },
  })

  const openCreateDialog = () => {
    setSelectedProfile(null)
    setIsCreateOpen(true)
  }

  const openEditDialog = (profile: Profile) => {
    setSelectedProfile(profile)
    setIsEditOpen(true)
  }

  const openDeleteDialog = (profile: Profile) => {
    setSelectedProfile(profile)
    setIsDeleteOpen(true)
  }

  const handleCreate = (data: ProfileFormData) => createMutation.mutate(data)
  const handleUpdate = (data: ProfileFormData) => {
    if (!selectedProfile) return
    updateMutation.mutate({ id: selectedProfile.id, data })
  }
  const handleDelete = () => {
    if (!selectedProfile) return
    deleteMutation.mutate(selectedProfile.id)
  }

  if (profilesLoading || authorizationsLoading) {
    return <div className="p-6">{tCommon('loading')}</div>
  }

  return (
    <main className="flex-1 p-4 md:p-6 space-y-6">
      <ProfilesTable
        profiles={profiles}
        isLoading={profilesLoading}
        selectedProfileId={selectedProfile?.id}
        onSelectProfile={setSelectedProfile}
        onEdit={openEditDialog}
        onDelete={openDeleteDialog}
        onCreate={openCreateDialog}
      />

      <ProfileDialog
        open={isCreateOpen}
        mode="create"
        initialValues={defaultProfileValues}
        authorizations={authorizations}
        isSubmitting={createMutation.isPending}
        onCancel={() => setIsCreateOpen(false)}
        onSubmit={handleCreate}
      />

      <ProfileDialog
        open={isEditOpen}
        mode="edit"
        initialValues={{
          name: selectedProfile?.name || '',
          description: selectedProfile?.description || '',
          mc2: selectedProfile?.mc2 || false,
          authorizations: selectedProfile?.authorizations.map((a) => a.id) || [],
        }}
        authorizations={authorizations}
        isSubmitting={updateMutation.isPending}
        onCancel={() => setIsEditOpen(false)}
        onSubmit={handleUpdate}
      />

      <DeleteProfileDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        profile={selectedProfile}
        isDeleting={deleteMutation.isPending}
        onDelete={handleDelete}
      />
    </main>
  )
}
