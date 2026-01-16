'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAvailableProbes } from '@/hooks/useAvailableProbes'
import { useGroups } from '@/hooks/useGroups'
import { useLocations, type LocationRow } from '@/hooks/useLocations'
import { useSitesSimple } from '@/hooks/useSites'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { useRouter } from '@/i18n/navigation'
import { LocationFormDialog } from './_components/location-form-dialog'
import { LocationsTable } from './_components/locations-table'
import { patchJson, postJson } from '@/lib/http'
import { LocationsActions } from './_components/locations-actions'
import type { LocationFormData } from './_components/location-form-types'
import { getDefaultLocationFormData } from './_components/location-form-defaults'
import { mapLocationToFormData } from './_components/location-form-mappers'

export function LocationsClient() {
  const queryClient = useQueryClient()
  const router = useRouter()
  const { data: locations = [], isLoading } = useLocations()
  const { data: sites = [] } = useSitesSimple()
  const { data: groups = [] } = useGroups()
  const { data: availableProbes = [] } = useAvailableProbes()

  const [selectedLocation, setSelectedLocation] = useState<LocationRow | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)

  const defaultFormData: LocationFormData = getDefaultLocationFormData()

  const [formData, setFormData] = useState<LocationFormData>(defaultFormData)

  const resetForm = () => setFormData(getDefaultLocationFormData())

  const createMutation = useMutation({
    mutationFn: async (data: Partial<LocationRow>) => postJson('/api/lieux', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] })
      router.refresh()
      toast.success('Lieu créé avec succès')
      setIsCreateOpen(false)
      resetForm()
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la création du lieu')
    },
  })

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<LocationRow>) => {
      if (!selectedLocation?.Id_Lieu) throw new Error('Aucun lieu sélectionné')
      return patchJson(`/api/lieux/${selectedLocation.Id_Lieu}`, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] })
      router.refresh()
      toast.success('Lieu modifié avec succès')
      if (selectedLocation?.Id_Lieu) {
        window.dispatchEvent(
          new CustomEvent('vigitemp:lieu-updated', {
            detail: { idLieu: selectedLocation.Id_Lieu },
          }),
        )
      }
      setIsEditOpen(false)
      setSelectedLocation(null)
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la modification du lieu')
    },
  })

  const handleEdit = () => {
    if (!selectedLocation) return

    setFormData(mapLocationToFormData(selectedLocation))
    setIsEditOpen(true)
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <main className="flex-1 p-4 md:p-6 space-y-6 animate-fade-in">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Gestion des lieux</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {locations.length} lieu{locations.length > 1 ? 'x' : ''}
            </p>
          </div>
          <LocationsActions
            canEdit={!!selectedLocation}
            onCreate={() => {
              resetForm()
              setIsCreateOpen(true)
            }}
            onEdit={handleEdit}
            onPrint={handlePrint}
          />
        </CardHeader>
        <CardContent>
          <LocationsTable
            locations={locations}
            isLoading={isLoading}
            selectedLocationId={selectedLocation?.Id_Lieu}
            onSelectLocation={(location) => setSelectedLocation(location)}
          />
        </CardContent>
      </Card>

      <LocationFormDialog
        open={isCreateOpen}
        mode="create"
        formData={formData}
        setFormData={setFormData}
        sites={sites}
        groups={groups}
        availableProbes={availableProbes}
        isSubmitting={createMutation.isPending}
        onCancel={() => setIsCreateOpen(false)}
        onSubmit={() => createMutation.mutate(formData)}
      />

      <LocationFormDialog
        open={isEditOpen}
        mode="edit"
        formData={formData}
        setFormData={setFormData}
        sites={sites}
        groups={groups}
        availableProbes={availableProbes}
        isSubmitting={updateMutation.isPending}
        onCancel={() => setIsEditOpen(false)}
        onSubmit={() => updateMutation.mutate(formData)}
      />
    </main>
  )
}

