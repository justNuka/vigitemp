'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
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
  const [statusTab, setStatusTab] = useState<'active' | 'archived'>('active')

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null)
  const activeProfiles = profiles.filter((profile) => !profile.estArchive)
  const archivedProfiles = profiles.filter((profile) => Boolean(profile.estArchive))
  const displayedProfiles = statusTab === 'active' ? activeProfiles : archivedProfiles
  const selectedDisplayedProfile = selectedProfile
    ? displayedProfiles.find((profile) => profile.id === selectedProfile.id) ?? null
    : null
  const shouldLoadDialogData = isCreateOpen || isEditOpen
  const { data: authorizations = [], isLoading: authorizationsLoading } = useAuthorizations(shouldLoadDialogData)
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['users', 'profiles-dialog'],
    queryFn: () => getJson<Array<{ id: number; username: string; displayName: string; role: string | null }>>('/api/utilisateurs'),
    enabled: shouldLoadDialogData,
  })

  const defaultProfileValues: ProfileFormData = useMemo(
    () => ({
      name: '',
      description: '',
      mc2: false,
      authorizations: [],
      assignedUserIds: [],
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
      toast.success(t('toast.archive_success'))
      setIsDeleteOpen(false)
      setSelectedProfile(null)
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : t('toast.archive_error'))
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
    if (!selectedDisplayedProfile) return
    updateMutation.mutate({ id: selectedDisplayedProfile.id, data })
  }
  const handleDelete = () => {
    if (!selectedDisplayedProfile) return
    deleteMutation.mutate(selectedDisplayedProfile.id)
  }

  if (profilesLoading || authorizationsLoading || usersLoading) {
    return <div className="p-6">{tCommon('loading')}</div>
  }

  return (
    <main className="flex-1 p-4 md:p-6 space-y-6">
      <ProfilesTable
        profiles={displayedProfiles}
        isLoading={profilesLoading}
        selectedProfileId={selectedDisplayedProfile?.id}
        onSelectProfile={setSelectedProfile}
        onEdit={openEditDialog}
        onDelete={openDeleteDialog}
        onCreate={openCreateDialog}
        statusTab={statusTab}
        activeCount={activeProfiles.length}
        archivedCount={archivedProfiles.length}
        onStatusTabChange={(value) => {
          setStatusTab(value)
          setSelectedProfile(null)
        }}
      />

      <ProfileDialog
        open={isCreateOpen}
        mode="create"
        initialValues={defaultProfileValues}
        authorizations={authorizations}
        users={users.map((user) => ({
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          profile: user.role,
        }))}
        isSubmitting={createMutation.isPending}
        onCancel={() => setIsCreateOpen(false)}
        onSubmit={handleCreate}
      />

      <ProfileDialog
        open={isEditOpen}
        mode="edit"
        initialValues={{
          name: selectedDisplayedProfile?.name || '',
          description: selectedDisplayedProfile?.description || '',
          mc2: selectedDisplayedProfile?.mc2 || false,
          authorizations: selectedDisplayedProfile?.authorizations.map((a) => a.id) || [],
          assignedUserIds: users
            .filter((user) => user.role === (selectedDisplayedProfile?.name || ''))
            .map((user) => user.id),
        }}
        authorizations={authorizations}
        users={users.map((user) => ({
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          profile: user.role,
        }))}
        isSubmitting={updateMutation.isPending}
        onCancel={() => setIsEditOpen(false)}
        onSubmit={handleUpdate}
      />

      <DeleteProfileDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        profile={selectedDisplayedProfile}
        isDeleting={deleteMutation.isPending}
        onDelete={handleDelete}
      />
    </main>
  )
}
