'use client'

import { Button } from '@/components/ui/button'
import { Archive, Pencil, Plus } from "lucide-react"

interface Props {
  canEdit: boolean
  onCreate: () => void
  onEdit: () => void
  onArchive: () => void
}

export function LocationsActions({ canEdit, onCreate, onEdit, onArchive }: Props) {
  return (
    <div className="flex gap-2">
      <Button onClick={onCreate} variant="default" size="sm" className="gap-2">
        <Plus className="h-4 w-4" />
        Nouveau
      </Button>
      <Button onClick={onEdit} variant="outline" disabled={!canEdit} size="sm" className="gap-2">
        <Pencil className="h-4 w-4" />
        Modifier
      </Button>
      <Button onClick={onArchive} variant="outline" disabled={!canEdit} size="sm" className="gap-2">
        <Archive className="h-4 w-4" />
        Archiver
      </Button>
    </div>
  )
}
