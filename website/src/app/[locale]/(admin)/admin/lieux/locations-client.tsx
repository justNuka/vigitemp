'use client'

import { useEffect, useRef, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useAvailableSensors } from '@/hooks/useAvailableSensors'
import { useGroups } from '@/hooks/useGroups'
import { useLocations, type LocationRow } from '@/hooks/useLocations'
import { useSitesSimple } from '@/hooks/useSites'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { useRouter } from '@/i18n/navigation'
import { LocationFormDialog } from './_components/location-form-dialog'
import { LocationsTable } from './_components/locations-table'
import { getJson, patchJson, postJson } from '@/lib/http'
import { LocationsActions } from './_components/locations-actions'
import type { LocationFormData } from './_components/location-form-types'
import { getDefaultLocationFormData } from './_components/location-form-defaults'
import { mapLocationToFormData } from './_components/location-form-mappers'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function LocationsClient() {
  const queryClient = useQueryClient()
  const router = useRouter()
  const { data: locations = [], isLoading } = useLocations()
  const didPrefetchRef = useRef(false)
  const [selectedLocation, setSelectedLocation] = useState<LocationRow | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isArchiveOpen, setIsArchiveOpen] = useState(false)
  const [isCreateNoSondeOpen, setIsCreateNoSondeOpen] = useState(false)
  const [pendingCreate, setPendingCreate] = useState<LocationFormData | null>(null)
  const [tabFilter, setTabFilter] = useState<'all' | 'unassigned'>('all')
  const shouldLoadFormData = isCreateOpen || isEditOpen

  const form = useForm<LocationFormData>({
    defaultValues: getDefaultLocationFormData(),
  })
  const watchedSensor = form.watch('Sonde_Numero_Serie')
  const { data: sites = [] } = useSitesSimple(shouldLoadFormData)
  const { data: groups = [] } = useGroups(undefined, shouldLoadFormData)
  const { data: availableSensors = [] } = useAvailableSensors(watchedSensor, shouldLoadFormData)

  useEffect(() => {
    if (isLoading || didPrefetchRef.current) return
    didPrefetchRef.current = true

    queryClient.prefetchQuery({
      queryKey: ['sites-simple'],
      queryFn: () => getJson('/api/sites'),
    })
    queryClient.prefetchQuery({
      queryKey: ['groups', undefined],
      queryFn: () => getJson('/api/groupes'),
    })
    queryClient.prefetchQuery({
      queryKey: ['available-sensors', null],
      queryFn: async () => {
        const data = await getJson<any[]>('/api/sondes')
        return data.filter((sensor: any) => !sensor?.Lieu)
      },
    })
  }, [isLoading, queryClient])

  const resetForm = () => form.reset(getDefaultLocationFormData())
  const normalizePayload = (data: LocationFormData, forceInactive = false): Partial<LocationRow> => ({
    ...data,
    Sonde_Numero_Serie: data.Sonde_Numero_Serie ? data.Sonde_Numero_Serie : null,
    ...(forceInactive ? { Lieu_Etat: 'D' } : {}),
  })

  const createMutation = useMutation({
    mutationFn: async (data: Partial<LocationRow>) => postJson('/api/lieux', data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['locations'] })
      router.refresh()
      toast.success('Lieu créé avec succès')
      if (!variables?.Sonde_Numero_Serie) {
        toast.message("Lieu créé sans sonde. Pensez à l'affecter plus tard.")
      }
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

  const archiveMutation = useMutation({
    mutationFn: async () => {
      if (!selectedLocation?.Id_Lieu) throw new Error('Aucun lieu selectionne')
      return patchJson(`/api/lieux/${selectedLocation.Id_Lieu}`, { Est_Archive: true })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] })
      router.refresh()
      toast.success('Lieu archive avec succes')
      setIsArchiveOpen(false)
      setSelectedLocation(null)
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Erreur lors de l'archivage du lieu")
    },
  })

  const handleEdit = () => {
    if (!selectedLocation) return

    form.reset(mapLocationToFormData(selectedLocation))
    setIsEditOpen(true)
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
            onArchive={() => setIsArchiveOpen(true)}
          />
        </CardHeader>
        <CardContent>
          <Tabs value={tabFilter} onValueChange={(val) => setTabFilter(val as 'all' | 'unassigned')} className='mb-3'>
            <TabsList className="grid w-full grid-cols-2 bg-primary/10 text-primary md:w-auto">
              <TabsTrigger
                value="all"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Tous ({locations.length})
              </TabsTrigger>
              <TabsTrigger
                value="unassigned"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Sans sonde ({locations.filter((l) => !l.Sonde_Numero_Serie).length})
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <LocationsTable
            locations={
              tabFilter === 'unassigned'
                ? locations.filter((location) => !location.Sonde_Numero_Serie)
                : locations
            }
            isLoading={isLoading}
            selectedLocationId={selectedLocation?.Id_Lieu}
            onSelectLocation={(location) => setSelectedLocation(location)}
            onEditLocation={(location) => {
              setSelectedLocation(location)
              form.reset(mapLocationToFormData(location))
              setIsEditOpen(true)
            }}
          />
        </CardContent>
      </Card>

      <LocationFormDialog
        open={isCreateOpen}
        mode="create"
        form={form}
        sites={sites}
        groups={groups}
        availableSensors={availableSensors}
        isSubmitting={createMutation.isPending}
        onCancel={() => setIsCreateOpen(false)}
        onSubmit={(values) => {
          if (!values.Sonde_Numero_Serie) {
            setPendingCreate(values)
            setIsCreateNoSondeOpen(true)
            return
          }
          createMutation.mutate(normalizePayload(values, true))
        }}
      />

      <LocationFormDialog
        open={isEditOpen}
        mode="edit"
        form={form}
        sites={sites}
        groups={groups}
        availableSensors={availableSensors}
        isSubmitting={updateMutation.isPending}
        onCancel={() => setIsEditOpen(false)}
        onSubmit={(values) => updateMutation.mutate(normalizePayload(values))}
      />

      <AlertDialog open={isArchiveOpen} onOpenChange={setIsArchiveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archiver le lieu</AlertDialogTitle>
            <AlertDialogDescription>
              Ce lieu passera en surveillance desactivee et la sonde sera desaffectee. Voulez-vous continuer ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end gap-2">
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => archiveMutation.mutate()} disabled={archiveMutation.isPending}>
              {archiveMutation.isPending ? 'Archivage...' : 'Archiver'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isCreateNoSondeOpen} onOpenChange={setIsCreateNoSondeOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Créer un lieu sans sonde ?</AlertDialogTitle>
            <AlertDialogDescription>
              Ce lieu sera créé sans sonde associée. Vous pourrez l’affecter plus tard dans la gestion des lieux.
              Voulez-vous continuer ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end gap-2">
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!pendingCreate) return
                createMutation.mutate(normalizePayload(pendingCreate, true))
                setPendingCreate(null)
                setIsCreateNoSondeOpen(false)
              }}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? 'Creation...' : 'Continuer'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  )
}



