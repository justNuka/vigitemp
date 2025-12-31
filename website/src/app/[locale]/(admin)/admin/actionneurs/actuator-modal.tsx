"use client"

import { useMemo, useState } from "react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useActuatorTypes } from "@/hooks/useActuatorTypes"
import { useLocations } from "@/hooks/useLocations"
import type { Actuator } from "@/hooks/useActuators"
import { patchJson, postJson } from "@/lib/http"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  actuator?: Actuator | null
  isEditing?: boolean
}

export function ActuatorModal({ open, onOpenChange, actuator, isEditing }: Props) {
  const isEdit = Boolean(isEditing && actuator)
  const contentKey = useMemo(() => {
    const id = actuator?.Id_Actionneur ?? "new"
    return `${isEdit ? "edit" : "new"}-${id}-${open ? "open" : "closed"}`
  }, [actuator?.Id_Actionneur, isEdit, open])

  const { data: types, isLoading: typesLoading } = useActuatorTypes()
  const { data: locations, isLoading: locationsLoading } = useLocations()

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

      onOpenChange(false)
    } catch (error) {
      console.error("Error:", error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent key={contentKey} className="sm:max-w-[500px]">
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
            <Select value={locationId} onValueChange={setLocationId}>
              <SelectTrigger id="lieu" disabled={locationsLoading}>
                <SelectValue placeholder="Sélectionner un lieu" />
              </SelectTrigger>
              <SelectContent>
                {locations?.map((location) => (
                  <SelectItem key={location.Id_Lieu} value={location.Id_Lieu.toString()}>
                    {location.Nom_Lieu || `Lieu ${location.Id_Lieu}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit}>{isEdit ? "Mettre à jour" : "Créer"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

