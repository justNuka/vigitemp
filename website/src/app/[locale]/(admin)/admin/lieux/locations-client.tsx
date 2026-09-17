'use client'

import { useEffect, useRef, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, useWatch } from 'react-hook-form'
import { LazyMotion, domAnimation, m } from "motion/react";
import { fadeInUp } from "@/lib/motion-variants";

import { useAvailableSensors } from '@/hooks/useAvailableSensors'
import { useGroups } from '@/hooks/useGroups'
import { useModules } from '@/hooks/useModules'
import { useLocations, type LocationRow } from '@/hooks/useLocations'
import { useSitesSimple } from '@/hooks/useSites'
import { useUsersForMailing } from '@/hooks/useUsersForMailing'
import { useLocationTemplates } from '@/hooks/useLocationTemplates'
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
import { LocationConfigSourceDialog } from './_components/location-config-source-dialog'
import { LocationsTable } from './_components/locations-table'
import { getJson, patchJson, postJson } from '@/lib/http'
import { LocationsActions } from './_components/locations-actions'
import type { LocationFormData } from './_components/location-form-types'
import { getDefaultLocationFormData } from './_components/location-form-defaults'
import { mapLocationToFormData } from './_components/location-form-mappers'
import { buildLocationConfigCopy } from './_components/location-config-copy'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTranslations } from 'next-intl'
import { MapPin } from 'lucide-react'

