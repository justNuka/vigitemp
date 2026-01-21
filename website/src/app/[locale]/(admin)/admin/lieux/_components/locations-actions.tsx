'use client'

import { Button } from '@/components/ui/button'

interface Props {
  canEdit: boolean
  onCreate: () => void
  onEdit: () => void
}

export function LocationsActions({ canEdit, onCreate, onEdit }: Props) {
  return (
    <div className="flex gap-2">
      <Button onClick={onCreate} variant="default">
        Nouveau
      </Button>
      <Button onClick={onEdit} variant="outline" disabled={!canEdit}>
        Modifier
      </Button>
    </div>
  )
}
