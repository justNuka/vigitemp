import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { patchJson } from '@/lib/http'
import { getDefaultLocationFormData } from '@/app/[locale]/(admin)/admin/lieux/_components/location-form-defaults'
import { mapLocationToFormData } from '@/app/[locale]/(admin)/admin/lieux/_components/location-form-mappers'
import type { LocationFormData } from '@/app/[locale]/(admin)/admin/lieux/_components/location-form-types'

export function useSurveillanceLocationEditor({
  locations,
  form,
  queryClient,
  t,
}: {
  locations: Array<{ Id_Lieu: number }>
  form: { reset: (values: LocationFormData) => void }
  queryClient: { invalidateQueries: (args: { queryKey: unknown[] }) => Promise<unknown> }
  t: (key: string) => string
}) {
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null)
  const [isEditLocationOpen, setIsEditLocationOpen] = useState(false)
  const [isLocationSaving, setIsLocationSaving] = useState(false)

  const askOptionalComment = useCallback(() => {
    if (typeof window === "undefined") return ""
    const response = window.prompt(t("action_comment.location_prompt"), "")
    if (response === null) return null
    return response.trim()
  }, [t])

  const handleOpenLocationEdit = useCallback((idLieu: number) => {
    const location = locations.find((item) => item.Id_Lieu === idLieu)
    if (!location) {
      toast.error(t('toast.location_not_found'))
      return
    }
    setSelectedLocationId(idLieu)
    form.reset(mapLocationToFormData(location as any))
    setIsEditLocationOpen(true)
  }, [form, locations, t])

  const handleEditLocationSubmit = useCallback(async (values: LocationFormData) => {
    if (!selectedLocationId) return
    const actionComment = askOptionalComment()
    if (actionComment === null) return

    setIsLocationSaving(true)
    try {
      await patchJson(`/api/lieux/${selectedLocationId}`, {
        ...values,
        Sonde_Numero_Serie: values.Sonde_Numero_Serie ? values.Sonde_Numero_Serie : null,
        Commentaire_Action: actionComment || null,
      })
      await queryClient.invalidateQueries({ queryKey: ['locations'] })
      await queryClient.invalidateQueries({ queryKey: ['capteurs', 'paginated', 100] })
      toast.success(t('toast.location_updated'))
      window.dispatchEvent(new CustomEvent('vigitemp:lieu-updated', { detail: { idLieu: selectedLocationId } }))
      setIsEditLocationOpen(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('toast.location_update_error'))
    } finally {
      setIsLocationSaving(false)
    }
  }, [askOptionalComment, queryClient, selectedLocationId, t])

  const closeEditor = useCallback(() => {
    setSelectedLocationId(null)
    setIsEditLocationOpen(false)
    form.reset(getDefaultLocationFormData())
  }, [form])

  return {
    selectedLocationId,
    isEditLocationOpen,
    isLocationSaving,
    handleOpenLocationEdit,
    handleEditLocationSubmit,
    closeEditor,
  }
}