export function LocationsClient() {
  const t = useTranslations('locationsPage')
  const tCommon = useTranslations('common')
  const queryClient = useQueryClient()
  const router = useRouter()
  const { data: locations = [], isLoading } = useLocations()
  const didPrefetchRef = useRef(false)
  const [selectedLocation, setSelectedLocation] = useState<LocationRow | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isArchiveOpen, setIsArchiveOpen] = useState(false)
  const [isCopySourceOpen, setIsCopySourceOpen] = useState(false)
  const [isCreateNoSondeOpen, setIsCreateNoSondeOpen] = useState(false)
  const [pendingCreate, setPendingCreate] = useState<{
    values: LocationFormData
    submitMode: 'stay' | 'close'
  } | null>(null)
  const [statusTab, setStatusTab] = useState<'active' | 'archived'>('active')
  const [tabFilter, setTabFilter] = useState<'all' | 'unassigned'>('all')
  const shouldLoadFormData = isCreateOpen || isEditOpen
  const activeLocations = locations.filter((location) => !location.Est_Archive)
  const archivedLocations = locations.filter((location) => Boolean(location.Est_Archive))
  const statusFilteredLocations = statusTab === 'active' ? activeLocations : archivedLocations
  const displayedLocations = tabFilter === 'unassigned'
    ? statusFilteredLocations.filter((location) => !location.Sonde_Numero_Serie)
    : statusFilteredLocations
  const selectedDisplayedLocation = selectedLocation
    ? displayedLocations.find((location) => location.Id_Lieu === selectedLocation.Id_Lieu) ?? null
    : null

  const form = useForm<LocationFormData>({
    defaultValues: getDefaultLocationFormData(),
  })
  const watchedSensor = useWatch({ control: form.control, name: 'Sonde_Numero_Serie' })
  const { data: sites = [] } = useSitesSimple(shouldLoadFormData)
  const { data: groups = [] } = useGroups(undefined, shouldLoadFormData)
  const { data: availableSensors = [] } = useAvailableSensors(watchedSensor, shouldLoadFormData)
  const { data: modules = [] } = useModules(shouldLoadFormData)
  const { data: mailingUsers = [] } = useUsersForMailing(shouldLoadFormData)
  const { data: locationTemplates = [] } = useLocationTemplates(shouldLoadFormData)

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
    Lieu_Etat: forceInactive || !data.Sonde_Numero_Serie ? 'D' : data.Lieu_Etat ?? null,
  })

  const createMutation = useMutation({
    mutationFn: async (data: Partial<LocationRow>) => postJson<LocationRow>('/api/lieux', data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['locations'] })
      queryClient.invalidateQueries({ queryKey: ['available-sensors'] })
      router.refresh()
      toast.success(t('toast.create_success'))
      if (!variables?.Sonde_Numero_Serie) {
        toast.message(t('toast.create_no_sensor'))
      }
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : t('toast.create_error'))
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ data }: { data: Partial<LocationRow>; submitMode: 'stay' | 'close' }) => {
      if (!selectedLocation?.Id_Lieu) throw new Error(t('errors.no_location_selected'))
      return patchJson(`/api/lieux/${selectedLocation.Id_Lieu}`, data)
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['locations'] })
      queryClient.invalidateQueries({ queryKey: ['available-sensors'] })
      router.refresh()
      toast.success(t('toast.update_success'))
      if (selectedLocation?.Id_Lieu) {
        window.dispatchEvent(
          new CustomEvent('vigitemp:lieu-updated', {
            detail: { idLieu: selectedLocation.Id_Lieu },
          }),
        )
      }
      if (variables.submitMode === 'close') {
        setIsEditOpen(false)
        setSelectedLocation(null)
      }
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : t('toast.update_error'))
    },
  })

  const archiveMutation = useMutation({
    mutationFn: async () => {
      if (!selectedDisplayedLocation?.Id_Lieu) throw new Error(t('errors.no_location_selected'))
      return patchJson(`/api/lieux/${selectedDisplayedLocation.Id_Lieu}`, { Est_Archive: true })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] })
      queryClient.invalidateQueries({ queryKey: ['available-sensors'] })
      router.refresh()
      toast.success(t('toast.archive_success'))
      setIsArchiveOpen(false)
      setSelectedLocation(null)
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : t('toast.archive_error'))
    },
  })

  const handleEdit = () => {
    if (!selectedDisplayedLocation) return

    form.reset(mapLocationToFormData(selectedDisplayedLocation))
    setIsEditOpen(true)
  }

  const applyExistingLocationConfig = (source: LocationRow, preserveCurrentName = false) => {
    const currentName = preserveCurrentName ? (form.getValues('Nom_Lieu') ?? '') : ''
    form.reset(buildLocationConfigCopy(source, { name: currentName }))
    toast.success(t('copy.applied', { name: source.Nom_Lieu || t('copy.unnamed') }))
  }

  const handleDuplicate = () => {
    if (!selectedDisplayedLocation) return
    setPendingCreate(null)
    setIsCreateNoSondeOpen(false)
    applyExistingLocationConfig(selectedDisplayedLocation)
    setIsCreateOpen(true)
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
        <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-border/50 bg-white/90 dark:bg-card/90">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="h-4 w-4 text-primary" />
              {t('title')}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {t('count', { count: displayedLocations.length })}
            </p>
          </div>
          <LocationsActions
            canEdit={!!selectedDisplayedLocation && statusTab === 'active'}
            canDuplicate={!!selectedDisplayedLocation && statusTab === 'active'}
            onCreate={() => {
              resetForm()
              setPendingCreate(null)
              setIsCreateNoSondeOpen(false)
              setIsCreateOpen(true)
            }}
            onDuplicate={handleDuplicate}
            onEdit={handleEdit}
            onArchive={() => setIsArchiveOpen(true)}
          />
        </CardHeader>
        <CardContent>
          <Tabs
            value={statusTab}
            onValueChange={(val) => {
              setStatusTab(val as 'active' | 'archived')
              setSelectedLocation(null)
              setTabFilter('all')
            }}
            className='mb-3 space-y-3'
          >
            <TabsList className="grid w-full max-w-md grid-cols-2 bg-primary/10 text-primary">
              <TabsTrigger value="active" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                {t('tabs.active', { count: activeLocations.length })}
              </TabsTrigger>
              <TabsTrigger value="archived" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                {t('tabs.archived', { count: archivedLocations.length })}
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Tabs value={tabFilter} onValueChange={(val) => setTabFilter(val as 'all' | 'unassigned')} className='mb-3'>
            <TabsList className="grid w-full grid-cols-2 bg-primary/10 text-primary md:w-auto">
              <TabsTrigger
                value="all"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {t('tabs.all', { count: statusFilteredLocations.length })}
              </TabsTrigger>
              <TabsTrigger
                value="unassigned"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {t('tabs.unassigned', { count: statusFilteredLocations.filter((l) => !l.Sonde_Numero_Serie).length })}
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <LocationsTable
            locations={displayedLocations}
            isLoading={isLoading}
            selectedLocationId={selectedDisplayedLocation?.Id_Lieu}
            onSelectLocation={(location) => setSelectedLocation(location)}
            onEditLocation={(location) => {
              if (statusTab === 'archived') return
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
        modules={modules}
        mailingUsers={mailingUsers}
        locationTemplates={locationTemplates}
        isSubmitting={createMutation.isPending}
        onRequestCopyFromExisting={() => setIsCopySourceOpen(true)}
        onCancel={() => {
          setIsCopySourceOpen(false)
          setIsCreateOpen(false)
        }}
        onSubmit={async (values, submitMode = 'stay') => {
          if (!values.Sonde_Numero_Serie) {
            setPendingCreate({ values, submitMode })
            setIsCreateNoSondeOpen(true)
            return { saved: false }
          }

          const created = await createMutation.mutateAsync(normalizePayload(values))
          const committedValues: LocationFormData = {
            ...values,
            Id_Lieu: created.Id_Lieu,
            Commentaire_Action: null,
          }

          if (submitMode === 'stay') {
            form.reset(committedValues)
            setSelectedLocation(created)
            setIsCreateOpen(false)
            setIsEditOpen(true)
          }

          return { saved: true, values: committedValues }
        }}
      />

      <LocationConfigSourceDialog
        open={isCopySourceOpen}
        onOpenChange={setIsCopySourceOpen}
        locations={activeLocations}
        onSelect={(source) => {
          applyExistingLocationConfig(source, true)
          setIsCopySourceOpen(false)
        }}
      />

      <LocationFormDialog
        open={isEditOpen}
        mode="edit"
        form={form}
        sites={sites}
        groups={groups}
        availableSensors={availableSensors}
        modules={modules}
        mailingUsers={mailingUsers}
        locationTemplates={locationTemplates}
        isSubmitting={updateMutation.isPending}
        onCancel={() => setIsEditOpen(false)}
        onSubmit={async (values, submitMode = 'stay') => {
          await updateMutation.mutateAsync({ data: normalizePayload(values), submitMode })
          return { saved: true }
        }}
      />

      <AlertDialog open={isArchiveOpen} onOpenChange={setIsArchiveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('dialogs.archive.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('dialogs.archive.description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end gap-2">
            <AlertDialogCancel>{tCommon('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={() => archiveMutation.mutate()} disabled={archiveMutation.isPending}>
              {archiveMutation.isPending ? t('dialogs.archive.submitting') : t('dialogs.archive.confirm')}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isCreateNoSondeOpen} onOpenChange={setIsCreateNoSondeOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('dialogs.create_no_sensor.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('dialogs.create_no_sensor.description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end gap-2">
            <AlertDialogCancel>{tCommon('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!pendingCreate) return
                try {
                  const created = await createMutation.mutateAsync(
                    normalizePayload(pendingCreate.values, true),
                  )
                  const committedValues: LocationFormData = {
                    ...pendingCreate.values,
                    Id_Lieu: created.Id_Lieu,
                    Lieu_Etat: 'D',
                    Commentaire_Action: null,
                  }

                  if (pendingCreate.submitMode === 'stay') {
                    form.reset(committedValues)
                    setSelectedLocation(created)
                    setIsCreateOpen(false)
                    setIsEditOpen(true)
                  } else {
                    setIsCreateOpen(false)
                    resetForm()
                  }

                  setPendingCreate(null)
                  setIsCreateNoSondeOpen(false)
                } catch {
                  // createMutation.onError shows the error and preserves the main form.
                }
              }}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? t('dialogs.create_no_sensor.submitting') : t('dialogs.create_no_sensor.confirm')}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
      </m.main>
    </LazyMotion>
  )
}


