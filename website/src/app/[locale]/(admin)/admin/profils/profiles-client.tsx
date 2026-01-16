'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from '@/i18n/navigation'
import { useAuthorizations, useProfiles, type Profile } from '@/hooks/useProfiles'
import { DeleteProfileDialog } from './_components/delete-profile-dialog'
import { ProfileDialog, type ProfileFormData } from './_components/profile-dialog'
import { ProfilesTable } from './_components/profiles-table'
import { deleteJson, patchJson, postJson } from '@/lib/http'

export function ProfilesClient() {
  const queryClient = useQueryClient()
  const router = useRouter()
  const { data: profiles = [], isLoading: profilesLoading } = useProfiles()
  const { data: authorizations = [], isLoading: authorizationsLoading } = useAuthorizations()

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null)

  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    description: '',
    mc2: false,
    authorizations: [],
  })

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      mc2: false,
      authorizations: [],
    })
  }

  const createMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => postJson('/api/profils', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] })
      router.refresh()
      toast.success('Profil créé avec succès')
      setIsCreateOpen(false)
      resetForm()
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la création')
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ProfileFormData }) => patchJson(`/api/profils/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] })
      router.refresh()
      toast.success('Profil mis à jour avec succès')
      setIsEditOpen(false)
      resetForm()
      setSelectedProfile(null)
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la mise à jour')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => deleteJson(`/api/profils/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] })
      router.refresh()
      toast.success('Profil supprimé avec succès')
      setIsDeleteOpen(false)
      setSelectedProfile(null)
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la suppression')
    },
  })

  const openCreateDialog = () => {
    resetForm()
    setSelectedProfile(null)
    setIsCreateOpen(true)
  }

  const openEditDialog = (profile: Profile) => {
    setSelectedProfile(profile)
    setFormData({
      name: profile.name,
      description: profile.description || '',
      mc2: profile.mc2 || false,
      authorizations: profile.authorizations.map((a) => a.id),
    })
    setIsEditOpen(true)
  }

  const openDeleteDialog = (profile: Profile) => {
    setSelectedProfile(profile)
    setIsDeleteOpen(true)
  }

  const handleCreate = () => createMutation.mutate(formData)
  const handleUpdate = () => {
    if (!selectedProfile) return
    updateMutation.mutate({ id: selectedProfile.id, data: formData })
  }
  const handleDelete = () => {
    if (!selectedProfile) return
    deleteMutation.mutate(selectedProfile.id)
  }

  if (profilesLoading || authorizationsLoading) {
    return <div className="p-6">Chargement...</div>
  }

  return (
    <main className="flex-1 p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Gestion des profils</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {profiles.length} profil{profiles.length > 1 ? 's' : ''}
          </p>
        </div>

        <Button className="gap-2" onClick={openCreateDialog}>
          <Plus className="h-4 w-4" />
          Nouveau profil
        </Button>
      </div>

      <ProfilesTable
        profiles={profiles}
        isLoading={profilesLoading}
        selectedProfileId={selectedProfile?.id}
        onSelectProfile={setSelectedProfile}
        onEdit={openEditDialog}
        onDelete={openDeleteDialog}
      />

      <ProfileDialog
        open={isCreateOpen}
        mode="create"
        formData={formData}
        setFormData={setFormData}
        authorizations={authorizations}
        isSubmitting={createMutation.isPending}
        onCancel={() => setIsCreateOpen(false)}
        onSubmit={handleCreate}
      />

      <ProfileDialog
        open={isEditOpen}
        mode="edit"
        formData={formData}
        setFormData={setFormData}
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
