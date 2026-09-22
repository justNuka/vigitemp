import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { patchJson } from '@/lib/http'
import { getDefaultLocationFormData } from '@/app/[locale]/(admin)/admin/lieux/_components/location-form-defaults'
import { mapLocationToFormData } from '@/app/[locale]/(admin)/admin/lieux/_components/location-form-mappers'
import type { LocationFormData } from '@/app/[locale]/(admin)/admin/lieux/_components/location-form-types'
import { useLicense } from '@/components/license/license-provider'
import { prepareLocationPayloadForLicense } from '@/lib/location-license-payload'

export function useSurveillanceLocationEditor({
  locations,
  form,
  queryClient,
  t,
  requireActionComment,
}: {
  locations: Array<{ Id_Lieu: number }>
  form: { reset: (values: LocationFormData) => void }
  queryClient: { invalidateQueries: (args: { queryKey: unknown[] }) => Promise<unknown> }
  t: (key: string) => string
  requireActionComment: boolean
}) {
  const { license } = useLicense()
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null)
  const [isEditLocationOpen, setIsEditLocationOpen] = useState(false)
  const [isLocationSaving, setIsLocationSaving] = useState(false)

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

  const handleEditLocationSubmit = useCallback(async (values: LocationFormData, submitMode: "stay" | "close" = "stay") => {
    if (!selectedLocationId) return
    const actionComment = typeof values.Commentaire_Action === "string" ? values.Commentaire_Action.trim() : ""
    if (requireActionComment && actionComment.length === 0) {
      toast.error(t("action_comment.required_error"))
      return
    }

    setIsLocationSaving(true)
    try {
      const payload = prepareLocationPayloadForLicense({
        ...values,
        Sonde_Numero_Serie: values.Sonde_Numero_Serie ? values.Sonde_Numero_Serie : null,
        Commentaire_Action: actionComment || null,
      }, license)

      await patchJson(`/api/lieux/${selectedLocationId}`, payload)
      if (submitMode === "close") {
        setIsEditLocationOpen(false)
      }
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['locations'] }),
        queryClient.invalidateQueries({ queryKey: ['capteurs', 'paginated', 100] }),
      ])
      toast.success(t('toast.location_updated'))
      window.dispatchEvent(new CustomEvent('vigitemp:lieu-updated', { detail: { idLieu: selectedLocationId } }))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('toast.location_update_error'))
    } finally {
      setIsLocationSaving(false)
    }
  }, [license, queryClient, requireActionComment, selectedLocationId, t])

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
