"use client"

import { useMemo, useState } from "react"
import { useQueryClient } from '@tanstack/react-query'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Combobox } from "@/components/ui/combobox"
import { useActuatorTypes } from "@/hooks/useActuatorTypes"
import { useLocations } from "@/hooks/useLocations"
import { useRouter } from '@/i18n/navigation'
import type { Actuator } from "@/hooks/useActuators"
import { patchJson, postJson } from "@/lib/http"
import { Check, X } from "lucide-react"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  actuator?: Actuator | null
  isEditing?: boolean
}

export function ActuatorModal({ open, onOpenChange, actuator, isEditing }: Props) {
  const queryClient = useQueryClient()
  const router = useRouter()
  const isEdit = Boolean(isEditing && actuator)
  const contentKey = useMemo(() => {
    const id = actuator?.Id_Actionneur ?? "new"
    return `${isEdit ? "edit" : "new"}-${id}-${open ? "open" : "closed"}`
  }, [actuator?.Id_Actionneur, isEdit, open])

  const { data: types, isLoading: typesLoading } = useActuatorTypes()
  const { data: locations, isLoading: locationsLoading } = useLocations()

  const locationOptions = useMemo(
    () =>
      (locations ?? []).map((location) => ({
        value: location.Id_Lieu.toString(),
        label: location.Nom_Lieu || `Lieu ${location.Id_Lieu}`,
        searchText: `${location.Nom_Lieu || ""} ${location.Id_Lieu}`,
      })),
    [locations]
  )

  const initial = useMemo(
    () => ({
      type: isEdit ? actuator?.Type?.toString() || "" : "",
      serie: isEdit ? actuator?.Num_Serie || "" : "",
      commentaire: isEdit ? actuator?.Commentaire || "" : "",
      locationId: isEdit ? actuator?.Id_Lieu?.toString() || "" : "",
    }),
    [actuator, isEdit],
  )

  const [type, setType] = useState(() => initial.type)
  const [serie, setSerie] = useState(() => initial.serie)
  const [commentaire, setCommentaire] = useState(() => initial.commentaire)
  const [locationId, setLocationId] = useState(() => initial.locationId)

  const handleSubmit = async () => {
    try {
      const payload = {
        type,
        serie,
        commentaire,
        lieuId: locationId,
      }

      if (isEdit && actuator) {
        await patchJson(`/api/actionneurs/${actuator.Id_Actionneur}`, payload)
      } else {
        await postJson("/api/actionneurs", payload)
      }

      await queryClient.invalidateQueries({ queryKey: ["actionneurs"] })
      router.refresh()
      onOpenChange(false)
    } catch (error) {
      console.error("Error:", error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent key={contentKey} className="sm:max-w-125 bg-white dark:bg-card">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Modifier l'actionneur" : "Créer un actionneur"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Type d'actionneur</Label>
            <Select value={type} onValueChange={setType} disabled={isEdit}>
              <SelectTrigger id="type" disabled={typesLoading || isEdit}>
                <SelectValue placeholder="Sélectionner un type" />
              </SelectTrigger>
              <SelectContent>
                {types?.map((t) => (
                  <SelectItem key={t.Type} value={t.Type?.toString() || ""}>
                    {t.Description || `Type ${t.Type}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="serie">Numéro de série</Label>
            <Input id="serie" placeholder="Ex: 00001" value={serie} onChange={(e) => setSerie(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="commentaire">Commentaire</Label>
            <Input
              id="commentaire"
              placeholder="Commentaire..."
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lieu">Lieu</Label>
            <Combobox
              triggerId="lieu"
              value={locationId}
              onValueChange={setLocationId}
              options={locationOptions}
              placeholder="Sélectionner un lieu"
              searchPlaceholder="Rechercher un lieu..."
              emptyMessage="Aucun lieu"
              disabled={locationsLoading}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="gap-2">
            <X className="h-4 w-4" />
            Annuler
          </Button>
          <Button onClick={handleSubmit} className="gap-2">
            <Check className="h-4 w-4" />
            {isEdit ? "Mettre à jour" : "Créer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

