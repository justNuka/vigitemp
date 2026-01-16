'use client'

import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useRouter } from '@/i18n/navigation'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import type { Group } from '@/hooks/useGroups'
import { patchJson, postJson } from '@/lib/http'

interface GroupModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  group?: Group | null
  isEditing?: boolean
}

export function GroupModal({ open, onOpenChange, group, isEditing }: GroupModalProps) {
  const queryClient = useQueryClient()
  const router = useRouter()
  const [name, setName] = useState('')
  const [regroupement, setRegroupement] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return

    if (isEditing && group) {
      setName(group.Nom_Groupe || '')
      setRegroupement(group.Numero_Regroupement || '')
    } else {
      setName('')
      setRegroupement('')
    }
  }, [open, group, isEditing])

  const handleSubmit = async () => {
    if (!name || !regroupement) {
      toast.error('Veuillez remplir tous les champs')
      return
    }

    setIsSubmitting(true)
    try {
      if (isEditing && group) {
        await patchJson(`/api/groupes/${group.Id_Groupe}`, { nom: name, regroupement })
        toast.success('Groupe modifié avec succès')
      } else {
        await postJson('/api/groupes', { nom: name, regroupement })
        toast.success('Groupe créé avec succès')
      }

      queryClient.invalidateQueries({ queryKey: ['groups'] })
      router.refresh()
      onOpenChange(false)
    } catch (error) {
      console.error('Group save error:', error)
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la sauvegarde du groupe')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Modifier le groupe' : 'Créer un groupe'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="regroupement">Regroupement</Label>
            <Select value={regroupement} onValueChange={setRegroupement}>
              <SelectTrigger id="regroupement">
                <SelectValue placeholder="Sélectionner un regroupement" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Regroupement 1</SelectItem>
                <SelectItem value="2">Regroupement 2</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nom du groupe</Label>
            <Input
              id="name"
              placeholder="Ex: Groupe A"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
