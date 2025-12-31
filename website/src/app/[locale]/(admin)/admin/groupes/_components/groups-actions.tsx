"use client"

import { Printer } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Props {
  regroupement: string
  onRegroupementChange: (value: string) => void
  canEdit: boolean
  onNew: () => void
  onEdit: () => void
  onArchive: () => void
  onPrint: () => void
}

export function GroupsActions({
  regroupement,
  onRegroupementChange,
  canEdit,
  onNew,
  onEdit,
  onArchive,
  onPrint,
}: Props) {
  return (
    <div className="flex gap-2">
      <Select value={regroupement} onValueChange={onRegroupementChange}>
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="1">Regroupement 1</SelectItem>
          <SelectItem value="2">Regroupement 2</SelectItem>
        </SelectContent>
      </Select>
      <Button onClick={onNew} variant="default">
        Nouveau
      </Button>
      <Button onClick={onEdit} disabled={!canEdit} variant="outline">
        Modifier
      </Button>
      <Button onClick={onArchive} disabled={!canEdit} variant="outline">
        Archiver
      </Button>
      <Button onClick={onPrint} variant="outline" size="icon" aria-label="Imprimer">
        <Printer className="h-4 w-4" />
      </Button>
    </div>
  )
}

