"use client"

import { useEffect, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

import { useModules } from "@/hooks/useModules"
import { useStandardTypes } from "@/hooks/useStandardTypes"
import type { Standard } from "@/hooks/useStandards"

import { StandardCertificateForm } from "./_components/standard-certificate-form"
import { StandardInfoForm } from "./_components/standard-info-form"
import { StandardMeasurementsTable, type MeasurementPoint } from "./_components/standard-measurements-table"
import { patchJson, postJson } from "@/lib/http"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  standard?: Standard | null
  isEditing?: boolean
}

type Measurement = MeasurementPoint

export function StandardModal({ open, onOpenChange, standard, isEditing }: Props) {
  const queryClient = useQueryClient()
  const [isLoading, setIsLoading] = useState(false)

  const [type, setType] = useState("")
  const [serie, setSerie] = useState("")
  const [moduleId, setModuleId] = useState("")
  const [portSerie, setPortSerie] = useState("")
  const [idServeur, setIdServeur] = useState("0")
  const [valeurBase, setValeurBase] = useState("0")
  const [resolution, setResolution] = useState("0")
  const [incertitude, setIncertitude] = useState("0")

  const [organisme, setOrganisme] = useState("")
  const [dateCertif, setDateCertif] = useState("")
  const [unite, setUnite] = useState("")
  const [numeroCertif, setNumeroCertif] = useState("")

  const [mesures, setMesures] = useState<Measurement[]>([])
  const [selectedMesureIndex, setSelectedMesureIndex] = useState<number | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const { data: types, isLoading: typesLoading } = useStandardTypes()
  const { data: modules, isLoading: modulesLoading } = useModules()

  useEffect(() => {
    if (!open) return

    if (isEditing && standard) {
      setType(standard.Etalon_Numero_Serie?.substring(0, 2) || "")
      setSerie(standard.Etalon_Numero_Serie || "")
      setModuleId(standard.Id_Module?.toString() || "")
      setPortSerie(standard.Port_Serie || "")
      setIdServeur(standard.Id_Serveur?.toString() || "0")
      setResolution(standard.Resolution || "0")
      setIncertitude(standard.Incertitude || "0")
      setOrganisme(standard.Organisme || "")
      setDateCertif(standard.Date_Certif ? standard.Date_Certif.substring(0, 10) : "")
      setUnite(standard.Unite || "")
      setNumeroCertif(standard.Num_Certif || "")
      setMesures([])
      return
    }

    setType("")
    setSerie("")
    setModuleId("")
    setPortSerie("")
    setIdServeur("0")
    setValeurBase("0")
    setResolution("0")
    setIncertitude("0")
    setOrganisme("")
    setDateCertif("")
    setUnite("")
    setNumeroCertif("")
    setMesures([])
    setSelectedMesureIndex(null)
  }, [open, standard, isEditing])

  const handleAddMesure = () => {
    const nextPoint = mesures.length > 0 ? Math.max(...mesures.map((m) => m.point)) + 1 : 1
    setMesures([...mesures, { point: nextPoint, reference: "", value: "", incertitude: "" }])
    setSelectedMesureIndex(mesures.length)
  }

  const handleUpdateMesure = (index: number, field: keyof Measurement, value: string) => {
    const updated = [...mesures]
    updated[index] = { ...updated[index], [field]: value }
    setMesures(updated)
  }

  const handleDeleteMesure = () => {
    if (selectedMesureIndex !== null) {
      setMesures(mesures.filter((_, i) => i !== selectedMesureIndex))
      setSelectedMesureIndex(null)
      setIsDeleteDialogOpen(false)
    }
  }

  const handleSubmit = async () => {
    if (!serie.trim()) {
      toast.error("Veuillez remplir le numéro de série")
      return
    }

    setIsLoading(true)

    try {
      const payload = {
        Etalon_Numero_Serie: serie,
        Resolution: resolution,
        Incertitude: incertitude,
        Numero: numeroCertif,
        Organisme: organisme,
        Date: dateCertif,
        Unite: unite,
        mesures: mesures.map((m, index) => ({
          Numero_Ordre: index + 1,
          Temperature_Reference: m.reference,
          Temperature_Vraie: m.value,
          Incertitude: m.incertitude,
        })),
      }

      if (isEditing && standard) {
        await patchJson(`/api/etalons/${standard.Id_Etalon}`, payload)
      } else {
        await postJson("/api/etalons", payload)
      }

      toast.success(isEditing ? "Étalon mis à jour avec succès" : "Étalon créé avec succès")

      queryClient.invalidateQueries({ queryKey: ["etalons"] })
      onOpenChange(false)
    } catch (error) {
      console.error("Submit error:", error)
      toast.error(error instanceof Error ? error.message : "Erreur lors de la sauvegarde")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Modifier l'étalon" : "Créer un étalon"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <StandardInfoForm
              isEditing={!!isEditing}
              types={types}
              typesLoading={typesLoading}
              modules={modules}
              modulesLoading={modulesLoading}
              type={type}
              setType={setType}
              serie={serie}
              setSerie={setSerie}
              moduleId={moduleId}
              setModuleId={setModuleId}
              portSerie={portSerie}
              idServeur={idServeur}
              valeurBase={valeurBase}
              setValeurBase={setValeurBase}
              resolution={resolution}
              setResolution={setResolution}
              incertitude={incertitude}
              setIncertitude={setIncertitude}
            />

            <Separator />

            <StandardCertificateForm
              organisme={organisme}
              setOrganisme={setOrganisme}
              dateCertif={dateCertif}
              setDateCertif={setDateCertif}
              unite={unite}
              setUnite={setUnite}
              numeroCertif={numeroCertif}
              setNumeroCertif={setNumeroCertif}
            />

            <Separator />

            <StandardMeasurementsTable
              mesures={mesures}
              selectedMesureIndex={selectedMesureIndex}
              onSelectMesure={setSelectedMesureIndex}
              onAdd={handleAddMesure}
              onUpdate={handleUpdateMesure}
              onRequestDelete={() => {
                if (selectedMesureIndex !== null) setIsDeleteDialogOpen(true)
              }}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Annuler
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? "Enregistrement..." : isEditing ? "Mettre à jour" : "Créer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la mesure</AlertDialogTitle>
            <AlertDialogDescription>Êtes-vous sûr de vouloir supprimer ce point de mesure ?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction onClick={handleDeleteMesure} className="bg-red-600">
            Supprimer
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

